// Run with: npm run test:server  (Node's built-in test runner, no extra dependencies)
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { GET, POST } from '../api/subscribe.ts';

type Call = { url: string; init: RequestInit };

let calls: Call[] = [];
let reply: { status: number; body: string } = { status: 200, body: '{"data":{}}' };
const realFetch = globalThis.fetch;
const realError = console.error;

const request = (body: unknown) =>
  new Request('https://api.test/api/subscribe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

beforeEach(() => {
  calls = [];
  reply = { status: 200, body: '{"data":{}}' };
  process.env.BEEHIIV_API_KEY = 'test-key';
  process.env.BEEHIIV_PUBLICATION_ID = 'pub_test';
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(reply.body, { status: reply.status });
  }) as typeof fetch;
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

describe('POST /api/subscribe', () => {
  it('subscribes a normalized email through the beehiiv API', async () => {
    const res = await POST(request({ email: '  You@Example.com ' }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.beehiiv.com/v2/publications/pub_test/subscriptions');
    assert.equal((calls[0].init.headers as Record<string, string>).Authorization, 'Bearer test-key');
    const sent = JSON.parse(calls[0].init.body as string);
    assert.equal(sent.email, 'you@example.com');
    assert.equal(sent.utm_source, 'unravel-korea-app');
    assert.equal(sent.send_welcome_email, true);
  });

  it('rejects invalid input without calling beehiiv', async () => {
    assert.equal((await POST(request('not json'))).status, 400);
    assert.equal((await POST(request({ email: 'nope' }))).status, 400);
    assert.equal((await POST(request({ email: `${'a'.repeat(250)}@b.co` }))).status, 400);
    assert.equal(calls.length, 0);
  });

  it('fails safely when not configured', async () => {
    delete process.env.BEEHIIV_API_KEY;
    const res = await POST(request({ email: 'a@b.co' }));
    assert.equal(res.status, 503);
    assert.match(((await res.json()) as { error: string }).error, /seoulsip\.online\/subscribe/);
    assert.equal(calls.length, 0);
  });

  it('passes through rate limiting and hides other upstream errors', async () => {
    reply = { status: 429, body: '' };
    assert.equal((await POST(request({ email: 'a@b.co' }))).status, 429);
    reply = { status: 500, body: 'internal details' };
    const res = await POST(request({ email: 'a@b.co' }));
    assert.equal(res.status, 502);
    assert.doesNotMatch(JSON.stringify(await res.json()), /internal details/);
  });

  it('only accepts POST', () => {
    assert.equal(GET().status, 405);
  });
});

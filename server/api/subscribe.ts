/**
 * POST /api/subscribe  { "email": "someone@example.com" }
 *
 * Adds an email to the Seoul Sip beehiiv publication. Runs on Vercel so the beehiiv API key never
 * ships inside the app. Required environment variables (Vercel → Project → Settings → Environment):
 *   BEEHIIV_API_KEY         beehiiv → Settings → Integrations → API → Create new key
 *   BEEHIIV_PUBLICATION_ID  the "pub_..." id shown on the same page
 *
 * Tip: keep double opt-in on in beehiiv so nobody can sign up an address they don't own.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.BEEHIIV_API_KEY?.trim();
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  // The app shows this text as-is, so point people to the web signup until the keys are set.
  if (!apiKey || !publicationId) {
    return json(503, { error: 'In-app signup is coming soon. For now, join at seoulsip.online/subscribe.' });
  }

  let email = '';
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return json(400, { error: 'Send JSON like {"email": "you@example.com"}.' });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json(400, { error: 'Please enter a valid email address.' });
  }

  const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      send_welcome_email: true,
      utm_source: 'unravel-korea-app',
      utm_medium: 'app',
      referring_site: 'Unravel Korea app',
    }),
  });

  if (res.status === 429) return json(429, { error: 'Too many signups right now — please try again in a minute.' });
  if (!res.ok) {
    console.error('beehiiv error', res.status, await res.text().catch(() => ''));
    return json(502, { error: 'Could not subscribe right now. Please try again later.' });
  }
  return json(200, { ok: true });
}

export function GET(): Response {
  return json(405, { error: 'Use POST.' });
}

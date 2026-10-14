import {
  decodeEntities,
  fetchGuides,
  fetchWithTimeout,
  isValidEmail,
  parseRss,
  parseSitemap,
  subscribeToNewsletter,
} from '@/lib/content';

const mockConfig = { subscribeEndpoint: '' };
jest.mock('@/config', () => {
  const actual = jest.requireActual('@/config');
  return {
    Config: new Proxy(actual.Config, {
      get: (t, k) => (k in mockConfig ? mockConfig[k as 'subscribeEndpoint'] : t[k]),
    }),
  };
});

const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  mockConfig.subscribeEndpoint = '';
});

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('decodeEntities', () => {
  it('decodes numeric and named entities from WordPress titles', () => {
    expect(decodeEntities('Beaches &#038; Temples &#8211; Seoul&#8217;s best &amp; more&hellip;')).toBe(
      'Beaches & Temples – Seoul’s best & more…',
    );
    expect(decodeEntities('&#x1F1F0;&#x1F1F7;')).toBe('🇰🇷');
    expect(decodeEntities('&unknown;')).toBe('&unknown;');
  });
});

describe('fetchGuides (WordPress)', () => {
  const post = {
    id: 7,
    date: '2026-10-05T00:04:57',
    link: 'https://unravelkorea.com/busan/',
    title: { rendered: 'Busan &#038; Beyond' },
    excerpt: { rendered: '<p>If Seoul is Korea&#8217;s brain, Busan is its heart.</p>' },
    _embedded: { 'wp:featuredmedia': [{ media_details: { sizes: { medium: { source_url: 'https://img/m.png' } } } }] },
  };

  it('maps posts and builds filter/search/page URLs', async () => {
    fetchMock.mockReturnValueOnce(json(200, [post]));
    const [a] = await fetchGuides({ page: 2, search: 'busan beach', category: 21 });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/wp-json/wp/v2/posts?per_page=20&page=2');
    expect(url).toContain('search=busan%20beach');
    expect(url).toContain('categories=21');
    expect(a).toMatchObject({
      id: 'wp-7',
      title: 'Busan & Beyond',
      excerpt: 'If Seoul is Korea’s brain, Busan is its heart.',
      image: 'https://img/m.png',
      source: 'guide',
    });
  });

  it('treats paging past the end as an empty page', async () => {
    fetchMock.mockReturnValueOnce(json(400, { code: 'rest_post_invalid_page_number' }));
    await expect(fetchGuides({ page: 9 })).resolves.toEqual([]);
  });

  it('surfaces server errors', async () => {
    fetchMock.mockReturnValueOnce(json(500, {}));
    await expect(fetchGuides()).rejects.toThrow('Request failed (500)');
  });
});

describe('Seoul Sip parsing (beehiiv)', () => {
  it('reads newest posts from the sitemap and titles them from the slug', () => {
    const xml = `<urlset>
      <url><loc>https://www.seoulsip.online/</loc><lastmod>2026-10-08</lastmod></url>
      <url><loc>https://www.seoulsip.online/p/first-snow-in-seoul</loc><lastmod>2026-01-02</lastmod></url>
      <url><loc>https://www.seoulsip.online/p/make-your-custom-trip-planner</loc><lastmod>2026-09-25</lastmod></url>
    </urlset>`;
    expect(parseSitemap(xml).map((a) => [a.title, a.date])).toEqual([
      ['Make your custom trip planner', '2026-09-25'],
      ['First snow in seoul', '2026-01-02'],
    ]);
  });

  it('reads RSS items when the beehiiv feed is enabled', () => {
    const xml = `<rss><channel><item>
      <title><![CDATA[First snow &amp; hot drinks]]></title>
      <link>https://www.seoulsip.online/p/first-snow</link>
      <guid>abc</guid>
      <pubDate>Tue, 02 Dec 2025 09:00:00 GMT</pubDate>
      <description><![CDATA[<p>Seoul turned white overnight.</p>]]></description>
      <enclosure url="https://img/snow.jpg" type="image/jpeg"/>
    </item></channel></rss>`;
    expect(parseRss(xml)[0]).toMatchObject({
      id: 'ss-abc',
      title: 'First snow & hot drinks',
      url: 'https://www.seoulsip.online/p/first-snow',
      date: '2025-12-02T09:00:00.000Z',
      excerpt: 'Seoul turned white overnight.',
      image: 'https://img/snow.jpg',
      source: 'newsletter',
    });
  });
});

describe('newsletter signup', () => {
  it('validates emails', () => {
    expect(isValidEmail(' you@example.com ')).toBe(true);
    expect(isValidEmail('you@example')).toBe(false);
    expect(isValidEmail('no spaces@example.com')).toBe(false);
  });

  it('reports "not configured" so the UI can fall back to the web form', async () => {
    await expect(subscribeToNewsletter('you@example.com')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the email to the configured endpoint', async () => {
    mockConfig.subscribeEndpoint = 'https://api.example/subscribe';
    fetchMock.mockReturnValueOnce(json(200, { ok: true }));
    await expect(subscribeToNewsletter('you@example.com')).resolves.toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example/subscribe');
    expect(JSON.parse(init.body)).toEqual({ email: 'you@example.com' });
  });

  it('shows the server error message', async () => {
    mockConfig.subscribeEndpoint = 'https://api.example/subscribe';
    fetchMock.mockReturnValueOnce(json(400, { error: 'Please enter a valid email address.' }));
    await expect(subscribeToNewsletter('x@y.zz')).rejects.toThrow('Please enter a valid email address.');
  });
});

describe('fetchWithTimeout', () => {
  it('aborts slow requests with a friendly message', async () => {
    fetchMock.mockImplementationOnce(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted')))),
    );
    await expect(fetchWithTimeout('https://slow.example', {}, 10)).rejects.toThrow('The connection timed out');
  });
});

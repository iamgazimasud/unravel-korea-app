import AsyncStorage from '@react-native-async-storage/async-storage';

import { Config } from '@/config';

export type Article = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  excerpt?: string;
  image?: string;
  source: 'guide' | 'newsletter';
};

// ---------- Unravel Korea guides (WordPress REST API) ----------

type WPPost = {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: {
      source_url?: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }[];
  };
};

export type GuideQuery = { page?: number; search?: string; category?: number };

export async function fetchGuides({ page = 1, search, category }: GuideQuery = {}): Promise<Article[]> {
  let url =
    `${Config.blogUrl}/wp-json/wp/v2/posts?per_page=20&page=${page}` +
    `&_embed=wp:featuredmedia&_fields=id,date,link,title,excerpt,_links,_embedded`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (category) url += `&categories=${category}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  // WordPress answers 400 (rest_post_invalid_page_number) when you page past the end.
  if (res.status === 400 && page > 1) return [];
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const posts = (await res.json()) as WPPost[];

  return posts.map((p) => {
    const media = p._embedded?.['wp:featuredmedia']?.[0];
    const sizes = media?.media_details?.sizes;
    return {
      id: `wp-${p.id}`,
      title: decodeEntities(p.title.rendered),
      url: p.link,
      date: p.date,
      excerpt: p.excerpt ? truncate(stripTags(p.excerpt.rendered), 160) : undefined,
      image: sizes?.medium_large?.source_url ?? sizes?.medium?.source_url ?? media?.source_url,
      source: 'guide',
    };
  });
}

/** First page of the latest guides — the cached feed used on Home and in Read. */
export const fetchLatestGuides = () => fetchGuides();

/** Blog posts that mention a spot — powers "From the blog" on each spot page. */
export async function searchGuides(query: string): Promise<Article[]> {
  const url =
    `${Config.blogUrl}/wp-json/wp/v2/posts?per_page=3&search=${encodeURIComponent(query)}` +
    `&_fields=id,date,link,title`;
  const posts = await getJson<WPPost[]>(url);
  return posts.map((p) => ({
    id: `wp-${p.id}`,
    title: decodeEntities(p.title.rendered),
    url: p.link,
    date: p.date,
    source: 'guide',
  }));
}

// ---------- Seoul Sip newsletter (beehiiv) ----------

export async function fetchNewsletter(): Promise<Article[]> {
  if (Config.newsletterRssUrl) return parseRss(await getText(Config.newsletterRssUrl));
  return parseSitemap(await getText(`${Config.newsletterUrl}/sitemap.xml`));
}

function parseRss(xml: string): Article[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.slice(0, 40).map((item, i) => {
    const tag = (name: string) =>
      item.match(new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`))?.[1]?.trim();
    const image = item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];
    const date = tag('pubDate');
    return {
      id: `ss-${tag('guid') ?? i}`,
      title: decodeEntities(tag('title') ?? 'Untitled'),
      url: tag('link') ?? Config.newsletterUrl,
      date: date ? new Date(date).toISOString() : null,
      excerpt: tag('description') ? truncate(stripTags(decodeEntities(tag('description')!)), 160) : undefined,
      image,
      source: 'newsletter',
    };
  });
}

function parseSitemap(xml: string): Article[] {
  const entries = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  return entries
    .map((e) => ({
      loc: e.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '',
      lastmod: e.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
    }))
    .filter((e) => e.loc.includes('/p/'))
    .sort((a, b) => (b.lastmod ?? '').localeCompare(a.lastmod ?? ''))
    .slice(0, 40)
    .map((e) => ({
      id: `ss-${e.loc}`,
      title: titleFromSlug(e.loc.split('/p/')[1] ?? ''),
      url: e.loc,
      date: e.lastmod,
      source: 'newsletter' as const,
    }));
}

function titleFromSlug(slug: string): string {
  const words = decodeURIComponent(slug).replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Signs an email up to Seoul Sip through the server function in `server/` (which holds the beehiiv
 * API key). Returns false when no endpoint is configured so callers can fall back to the web form.
 */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  if (!Config.subscribeEndpoint) return false;
  const res = await fetch(Config.subscribeEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Could not subscribe right now. Please try again.');
  }
  return true;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ---------- Offline cache ----------

export type CachedResult<T> = { data: T; savedAt: number };

const cacheKey = (key: string) => `unravel-korea/cache/${key}`;

export async function readCache<T>(key: string): Promise<CachedResult<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(key));
    return raw ? (JSON.parse(raw) as CachedResult<T>) : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(key), JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // Cache is best-effort.
  }
}

// ---------- helpers ----------

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.text();
}

const NamedEntities: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return NamedEntities[code.toLowerCase()] ?? m;
  });
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

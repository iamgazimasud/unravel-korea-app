import { useCallback, useEffect, useState } from 'react';

import { readCache, writeCache } from '@/lib/content';

type FeedState<T> = {
  data: T | null;
  loading: boolean;
  /** Set when the network failed; `data` may still hold the cached copy. */
  error: string | null;
  savedAt: number | null;
  refresh: () => Promise<void>;
};

/** Cache-first loader: shows the last saved copy instantly (works offline), then refreshes. */
export function useFeed<T>(key: string, fetcher: () => Promise<T>): FeedState<T> {
  const [data, setData] = useState<T | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((result: FetchResult<T>) => {
    if ('data' in result) {
      setData(result.data);
      setSavedAt(Date.now());
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    apply(await fetchAndCache(key, fetcher));
    // The fetcher is expected to be a stable module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, apply]);

  useEffect(() => {
    let cancelled = false;
    readCache<T>(key).then((cached) => {
      if (cancelled || !cached) return;
      setData((current) => current ?? cached.data);
      setSavedAt((current) => current ?? cached.savedAt);
    });
    fetchAndCache(key, fetcher).then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, apply]);

  return { data, loading, error, savedAt, refresh };
}

type FetchResult<T> = { data: T } | { error: string };

async function fetchAndCache<T>(key: string, fetcher: () => Promise<T>): Promise<FetchResult<T>> {
  try {
    const data = await fetcher();
    await writeCache(key, data);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Could not load' };
  }
}

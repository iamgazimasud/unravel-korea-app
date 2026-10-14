import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ArticleRow, openLink } from '@/components/article-row';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { BrandHeader, Button, Card, Chip, EmptyState, Icon, IconButton, Loading, Screen, T } from '@/components/ui';
import { Config } from '@/config';
import { fetchGuides, fetchLatestGuides, fetchNewsletter, type Article } from '@/lib/content';
import { useFeed, type FeedState } from '@/lib/use-feed';
import { Brand, Fonts, Radius, Space, useColors } from '@/theme';

type Tab = 'guides' | 'newsletter';
type Filter = { search: string; category: number | null };

const PAGE_SIZE = 20;

export default function ReadScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab: Tab = params.tab === 'newsletter' ? 'newsletter' : 'guides';
  const setTab = (next: Tab) => router.setParams({ tab: next });
  const guides = useFeed('guides', fetchLatestGuides);
  const newsletter = useFeed('newsletter', fetchNewsletter);
  const feed = tab === 'guides' ? guides : newsletter;

  const header = (
    <BrandHeader title="Read" subtitle="Guides from Unravel Korea and the Seoul Sip newsletter.">
      <View style={styles.segment}>
        {(
          [
            ['guides', 'Travel guides'],
            ['newsletter', 'Seoul Sip ☕'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            style={[styles.segmentItem, tab === key && styles.segmentItemOn]}>
            <Text style={[styles.segmentLabel, { color: tab === key ? Brand.navy : '#FFFFFF' }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </BrandHeader>
  );

  return (
    <Screen
      header={header}
      refreshControl={
        <RefreshControl
          refreshing={feed.loading && !!feed.data}
          onRefresh={feed.refresh}
          tintColor={c.primary}
          colors={[c.primary]}
        />
      }>
      {tab === 'guides' ? <GuidesList latest={guides} /> : <NewsletterList feed={newsletter} />}
    </Screen>
  );
}

/** WordPress guides: cached latest posts, plus live category filters, search and paging. */
function GuidesList({ latest }: { latest: FeedState<Article[]> }) {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>({ search: '', category: null });
  const [filtered, setFiltered] = useState<Article[] | null>(null);
  const [extra, setExtra] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ignore responses for a filter the reader has already moved away from.
  const requestId = useRef(0);

  const isFiltered = !!filter.search || filter.category !== null;
  const base = isFiltered ? filtered : latest.data;
  const items = [...(base ?? []), ...extra];

  const applyFilter = (next: Filter) => {
    const id = ++requestId.current;
    setFilter(next);
    setFiltered(null);
    setExtra([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    if (!next.search && next.category === null) {
      setBusy(false);
      return;
    }
    setBusy(true);
    fetchGuides({ search: next.search || undefined, category: next.category ?? undefined })
      .then((r) => {
        if (id !== requestId.current) return;
        setFiltered(r);
        setHasMore(r.length === PAGE_SIZE);
      })
      .catch((e: Error) => {
        if (id === requestId.current) setError(e.message);
      })
      .finally(() => {
        if (id === requestId.current) setBusy(false);
      });
  };

  const loadMore = () => {
    const id = requestId.current;
    const next = page + 1;
    const seen = new Set(items.map((a) => a.id));
    setBusy(true);
    fetchGuides({ page: next, search: filter.search || undefined, category: filter.category ?? undefined })
      .then((r) => {
        if (id !== requestId.current) return;
        setExtra((list) => [...list, ...r.filter((a) => !seen.has(a.id))]);
        setPage(next);
        setHasMore(r.length === PAGE_SIZE);
      })
      .catch((e: Error) => {
        if (id === requestId.current) setError(e.message);
      })
      .finally(() => {
        if (id === requestId.current) setBusy(false);
      });
  };

  const nothingCached = !isFiltered && !latest.data;

  return (
    <View>
      <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border, marginTop: Space.sm }]}>
        <Icon name="search" size={18} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => applyFilter({ ...filter, search: query.trim() })}
          placeholder="Search the blog — Busan, kimchi…"
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text, fontFamily: Fonts.medium }]}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search the blog"
        />
        {query ? (
          <IconButton
            icon="close"
            label="Clear search"
            onPress={() => {
              setQuery('');
              applyFilter({ ...filter, search: '' });
            }}
          />
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip
          label="Latest"
          selected={filter.category === null}
          onPress={() => applyFilter({ ...filter, category: null })}
        />
        {Config.blogCategories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            selected={filter.category === cat.id}
            onPress={() => applyFilter({ ...filter, category: cat.id })}
          />
        ))}
      </ScrollView>

      {!isFiltered && latest.error && latest.data ? (
        <T variant="caption" tone="warning" style={{ marginBottom: Space.sm }}>
          You&apos;re offline — showing the copy saved on your phone.
        </T>
      ) : null}

      {(nothingCached && latest.loading) || (isFiltered && busy && !filtered) ? <Loading /> : null}

      {nothingCached && !latest.loading && latest.error ? (
        <OfflineState onRetry={latest.refresh} url={Config.blogUrl} />
      ) : null}

      {isFiltered && filtered?.length === 0 ? (
        <EmptyState icon="search" title="No posts found" body="Try a different word or category." />
      ) : null}

      <View style={{ gap: Space.sm }}>
        {items.map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </View>

      {error ? (
        <T variant="caption" tone="warning" style={{ marginTop: Space.sm }}>
          {error}
        </T>
      ) : null}

      {items.length >= PAGE_SIZE && hasMore ? (
        <Button
          label={busy ? 'Loading…' : 'Load more'}
          variant="secondary"
          disabled={busy}
          style={{ marginTop: Space.md }}
          onPress={loadMore}
        />
      ) : null}
      {items.length ? (
        <Button
          label="Open unravelkorea.com"
          variant="ghost"
          icon="open"
          style={{ marginTop: Space.sm }}
          onPress={() => openLink(Config.blogUrl)}
        />
      ) : null}
    </View>
  );
}

function NewsletterList({ feed }: { feed: FeedState<Article[]> }) {
  return (
    <View>
      <Card tone="navy" style={{ marginTop: Space.sm, marginBottom: Space.md, gap: Space.sm }}>
        <T variant="title" tone="inverse">
          Know what&apos;s happening in Korea in 5 minutes
        </T>
        <T tone="inverse" style={{ opacity: 0.85 }}>
          K-drama, travel, fashion and news — free in your inbox every week.
        </T>
        <NewsletterSignup onDark />
      </Card>

      {feed.error && feed.data ? (
        <T variant="caption" tone="warning" style={{ marginBottom: Space.sm }}>
          You&apos;re offline — showing the copy saved on your phone.
        </T>
      ) : null}
      {!feed.data && feed.loading ? <Loading /> : null}
      {!feed.data && !feed.loading && feed.error ? (
        <OfflineState onRetry={feed.refresh} url={Config.newsletterUrl} />
      ) : null}

      <View style={{ gap: Space.sm }}>
        {(feed.data ?? []).map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </View>

      {feed.data?.length ? (
        <Button
          label="Full Seoul Sip archive"
          variant="ghost"
          icon="open"
          style={{ marginTop: Space.md }}
          onPress={() => openLink(`${Config.newsletterUrl}/archive`)}
        />
      ) : null}
    </View>
  );
}

function OfflineState({ onRetry, url }: { onRetry: () => void; url: string }) {
  return (
    <EmptyState
      icon="cloud-offline"
      title="Can't load right now"
      body="Connect once and articles are saved for offline reading."
      action={
        <View style={{ flexDirection: 'row', gap: Space.sm }}>
          <Button label="Try again" size="sm" onPress={onRetry} />
          <Button label="Open website" size="sm" variant="secondary" onPress={() => openLink(url)} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.pill },
  segmentItemOn: { backgroundColor: '#FFFFFF' },
  segmentLabel: { fontFamily: Fonts.bold, fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingLeft: Space.md,
    paddingRight: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 48,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  chips: { gap: Space.sm, paddingVertical: Space.md },
});

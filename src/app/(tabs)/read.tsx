import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ArticleRow, openLink } from '@/components/article-row';
import { NewsletterSignup } from '@/components/newsletter-signup';
import {
  BrandHeader,
  Button,
  Card,
  Divider,
  EmptyState,
  Icon,
  IconCircle,
  Loading,
  Screen,
  Section,
  T,
} from '@/components/ui';
import { Config } from '@/config';
import { fetchGuides, fetchLatestGuides, fetchNewsletter, type Article } from '@/lib/content';
import { useFeed, type FeedState } from '@/lib/use-feed';
import { Space, useColors } from '@/theme';

const PAGE_SIZE = 20;
const ISSUES_SHOWN = 3;

export default function ReadScreen() {
  const c = useColors();
  const guides = useFeed('guides', fetchLatestGuides);
  const newsletter = useFeed('newsletter', fetchNewsletter);

  return (
    <Screen
      header={<BrandHeader title="Read" subtitle="The Seoul Sip newsletter and our latest Korea travel guides." />}
      refreshControl={
        <RefreshControl
          refreshing={(guides.loading && !!guides.data) || (newsletter.loading && !!newsletter.data)}
          onRefresh={() => {
            guides.refresh();
            newsletter.refresh();
          }}
          tintColor={c.primary}
          colors={[c.primary]}
        />
      }>
      <SeoulSip feed={newsletter} />
      <Guides latest={guides} />
      <About />
    </Screen>
  );
}

function SeoulSip({ feed }: { feed: FeedState<Article[]> }) {
  const issues = (feed.data ?? []).slice(0, ISSUES_SHOWN);
  return (
    <Card tone="navy" style={styles.sip}>
      <View style={styles.sipHead}>
        <IconCircle name="cafe" size={44} />
        <View style={{ flex: 1 }}>
          <T variant="title" tone="inverse">
            Seoul Sip
          </T>
          <T tone="inverse" style={{ opacity: 0.85 }}>
            What&apos;s happening in Korea, in 5 minutes. Free every week.
          </T>
        </View>
      </View>
      <NewsletterSignup onDark />
      {issues.length ? (
        <View style={{ marginTop: Space.sm }}>
          <T variant="eyebrow" tone="inverse" style={{ opacity: 0.7, marginBottom: Space.xs }}>
            LATEST ISSUES
          </T>
          {issues.map((a) => (
            <Pressable key={a.id} onPress={() => openLink(a.url)} style={styles.issue} accessibilityRole="link">
              <T variant="label" tone="inverse" numberOfLines={2} style={{ flex: 1 }}>
                {a.title}
              </T>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          ))}
          <Pressable
            onPress={() => openLink(`${Config.newsletterUrl}/archive`)}
            style={styles.issue}
            accessibilityRole="link">
            <T variant="label" tone="inverse" style={{ flex: 1, opacity: 0.85 }}>
              See every issue
            </T>
            <Icon name="open-outline" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

/** Latest posts from the WordPress blog (cached for offline), with "Load more" for older ones. */
function Guides({ latest }: { latest: FeedState<Article[]> }) {
  const [extra, setExtra] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // A refresh can bring back posts that "Load more" already added, so de-duplicate by id.
  const items = [...new Map([...(latest.data ?? []), ...extra].map((a) => [a.id, a])).values()];

  const loadMore = () => {
    const next = page + 1;
    setBusy(true);
    setError(null);
    fetchGuides({ page: next })
      .then((r) => {
        setExtra((list) => [...list, ...r]);
        setPage(next);
        setHasMore(r.length === PAGE_SIZE);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  };

  return (
    <Section title="Travel guides">
      {latest.error && latest.data ? (
        <T variant="caption" tone="warning" style={{ marginBottom: Space.sm }}>
          You&apos;re offline — showing the copy saved on your phone.
        </T>
      ) : null}
      {!latest.data && latest.loading ? <Loading /> : null}
      {!latest.data && !latest.loading && latest.error ? (
        <EmptyState
          icon="cloud-offline"
          title="Can't load guides right now"
          body="Connect once and they're saved for offline reading."
          action={
            <View style={{ flexDirection: 'row', gap: Space.sm }}>
              <Button label="Try again" size="sm" onPress={latest.refresh} />
              <Button label="Open website" size="sm" variant="secondary" onPress={() => openLink(Config.blogUrl)} />
            </View>
          }
        />
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
          label={busy ? 'Loading…' : 'Load more guides'}
          variant="secondary"
          disabled={busy}
          style={{ marginTop: Space.md }}
          onPress={loadMore}
        />
      ) : null}
    </Section>
  );
}

function About() {
  return (
    <Section title="About">
      <Card>
        <AboutRow icon="globe" label="unravelkorea.com" onPress={() => openLink(Config.blogUrl)} />
        <Divider />
        <AboutRow icon="images" label="Photo credits" internal onPress={() => router.push('/credits')} />
        <Divider />
        <AboutRow icon="shield-checkmark" label="Privacy policy" onPress={() => openLink(Config.privacyPolicyUrl)} />
      </Card>
      <T variant="caption" tone="muted" style={{ marginTop: Space.sm, textAlign: 'center' }}>
        Unravel Korea v{Constants.expoConfig?.version ?? '1.0.0'} · Opening hours and prices are approximate.
      </T>
    </Section>
  );
}

function AboutRow({
  icon,
  label,
  onPress,
  internal,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  internal?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole={internal ? 'button' : 'link'} style={styles.aboutRow}>
      <IconCircle name={icon} size={34} tone="navy" />
      <T variant="label" style={{ flex: 1 }}>
        {label}
      </T>
      <Icon name={internal ? 'chevron-forward' : 'open-outline'} size={16} color={c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sip: { marginTop: Space.sm, gap: Space.md },
  sipHead: { flexDirection: 'row', gap: Space.md, alignItems: 'center' },
  issue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
});

import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { ArticleRow, openLink } from '@/components/article-row';
import { Button, Card, EmptyState, Loading, Screen, T } from '@/components/ui';
import { Config } from '@/config';
import { fetchGuides, fetchNewsletter } from '@/lib/content';
import { useFeed } from '@/lib/use-feed';
import { Radius, Space, useColors } from '@/theme';

type Tab = 'guides' | 'newsletter';

export default function ReadScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab: Tab = params.tab === 'newsletter' ? 'newsletter' : 'guides';
  const setTab = (next: Tab) => router.setParams({ tab: next });
  const guides = useFeed('guides', fetchGuides);
  const newsletter = useFeed('newsletter', fetchNewsletter);
  const feed = tab === 'guides' ? guides : newsletter;

  return (
    <Screen
      title="Read"
      subtitle="Guides from Unravel Korea and the Seoul Sip newsletter."
      refreshControl={<RefreshControl refreshing={feed.loading && !!feed.data} onRefresh={feed.refresh} tintColor={c.primary} />}>
      <View style={[styles.segment, { backgroundColor: c.surfaceAlt }]}>
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
            style={[styles.segmentItem, tab === key && { backgroundColor: c.surface }]}>
            <T variant="label" tone={tab === key ? 'default' : 'muted'}>
              {label}
            </T>
          </Pressable>
        ))}
      </View>

      {tab === 'newsletter' ? (
        <Card tone="accent" style={{ marginBottom: Space.md, gap: Space.sm }}>
          <T variant="heading">Know what&apos;s happening in Korea in 5 minutes</T>
          <T tone="muted">K-drama, travel, fashion and news — free in your inbox every week.</T>
          <Button label="Subscribe free" icon="mail" variant="accent" onPress={() => openLink(Config.newsletterSubscribeUrl)} />
        </Card>
      ) : null}

      {feed.error && feed.data ? (
        <T variant="caption" tone="warning" style={{ marginBottom: Space.sm }}>
          You&apos;re offline — showing the copy saved on your phone.
        </T>
      ) : null}

      {!feed.data && feed.loading ? <Loading /> : null}
      {!feed.data && !feed.loading && feed.error ? (
        <EmptyState
          icon="cloud-offline"
          title="Can't reach the internet"
          body="Connect once and articles are saved for offline reading."
          action={
            <View style={{ flexDirection: 'row', gap: Space.sm }}>
              <Button label="Try again" size="sm" onPress={feed.refresh} />
              <Button
                label="Open website"
                size="sm"
                variant="secondary"
                onPress={() => openLink(tab === 'guides' ? Config.blogUrl : Config.newsletterUrl)}
              />
            </View>
          }
        />
      ) : null}

      <View style={{ gap: Space.sm }}>
        {(feed.data ?? []).map((a) => (
          <ArticleRow key={a.id} article={a} />
        ))}
      </View>

      {feed.data?.length ? (
        <Button
          label={tab === 'guides' ? 'All guides on unravelkorea.com' : 'Full Seoul Sip archive'}
          variant="ghost"
          icon="open"
          style={{ marginTop: Space.md }}
          onPress={() => openLink(tab === 'guides' ? Config.blogUrl : `${Config.newsletterUrl}/archive`)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', padding: 4, borderRadius: Radius.md, marginBottom: Space.lg },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.sm },
});

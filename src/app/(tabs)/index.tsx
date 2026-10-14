import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { ArticleRow, openLink } from '@/components/article-row';
import { CategoryTile } from '@/components/spot-card';
import { Button, Card, Icon, Screen, Section, T } from '@/components/ui';
import { Config, Essentials } from '@/config';
import { Spots, type Spot } from '@/data/spots';
import { fetchGuides, fetchNewsletter } from '@/lib/content';
import { useFeed } from '@/lib/use-feed';
import { tripPhase, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

export default function HomeScreen() {
  const { trip, prefs } = useAppState();
  const [adding, setAdding] = useState<Spot | null>(null);
  const guides = useFeed('guides', fetchGuides);
  const newsletter = useFeed('newsletter', fetchNewsletter);

  const picks = useMemo(() => {
    const planned = new Set(trip.days.flat());
    const scored = Spots.filter((s) => !planned.has(s.id)).map((s) => ({
      spot: s,
      score: s.interests.filter((i) => prefs.interests.includes(i)).length,
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, 8).map((x) => x.spot);
  }, [trip.days, prefs.interests]);

  return (
    <Screen title="안녕하세요 👋" subtitle="Your Korea trip, all in one place.">
      <TripStatusCard />

      <Section title="Picked for you" action="See all" onAction={() => router.push('/explore')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.md }}>
          {picks.map((s) => (
            <PickCard key={s.id} spot={s} onAdd={() => setAdding(s)} />
          ))}
        </ScrollView>
      </Section>

      <Section title="Latest guides" action="More" onAction={() => router.push('/read')}>
        <View style={{ gap: Space.sm }}>
          {(guides.data ?? []).slice(0, 2).map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
          {!guides.data && guides.error ? <T tone="muted">Guides need a connection the first time.</T> : null}
        </View>
      </Section>

      <Section title="Seoul Sip ☕" action="More" onAction={() => router.push({ pathname: '/read', params: { tab: 'newsletter' } })}>
        <T tone="muted" style={{ marginBottom: Space.md }}>
          What&apos;s happening in Korea, in 5 minutes. Free, weekly.
        </T>
        <View style={{ gap: Space.sm }}>
          {(newsletter.data ?? []).slice(0, 2).map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </View>
        <Button
          label="Subscribe to Seoul Sip"
          icon="mail"
          variant="accent"
          style={{ marginTop: Space.md }}
          onPress={() => openLink(Config.newsletterSubscribeUrl)}
        />
      </Section>

      <Section title="Before you fly">
        <View style={{ gap: Space.sm }}>
          {Essentials.map((e) => (
            <Card key={e.id} onPress={() => openLink(e.url)} style={styles.essential}>
              <Icon name={e.icon} size={22} />
              <View style={{ flex: 1 }}>
                <T variant="heading">{e.title}</T>
                <T variant="caption" tone="muted">
                  {e.subtitle}
                </T>
              </View>
              <Icon name="chevron-forward" size={18} />
            </Card>
          ))}
        </View>
        <T variant="caption" tone="muted" style={{ marginTop: Space.sm }}>
          Some links are affiliate links — they support Unravel Korea at no extra cost to you.
        </T>
      </Section>

      <AddToTripSheet spot={adding} onClose={() => setAdding(null)} />
    </Screen>
  );
}

function TripStatusCard() {
  const { trip } = useAppState();
  const phase = tripPhase(trip);
  const stops = trip.days.reduce((n, d) => n + d.length, 0);

  let eyebrow = 'YOUR TRIP';
  let headline = '';
  let body = '';
  let cta: { label: string; icon: string; go: () => void };

  switch (phase.kind) {
    case 'empty':
      headline = 'Plan your Korea trip';
      body = `Pick spots, drop them on days, and carry the plan offline. Takes about 2 minutes.`;
      cta = { label: 'Start planning', icon: 'compass', go: () => router.push('/explore') };
      break;
    case 'undated':
      headline = trip.name;
      body = `${stops} stops across ${trip.days.length} days. Add your start date to get closed-day warnings.`;
      cta = { label: 'Open my trip', icon: 'calendar', go: () => router.push('/trip') };
      break;
    case 'upcoming':
      eyebrow = 'COUNTDOWN';
      headline = phase.daysToGo === 1 ? 'Tomorrow! 🎉' : `${phase.daysToGo} days to go`;
      body = `${trip.name} · ${stops} stops over ${trip.days.length} days.`;
      cta = { label: 'Review my trip', icon: 'calendar', go: () => router.push('/trip') };
      break;
    case 'during': {
      const todays = trip.days[phase.dayIndex]?.length ?? 0;
      eyebrow = `DAY ${phase.dayIndex + 1} OF ${trip.days.length}`;
      headline = todays ? `${todays} stop${todays > 1 ? 's' : ''} today` : 'A free day today';
      body = 'Directions, Korean addresses for taxis, and opening hours — all offline.';
      cta = { label: 'Open Today mode', icon: 'navigate', go: () => router.push('/today') };
      break;
    }
    case 'past':
      headline = 'Welcome back!';
      body = 'Hope Korea was everything. Ready to plan the next one?';
      cta = { label: 'Plan another trip', icon: 'compass', go: () => router.push('/trip') };
      break;
  }

  return (
    <Card tone="primary" style={{ gap: Space.sm }}>
      <T variant="caption" tone="onPrimary" style={{ opacity: 0.85, letterSpacing: 1 }}>
        {eyebrow}
      </T>
      <T variant="title" tone="onPrimary">
        {headline}
      </T>
      <T tone="onPrimary" style={{ opacity: 0.9 }}>
        {body}
      </T>
      <Pressable onPress={cta.go} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]} accessibilityRole="button">
        <Icon name={cta.icon} size={18} color="#1A1F2B" />
        <T variant="label" style={{ color: '#1A1F2B' }}>
          {cta.label}
        </T>
      </Pressable>
    </Card>
  );
}

function PickCard({ spot, onAdd }: { spot: Spot; onAdd: () => void }) {
  const c = useColors();
  return (
    <Card
      onPress={() => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })}
      style={styles.pick}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <CategoryTile spot={spot} size={40} />
        <Pressable onPress={onAdd} hitSlop={10} accessibilityLabel={`Add ${spot.name} to trip`}>
          <Icon name="add-circle" size={28} color={c.primary} />
        </Pressable>
      </View>
      <T variant="heading" numberOfLines={2} style={{ marginTop: Space.sm }}>
        {spot.name}
      </T>
      <T variant="caption" tone="muted" numberOfLines={1}>
        {spot.nameKo} · {spot.area}
      </T>
    </Card>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.pill,
    marginTop: Space.xs,
  },
  pick: { width: 180, padding: Space.md, minHeight: 150 },
  essential: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
});

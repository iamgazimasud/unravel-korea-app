import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { ArticleRow, openLink } from '@/components/article-row';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { PhotoCard } from '@/components/spot-card';
import { BrandHeader, Card, HeaderPill, Icon, IconCircle, Screen, Section, T } from '@/components/ui';
import { Essentials } from '@/config';
import { getSpot, Spots, type Spot } from '@/data/spots';
import { fetchLatestGuides, fetchNewsletter } from '@/lib/content';
import { useFeed } from '@/lib/use-feed';
import { doneKey, stopCount, tripPhase, useAppState, type Trip } from '@/state/app-state';
import { ScreenPadding, Space } from '@/theme';

export default function HomeScreen() {
  const { trip, prefs } = useAppState();
  const [adding, setAdding] = useState<Spot | null>(null);
  const guides = useFeed('guides', fetchLatestGuides);
  const newsletter = useFeed('newsletter', fetchNewsletter);

  const picks = useMemo(() => {
    const planned = new Set(trip.days.flat());
    const scored = Spots.filter((s) => !planned.has(s.id)).map((s) => ({
      spot: s,
      score: s.interests.filter((i) => prefs.interests.includes(i)).length,
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.spot);
  }, [trip.days, prefs.interests]);

  return (
    <Screen header={<TripHeader trip={trip} />}>
      <Section title="Picked for you" action="See all" onAction={() => router.push('/explore')}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -ScreenPadding }}
          contentContainerStyle={{ gap: Space.md, paddingHorizontal: ScreenPadding }}>
          {picks.map((s) => (
            <PhotoCard key={s.id} spot={s} onAdd={() => setAdding(s)} />
          ))}
        </ScrollView>
      </Section>

      <Section title="Latest guides" action="More" onAction={() => router.push('/read')}>
        <View style={{ gap: Space.sm }}>
          {(guides.data ?? []).slice(0, 3).map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
          {!guides.data && guides.error ? <T tone="muted">Guides need a connection the first time.</T> : null}
        </View>
      </Section>

      <Card tone="navy" style={styles.sip}>
        <View style={styles.sipHead}>
          <IconCircle name="cafe" size={40} />
          <View style={{ flex: 1 }}>
            <T variant="title" tone="inverse">
              Seoul Sip
            </T>
            <T tone="inverse" style={{ opacity: 0.85 }}>
              What&apos;s happening in Korea, in 5 minutes. Free, weekly.
            </T>
          </View>
        </View>
        {(newsletter.data ?? []).slice(0, 2).map((a) => (
          <Pressable key={a.id} onPress={() => openLink(a.url)} style={styles.sipRow} accessibilityRole="link">
            <T variant="label" tone="inverse" numberOfLines={1} style={{ flex: 1 }}>
              {a.title}
            </T>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </Pressable>
        ))}
        <View style={{ marginTop: Space.md }}>
          <NewsletterSignup onDark />
        </View>
      </Card>

      <Section title="Before you fly">
        <View style={{ gap: Space.sm }}>
          {Essentials.map((e) => (
            <Card key={e.id} onPress={() => openLink(e.url)} style={styles.essential} accessibilityLabel={e.title}>
              <IconCircle name={e.icon} />
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

/** The trip status lives inside the blue brand header. */
function TripHeader({ trip }: { trip: Trip }) {
  const phase = tripPhase(trip);
  const stops = stopCount(trip);

  switch (phase.kind) {
    case 'empty':
      return (
        <BrandHeader
          logo
          eyebrow="안녕하세요 👋"
          title="Plan your Korea trip"
          subtitle="Pick places, drop them on days, and carry the plan offline.">
          <HeaderPill label="Start planning" icon="compass" onPress={() => router.push('/explore')} />
        </BrandHeader>
      );
    case 'undated':
      return (
        <BrandHeader
          logo
          eyebrow="YOUR TRIP"
          title={trip.name}
          subtitle={`${stops} stops over ${trip.days.length} days · add dates for closed-day warnings`}>
          <HeaderPill label="Open my trip" icon="calendar" onPress={() => router.push('/trip')} />
        </BrandHeader>
      );
    case 'upcoming':
      return (
        <BrandHeader
          logo
          eyebrow={`COUNTDOWN · ${trip.name.toUpperCase()}`}
          title={phase.daysToGo === 1 ? 'Tomorrow! 🎉' : `${phase.daysToGo} days to go`}
          subtitle={`${stops} stops planned over ${trip.days.length} days.`}>
          <HeaderPill label="Review my trip" icon="calendar" onPress={() => router.push('/trip')} />
        </BrandHeader>
      );
    case 'during': {
      const today = trip.days[phase.dayIndex] ?? [];
      const nextId = today.find((id) => !trip.done.includes(doneKey(phase.dayIndex, id)));
      const next = nextId ? getSpot(nextId) : undefined;
      return (
        <BrandHeader
          logo
          eyebrow={`DAY ${phase.dayIndex + 1} OF ${trip.days.length}`}
          title={today.length ? `${today.length} stop${today.length > 1 ? 's' : ''} today` : 'A free day today'}
          subtitle={next ? `Next: ${next.name} · ${next.nameKo}` : today.length ? 'All done for today 🎉' : undefined}>
          <HeaderPill label="Open Today mode" icon="navigate" onPress={() => router.push('/today')} />
        </BrandHeader>
      );
    }
    case 'past':
      return (
        <BrandHeader logo eyebrow="WELCOME BACK" title="Hope Korea was amazing" subtitle="Ready to plan the next one?">
          <HeaderPill label="Plan another trip" icon="compass" onPress={() => router.push('/trip')} />
        </BrandHeader>
      );
  }
}

const styles = StyleSheet.create({
  sip: { marginTop: Space.xl, gap: Space.sm },
  sipHead: { flexDirection: 'row', gap: Space.md, alignItems: 'center', marginBottom: Space.xs },
  sipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  essential: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md },
});

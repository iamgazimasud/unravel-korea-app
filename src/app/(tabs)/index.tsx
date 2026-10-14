import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { openLink } from '@/components/article-row';
import { PlanCard } from '@/components/plan-card';
import { SpotPhoto } from '@/components/spot-card';
import { TripSettingsSheet } from '@/components/trip-settings-sheet';
import {
  Badge,
  BrandHeader,
  Button,
  Card,
  HeaderButton,
  HeaderPill,
  Icon,
  IconCircle,
  Screen,
  Section,
  T,
} from '@/components/ui';
import { Essentials } from '@/config';
import { Plans } from '@/data/plans';
import { getSpot, isClosedOn, Spots, type Spot } from '@/data/spots';
import { addDays, formatDate, parseISODate } from '@/lib/dates';
import { confirm } from '@/lib/platform';
import { plural } from '@/lib/text';
import {
  dayDate,
  dayTitle,
  doneKey,
  stopCount,
  tripPhase,
  useAppState,
  type Trip,
  type TripPhase,
} from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

const PHOTO_SLOTS = 4;

const openDay = (day: number) => router.push({ pathname: '/today', params: { day: String(day) } });

export default function MyTripScreen() {
  const { trip, prefs, startPlan } = useAppState();
  const [settings, setSettings] = useState(false);
  const phase = tripPhase(trip);
  const hasPlan = stopCount(trip) > 0;

  return (
    <Screen header={<TripHeader trip={trip} phase={phase} onSettings={() => setSettings(true)} />}>
      {hasPlan ? (
        <Section title="Your days" action="Add places" onAction={() => router.push('/explore')}>
          <View style={{ gap: Space.md }}>
            {trip.days.map((ids, i) => (
              <DayCard
                key={i}
                trip={trip}
                day={i}
                ids={ids}
                isToday={phase.kind === 'during' && phase.dayIndex === i}
              />
            ))}
          </View>
        </Section>
      ) : (
        <Section title="How long is your trip?">
          <View style={{ gap: Space.md }}>
            {Plans.map((p) => (
              <PlanCard key={p.id} plan={p} onPress={() => startPlan(p.id)} />
            ))}
          </View>
          <Button
            label={`Or build your own from ${Spots.length} places`}
            icon="compass"
            variant="ghost"
            style={{ marginTop: Space.sm }}
            onPress={() => router.push('/explore')}
          />
        </Section>
      )}

      <Section title="Before you fly">
        <View style={styles.tiles}>
          {Essentials.map((e) => (
            <Card key={e.id} onPress={() => openLink(e.url)} style={styles.tile} accessibilityLabel={e.title}>
              <IconCircle name={e.icon} size={38} />
              <T variant="label" numberOfLines={2}>
                {e.title}
              </T>
            </Card>
          ))}
        </View>
        <T variant="caption" tone="muted" style={{ marginTop: Space.sm }}>
          Some links are affiliate links — they support Unravel Korea at no extra cost to you.
        </T>
      </Section>

      {!prefs.subscribed ? (
        <Card tone="navy" onPress={() => router.push('/read')} style={styles.sip} accessibilityLabel="Seoul Sip">
          <IconCircle name="cafe" size={44} />
          <View style={{ flex: 1 }}>
            <T variant="heading" tone="inverse">
              Get Seoul Sip ☕
            </T>
            <T variant="caption" tone="inverse" style={{ opacity: 0.85 }}>
              What&apos;s happening in Korea, in 5 minutes. Free every week.
            </T>
          </View>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </Card>
      ) : null}

      <TripSettingsSheet visible={settings} onClose={() => setSettings(false)} />
    </Screen>
  );
}

/** One line about where you are in the trip, plus the single most useful next action. */
function TripHeader({ trip, phase, onSettings }: { trip: Trip; phase: TripPhase; onSettings: () => void }) {
  const { clearStops, setStartDate } = useAppState();
  const stops = stopCount(trip);
  const places = `${plural(trip.days.length, 'day')} · ${plural(stops, 'place')}`;
  // Always reachable: it is the only place to set the arrival date and the trip length.
  const settings = <HeaderButton icon="options" label="Trip settings" onPress={onSettings} />;

  switch (phase.kind) {
    case 'empty':
      return (
        <BrandHeader
          logo
          right={settings}
          eyebrow="안녕하세요 👋"
          title="Plan your Korea trip"
          subtitle="Pick a ready-made plan from our Seoul guide. You can change anything later."
        />
      );
    case 'undated':
      return (
        <BrandHeader logo right={settings} eyebrow="YOUR TRIP" title={trip.name} subtitle={places}>
          <HeaderPill label="When do you land?" icon="calendar" onPress={onSettings} />
        </BrandHeader>
      );
    case 'upcoming': {
      const range = `${formatDate(trip.startDate!)} – ${formatDate(addDays(trip.startDate!, trip.days.length - 1))}`;
      return (
        <BrandHeader
          logo
          right={settings}
          eyebrow={trip.name.toUpperCase()}
          title={phase.daysToGo === 1 ? 'Tomorrow! 🎉' : `${phase.daysToGo} days to go`}
          subtitle={stops ? `${range} · ${plural(stops, 'place')}` : range}
        />
      );
    }
    case 'during': {
      const ids = trip.days[phase.dayIndex] ?? [];
      const nextId = ids.find((id) => !trip.done.includes(doneKey(phase.dayIndex, id)));
      const next = nextId ? getSpot(nextId) : undefined;
      return (
        <BrandHeader
          logo
          right={settings}
          eyebrow={`TODAY · DAY ${phase.dayIndex + 1} OF ${trip.days.length}`}
          title={dayTitle(trip, phase.dayIndex)}
          subtitle={next ? `Next: ${next.name}` : ids.length ? 'All done for today 🎉' : 'A free day — enjoy it'}>
          <HeaderPill label="Open today's plan" icon="navigate" onPress={() => openDay(phase.dayIndex)} />
        </BrandHeader>
      );
    }
    case 'past':
      return (
        <BrandHeader logo right={settings} eyebrow="WELCOME BACK" title="Hope Korea was amazing">
          <HeaderPill
            label="Plan a new trip"
            icon="refresh"
            onPress={async () => {
              if (await confirm('Plan a new trip?', 'This clears your last trip.', 'Start fresh')) {
                clearStops();
                setStartDate(null);
              }
            }}
          />
        </BrandHeader>
      );
  }
}

/** A day at a glance: theme, date, photos of its places. Tap to open the day. */
function DayCard({ trip, day, ids, isToday }: { trip: Trip; day: number; ids: string[]; isToday: boolean }) {
  const c = useColors();
  const date = dayDate(trip, day);
  const spots = ids.map(getSpot).filter((s): s is Spot => !!s);
  const hours = spots.reduce((h, s) => h + s.duration, 0);
  const closed = date ? spots.filter((s) => isClosedOn(s, parseISODate(date))).length : 0;
  const done = spots.filter((s) => trip.done.includes(doneKey(day, s.id))).length;
  const title = dayTitle(trip, day);

  return (
    <Card
      onPress={() => openDay(day)}
      style={[styles.day, isToday && { borderWidth: 2, borderColor: c.primary }]}
      accessibilityLabel={`Day ${day + 1}: ${title}`}>
      <View style={styles.dayHead}>
        <View style={[styles.dayNumber, { backgroundColor: isToday ? c.primary : c.primarySoft }]}>
          <T variant="heading" style={{ color: isToday ? c.onPrimary : c.primary }}>
            {day + 1}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="caption" tone="muted">
            {[isToday ? 'Today' : `Day ${day + 1}`, date ? formatDate(date, { weekday: 'short' }) : null]
              .filter(Boolean)
              .join(' · ')}
          </T>
          <T variant="heading" numberOfLines={1}>
            {title}
          </T>
        </View>
        <Icon name="chevron-forward" size={18} color={c.textMuted} />
      </View>

      {spots.length ? (
        // Always four equal slots, so every day card lines up: up to 4 photos, or 3 and a "+N" tile.
        <View style={styles.photos}>
          {Array.from({ length: PHOTO_SLOTS }, (_, k) => {
            const overflow = spots.length > PHOTO_SLOTS && k === PHOTO_SLOTS - 1;
            if (overflow) {
              return (
                <View key="more" style={[styles.photo, styles.more, { backgroundColor: c.primarySoft }]}>
                  <T variant="label" tone="primary">
                    +{spots.length - k}
                  </T>
                </View>
              );
            }
            const s = spots[k];
            return s ? <SpotPhoto key={s.id} spot={s} style={styles.photo} /> : <View key={k} style={styles.photo} />;
          })}
        </View>
      ) : null}

      <View style={styles.meta}>
        <T variant="caption" tone="muted">
          {spots.length ? `${plural(spots.length, 'place')} · ~${hours}h` : 'Free day — tap to add places'}
        </T>
        {done ? <Badge tone="success" icon="checkmark" label={`${done} done`} /> : null}
        {closed ? <Badge tone="warning" icon="alert-circle" label={`${closed} closed this day`} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  day: { gap: Space.md, padding: Space.md },
  dayHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  dayNumber: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  photos: { flexDirection: 'row', gap: 6 },
  photo: { flex: 1, height: 68, borderRadius: Radius.md },
  more: { alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Space.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  tile: { flexBasis: '47%', flexGrow: 1, gap: Space.sm, padding: Space.md },
  sip: { flexDirection: 'row', alignItems: 'center', gap: Space.md, marginTop: Space.xl },
});

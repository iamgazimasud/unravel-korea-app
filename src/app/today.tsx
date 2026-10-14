import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ShowKoreanModal } from '@/components/show-korean-modal';
import { SpotPhoto } from '@/components/spot-card';
import { StopActionsSheet, type StopRef } from '@/components/stop-actions-sheet';
import { Badge, BrandHeader, Button, Card, EmptyState, Icon, IconButton, Screen, T } from '@/components/ui';
import { getSpot, isClosedOn, type Spot } from '@/data/spots';
import { formatDate, parseISODate, weekdayName } from '@/lib/dates';
import { openInMap } from '@/lib/maps';
import { dayDate, dayTitle, doneKey, tripPhase, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

/**
 * One day of the trip: what's next, how to get there, and Korean text for the taxi — all offline.
 * Opens on `?day=N` (0-based) or, without it, on today's day of the trip.
 */
export default function DayScreen() {
  const c = useColors();
  const params = useLocalSearchParams<{ day?: string }>();
  const { ready, trip, toggleDone } = useAppState();
  const [taxiFor, setTaxiFor] = useState<Spot | null>(null);
  const [actionsFor, setActionsFor] = useState<StopRef | null>(null);

  // Wait for the saved trip, otherwise a cold start on this screen would show the wrong day.
  if (!ready) return null;

  const phase = tripPhase(trip);
  const todayIndex = phase.kind === 'during' ? phase.dayIndex : null;
  const requested = Number.parseInt(params.day ?? '', 10);
  const day = Math.max(0, Math.min(Number.isNaN(requested) ? (todayIndex ?? 0) : requested, trip.days.length - 1));
  const isToday = day === todayIndex;
  const date = dayDate(trip, day);
  const spots = trip.days[day].map(getSpot).filter((s): s is Spot => !!s);
  const isDone = (id: string) => trip.done.includes(doneKey(day, id));
  const next = spots.find((s) => !isDone(s.id));
  const doneCount = spots.filter((s) => isDone(s.id)).length;

  const header = (
    <BrandHeader
      back
      eyebrow={`${isToday ? 'TODAY · ' : ''}DAY ${day + 1} OF ${trip.days.length}`}
      title={dayTitle(trip, day)}
      subtitle={[
        date ? formatDate(date, { weekday: 'long' }) : null,
        spots.length ? `${doneCount} of ${spots.length} done` : null,
      ]
        .filter(Boolean)
        .join(' · ')}
    />
  );

  return (
    <Screen header={header}>
      {spots.length === 0 ? (
        <View style={{ marginTop: Space.md }}>
          <EmptyState
            icon="sunny"
            title="A free day"
            body="Nothing planned — wander, or add a few places."
            action={<Button label="Add places" icon="add" size="sm" onPress={() => router.push('/explore')} />}
          />
        </View>
      ) : null}

      {next ? (
        <Card style={styles.next}>
          <View>
            <SpotPhoto spot={next} style={styles.nextPhoto} />
            <View style={styles.nextBadge}>
              <Badge tone="onPhoto" icon="navigate" label={`NEXT UP · ${doneCount + 1} of ${spots.length}`} />
            </View>
          </View>
          <View style={styles.nextBody}>
            <T variant="eyebrow" tone="primary">
              NEXT UP
            </T>
            <T variant="title">{next.name}</T>
            <T style={[styles.bigKorean, { color: c.text }]}>{next.nameKo}</T>
            <View style={styles.fact}>
              <Icon name="train" size={16} color={c.primary} />
              <T tone="muted" style={{ flex: 1 }}>
                {next.directions}
              </T>
            </View>
            {next.hours ? (
              <View style={styles.fact}>
                <Icon name="time" size={16} color={c.primary} />
                <T tone="muted" style={{ flex: 1 }}>
                  {next.hours}
                </T>
              </View>
            ) : null}
            {date && isClosedOn(next, parseISODate(date)) ? (
              <Badge
                tone="warning"
                icon="alert-circle"
                label={`Usually closed ${isToday ? 'today' : `on ${weekdayName(date)}s`} — check before going`}
              />
            ) : null}
            <View style={styles.row}>
              <Button
                label="Directions"
                icon="navigate"
                style={{ flex: 1 }}
                onPress={() => openInMap('naver', next.mapQuery)}
              />
              <Button
                label="Taxi card"
                icon="car"
                variant="accent"
                style={{ flex: 1 }}
                onPress={() => setTaxiFor(next)}
              />
            </View>
            <Button label="Mark as done" icon="checkmark" variant="ghost" onPress={() => toggleDone(day, next.id)} />
          </View>
        </Card>
      ) : spots.length ? (
        <Card tone="accent" style={{ marginTop: Space.md, alignItems: 'center', gap: Space.sm }}>
          <Icon name="trophy" size={30} color={c.primary} />
          <T variant="title">All done 🎉</T>
          <T tone="muted">Time for Korean BBQ and an early night.</T>
        </Card>
      ) : null}

      {spots.length ? (
        <View style={{ marginTop: Space.xl, gap: Space.sm }}>
          <T variant="title">The plan</T>
          {spots.map((s, i) => {
            const done = isDone(s.id);
            return (
              <Card key={s.id} style={styles.stop}>
                <Pressable
                  onPress={() => toggleDone(day, s.id)}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={`Mark ${s.name} as done`}
                  style={[
                    styles.check,
                    { borderColor: done ? c.success : c.primary, backgroundColor: done ? c.success : 'transparent' },
                  ]}>
                  {done ? (
                    <Icon name="checkmark" size={16} color="#fff" />
                  ) : (
                    <T variant="caption" tone="primary">
                      {i + 1}
                    </T>
                  )}
                </Pressable>
                <SpotPhoto spot={s} style={[styles.thumb, done && { opacity: 0.5 }]} />
                <Pressable
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/spot/[id]', params: { id: s.id } })}>
                  <T variant="label" style={done && { textDecorationLine: 'line-through', opacity: 0.6 }}>
                    {s.name}
                  </T>
                  <T variant="caption" tone="muted">
                    {s.nameKo} · ~{s.duration}h
                  </T>
                </Pressable>
                <IconButton
                  icon="ellipsis-horizontal"
                  label={`Change ${s.name}`}
                  onPress={() => setActionsFor({ day, index: i })}
                />
              </Card>
            );
          })}
          <Button
            label="Add a place"
            icon="add"
            variant="secondary"
            style={{ marginTop: Space.sm }}
            onPress={() => router.push('/explore')}
          />
        </View>
      ) : null}

      <StopActionsSheet stop={actionsFor} onClose={() => setActionsFor(null)} />
      <ShowKoreanModal
        visible={!!taxiFor}
        onClose={() => setTaxiFor(null)}
        lead="여기로 가 주세요"
        korean={taxiFor?.nameKo ?? ''}
        caption={taxiFor ? `Please take me to ${taxiFor.name}` : ''}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  next: { marginTop: Space.sm, padding: 0, overflow: 'hidden' },
  nextPhoto: { height: 170 },
  nextBadge: { position: 'absolute', left: Space.md, top: Space.md },
  nextBody: { padding: Space.lg, gap: Space.sm },
  bigKorean: { fontSize: 34, lineHeight: 42, fontWeight: '800' },
  fact: { flexDirection: 'row', gap: Space.sm, alignItems: 'flex-start' },
  row: { flexDirection: 'row', gap: Space.sm, marginTop: Space.sm },
  stop: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: 10 },
  thumb: { width: 48, height: 48, borderRadius: Radius.sm },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

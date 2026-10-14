import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ShowKoreanModal } from '@/components/show-korean-modal';
import { Badge, Button, Card, Chip, EmptyState, Icon, IconButton, Page, T } from '@/components/ui';
import { getSpot, isClosedOn, type Spot } from '@/data/spots';
import { formatDate, parseISODate } from '@/lib/dates';
import { openInMap } from '@/lib/maps';
import { dayDate, tripPhase, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

/** On-the-ground view: what's next, how to get there, and Korean text for the taxi — all offline. */
export default function TodayScreen() {
  const c = useColors();
  const { trip, toggleDone } = useAppState();
  const phase = tripPhase(trip);
  const [day, setDay] = useState(phase.kind === 'during' ? phase.dayIndex : 0);
  const [taxiFor, setTaxiFor] = useState<Spot | null>(null);

  const safeDay = Math.min(day, trip.days.length - 1);
  const date = dayDate(trip, safeDay);
  const spots = trip.days[safeDay].map(getSpot).filter((s): s is Spot => !!s);
  const isDone = (id: string) => trip.done.includes(`${safeDay}:${id}`);
  const next = spots.find((s) => !isDone(s.id));
  const doneCount = spots.filter((s) => isDone(s.id)).length;

  return (
    <Page>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {trip.days.map((_, i) => (
          <Chip
            key={i}
            label={phase.kind === 'during' && phase.dayIndex === i ? `Day ${i + 1} · today` : `Day ${i + 1}`}
            selected={i === safeDay}
            onPress={() => setDay(i)}
          />
        ))}
      </ScrollView>

      <T variant="display">Day {safeDay + 1}</T>
      <T tone="muted">
        {date ? formatDate(date, { weekday: 'long' }) : 'Add a start date in My Trip to see dates'}
        {spots.length ? ` · ${doneCount} of ${spots.length} done` : ''}
      </T>

      {spots.length === 0 ? (
        <View style={{ marginTop: Space.xl }}>
          <EmptyState
            icon="sunny"
            title="A free day"
            body="Nothing planned — wander, or add a few spots."
            action={<Button label="Browse spots" size="sm" onPress={() => router.push('/explore')} />}
          />
        </View>
      ) : null}

      {next ? (
        <Card style={[styles.next, { borderColor: c.primary }]}>
          <T variant="caption" tone="primary" style={{ letterSpacing: 1 }}>
            NEXT UP
          </T>
          <T variant="title">{next.name}</T>
          <T style={[styles.bigKorean, { color: c.text }]}>{next.nameKo}</T>
          <View style={{ flexDirection: 'row', gap: Space.sm, alignItems: 'flex-start' }}>
            <Icon name="train" size={16} color={c.textMuted} />
            <T tone="muted" style={{ flex: 1 }}>
              {next.directions}
            </T>
          </View>
          {next.hours ? (
            <View style={{ flexDirection: 'row', gap: Space.sm, alignItems: 'flex-start' }}>
              <Icon name="time" size={16} color={c.textMuted} />
              <T tone="muted" style={{ flex: 1 }}>
                {next.hours}
              </T>
            </View>
          ) : null}
          {date && isClosedOn(next, parseISODate(date)) ? (
            <Badge tone="warning" icon="alert-circle" label="Usually closed today — check before going" />
          ) : null}
          <View style={styles.row}>
            <Button label="Naver Map" icon="navigate" style={{ flex: 1 }} onPress={() => openInMap('naver', next.mapQuery)} />
            <Button label="Taxi" icon="car" variant="secondary" style={{ flex: 1 }} onPress={() => setTaxiFor(next)} />
          </View>
          <Button label="Mark as done" icon="checkmark" variant="ghost" onPress={() => toggleDone(safeDay, next.id)} />
        </Card>
      ) : spots.length ? (
        <Card tone="accent" style={{ marginTop: Space.lg, alignItems: 'center', gap: Space.sm }}>
          <Icon name="trophy" size={28} color={c.accent} />
          <T variant="heading">All done for today 🎉</T>
          <T tone="muted">Time for Korean BBQ and an early night.</T>
        </Card>
      ) : null}

      {spots.length ? (
        <View style={{ marginTop: Space.xl, gap: Space.sm }}>
          <T variant="heading">Today&apos;s plan</T>
          {spots.map((s, i) => {
            const done = isDone(s.id);
            return (
              <View key={s.id} style={[styles.stop, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Pressable
                  onPress={() => toggleDone(safeDay, s.id)}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: done }}
                  accessibilityLabel={`Mark ${s.name} as done`}
                  style={[
                    styles.check,
                    { borderColor: done ? c.success : c.border, backgroundColor: done ? c.success : 'transparent' },
                  ]}>
                  {done ? <Icon name="checkmark" size={16} color="#fff" /> : <T variant="caption">{i + 1}</T>}
                </Pressable>
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => router.push({ pathname: '/spot/[id]', params: { id: s.id } })}>
                  <T variant="label" style={done && { textDecorationLine: 'line-through', opacity: 0.6 }}>
                    {s.name}
                  </T>
                  <T variant="caption" tone="muted">
                    {s.nameKo} · ~{s.duration}h
                  </T>
                </Pressable>
                <IconButton icon="navigate" label={`Directions to ${s.name}`} onPress={() => openInMap('naver', s.mapQuery)} />
              </View>
            );
          })}
        </View>
      ) : null}

      <ShowKoreanModal
        visible={!!taxiFor}
        onClose={() => setTaxiFor(null)}
        lead="여기로 가 주세요"
        korean={taxiFor?.nameKo ?? ''}
        caption={taxiFor ? `Please take me to ${taxiFor.name}` : ''}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  chips: { gap: Space.sm, paddingBottom: Space.lg },
  next: { marginTop: Space.lg, gap: Space.sm, borderWidth: 2 },
  bigKorean: { fontSize: 34, lineHeight: 42, fontWeight: '800' },
  row: { flexDirection: 'row', gap: Space.sm, marginTop: Space.sm },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

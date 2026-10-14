import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateStepper, NumberStepper } from '@/components/steppers';
import { Badge, Button, Card, Icon, IconButton, Screen, T } from '@/components/ui';
import { getSpot, isClosedOn } from '@/data/spots';
import { addDays, formatDate, parseISODate, today } from '@/lib/dates';
import { confirm, shareText } from '@/lib/platform';
import { tripShareUrl, tripToText } from '@/lib/share';
import { dayDate, tripPhase, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

/** A comfortable sightseeing day, in hours on site (travel time comes on top). */
const BUSY_DAY_HOURS = 8;

type StopRef = { day: number; index: number };

export default function TripScreen() {
  const c = useColors();
  const { trip, setTripName, setStartDate, setDayCount, clearStops } = useAppState();
  const [actionsFor, setActionsFor] = useState<StopRef | null>(null);
  const stops = trip.days.reduce((n, d) => n + d.length, 0);
  const phase = tripPhase(trip);

  const share = () => shareText(`${tripToText(trip)}\n\nOpen it in the app: ${tripShareUrl(trip)}`, trip.name);

  return (
    <Screen
      title="My Trip"
      subtitle={stops ? `${stops} stops · ${trip.days.length} days` : 'Build your day-by-day plan.'}>
      <Card style={{ gap: Space.md }}>
        <View>
          <T variant="caption" tone="muted">
            TRIP NAME
          </T>
          <TextInput
            value={trip.name}
            onChangeText={setTripName}
            style={[styles.nameInput, { color: c.text, borderColor: c.border }]}
            maxLength={60}
            placeholder="My Korea trip"
            placeholderTextColor={c.textMuted}
          />
        </View>

        <View style={{ gap: Space.sm }}>
          <View style={styles.rowBetween}>
            <T variant="caption" tone="muted">
              START DATE
            </T>
            {trip.startDate ? (
              <Pressable onPress={() => setStartDate(null)} hitSlop={8}>
                <T variant="caption" tone="primary">
                  Not sure yet
                </T>
              </Pressable>
            ) : null}
          </View>
          {trip.startDate ? (
            <DateStepper value={trip.startDate} onChange={setStartDate} />
          ) : (
            <Button
              label="Set your start date"
              icon="calendar"
              variant="secondary"
              onPress={() => setStartDate(addDays(today(), 30))}
            />
          )}
        </View>

        <View style={{ gap: Space.sm }}>
          <T variant="caption" tone="muted">
            LENGTH
          </T>
          <NumberStepper value={trip.days.length} onChange={setDayCount} unit={['day', 'days']} />
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          label="Share"
          icon="share-social"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={share}
          disabled={!stops}
        />
        <Button
          label="Today mode"
          icon="navigate"
          style={{ flex: 1 }}
          onPress={() => router.push('/today')}
          disabled={!stops}
        />
      </View>
      {phase.kind === 'during' ? (
        <T variant="caption" tone="success" style={{ marginTop: Space.sm, textAlign: 'center' }}>
          You&apos;re on day {phase.dayIndex + 1} — Today mode opens it automatically.
        </T>
      ) : null}

      <View style={{ gap: Space.lg, marginTop: Space.xl }}>
        {trip.days.map((ids, day) => (
          <DaySection key={day} day={day} ids={ids} onStopActions={(index) => setActionsFor({ day, index })} />
        ))}
      </View>

      {stops ? (
        <Button
          label="Clear all stops"
          variant="ghost"
          icon="trash"
          style={{ marginTop: Space.xl }}
          onPress={async () => {
            if (await confirm('Clear your trip?', 'This removes every stop. Your days and dates stay.', 'Clear'))
              clearStops();
          }}
        />
      ) : null}

      <StopActionsSheet stop={actionsFor} onClose={() => setActionsFor(null)} />
    </Screen>
  );
}

function DaySection({
  day,
  ids,
  onStopActions,
}: {
  day: number;
  ids: string[];
  onStopActions: (index: number) => void;
}) {
  const c = useColors();
  const { trip, moveStop } = useAppState();
  const date = dayDate(trip, day);
  const hours = ids.reduce((h, id) => h + (getSpot(id)?.duration ?? 0), 0);
  const busy = hours > BUSY_DAY_HOURS;

  return (
    <View>
      <View style={styles.dayHeader}>
        <View style={[styles.dayNumber, { backgroundColor: c.text }]}>
          <T variant="label" style={{ color: c.background }}>
            {day + 1}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="heading">Day {day + 1}</T>
          {date ? (
            <T variant="caption" tone="muted">
              {formatDate(date)}
            </T>
          ) : null}
        </View>
        {ids.length ? (
          <Badge tone={busy ? 'warning' : 'muted'} icon="time" label={`~${hours}h${busy ? ' · packed' : ''}`} />
        ) : null}
      </View>

      {ids.length === 0 ? (
        <Pressable
          onPress={() => router.push('/explore')}
          style={({ pressed }) => [styles.emptyDay, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}>
          <Icon name="add" size={18} color={c.textMuted} />
          <T tone="muted">Free day — add spots from Explore</T>
        </Pressable>
      ) : (
        <View style={{ gap: Space.sm }}>
          {ids.map((id, index) => {
            const spot = getSpot(id);
            if (!spot) return null;
            const closed = date ? isClosedOn(spot, parseISODate(date)) : false;
            return (
              <Card
                key={id}
                style={styles.stop}
                onPress={() => router.push({ pathname: '/spot/[id]', params: { id } })}>
                <T variant="label" tone="muted" style={{ width: 18, textAlign: 'center' }}>
                  {index + 1}
                </T>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="heading" numberOfLines={2}>
                    {spot.name}
                  </T>
                  <T variant="caption" tone="muted" numberOfLines={1}>
                    {spot.nameKo} · ~{spot.duration}h
                  </T>
                  {closed ? <Badge tone="warning" icon="alert-circle" label="Closed this day" /> : null}
                </View>
                <View style={styles.stopControls}>
                  <IconButton
                    icon="chevron-up"
                    label="Move up"
                    disabled={index === 0}
                    onPress={() => moveStop(day, index, -1)}
                  />
                  <IconButton
                    icon="chevron-down"
                    label="Move down"
                    disabled={index === ids.length - 1}
                    onPress={() => moveStop(day, index, 1)}
                  />
                  <IconButton icon="ellipsis-horizontal" label="More actions" onPress={() => onStopActions(index)} />
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
}

function StopActionsSheet({ stop, onClose }: { stop: StopRef | null; onClose: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { trip, moveStopToDay, removeStop } = useAppState();
  const spot = stop ? getSpot(trip.days[stop.day]?.[stop.index] ?? '') : undefined;

  return (
    <Modal visible={!!stop && !!spot} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      {stop && spot ? (
        <View style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + Space.lg }]}>
          <T variant="title">{spot.name}</T>
          <T tone="muted" style={{ marginBottom: Space.md }}>
            Move to another day
          </T>
          <View style={styles.dayGrid}>
            {trip.days.map((_, d) => {
              const date = dayDate(trip, d);
              const closed = date ? isClosedOn(spot, parseISODate(date)) : false;
              const current = d === stop.day;
              return (
                <Pressable
                  key={d}
                  disabled={current}
                  onPress={() => {
                    moveStopToDay(stop.day, stop.index, d);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.dayChip,
                    {
                      backgroundColor: current ? c.text : closed ? c.warningSoft : c.surface,
                      borderColor: c.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <T variant="label" style={{ color: current ? c.background : closed ? c.warning : c.text }}>
                    Day {d + 1}
                  </T>
                  {closed ? (
                    <T variant="caption" tone="warning">
                      closed
                    </T>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <Button
            label="Remove from trip"
            icon="trash"
            variant="secondary"
            style={{ marginTop: Space.lg }}
            onPress={() => {
              removeStop(stop.day, stop.index);
              onClose();
            }}
          />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Space.sm, marginTop: Space.md },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md, marginBottom: Space.sm },
  dayNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  stop: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, padding: Space.md },
  stopControls: { flexDirection: 'row', gap: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  dayChip: {
    minWidth: 76,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
});

import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpotPhoto } from '@/components/spot-card';
import { DateStepper, NumberStepper } from '@/components/steppers';
import {
  Badge,
  BrandHeader,
  Button,
  Card,
  HeaderButton,
  HeaderPill,
  Icon,
  IconButton,
  Screen,
  T,
} from '@/components/ui';
import { getSpot, isClosedOn } from '@/data/spots';
import { addDays, formatDate, parseISODate, today } from '@/lib/dates';
import { confirm, shareText } from '@/lib/platform';
import { tripShareUrl, tripToText } from '@/lib/share';
import { dayDate, stopCount, tripPhase, useAppState } from '@/state/app-state';
import { Fonts, Radius, Space, useColors } from '@/theme';

/** A comfortable sightseeing day, in hours on site (travel time comes on top). */
const BUSY_DAY_HOURS = 8;

type StopRef = { day: number; index: number };

export default function TripScreen() {
  const { trip, setTripName, setStartDate, setDayCount, clearStops } = useAppState();
  const [actionsFor, setActionsFor] = useState<StopRef | null>(null);
  const stops = stopCount(trip);
  const phase = tripPhase(trip);

  const share = () => shareText(`${tripToText(trip)}\n\nOpen it in the app: ${tripShareUrl(trip)}`, trip.name);

  const dates = trip.startDate
    ? `${formatDate(trip.startDate)} – ${formatDate(addDays(trip.startDate, trip.days.length - 1))}`
    : 'No dates yet';

  const header = (
    <BrandHeader
      eyebrow="MY TRIP"
      right={stops ? <HeaderButton icon="share-social" label="Share trip" onPress={share} /> : undefined}>
      <TextInput
        value={trip.name}
        onChangeText={setTripName}
        style={styles.nameInput}
        maxLength={60}
        placeholder="My Korea trip"
        placeholderTextColor="rgba(255,255,255,0.6)"
        accessibilityLabel="Trip name"
      />
      <T tone="inverse" style={{ opacity: 0.88 }}>
        {`${dates} · ${trip.days.length} days · ${stops} stops`}
      </T>
      {stops ? (
        <View style={{ marginTop: Space.lg }}>
          <HeaderPill
            label={phase.kind === 'during' ? `Today mode · day ${phase.dayIndex + 1}` : 'Today mode'}
            icon="navigate"
            onPress={() => router.push('/today')}
          />
        </View>
      ) : null}
    </BrandHeader>
  );

  return (
    <Screen header={header}>
      <Card style={{ gap: Space.md }}>
        <View style={styles.rowBetween}>
          <T variant="label">Start date</T>
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
        <T variant="label">Length</T>
        <NumberStepper value={trip.days.length} onChange={setDayCount} unit={['day', 'days']} />
      </Card>

      <View style={{ gap: Space.xl, marginTop: Space.xl }}>
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
  const { trip } = useAppState();
  const date = dayDate(trip, day);
  const hours = ids.reduce((h, id) => h + (getSpot(id)?.duration ?? 0), 0);
  const busy = hours > BUSY_DAY_HOURS;

  return (
    <View>
      <View style={styles.dayHeader}>
        <View style={[styles.dayNumber, { backgroundColor: c.primary }]}>
          <T variant="label" tone="onPrimary">
            {day + 1}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="title">Day {day + 1}</T>
          {date ? (
            <T variant="caption" tone="muted">
              {formatDate(date)}
            </T>
          ) : null}
        </View>
        {ids.length ? (
          <Badge tone={busy ? 'warning' : 'primary'} icon="time" label={`~${hours}h${busy ? ' · packed' : ''}`} />
        ) : null}
      </View>

      {ids.length === 0 ? (
        <Pressable
          onPress={() => router.push('/explore')}
          style={({ pressed }) => [
            styles.emptyDay,
            { borderColor: c.primary, backgroundColor: c.primarySoft, opacity: pressed ? 0.7 : 1 },
          ]}>
          <Icon name="add-circle" size={20} color={c.primary} />
          <T variant="label" tone="primary">
            Free day — add places from Explore
          </T>
        </Pressable>
      ) : (
        <View style={[styles.timeline, { borderColor: c.primarySoft }]}>
          {ids.map((id, index) => {
            const spot = getSpot(id);
            if (!spot) return null;
            const closed = date ? isClosedOn(spot, parseISODate(date)) : false;
            return (
              <Card
                key={id}
                style={styles.stop}
                onPress={() => router.push({ pathname: '/spot/[id]', params: { id } })}
                accessibilityLabel={spot.name}>
                <SpotPhoto spot={spot} style={styles.thumb} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="heading" numberOfLines={2}>
                    {spot.name}
                  </T>
                  <T variant="caption" tone="muted" numberOfLines={1}>
                    {spot.nameKo} · ~{spot.duration}h
                  </T>
                  {closed ? <Badge tone="warning" icon="alert-circle" label="Closed this day" /> : null}
                </View>
                <IconButton icon="ellipsis-horizontal" label="Stop actions" onPress={() => onStopActions(index)} />
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
}

/** One sheet for everything you can do to a stop: reorder, move to another day, remove. */
function StopActionsSheet({ stop, onClose }: { stop: StopRef | null; onClose: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { trip, moveStop, moveStopToDay, removeStop } = useAppState();
  const spot = stop ? getSpot(trip.days[stop.day]?.[stop.index] ?? '') : undefined;
  const count = stop ? (trip.days[stop.day]?.length ?? 0) : 0;

  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <Modal visible={!!stop && !!spot} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      {stop && spot ? (
        <View style={[styles.sheet, { backgroundColor: c.background, paddingBottom: insets.bottom + Space.lg }]}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <View style={{ flexDirection: 'row', gap: Space.md, alignItems: 'center', marginBottom: Space.lg }}>
            <SpotPhoto spot={spot} style={styles.sheetThumb} />
            <View style={{ flex: 1 }}>
              <T variant="title" numberOfLines={2}>
                {spot.name}
              </T>
              <T variant="caption" tone="muted">
                Day {stop.day + 1} · stop {stop.index + 1} of {count}
              </T>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: Space.sm }}>
            <Button
              label="Move up"
              icon="arrow-up"
              variant="secondary"
              style={{ flex: 1 }}
              disabled={stop.index === 0}
              onPress={act(() => moveStop(stop.day, stop.index, -1))}
            />
            <Button
              label="Move down"
              icon="arrow-down"
              variant="secondary"
              style={{ flex: 1 }}
              disabled={stop.index >= count - 1}
              onPress={act(() => moveStop(stop.day, stop.index, 1))}
            />
          </View>

          {trip.days.length > 1 ? (
            <>
              <T variant="label" tone="muted" style={{ marginTop: Space.lg, marginBottom: Space.sm }}>
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
                      accessibilityRole="button"
                      accessibilityLabel={`Move to day ${d + 1}${closed ? ' (closed that day)' : ''}`}
                      onPress={act(() => moveStopToDay(stop.day, stop.index, d))}
                      style={({ pressed }) => [
                        styles.dayChip,
                        {
                          backgroundColor: current ? c.primary : closed ? c.warningSoft : c.surface,
                          borderColor: current ? c.primary : c.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}>
                      <T variant="label" style={{ color: current ? c.onPrimary : closed ? c.warning : c.text }}>
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
            </>
          ) : null}

          <Button
            label="Remove from trip"
            icon="trash"
            variant="ghost"
            style={{ marginTop: Space.lg }}
            onPress={act(() => removeStop(stop.day, stop.index))}
          />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  nameInput: {
    fontFamily: Fonts.extrabold,
    fontSize: 28,
    color: '#FFFFFF',
    paddingVertical: 2,
    letterSpacing: -0.5,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md, marginBottom: Space.md },
  dayNumber: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  timeline: { gap: Space.sm, borderLeftWidth: 3, marginLeft: 15, paddingLeft: Space.md },
  emptyDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  stop: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: 10 },
  thumb: { width: 60, height: 60, borderRadius: Radius.md },
  backdrop: { flex: 1, backgroundColor: 'rgba(14,21,32,0.5)' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: Space.md },
  sheetThumb: { width: 64, height: 64, borderRadius: Radius.md },
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

import { Pressable, StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { SpotPhoto } from '@/components/spot-card';
import { Button, T } from '@/components/ui';
import { getSpot, isClosedOn } from '@/data/spots';
import { parseISODate } from '@/lib/dates';
import { dayDate, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

export type StopRef = { day: number; index: number };

/** Everything you can do to a planned stop: reorder, move to another day, remove. */
export function StopActionsSheet({ stop, onClose }: { stop: StopRef | null; onClose: () => void }) {
  const c = useColors();
  const { trip, moveStop, moveStopToDay, removeStop } = useAppState();
  const spot = stop ? getSpot(trip.days[stop.day]?.[stop.index] ?? '') : undefined;
  const count = stop ? (trip.days[stop.day]?.length ?? 0) : 0;

  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <Sheet visible={!!stop && !!spot} onClose={onClose}>
      {stop && spot ? (
        <>
          <View style={styles.head}>
            <SpotPhoto spot={spot} style={styles.thumb} />
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
              label="Earlier"
              icon="arrow-up"
              variant="secondary"
              style={{ flex: 1 }}
              disabled={stop.index === 0}
              onPress={act(() => moveStop(stop.day, stop.index, -1))}
            />
            <Button
              label="Later"
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
        </>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', gap: Space.md, alignItems: 'center', marginBottom: Space.lg },
  thumb: { width: 64, height: 64, borderRadius: Radius.md },
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

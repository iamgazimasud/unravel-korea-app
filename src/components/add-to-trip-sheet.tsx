import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Badge, Icon, T } from '@/components/ui';
import { isClosedOn, type Spot } from '@/data/spots';
import { formatDate, parseISODate } from '@/lib/dates';
import { dayDate, dayTitle, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

/** Drop a place onto a day of the trip, flagging days when it's closed. */
export function AddToTripSheet({ spot, onClose }: { spot: Spot | null; onClose: () => void }) {
  const c = useColors();
  const { trip, addSpot } = useAppState();

  return (
    <Sheet visible={!!spot} onClose={onClose} title="Add to which day?" subtitle={spot?.name}>
      {spot ? (
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: Space.sm }}>
          {trip.days.map((ids, i) => {
            const date = dayDate(trip, i);
            const closed = date ? isClosedOn(spot, parseISODate(date)) : false;
            const already = ids.includes(spot.id);
            const title = dayTitle(trip, i);
            return (
              <Pressable
                key={i}
                disabled={already}
                accessibilityRole="button"
                accessibilityLabel={`Add to day ${i + 1}${closed ? ' (closed that day)' : ''}`}
                onPress={() => {
                  addSpot(i, spot.id);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.dayRow,
                  { backgroundColor: c.surface, borderColor: c.border, opacity: already ? 0.5 : pressed ? 0.8 : 1 },
                ]}>
                <View style={[styles.dayNumber, { backgroundColor: c.primarySoft }]}>
                  <T variant="label" tone="primary">
                    {i + 1}
                  </T>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="heading" numberOfLines={1}>
                    {title}
                  </T>
                  <T variant="caption" tone="muted">
                    {[date ? formatDate(date) : null, ids.length ? `${ids.length} places` : 'Nothing planned yet']
                      .filter(Boolean)
                      .join(' · ')}
                  </T>
                </View>
                {already ? (
                  <Badge tone="success" icon="checkmark" label="Added" />
                ) : closed ? (
                  <Badge tone="warning" icon="alert-circle" label="Closed that day" />
                ) : (
                  <Icon name="add-circle" size={26} color={c.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dayNumber: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

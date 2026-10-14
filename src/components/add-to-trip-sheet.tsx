import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Icon, T } from '@/components/ui';
import { isClosedOn, type Spot } from '@/data/spots';
import { formatDate, parseISODate } from '@/lib/dates';
import { dayDate, useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

/** Bottom sheet that lets the traveler drop a spot onto a day, flagging days when it's closed. */
export function AddToTripSheet({ spot, onClose }: { spot: Spot | null; onClose: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { trip, addSpot, setDayCount } = useAppState();

  return (
    <Modal visible={!!spot} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      {spot ? (
        <View
          style={[
            styles.sheet,
            { backgroundColor: c.background, paddingBottom: insets.bottom + Space.lg },
          ]}>
          <View style={[styles.handle, { backgroundColor: c.border }]} />
          <T variant="title">Add to which day?</T>
          <T tone="muted" style={{ marginBottom: Space.md }}>
            {spot.name} · ~{spot.duration}h
          </T>
          <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ gap: Space.sm }}>
            {trip.days.map((ids, i) => {
              const date = dayDate(trip, i);
              const closed = date ? isClosedOn(spot, parseISODate(date)) : false;
              const already = ids.includes(spot.id);
              const stops = ids.length;
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
                    {
                      backgroundColor: c.surface,
                      borderColor: c.border,
                      opacity: already ? 0.5 : pressed ? 0.8 : 1,
                    },
                  ]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="heading">
                      Day {i + 1}
                      {date ? <T tone="muted">{`  ${formatDate(date)}`}</T> : null}
                    </T>
                    <T variant="caption" tone="muted">
                      {stops === 0 ? 'Nothing planned yet' : `${stops} stop${stops > 1 ? 's' : ''}`}
                    </T>
                  </View>
                  {already ? (
                    <Badge tone="success" icon="checkmark" label="Added" />
                  ) : closed ? (
                    <Badge tone="warning" icon="alert-circle" label="Closed that day" />
                  ) : (
                    <Icon name="add-circle" size={24} color={c.primary} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          <Button
            label="Add a new day"
            icon="calendar"
            variant="secondary"
            style={{ marginTop: Space.md }}
            onPress={() => {
              const newDay = trip.days.length;
              setDayCount(newDay + 1);
              addSpot(newDay, spot.id);
              onClose();
            }}
          />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.lg,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: Space.md },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

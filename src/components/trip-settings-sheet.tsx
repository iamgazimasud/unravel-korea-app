import { Pressable, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { DateStepper, NumberStepper } from '@/components/steppers';
import { Button, T } from '@/components/ui';
import { addDays, today } from '@/lib/dates';
import { confirm, shareText } from '@/lib/platform';
import { tripShareUrl, tripToText } from '@/lib/share';
import { stopCount, useAppState } from '@/state/app-state';
import { Space } from '@/theme';

/** The only trip settings there are: arrival date, length, share, start over. */
export function TripSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { trip, setStartDate, setDayCount, clearStops } = useAppState();
  const hasPlan = stopCount(trip) > 0;

  const share = () => shareText(`${tripToText(trip)}\n\nOpen it in the app: ${tripShareUrl(trip)}`, trip.name);

  const startOver = async () => {
    if (await confirm('Start over?', 'This removes every place from your trip. Your dates stay.', 'Start over')) {
      clearStops();
      onClose();
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Trip settings">
      <View style={{ gap: Space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T variant="label">When do you land?</T>
          {trip.startDate ? (
            <Pressable onPress={() => setStartDate(null)} hitSlop={8} accessibilityRole="button">
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
            label="Add arrival date"
            icon="calendar"
            variant="secondary"
            onPress={() => setStartDate(addDays(today(), 30))}
          />
        )}
        <T variant="caption" tone="muted">
          With a date we count down to your trip and warn you when a place is closed on the day you planned it.
        </T>

        <T variant="label" style={{ marginTop: Space.md }}>
          How many days?
        </T>
        <NumberStepper value={trip.days.length} onChange={setDayCount} unit={['day', 'days']} />

        {hasPlan ? (
          <>
            <Button
              label="Share my trip"
              icon="share-social"
              style={{ marginTop: Space.lg }}
              onPress={() => {
                onClose();
                share();
              }}
            />
            <Button label="Start over" icon="refresh" variant="ghost" onPress={startOver} />
          </>
        ) : (
          <Button label="Done" style={{ marginTop: Space.lg }} onPress={onClose} />
        )}
      </View>
    </Sheet>
  );
}

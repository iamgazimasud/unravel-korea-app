import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, EmptyState, Page, T } from '@/components/ui';
import { getSpot } from '@/data/spots';
import { formatDate } from '@/lib/dates';
import { confirm } from '@/lib/platform';
import { decodeSharedTrip } from '@/lib/share';
import { dayDate, useAppState } from '@/state/app-state';
import { Space } from '@/theme';

/** Opened from a shared link: unravelkorea://import?n=...&s=...&d=... */
export default function ImportScreen() {
  const params = useLocalSearchParams<{ n?: string; s?: string; d?: string }>();
  const { ready, trip, replaceTrip } = useAppState();
  const shared = decodeSharedTrip(params);

  // Wait for saved state so we know whether to ask before replacing an existing trip.
  if (!ready) return null;

  if (!shared) {
    return (
      <Page>
        <EmptyState
          icon="link"
          title="This trip link looks broken"
          body="Ask your friend to share it again from the My Trip tab."
          action={<Button label="Go home" size="sm" onPress={() => router.replace('/')} />}
        />
      </Page>
    );
  }

  const hasStops = trip.days.some((d) => d.length);

  const save = async () => {
    if (
      hasStops &&
      !(await confirm('Replace your trip?', `"${trip.name}" will be replaced by "${shared.name}".`, 'Replace'))
    ) {
      return;
    }
    replaceTrip(shared);
    router.replace('/trip');
  };

  return (
    <Page>
      <T variant="caption" tone="primary" style={{ letterSpacing: 1 }}>
        SOMEONE SHARED A TRIP WITH YOU
      </T>
      <T variant="display" style={{ marginBottom: Space.lg }}>
        {shared.name}
      </T>
      <View style={{ gap: Space.sm }}>
        {shared.days.map((ids, i) => {
          const date = dayDate(shared, i);
          return (
            <Card key={i} style={{ gap: 4 }}>
              <T variant="heading">
                Day {i + 1}
                {date ? <T tone="muted">{`  ${formatDate(date)}`}</T> : null}
              </T>
              {ids.length ? (
                ids.map((id) => (
                  <T key={id} tone="muted">
                    • {getSpot(id)?.name}
                  </T>
                ))
              ) : (
                <T tone="muted">Free day</T>
              )}
            </Card>
          );
        })}
      </View>
      <Button label="Use this trip" icon="download" style={{ marginTop: Space.xl }} onPress={save} />
      <Button label="Not now" variant="ghost" style={{ marginTop: Space.sm }} onPress={() => router.replace('/')} />
    </Page>
  );
}

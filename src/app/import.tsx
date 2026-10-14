import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SpotPhoto } from '@/components/spot-card';
import { BrandHeader, Button, Card, EmptyState, HeaderPill, Screen, T } from '@/components/ui';
import { getSpot } from '@/data/spots';
import { formatDate } from '@/lib/dates';
import { confirm } from '@/lib/platform';
import { decodeSharedTrip } from '@/lib/share';
import { dayDate, stopCount, useAppState } from '@/state/app-state';
import { Radius, Space } from '@/theme';

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Opened from a shared link: unravelkorea://import?n=...&s=...&d=... */
export default function ImportScreen() {
  const params = useLocalSearchParams<{ n?: string; s?: string; d?: string }>();
  const { ready, trip, replaceTrip } = useAppState();
  const shared = decodeSharedTrip(params);

  // Wait for saved state so we know whether to ask before replacing an existing trip.
  if (!ready) return null;

  if (!shared) {
    return (
      <Screen header={<BrandHeader back={close} title="Shared trip" />}>
        <EmptyState
          icon="link"
          title="This trip link looks broken"
          body="Ask your friend to share it again from the My Trip tab."
          action={<Button label="Go home" size="sm" onPress={() => router.replace('/')} />}
        />
      </Screen>
    );
  }

  const save = async () => {
    if (
      stopCount(trip) &&
      !(await confirm('Replace your trip?', `"${trip.name}" will be replaced by "${shared.name}".`, 'Replace'))
    ) {
      return;
    }
    replaceTrip(shared);
    router.replace('/trip');
  };

  const header = (
    <BrandHeader
      back={close}
      eyebrow="SOMEONE SHARED A TRIP WITH YOU"
      title={shared.name}
      subtitle={`${shared.days.length} days · ${stopCount(shared)} stops`}>
      <HeaderPill label="Use this trip" icon="download" onPress={save} />
    </BrandHeader>
  );

  return (
    <Screen header={header}>
      <View style={{ gap: Space.md, marginTop: Space.sm }}>
        {shared.days.map((ids, i) => {
          const date = dayDate(shared, i);
          return (
            <Card key={i} style={{ gap: Space.sm }}>
              <T variant="heading">
                Day {i + 1}
                {date ? <T tone="muted">{`  ${formatDate(date)}`}</T> : null}
              </T>
              {ids.length ? (
                ids.map((id) => {
                  const spot = getSpot(id);
                  return spot ? (
                    <View key={id} style={styles.stop}>
                      <SpotPhoto spot={spot} style={styles.thumb} />
                      <T variant="label" style={{ flex: 1 }}>
                        {spot.name}
                      </T>
                    </View>
                  ) : null;
                })
              ) : (
                <T tone="muted">Free day</T>
              )}
            </Card>
          );
        })}
      </View>
      <Button label="Use this trip" icon="download" style={{ marginTop: Space.xl }} onPress={save} />
      <Button label="Not now" variant="ghost" style={{ marginTop: Space.sm }} onPress={close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stop: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  thumb: { width: 44, height: 44, borderRadius: Radius.sm },
});

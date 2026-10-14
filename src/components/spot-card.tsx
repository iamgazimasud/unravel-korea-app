import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge, Card, IconButton, T } from '@/components/ui';
import { closedDaysLabel, type Spot } from '@/data/spots';
import { PhotoCredits, SpotImages } from '@/data/spot-photos';
import { useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

const openSpot = (id: string) => router.push({ pathname: '/spot/[id]', params: { id } });

/** Bundled destination photo (works offline). */
export function SpotPhoto({ spot, style }: { spot: Spot; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: c.primarySoft, overflow: 'hidden' }, style]}>
      <Image
        source={SpotImages[spot.id]}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={120}
        accessibilityLabel={PhotoCredits[spot.id]?.alt ?? spot.name}
      />
    </View>
  );
}

function tripDaysFor(days: string[][], spotId: string): number[] {
  return days.flatMap((d, i) => (d.includes(spotId) ? [i + 1] : []));
}

/** List row: photo thumbnail, names, quick facts, optional add button. */
export function SpotCard({ spot, onAdd }: { spot: Spot; onAdd?: (spot: Spot) => void }) {
  const c = useColors();
  const { trip } = useAppState();
  const inDays = tripDaysFor(trip.days, spot.id);
  const closed = closedDaysLabel(spot);

  return (
    <Card onPress={() => openSpot(spot.id)} style={styles.row} accessibilityLabel={spot.name}>
      <SpotPhoto spot={spot} style={styles.thumb} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="heading" numberOfLines={2}>
          {spot.name}
        </T>
        <T variant="caption" tone="muted" numberOfLines={1}>
          {spot.nameKo} · {spot.area} · ~{spot.duration}h
        </T>
        <View style={styles.badges}>
          {inDays.length ? <Badge tone="success" icon="checkmark" label={`Day ${inDays.join(', ')}`} /> : null}
          {closed ? <Badge tone="warning" icon="calendar" label={closed} /> : null}
        </View>
      </View>
      {onAdd ? (
        <IconButton icon="add" label={`Add ${spot.name} to trip`} onPress={() => onAdd(spot)} color={c.primary} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: 10 },
  thumb: { width: 76, height: 76, borderRadius: Radius.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
});

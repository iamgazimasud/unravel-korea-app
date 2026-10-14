import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Icon, IconButton, T } from '@/components/ui';
import { CategoryIcons, closedDaysLabel, type Spot } from '@/data/spots';
import { useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

export function CategoryTile({ spot, size = 48 }: { spot: Spot; size?: number }) {
  const c = useColors();
  const warm = ['heritage', 'market', 'food'].includes(spot.category);
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: warm ? c.primarySoft : c.accentSoft }]}>
      <Icon name={CategoryIcons[spot.category]} size={size * 0.45} color={warm ? c.primary : c.accent} />
    </View>
  );
}

function tripDaysFor(days: string[][], spotId: string): number[] {
  return days.flatMap((d, i) => (d.includes(spotId) ? [i + 1] : []));
}

export function SpotCard({ spot, onAdd }: { spot: Spot; onAdd?: (spot: Spot) => void }) {
  const c = useColors();
  const { trip } = useAppState();
  const inDays = tripDaysFor(trip.days, spot.id);
  const closed = closedDaysLabel(spot);

  return (
    <Card onPress={() => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })} style={styles.card}>
      <CategoryTile spot={spot} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="heading" numberOfLines={1}>
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
  card: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md },
  tile: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
});

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Badge, Card, Icon, IconButton, T } from '@/components/ui';
import { closedDaysLabel, type Spot } from '@/data/spots';
import { PhotoCredits, SpotImages } from '@/data/spot-photos';
import { useAppState } from '@/state/app-state';
import { Brand, Fonts, Radius, Space, useColors } from '@/theme';

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

/** Large photo card with the name over a gradient — for horizontal "Picked for you" rails. */
export function PhotoCard({ spot, onAdd, width = 210 }: { spot: Spot; onAdd?: () => void; width?: number }) {
  return (
    <Pressable
      onPress={() => openSpot(spot.id)}
      accessibilityRole="button"
      accessibilityLabel={spot.name}
      style={({ pressed }) => [styles.photoCard, { width }, pressed && { opacity: 0.92 }]}>
      <SpotPhoto spot={spot} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(20,30,55,0)', 'rgba(20,30,55,0.15)', 'rgba(20,30,55,0.88)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {onAdd ? (
        <Pressable
          onPress={onAdd}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${spot.name} to trip`}
          style={styles.addOnPhoto}>
          <Icon name="add" size={22} color={Brand.navy} />
        </Pressable>
      ) : null}
      <View style={styles.photoText}>
        <T variant="heading" tone="inverse" numberOfLines={2} style={{ fontFamily: Fonts.extrabold, fontSize: 17 }}>
          {spot.name}
        </T>
        <T variant="caption" tone="inverse" style={{ opacity: 0.9 }} numberOfLines={1}>
          {spot.nameKo} · ~{spot.duration}h
        </T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: 10 },
  thumb: { width: 76, height: 76, borderRadius: Radius.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  photoCard: { height: 250, borderRadius: Radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  photoText: { padding: Space.lg, gap: 2 },
  addOnPhoto: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

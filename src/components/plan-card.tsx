import { StyleSheet, View } from 'react-native';

import { SpotPhoto } from '@/components/spot-card';
import { Badge, Card, Icon, T } from '@/components/ui';
import { planPlaceCount, RECOMMENDED_PLAN, type Plan } from '@/data/plans';
import { getSpot, type Spot } from '@/data/spots';
import { plural } from '@/lib/text';
import { Brand, Fonts, Radius, Space, useColors } from '@/theme';

/** One tappable ready-made trip: three photos, the length in big type, and what's in it. */
export function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const c = useColors();
  const photos = plan.cover.map(getSpot).filter((s): s is Spot => !!s);
  const recommended = plan.id === RECOMMENDED_PLAN;

  return (
    <Card
      onPress={onPress}
      style={[styles.card, recommended && { borderWidth: 2, borderColor: c.primary }]}
      accessibilityLabel={`${plan.name}. ${plan.tagline}. ${plural(planPlaceCount(plan), 'place')}.`}>
      <View style={styles.photos}>
        {photos.map((s) => (
          <SpotPhoto key={s.id} spot={s} style={{ flex: 1 }} />
        ))}
        <View style={styles.days}>
          <T style={styles.daysNumber}>{plan.days}</T>
          <T variant="caption" style={styles.daysLabel}>
            DAYS
          </T>
        </View>
        {recommended ? (
          <View style={styles.pick}>
            <Badge tone="onPhoto" icon="star" label="Our pick" />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="title">{plan.name}</T>
          <T tone="muted">{plan.tagline}</T>
          <T variant="label" tone="primary" style={{ marginTop: Space.xs }}>
            {plural(planPlaceCount(plan), 'place')} · ready to go
          </T>
        </View>
        <View style={[styles.go, { backgroundColor: c.primary }]}>
          <Icon name="arrow-forward" size={20} color={c.onPrimary} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  photos: { height: 112, flexDirection: 'row', gap: 2 },
  days: {
    position: 'absolute',
    left: Space.md,
    bottom: Space.md,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
    alignItems: 'center',
  },
  daysNumber: { fontFamily: Fonts.extrabold, fontSize: 26, lineHeight: 30, color: Brand.navy },
  daysLabel: { fontFamily: Fonts.bold, letterSpacing: 1.2, color: Brand.navy, marginTop: -2 },
  pick: { position: 'absolute', right: Space.md, top: Space.md },
  body: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.lg },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

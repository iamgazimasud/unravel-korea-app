import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { openLink } from '@/components/article-row';
import { ShowKoreanModal } from '@/components/show-korean-modal';
import { SpotPhoto } from '@/components/spot-card';
import {
  Badge,
  BrandHeader,
  Button,
  Card,
  Divider,
  EmptyState,
  HeaderButton,
  Icon,
  IconCircle,
  Screen,
  T,
} from '@/components/ui';
import { PhotoCredits } from '@/data/spot-photos';
import { CategoryLabels, closedDaysLabel, getSpot, type Spot } from '@/data/spots';
import { searchGuides, type Article } from '@/lib/content';
import { openInMap } from '@/lib/maps';
import { useAppState } from '@/state/app-state';
import { Radius, ScreenPadding, Space, useColors } from '@/theme';

export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = getSpot(id ?? '');
  if (!spot) {
    return (
      <Screen header={<BrandHeader back title="Not found" />}>
        <EmptyState icon="help" title="We couldn't find that spot" />
      </Screen>
    );
  }
  return <SpotDetail spot={spot} />;
}

function SpotDetail({ spot }: { spot: Spot }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { trip } = useAppState();
  const [adding, setAdding] = useState(false);
  const [showTaxi, setShowTaxi] = useState(false);
  const inDays = trip.days.flatMap((d, i) => (d.includes(spot.id) ? [i + 1] : []));
  const closed = closedDaysLabel(spot);
  const credit = PhotoCredits[spot.id];

  const hero = (
    <View style={styles.hero}>
      <SpotPhoto spot={spot} style={StyleSheet.absoluteFill} />
      {/* Top shade keeps the light status bar and buttons readable on bright photos. */}
      <LinearGradient
        colors={['rgba(14,21,32,0.55)', 'rgba(14,21,32,0)', 'rgba(14,21,32,0.1)', 'rgba(14,21,32,0.85)']}
        locations={[0, 0.3, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.heroBar, { top: insets.top + Space.sm }]}>
        <HeaderButton icon="chevron-back" label="Back" onPress={() => router.back()} />
      </View>
      <View style={styles.heroText}>
        <T variant="eyebrow" tone="inverse" style={{ opacity: 0.85 }}>
          {CategoryLabels[spot.category].toUpperCase()} · {spot.area.toUpperCase()}
        </T>
        <T variant="display" tone="inverse">
          {spot.name}
        </T>
        <T variant="korean" tone="inverse" style={{ fontSize: 18, opacity: 0.92 }}>
          {spot.nameKo}
        </T>
      </View>
    </View>
  );

  return (
    <Screen header={hero} statusBackdrop={false} contentStyle={[styles.sheet, { backgroundColor: c.background }]}>
      <T style={{ fontSize: 16, lineHeight: 24 }}>{spot.blurb}</T>

      <View style={styles.badges}>
        <Badge tone="primary" icon="time" label={`~${spot.duration}h here`} />
        {closed ? (
          <Badge tone="warning" icon="calendar" label={closed} />
        ) : (
          <Badge tone="success" icon="calendar" label="Open daily" />
        )}
        {inDays.length ? (
          <Badge tone="success" icon="checkmark" label={`In your trip: Day ${inDays.join(', ')}`} />
        ) : null}
      </View>

      <Button
        label={inDays.length ? 'Add to another day' : 'Add to my trip'}
        icon="add"
        style={{ marginTop: Space.lg }}
        onPress={() => setAdding(true)}
      />
      <View style={styles.buttons}>
        <Button
          label="Directions"
          icon="navigate"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => openInMap('naver', spot.mapQuery)}
        />
        <Button label="Taxi card" icon="car" variant="accent" style={{ flex: 1 }} onPress={() => setShowTaxi(true)} />
      </View>

      <Card style={{ marginTop: Space.xl }}>
        <InfoRow icon="train" label="Getting there" value={spot.directions} />
        {spot.hours ? (
          <>
            <Divider />
            <InfoRow icon="time" label="Hours" value={spot.hours} />
          </>
        ) : null}
        {spot.price ? (
          <>
            <Divider />
            <InfoRow icon="pricetag" label="Cost" value={spot.price} />
          </>
        ) : null}
      </Card>

      {spot.tips?.length ? (
        <Card tone="accent" style={{ marginTop: Space.md, gap: Space.sm }}>
          <T variant="heading">Tips from our visit</T>
          {spot.tips.map((tip) => (
            <View key={tip} style={{ flexDirection: 'row', gap: Space.sm }}>
              <Icon name="sparkles" size={16} color={c.primary} />
              <T style={{ flex: 1 }}>{tip}</T>
            </View>
          ))}
        </Card>
      ) : null}

      <FromTheBlog spot={spot} />

      {credit ? (
        <T
          variant="caption"
          tone="muted"
          style={{ marginTop: Space.xl, textAlign: 'center' }}
          onPress={() => credit.url && openLink(credit.url)}>
          Photo: {credit.author} · {credit.license}
        </T>
      ) : null}
      <T variant="caption" tone="muted" style={{ marginTop: Space.sm, textAlign: 'center' }}>
        Opening hours, closed days and prices are approximate and change without notice — check the official source
        before you go.
      </T>

      <AddToTripSheet spot={adding ? spot : null} onClose={() => setAdding(false)} />
      <ShowKoreanModal
        visible={showTaxi}
        onClose={() => setShowTaxi(false)}
        lead="여기로 가 주세요"
        korean={spot.nameKo}
        caption={`Please take me to ${spot.name}`}
      />
    </Screen>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: Space.md, alignItems: 'flex-start' }}>
      <IconCircle name={icon} size={34} />
      <View style={{ flex: 1 }}>
        <T variant="caption" tone="muted">
          {label}
        </T>
        <T>{value}</T>
      </View>
    </View>
  );
}

function FromTheBlog({ spot }: { spot: Spot }) {
  const [posts, setPosts] = useState<Article[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = spot.name.split(/ [—&(]/)[0];
    searchGuides(query)
      .then((r) => !cancelled && setPosts(r))
      .catch(() => !cancelled && setPosts([]));
    return () => {
      cancelled = true;
    };
  }, [spot.name]);

  if (!posts?.length) return null;
  return (
    <View style={{ marginTop: Space.xl, gap: Space.sm }}>
      <T variant="title">From the blog</T>
      {posts.map((p) => (
        <Card
          key={p.id}
          onPress={() => openLink(p.url)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md }}
          accessibilityLabel={p.title}>
          <IconCircle name="book" size={36} tone="navy" />
          <T variant="label" style={{ flex: 1 }}>
            {p.title}
          </T>
          <Icon name="open-outline" size={16} />
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380, justifyContent: 'flex-end' },
  heroBar: {
    position: 'absolute',
    left: ScreenPadding,
    right: ScreenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroText: { paddingHorizontal: ScreenPadding, paddingBottom: 44, gap: 2 },
  sheet: {
    marginTop: -26,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Space.xl,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.md },
  buttons: { flexDirection: 'row', gap: Space.sm, marginTop: Space.md },
});

import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { openLink } from '@/components/article-row';
import { ShowKoreanModal } from '@/components/show-korean-modal';
import { CategoryTile } from '@/components/spot-card';
import { Badge, Button, Card, Divider, EmptyState, Icon, Page, T } from '@/components/ui';
import { CategoryLabels, closedDaysLabel, getSpot, Spots, type Spot } from '@/data/spots';
import { searchGuides, type Article } from '@/lib/content';
import { openInMap } from '@/lib/maps';
import { useAppState } from '@/state/app-state';
import { Space, useColors } from '@/theme';

/** Pre-renders every spot page for the web build. */
export function generateStaticParams() {
  return Spots.map((s) => ({ id: s.id }));
}

export default function SpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = getSpot(id ?? '');
  if (!spot) {
    return (
      <Page>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState icon="help" title="We couldn't find that spot" />
      </Page>
    );
  }
  return <SpotDetail spot={spot} />;
}

function SpotDetail({ spot }: { spot: Spot }) {
  const c = useColors();
  const { trip, prefs, toggleSaved } = useAppState();
  const [adding, setAdding] = useState(false);
  const [showTaxi, setShowTaxi] = useState(false);
  const saved = prefs.saved.includes(spot.id);
  const inDays = trip.days.flatMap((d, i) => (d.includes(spot.id) ? [i + 1] : []));
  const closed = closedDaysLabel(spot);

  return (
    <Page>
      <Stack.Screen
        options={{
          title: spot.name,
          headerRight: () => (
            <Pressable
              onPress={() => toggleSaved(spot.id)}
              hitSlop={10}
              accessibilityLabel={saved ? 'Remove from saved' : 'Save spot'}>
              <Icon name={saved ? 'heart' : 'heart-outline'} size={24} color={c.primary} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.hero}>
        <CategoryTile spot={spot} size={64} />
        <View style={{ flex: 1 }}>
          <T variant="caption" tone="primary" style={{ letterSpacing: 0.5 }}>
            {CategoryLabels[spot.category].toUpperCase()} · {spot.area.toUpperCase()}
          </T>
          <T variant="title">{spot.name}</T>
          <T variant="korean" tone="muted">
            {spot.nameKo}
          </T>
        </View>
      </View>

      <T style={{ marginTop: Space.md }}>{spot.blurb}</T>

      <View style={styles.badges}>
        <Badge icon="time" label={`~${spot.duration}h here`} />
        {closed ? <Badge tone="warning" icon="calendar" label={closed} /> : <Badge tone="success" icon="calendar" label="Open daily" />}
        {inDays.length ? <Badge tone="success" icon="checkmark" label={`In your trip: Day ${inDays.join(', ')}`} /> : null}
      </View>

      <View style={styles.buttons}>
        <Button label="Naver Map" icon="navigate" style={{ flex: 1 }} onPress={() => openInMap('naver', spot.mapQuery)} />
        <Button label="KakaoMap" icon="map" variant="secondary" style={{ flex: 1 }} onPress={() => openInMap('kakao', spot.mapQuery)} />
      </View>
      <View style={styles.buttons}>
        <Button label="Taxi card" icon="car" variant="secondary" style={{ flex: 1 }} onPress={() => setShowTaxi(true)} />
        <Button label={inDays.length ? 'Add again' : 'Add to trip'} icon="add" variant="accent" style={{ flex: 1 }} onPress={() => setAdding(true)} />
      </View>

      <Card style={{ marginTop: Space.xl, gap: Space.xs }}>
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
              <Icon name="sparkles" size={16} color={c.accent} />
              <T style={{ flex: 1 }}>{tip}</T>
            </View>
          ))}
        </Card>
      ) : null}

      <FromTheBlog spot={spot} />

      <T variant="caption" tone="muted" style={{ marginTop: Space.xl, textAlign: 'center' }}>
        Opening hours, closed days and prices are approximate and change without notice — check the official
        source before you go.
      </T>

      <AddToTripSheet spot={adding ? spot : null} onClose={() => setAdding(false)} />
      <ShowKoreanModal
        visible={showTaxi}
        onClose={() => setShowTaxi(false)}
        lead="여기로 가 주세요"
        korean={spot.nameKo}
        caption={`Please take me to ${spot.name}`}
      />
    </Page>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: Space.md }}>
      <Icon name={icon} size={18} color={c.textMuted} />
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
        <Card key={p.id} onPress={() => openLink(p.url)} style={{ flexDirection: 'row', alignItems: 'center', gap: Space.md }}>
          <Icon name="book" size={20} />
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
  hero: { flexDirection: 'row', alignItems: 'center', gap: Space.lg },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.md },
  buttons: { flexDirection: 'row', gap: Space.sm, marginTop: Space.md },
});

import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { SpotCard } from '@/components/spot-card';
import { BrandHeader, Chip, EmptyState, Icon, IconButton, Screen, T } from '@/components/ui';
import { PlaceFilters, Spots, type PlaceFilter, type Spot } from '@/data/spots';
import { Brand, Fonts, Radius, ScreenPadding, Space } from '@/theme';

export default function PlacesScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PlaceFilter | 'all'>('all');
  const [adding, setAdding] = useState<Spot | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const categories = PlaceFilters.find((f) => f.id === filter)?.categories;
    return Spots.filter((s) => {
      if (categories && !categories.includes(s.category)) return false;
      if (!q) return true;
      return [s.name, s.nameKo, s.area, s.blurb].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, filter]);

  const header = (
    <BrandHeader title="Places" subtitle={`${Spots.length} places we've actually been to.`}>
      <View style={styles.search}>
        <Icon name="search" size={18} color={Brand.navy} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search palaces, markets, 시장…"
          placeholderTextColor="#7A869A"
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search places"
        />
        {query ? <IconButton icon="close" label="Clear search" onPress={() => setQuery('')} /> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -ScreenPadding, marginTop: Space.md }}
        contentContainerStyle={styles.chips}>
        <Chip onDark label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {PlaceFilters.map((f) => (
          <Chip
            onDark
            key={f.id}
            label={f.label}
            icon={f.icon}
            selected={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </ScrollView>
    </BrandHeader>
  );

  return (
    <Screen header={header}>
      <View style={{ gap: Space.sm, marginTop: Space.sm }}>
        {results.map((s) => (
          <SpotCard key={s.id} spot={s} onAdd={setAdding} />
        ))}
      </View>

      {results.length === 0 ? (
        <EmptyState icon="search" title="Nothing found" body="Try another word, or search in Korean." />
      ) : (
        <T variant="caption" tone="muted" style={{ marginTop: Space.lg, textAlign: 'center' }}>
          Hours, closed days and prices are approximate — check before you go.
        </T>
      )}

      <AddToTripSheet spot={adding} onClose={() => setAdding(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingLeft: Space.lg,
    paddingRight: 6,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12, fontFamily: Fonts.medium, color: Brand.navy },
  chips: { gap: Space.sm, paddingHorizontal: ScreenPadding },
});

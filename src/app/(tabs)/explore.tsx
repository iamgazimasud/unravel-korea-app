import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { SpotCard } from '@/components/spot-card';
import { BrandHeader, Chip, EmptyState, Icon, IconButton, Screen, T } from '@/components/ui';
import { CategoryIcons, CategoryLabels, Spots, type Category, type Spot } from '@/data/spots';
import { useAppState } from '@/state/app-state';
import { Brand, Fonts, Radius, ScreenPadding, Space } from '@/theme';

type Filter = Category | 'all' | 'saved';

const Categories = Object.keys(CategoryLabels) as Category[];

export default function ExploreScreen() {
  const { prefs } = useAppState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState<Spot | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Spots.filter((s) => {
      if (filter === 'saved' && !prefs.saved.includes(s.id)) return false;
      if (filter !== 'all' && filter !== 'saved' && s.category !== filter) return false;
      if (!q) return true;
      return [s.name, s.nameKo, s.area, s.blurb].some((f) => f.toLowerCase().includes(q));
    });
  }, [query, filter, prefs.saved]);

  const header = (
    <BrandHeader title="Explore" subtitle={`${Spots.length} places we've actually been to.`}>
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
          accessibilityLabel="Search spots"
        />
        {query ? <IconButton icon="close" label="Clear search" onPress={() => setQuery('')} /> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -ScreenPadding, marginTop: Space.md }}
        contentContainerStyle={styles.chips}>
        <Chip onDark label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          onDark
          label={`Saved${prefs.saved.length ? ` (${prefs.saved.length})` : ''}`}
          icon="heart"
          selected={filter === 'saved'}
          onPress={() => setFilter('saved')}
        />
        {Categories.map((cat) => (
          <Chip
            onDark
            key={cat}
            label={CategoryLabels[cat]}
            icon={CategoryIcons[cat]}
            selected={filter === cat}
            onPress={() => setFilter(cat)}
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
        <EmptyState
          icon={filter === 'saved' ? 'heart' : 'search'}
          title={filter === 'saved' ? 'No saved spots yet' : 'Nothing found'}
          body={
            filter === 'saved'
              ? 'Tap the heart on any spot to save it for later.'
              : 'Try another word, or search in Korean.'
          }
        />
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

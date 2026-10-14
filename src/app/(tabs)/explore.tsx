import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AddToTripSheet } from '@/components/add-to-trip-sheet';
import { SpotCard } from '@/components/spot-card';
import { Chip, EmptyState, Icon, IconButton, Screen, T } from '@/components/ui';
import { CategoryIcons, CategoryLabels, Spots, type Category, type Spot } from '@/data/spots';
import { useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

type Filter = Category | 'all' | 'saved';

const Categories = Object.keys(CategoryLabels) as Category[];

export default function ExploreScreen() {
  const c = useColors();
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

  return (
    <Screen title="Explore" subtitle={`${Spots.length} places we've actually been to.`}>
      <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Icon name="search" size={18} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search palaces, markets, 시장…"
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text }]}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search spots"
        />
        {query ? <IconButton icon="close" label="Clear search" onPress={() => setQuery('')} /> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          label={`Saved${prefs.saved.length ? ` (${prefs.saved.length})` : ''}`}
          icon="heart"
          selected={filter === 'saved'}
          onPress={() => setFilter('saved')}
        />
        {Categories.map((cat) => (
          <Chip
            key={cat}
            label={CategoryLabels[cat]}
            icon={CategoryIcons[cat]}
            selected={filter === cat}
            onPress={() => setFilter(cat)}
          />
        ))}
      </ScrollView>

      <View style={{ gap: Space.sm }}>
        {results.map((s) => (
          <SpotCard key={s.id} spot={s} onAdd={setAdding} />
        ))}
      </View>

      {results.length === 0 ? (
        <EmptyState
          icon={filter === 'saved' ? 'heart' : 'search'}
          title={filter === 'saved' ? 'No saved spots yet' : 'Nothing found'}
          body={filter === 'saved' ? 'Tap the heart on any spot to save it for later.' : 'Try another word, or search in Korean.'}
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
    paddingLeft: Space.md,
    paddingRight: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 46,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  chips: { gap: Space.sm, paddingVertical: Space.md },
});

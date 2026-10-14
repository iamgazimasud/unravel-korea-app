import { StyleSheet, View } from 'react-native';

import { IconButton, T } from '@/components/ui';
import { addDays, formatDate } from '@/lib/dates';
import { Radius, Space, useColors } from '@/theme';

/** Simple date stepper — no native date-picker module needed, so it runs in Expo Go and on web. */
export function DateStepper({ value, onChange }: { value: string; onChange: (date: string) => void }) {
  const c = useColors();
  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <IconButton icon="play-back" label="One week earlier" onPress={() => onChange(addDays(value, -7))} />
      <IconButton icon="chevron-back" label="One day earlier" onPress={() => onChange(addDays(value, -1))} />
      <T variant="heading" style={styles.value}>
        {formatDate(value, { year: 'numeric' })}
      </T>
      <IconButton icon="chevron-forward" label="One day later" onPress={() => onChange(addDays(value, 1))} />
      <IconButton icon="play-forward" label="One week later" onPress={() => onChange(addDays(value, 7))} />
    </View>
  );
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 21,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  unit: [string, string];
}) {
  const c = useColors();
  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <IconButton icon="remove" label={`Fewer ${unit[1]}`} disabled={value <= min} onPress={() => onChange(value - 1)} />
      <T variant="heading" style={styles.value}>
        {value} {value === 1 ? unit[0] : unit[1]}
      </T>
      <IconButton icon="add" label={`More ${unit[1]}`} disabled={value >= max} onPress={() => onChange(value + 1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.xs,
    padding: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  value: { flex: 1, textAlign: 'center' },
});

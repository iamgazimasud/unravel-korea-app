import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ShowKoreanModal } from '@/components/show-korean-modal';
import { Card, Chip, Icon, IconButton, Screen, Section, T } from '@/components/ui';
import { EmergencyNumbers, MustHaveApps, PhraseGroups, Tips, type Phrase } from '@/data/toolkit';
import { Space, useColors } from '@/theme';

export default function ToolkitScreen() {
  const c = useColors();
  const [group, setGroup] = useState(0);
  const [showing, setShowing] = useState<Phrase | null>(null);

  return (
    <Screen title="Toolkit" subtitle="Phrases, numbers and know-how. Works offline.">
      <Section title="Say it in Korean">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Space.sm, paddingBottom: Space.md }}>
          {PhraseGroups.map((g, i) => (
            <Chip key={g.title} label={g.title} selected={group === i} onPress={() => setGroup(i)} />
          ))}
        </ScrollView>
        <View style={{ gap: Space.sm }}>
          {PhraseGroups[group].phrases.map((p) => (
            <Card key={p.ko} style={styles.phrase} onPress={() => setShowing(p)}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="heading">{p.en}</T>
                <T variant="korean" tone="primary">
                  {p.ko}
                </T>
                <T variant="caption" tone="muted">
                  {p.roman}
                </T>
              </View>
              <IconButton
                icon="volume-high"
                label={`Play ${p.en} in Korean`}
                onPress={() => Speech.speak(p.ko, { language: 'ko-KR', rate: 0.85 })}
              />
              <IconButton icon="copy" label="Copy Korean" onPress={() => Clipboard.setStringAsync(p.ko)} />
            </Card>
          ))}
        </View>
        <T variant="caption" tone="muted" style={{ marginTop: Space.sm }}>
          Tap a phrase to show it full-screen to staff.
        </T>
      </Section>

      <Section title="Emergency">
        <View style={{ gap: Space.sm }}>
          {EmergencyNumbers.map((e) => (
            <Card key={e.number} style={styles.row} onPress={() => Linking.openURL(`tel:${e.number}`)}>
              <View style={[styles.number, { backgroundColor: c.primarySoft }]}>
                <T variant="title" tone="primary">
                  {e.number}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="heading">{e.label}</T>
                <T variant="caption" tone="muted">
                  {e.detail}
                </T>
              </View>
              <Icon name="call" size={20} color={c.primary} />
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Know before you go">
        <View style={{ gap: Space.sm }}>
          {Tips.map((t) => (
            <Card key={t.title} style={{ gap: Space.sm }}>
              <View style={styles.tipHeader}>
                <Icon name={t.icon} size={20} color={c.accent} />
                <T variant="heading">{t.title}</T>
              </View>
              <T tone="muted">{t.body}</T>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Download these apps">
        <Card style={{ gap: Space.md }}>
          {MustHaveApps.map((a) => (
            <View key={a.name} style={styles.tipHeader}>
              <Icon name="checkmark-circle" size={20} color={c.success} />
              <View style={{ flex: 1 }}>
                <T variant="label">{a.name}</T>
                <T variant="caption" tone="muted">
                  {a.why}
                </T>
              </View>
            </View>
          ))}
        </Card>
      </Section>

      <ShowKoreanModal
        visible={!!showing}
        onClose={() => setShowing(null)}
        korean={showing?.ko ?? ''}
        caption={showing ? `${showing.en} · ${showing.roman}` : ''}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  phrase: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, padding: Space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md },
  number: { minWidth: 64, paddingHorizontal: Space.sm, paddingVertical: Space.sm, borderRadius: 12, alignItems: 'center' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
});

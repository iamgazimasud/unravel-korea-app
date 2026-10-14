import * as Linking from 'expo-linking';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ShowKoreanModal } from '@/components/show-korean-modal';
import { BrandHeader, Card, Icon, IconButton, IconCircle, Screen, Section, T } from '@/components/ui';
import { EmergencyNumbers, Phrases, Tips, type Phrase } from '@/data/korean';
import { speakKorean } from '@/lib/speech';
import { Fonts, Space, useColors } from '@/theme';

export default function KoreanScreen() {
  const c = useColors();
  const [showing, setShowing] = useState<Phrase | null>(null);

  return (
    <Screen
      header={
        <BrandHeader
          eyebrow="WORKS OFFLINE"
          title="Korean"
          subtitle="The 12 phrases you'll actually use. Tap one to show it to staff, or hear it out loud."
        />
      }>
      <View style={{ gap: Space.sm, marginTop: Space.sm }}>
        {Phrases.map((p) => (
          <Card key={p.ko} style={styles.phrase} onPress={() => setShowing(p)} accessibilityLabel={p.en}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="heading">{p.en}</T>
              <T variant="korean" tone="primary" style={{ fontSize: 20, lineHeight: 27 }}>
                {p.ko}
              </T>
              <T variant="caption" tone="muted">
                {p.roman}
              </T>
            </View>
            <IconButton
              icon="volume-high"
              label={`Play ${p.en} in Korean`}
              tone="solid"
              onPress={() => speakKorean(p.ko)}
            />
          </Card>
        ))}
      </View>

      <Section title="Emergency">
        <View style={{ gap: Space.sm }}>
          {EmergencyNumbers.map((e) => (
            <Card
              key={e.number}
              style={styles.row}
              onPress={() => Linking.openURL(`tel:${e.number}`)}
              accessibilityLabel={`Call ${e.label}, ${e.number}`}>
              <View style={[styles.number, { backgroundColor: c.primary }]}>
                <T style={[styles.numberText, { color: c.onPrimary }]}>{e.number}</T>
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

      <Section title="Good to know">
        <View style={{ gap: Space.sm }}>
          {Tips.map((t) => (
            <Card key={t.title} style={{ gap: Space.sm }}>
              <View style={styles.tipHeader}>
                <IconCircle name={t.icon} size={36} />
                <T variant="heading" style={{ flex: 1 }}>
                  {t.title}
                </T>
              </View>
              <T tone="muted">{t.body}</T>
            </Card>
          ))}
        </View>
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
  phrase: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md, padding: Space.md },
  number: {
    minWidth: 68,
    height: 52,
    paddingHorizontal: Space.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontFamily: Fonts.extrabold, fontSize: 22 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
});

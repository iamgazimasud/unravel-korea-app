import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { openLink } from '@/components/article-row';
import { ShowKoreanModal } from '@/components/show-korean-modal';
import { BrandHeader, Card, Chip, Divider, Icon, IconButton, IconCircle, Screen, Section, T } from '@/components/ui';
import { Config } from '@/config';
import { EmergencyNumbers, MustHaveApps, PhraseGroups, Tips, type Phrase } from '@/data/toolkit';
import { speakKorean } from '@/lib/speech';
import { Fonts, ScreenPadding, Space, useColors } from '@/theme';

export default function ToolkitScreen() {
  const c = useColors();
  const [group, setGroup] = useState(0);
  const [showing, setShowing] = useState<Phrase | null>(null);

  const header = (
    <BrandHeader title="Toolkit" subtitle="Phrases, numbers and know-how. Works offline.">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -ScreenPadding }}
        contentContainerStyle={{ gap: Space.sm, paddingHorizontal: ScreenPadding }}>
        {PhraseGroups.map((g, i) => (
          <Chip onDark key={g.title} label={g.title} selected={group === i} onPress={() => setGroup(i)} />
        ))}
      </ScrollView>
    </BrandHeader>
  );

  return (
    <Screen header={header}>
      <T variant="title" style={{ marginTop: Space.sm, marginBottom: Space.md }}>
        Say it in Korean
      </T>
      <View style={{ gap: Space.sm }}>
        {PhraseGroups[group].phrases.map((p) => (
          <Card key={p.ko} style={styles.phrase} onPress={() => setShowing(p)} accessibilityLabel={p.en}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="heading">{p.en}</T>
              <T variant="korean" tone="primary" style={{ fontSize: 18, lineHeight: 25 }}>
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
            <IconButton icon="copy" label="Copy Korean" onPress={() => Clipboard.setStringAsync(p.ko)} />
          </Card>
        ))}
      </View>
      <T variant="caption" tone="muted" style={{ marginTop: Space.sm }}>
        Tap a phrase to show it full-screen to staff.
      </T>

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

      <Section title="Know before you go">
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

      <Section title="Download these apps">
        <Card style={{ gap: Space.md }}>
          {MustHaveApps.map((a) => (
            <View key={a.name} style={styles.tipHeader}>
              <Icon name="checkmark-circle" size={22} color={c.primary} />
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

      <Section title="About">
        <Card>
          <AboutRow icon="globe" label="unravelkorea.com" onPress={() => openLink(Config.blogUrl)} />
          <Divider />
          <AboutRow icon="cafe" label="Seoul Sip newsletter" onPress={() => openLink(Config.newsletterUrl)} />
          <Divider />
          <AboutRow icon="images" label="Photo credits" internal onPress={() => router.push('/credits')} />
          <Divider />
          <AboutRow icon="shield-checkmark" label="Privacy policy" onPress={() => openLink(Config.privacyPolicyUrl)} />
        </Card>
        <T variant="caption" tone="muted" style={{ marginTop: Space.sm, textAlign: 'center' }}>
          Unravel Korea v{Constants.expoConfig?.version ?? '1.0.0'} · Opening hours and prices are approximate.
        </T>
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

function AboutRow({
  icon,
  label,
  onPress,
  internal,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  internal?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole={internal ? 'button' : 'link'} style={styles.tipHeader}>
      <IconCircle name={icon} size={34} tone="navy" />
      <T variant="label" style={{ flex: 1 }}>
        {label}
      </T>
      <Icon name={internal ? 'chevron-forward' : 'open-outline'} size={16} color={c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  phrase: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, padding: Space.md },
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

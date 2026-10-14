import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/brand-logo';
import { PlanCard } from '@/components/plan-card';
import { BrandHeader, Button, Screen, T } from '@/components/ui';
import { Plans, type PlanId } from '@/data/plans';
import { useAppState } from '@/state/app-state';
import { Space } from '@/theme';

/** First launch: one question. Picking an answer builds a complete day-by-day plan. */
export default function OnboardingScreen() {
  const { completeOnboarding, startPlan } = useAppState();

  const choose = (planId: PlanId) => {
    startPlan(planId);
    completeOnboarding();
    router.replace('/');
  };

  const buildOwn = () => {
    completeOnboarding();
    router.replace('/explore');
  };

  return (
    <Screen
      header={
        <BrandHeader>
          <View style={styles.hero}>
            <BrandLogo variant="stacked" tone="onDark" height={170} />
            <T tone="inverse" style={styles.tagline}>
              Your Korea trip, all in one place — planned by people who&apos;ve been.
            </T>
          </View>
        </BrandHeader>
      }>
      <T variant="title" style={{ marginTop: Space.sm }}>
        How long is your trip?
      </T>
      <T tone="muted" style={{ marginTop: Space.xs, marginBottom: Space.lg }}>
        Pick one and we&apos;ll build your day-by-day Seoul plan. You can change anything later.
      </T>
      <View style={{ gap: Space.md }}>
        {Plans.map((p) => (
          <PlanCard key={p.id} plan={p} onPress={() => choose(p.id)} />
        ))}
      </View>
      <Button
        label="I'll plan it myself"
        variant="ghost"
        icon="compass"
        style={{ marginTop: Space.md }}
        onPress={buildOwn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: Space.md, marginTop: -Space.sm },
  tagline: { textAlign: 'center', maxWidth: 320, opacity: 0.9 },
});

import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { NewsletterSignup } from '@/components/newsletter-signup';
import { DateStepper, NumberStepper } from '@/components/steppers';
import { Button, Chip, Icon, Screen, T } from '@/components/ui';
import { InterestLabels, type Interest } from '@/data/spots';
import { addDays, today } from '@/lib/dates';
import { useAppState } from '@/state/app-state';
import { Radius, Space, useColors } from '@/theme';

const Interests = Object.keys(InterestLabels) as Interest[];

export default function OnboardingScreen() {
  const c = useColors();
  const { trip, completeOnboarding } = useAppState();
  const hasPlan = trip.days.some((d) => d.length);
  const [dayCount, setDayCount] = useState(hasPlan ? trip.days.length : 5);
  const [startDate, setStartDate] = useState<string | null>(trip.startDate);
  const [interests, setInterests] = useState<Interest[]>([]);

  const toggle = (i: Interest) =>
    setInterests((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

  const finish = () => {
    completeOnboarding({ interests, dayCount, startDate });
    router.replace(hasPlan ? '/trip' : '/');
  };

  return (
    <Screen>
      <View style={[styles.logo, { backgroundColor: c.primary }]}>
        <T style={styles.logoText}>한</T>
      </View>
      <T variant="display">Unravel Korea</T>
      <T tone="muted" style={{ marginTop: Space.xs }}>
        Plan your trip, carry it offline, and get around like you&apos;ve been before.
      </T>

      <Step n={1} title="How long is your trip?">
        <NumberStepper value={dayCount} onChange={setDayCount} unit={['day', 'days']} />
      </Step>

      <Step n={2} title="When do you arrive?">
        {startDate ? (
          <>
            <DateStepper value={startDate} onChange={setStartDate} />
            <Pressable onPress={() => setStartDate(null)} style={{ marginTop: Space.sm }}>
              <T variant="label" tone="primary">
                I&apos;m not sure yet
              </T>
            </Pressable>
          </>
        ) : (
          <Button
            label="Pick my arrival date"
            icon="calendar"
            variant="secondary"
            onPress={() => setStartDate(addDays(today(), 30))}
          />
        )}
        <T variant="caption" tone="muted" style={{ marginTop: Space.sm }}>
          With dates we warn you when a palace or market is closed on the day you planned it.
        </T>
      </Step>

      <Step n={3} title="What are you into?">
        <View style={styles.chips}>
          {Interests.map((i) => (
            <Chip key={i} label={InterestLabels[i]} selected={interests.includes(i)} onPress={() => toggle(i)} />
          ))}
        </View>
      </Step>

      <View style={[styles.newsletter, { backgroundColor: c.accentSoft }]}>
        <View style={styles.stepHeader}>
          <Icon name="mail" size={22} color={c.accent} />
          <View style={{ flex: 1 }}>
            <T variant="label">Get Seoul Sip — free weekly newsletter</T>
            <T variant="caption" tone="muted">
              What&apos;s happening in Korea in 5 minutes. Join 5,000+ readers.
            </T>
          </View>
        </View>
        <NewsletterSignup />
      </View>

      <Button label="Let's go" icon="arrow-forward" style={{ marginTop: Space.xl }} onPress={finish} />
    </Screen>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ marginTop: Space.xl }}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, { backgroundColor: c.primarySoft }]}>
          <T variant="label" tone="primary">
            {n}
          </T>
        </View>
        <T variant="heading">{title}</T>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.xl,
    marginBottom: Space.lg,
  },
  logoText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginBottom: Space.md },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  newsletter: {
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.lg,
    marginTop: Space.xl,
  },
});

import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, useColorScheme } from 'react-native';

import { BrandLogo } from '@/components/brand-logo';
import { T } from '@/components/ui';
import { Palette, Space } from '@/theme';

/**
 * Width of the tower mark on the native splash screen (app.json → expo-splash-screen → imageWidth).
 * The welcome starts from exactly this size and position so the hand-off from the native splash is
 * seamless. Kept small enough to fit inside Android 12+'s circular splash-icon mask.
 */
export const SPLASH_MARK_WIDTH = 110;
const MARK_HEIGHT = Math.round((SPLASH_MARK_WIDTH * 757) / 600);

/**
 * Branded welcome shown on every cold start: the native splash's tower mark lifts, the wordmark and
 * tagline fade in, then the whole thing dissolves into the app (~1.5s). Tap anywhere to skip;
 * "Reduce motion" skips the animation.
 */
export function WelcomeOverlay({ start, onDone }: { start: boolean; onDone: () => void }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // Stable Animated values (useState initializers run once; reading refs during render isn't allowed).
  const [lift] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(fade, { toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(
      () => onDone(),
    );
  }, [fade, onDone]);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          lift.setValue(1);
          reveal.setValue(1);
          setTimeout(finish, 600);
          return;
        }
        Animated.sequence([
          Animated.timing(lift, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(reveal, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(550),
        ]).start(({ finished: done }) => done && finish());
      });
    return () => {
      cancelled = true;
    };
  }, [start, lift, reveal, finish]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: Palette[scheme].background, opacity: fade }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Pressable
        style={styles.center}
        onPress={start ? finish : undefined}
        accessibilityRole="button"
        accessibilityLabel="Unravel Korea. Tap to skip">
        <Animated.View
          style={{
            transform: [
              { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -64] }) },
              { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }) },
            ],
          }}>
          <BrandLogo variant="mark" height={MARK_HEIGHT} />
        </Animated.View>
        <Animated.View
          style={[
            styles.below,
            {
              opacity: reveal,
              transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            },
          ]}>
          <BrandLogo variant="wordmark" height={58} />
          <T tone="muted" style={styles.tagline}>
            Your Korea trip, all in one place.
          </T>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000, elevation: 1000 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  below: {
    position: 'absolute',
    top: '50%',
    marginTop: MARK_HEIGHT / 2 - 40,
    alignItems: 'center',
    gap: Space.sm,
  },
  tagline: { textAlign: 'center' },
});

import type { ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/brand-logo';
import { Button, T } from '@/components/ui';
import { Space, useColors } from '@/theme';

/** Shown by Expo Router when a screen throws. Trips are saved on the device, so retrying is safe. */
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  const c = useColors();
  // If the crash happened before the app finished loading, the splash screen would hide this.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <BrandLogo variant="mark" height={96} />
      <T variant="title" style={styles.center}>
        Something went wrong
      </T>
      <T tone="muted" style={styles.center}>
        Your trip is saved on this phone. Try again, and if it keeps happening, let us know.
      </T>
      {__DEV__ ? (
        <T variant="caption" tone="warning" style={styles.center}>
          {error.message}
        </T>
      ) : null}
      <Button label="Try again" icon="refresh" onPress={retry} style={{ minWidth: 180 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.md, padding: Space.xl },
  center: { textAlign: 'center' },
});

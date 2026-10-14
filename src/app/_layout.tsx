import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorScreen } from '@/components/error-screen';
import { WelcomeOverlay } from '@/components/welcome-overlay';
import { AppStateProvider, useAppState } from '@/state/app-state';
import { Fonts, Palette } from '@/theme';

SplashScreen.preventAutoHideAsync();

export { ErrorScreen as ErrorBoundary };

/**
 * Keeps the native splash up until saved state and fonts are loaded, then hands over to the
 * animated welcome, which starts from the same tower mark so the transition is seamless.
 */
function LaunchSequence({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useAppState();
  const appReady = ready && fontsReady;
  const [welcomeDone, setWelcomeDone] = useState(false);
  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);
  return welcomeDone ? null : <WelcomeOverlay start={appReady} onDone={() => setWelcomeDone(true)} />;
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  // A font that fails to load falls back to the system font rather than blocking the app.
  const [fontsLoaded, fontError] = useFonts({
    [Fonts.regular]: PlusJakartaSans_400Regular,
    [Fonts.medium]: PlusJakartaSans_500Medium,
    [Fonts.semibold]: PlusJakartaSans_600SemiBold,
    [Fonts.bold]: PlusJakartaSans_700Bold,
    [Fonts.extrabold]: PlusJakartaSans_800ExtraBold,
  });
  const p = Palette[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: p.primary,
      background: p.background,
      card: p.surface,
      text: p.text,
      border: p.border,
    },
  };

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ThemeProvider value={navTheme}>
          {/* Every screen starts with the navy/blue brand header, so the status bar is always light. */}
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="spot/[id]" />
            <Stack.Screen name="today" />
            <Stack.Screen name="credits" />
            <Stack.Screen name="import" options={{ presentation: 'modal' }} />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          </Stack>
          <LaunchSequence fontsReady={fontsLoaded || !!fontError} />
        </ThemeProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

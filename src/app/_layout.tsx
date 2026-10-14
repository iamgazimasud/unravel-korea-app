import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorScreen } from '@/components/error-screen';
import { AppStateProvider, useAppState } from '@/state/app-state';
import { Palette } from '@/theme';

SplashScreen.preventAutoHideAsync();

export { ErrorScreen as ErrorBoundary };

function HideSplashWhenReady() {
  const { ready } = useAppState();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const p = Palette[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: p.primary,
      background: p.background,
      card: p.background,
      text: p.text,
      border: p.border,
    },
  };

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ThemeProvider value={navTheme}>
          <HideSplashWhenReady />
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal', headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="spot/[id]" options={{ title: '' }} />
            <Stack.Screen name="today" options={{ title: 'Today' }} />
            <Stack.Screen name="import" options={{ title: 'Shared trip', presentation: 'modal' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
        </ThemeProvider>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

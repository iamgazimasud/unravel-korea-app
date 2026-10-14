import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { useAppState } from '@/state/app-state';
import { Fonts, useColors } from '@/theme';

const TabIcons: Record<string, [string, string]> = {
  index: ['home', 'home-outline'],
  explore: ['compass', 'compass-outline'],
  trip: ['calendar', 'calendar-outline'],
  read: ['newspaper', 'newspaper-outline'],
  toolkit: ['briefcase', 'briefcase-outline'],
};

export default function TabLayout() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { ready, prefs } = useAppState();

  if (!ready) return null;
  if (!prefs.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        // Item = 5px padding + 26px icon pill + 2px gap + 17px label + 5px padding; the bar adds
        // 6px top/bottom and the Android gesture-bar inset.
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          height: 72 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarItemStyle: { gap: 2 },
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 11, lineHeight: 15, marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const [on, off] = TabIcons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            // Active tab sits on a soft brand-blue pill.
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: focused ? c.primarySoft : 'transparent',
              }}>
              <Icon name={focused ? on : off} size={22} color={color} />
            </View>
          );
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="trip" options={{ title: 'My Trip' }} />
      <Tabs.Screen name="read" options={{ title: 'Read' }} />
      <Tabs.Screen name="toolkit" options={{ title: 'Toolkit' }} />
    </Tabs>
  );
}

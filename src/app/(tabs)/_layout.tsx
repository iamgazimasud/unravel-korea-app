import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { Icon } from '@/components/ui';
import { useAppState } from '@/state/app-state';
import { useColors } from '@/theme';

const TabIcons: Record<string, [string, string]> = {
  index: ['home', 'home-outline'],
  explore: ['compass', 'compass-outline'],
  trip: ['calendar', 'calendar-outline'],
  read: ['newspaper', 'newspaper-outline'],
  toolkit: ['briefcase', 'briefcase-outline'],
};

export default function TabLayout() {
  const c = useColors();
  const { ready, prefs } = useAppState();

  if (!ready) return null;
  if (!prefs.onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const [on, off] = TabIcons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Icon name={focused ? on : off} size={size} color={color} />;
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

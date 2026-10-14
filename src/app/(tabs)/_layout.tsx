import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui';
import { useAppState } from '@/state/app-state';
import { Fonts, useColors } from '@/theme';

const TabIcons: Record<string, [string, string]> = {
  index: ['calendar', 'calendar-outline'],
  explore: ['compass', 'compass-outline'],
  korean: ['chatbubbles', 'chatbubbles-outline'],
  read: ['newspaper', 'newspaper-outline'],
};

const ICON_SIZE = 22;
const ICON_PILL_WIDTH = 54;
const ICON_PILL_HEIGHT = 26;

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
        // The tab bar sizes the icon slot for a bare 24pt icon. Our icon sits on a wider pill, so the slot
        // must fit the pill: on Android a narrower slot squeezes the icon to zero width (web just overflows).
        tabBarIconStyle: { width: ICON_PILL_WIDTH, height: ICON_PILL_HEIGHT },
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 11, lineHeight: 15, marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const [on, off] = TabIcons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            // Active tab sits on a soft brand-blue pill.
            <View
              style={{
                width: ICON_PILL_WIDTH,
                height: ICON_PILL_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                backgroundColor: focused ? c.primarySoft : 'transparent',
              }}>
              <Icon name={focused ? on : off} size={ICON_SIZE} color={color} />
            </View>
          );
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'My Trip' }} />
      <Tabs.Screen name="explore" options={{ title: 'Places' }} />
      <Tabs.Screen name="korean" options={{ title: 'Korean' }} />
      <Tabs.Screen name="read" options={{ title: 'Read' }} />
    </Tabs>
  );
}

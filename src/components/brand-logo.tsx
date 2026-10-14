import { Image } from 'expo-image';
import { useColorScheme, type StyleProp, type ImageStyle } from 'react-native';

const Logos = {
  wordmark: {
    light: require('@/assets/brand/wordmark.png'),
    dark: require('@/assets/brand/wordmark-dark.png'),
    aspect: 1200 / 390,
  },
  stacked: {
    light: require('@/assets/brand/logo-stacked.png'),
    dark: require('@/assets/brand/logo-stacked-dark.png'),
    aspect: 900 / 785,
  },
  mark: {
    light: require('@/assets/brand/mark.png'),
    dark: require('@/assets/brand/mark.png'),
    aspect: 600 / 757,
  },
} as const;

/** The Unravel Korea logo, switching to the light-ink version in dark mode. */
export function BrandLogo({
  variant = 'wordmark',
  tone = 'auto',
  height,
  style,
}: {
  variant?: keyof typeof Logos;
  /** `onDark` always uses the light-ink version, e.g. on the blue header. */
  tone?: 'auto' | 'onDark';
  height: number;
  style?: StyleProp<ImageStyle>;
}) {
  const logo = Logos[variant];
  const scheme = useColorScheme();
  const source = tone === 'onDark' || scheme === 'dark' ? logo.dark : logo.light;
  return (
    <Image
      source={source}
      style={[{ height, width: height * logo.aspect }, style]}
      contentFit="contain"
      accessibilityRole="image"
      accessibilityLabel="Unravel Korea"
    />
  );
}

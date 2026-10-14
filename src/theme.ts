import { useColorScheme } from 'react-native';

/** Exact colours sampled from the Unravel Korea logo (assets/brand/source). */
export const Brand = {
  skyBlue: '#1E8CC8',
  waveBlue: '#60B8E0',
  navy: '#283858',
} as const;

/**
 * App palette built on the logo. `primary` is the logo blue deepened just enough for white text to
 * pass WCAG AA (4.9:1); dark mode flips to a lighter blue with dark text (7.9:1).
 */
export const Palette = {
  light: {
    background: '#F7FAFD',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF3F9',
    border: '#DDE5EF',
    text: '#17213A',
    textMuted: '#5B6578',
    primary: '#1677B3',
    primarySoft: '#E2F0FA',
    onPrimary: '#FFFFFF',
    accent: Brand.navy,
    accentSoft: '#E7ECF5',
    success: '#1F8A5B',
    successSoft: '#E3F4EC',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
  },
  dark: {
    background: '#0E1520',
    surface: '#151E2C',
    surfaceAlt: '#1D2838',
    border: '#283548',
    text: '#EEF3F9',
    textMuted: '#9AA8BC',
    primary: '#5DB3EA',
    primarySoft: '#132C42',
    onPrimary: '#0E1520',
    accent: '#9DB4DA',
    accentSoft: '#1A2436',
    success: '#34D399',
    successSoft: '#11291F',
    warning: '#FBBF24',
    warningSoft: '#3A2E10',
  },
} as const;

export type Colors = { [K in keyof typeof Palette.light]: string };

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? Palette.dark : Palette.light;
}

export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const ScreenPadding = 20;
export const Radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const MaxWidth = 720;

/** Plus Jakarta Sans, loaded in the root layout. Hangul falls back to the system font automatically. */
export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

/** The navy → sky-blue gradient used behind every screen header (from the logo's two blues). */
export const HeaderGradient = [Brand.navy, '#1D5488', Brand.skyBlue] as const;

/** Soft drop shadow for cards in light mode (dark mode uses a hairline border instead). */
export const CardShadow = {
  shadowColor: Brand.navy,
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

import { useColorScheme } from 'react-native';

/** Palette drawn from the taegeuk: red #CD2E3A and blue #0047A0 on a warm hanji-paper background. */
export const Palette = {
  light: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F2EEE8',
    border: '#E7E2DA',
    text: '#1A1F2B',
    textMuted: '#6B7280',
    primary: '#CD2E3A',
    primarySoft: '#FBE9EA',
    onPrimary: '#FFFFFF',
    accent: '#0047A0',
    accentSoft: '#E6EEF8',
    success: '#1F8A5B',
    successSoft: '#E3F4EC',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
  },
  dark: {
    background: '#0F1115',
    surface: '#181B21',
    surfaceAlt: '#20242C',
    border: '#2A2F38',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    primary: '#EF4B57',
    primarySoft: '#3A1A1D',
    onPrimary: '#FFFFFF',
    accent: '#6AA5F2',
    accentSoft: '#16243A',
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
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;
export const MaxWidth = 720;

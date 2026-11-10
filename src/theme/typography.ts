import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  fontFamily,
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  heading1: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  heading3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  captionStrong: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  // Financial figures use tabular numerals for aligned columns.
  financialLarge: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'] as const,
  },
  financialMedium: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
  },
  financialSmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export type TypographyTokens = typeof typography;

import { Platform } from 'react-native';

/**
 * Controlled, restrained shadow presets. Used sparingly — not every surface
 * needs elevation, and glass panels mostly rely on borders/highlights instead.
 */
function elevation(elevationLevel: number, opacity: number, radiusPx: number, color = '#000000') {
  return Platform.select({
    android: { elevation: elevationLevel },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: Math.round(radiusPx / 2) },
    },
  });
}

export const shadows = {
  none: {},
  soft: elevation(2, 0.18, 10),
  card: elevation(4, 0.24, 16),
  floating: elevation(10, 0.32, 24),
  glowAccent: Platform.select({
    ios: {
      shadowColor: '#35D6A0',
      shadowOpacity: 0.35,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 0 },
    },
    default: {},
  }),
} as const;

export type ShadowTokens = typeof shadows;

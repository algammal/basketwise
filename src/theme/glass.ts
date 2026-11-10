import { colors } from './colors';
import { radius } from './spacing';

/**
 * Shared glassmorphism presets. BlurView intensity/tint plus the border/
 * highlight treatment that makes panels read as layered glass rather than
 * flat translucent boxes.
 */
export const glass = {
  panel: {
    blurIntensity: 36,
    tint: 'dark' as const,
    backgroundColor: colors.glass.surface,
    borderColor: colors.glass.border,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  panelElevated: {
    blurIntensity: 48,
    tint: 'dark' as const,
    backgroundColor: colors.glass.surfaceStrong,
    borderColor: colors.glass.borderStrong,
    borderWidth: 1,
    borderRadius: radius.xl,
  },
  wheel: {
    blurIntensity: 60,
    tint: 'dark' as const,
    backgroundColor: 'rgba(20,31,48,0.55)',
    borderColor: colors.glass.borderStrong,
    borderWidth: 1,
  },
  pill: {
    blurIntensity: 24,
    tint: 'dark' as const,
    backgroundColor: colors.glass.surface,
    borderColor: colors.glass.border,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
} as const;

export type GlassTokens = typeof glass;

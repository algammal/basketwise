export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './glass';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, radius } from './spacing';
import { shadows } from './shadows';
import { glass } from './glass';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  glass,
} as const;

export type Theme = typeof theme;

/**
 * BasketWise color tokens — premium dark glassmorphism fintech palette.
 * Do not use raw hex values outside this file; import from theme instead.
 */
export const colors = {
  background: {
    primary: '#080D18',
    secondary: '#101827',
    elevated: '#141F30',
  },
  glass: {
    surface: 'rgba(255,255,255,0.045)',
    surfaceStrong: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.09)',
    borderStrong: 'rgba(255,255,255,0.16)',
    highlight: 'rgba(255,255,255,0.12)',
  },
  accent: {
    primary: '#35D6A0',
    primaryMuted: 'rgba(53,214,160,0.16)',
    secondary: '#55C9F5',
    secondaryMuted: 'rgba(85,201,245,0.16)',
  },
  text: {
    primary: '#F4F7FB',
    secondary: '#8B98AA',
    tertiary: '#5A6478',
    inverse: '#080D18',
  },
  semantic: {
    savings: '#35D6A0',
    info: '#55C9F5',
    warning: '#E9B95F',
    warningMuted: 'rgba(233,185,95,0.16)',
    danger: '#F07878',
    dangerMuted: 'rgba(240,120,120,0.16)',
  },
  chart: {
    series: ['#35D6A0', '#55C9F5', '#E9B95F', '#B88BF0', '#F07878'],
    grid: 'rgba(255,255,255,0.06)',
  },
  overlay: {
    scrim: 'rgba(5,8,15,0.72)',
  },
} as const;

export type ColorTokens = typeof colors;

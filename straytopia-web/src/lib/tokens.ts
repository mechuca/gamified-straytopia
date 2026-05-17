export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const fontSizes = {
  xs: 10,
  '2xs': 11,
  sm: 12,
  '2sm': 13,
  base: 14,
  '2base': 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
  '7xl': 44,
} as const;

export const fontWeights = {
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
  md: '0 2px 4px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.06)',
  lg: '0 4px 8px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.08)',
  xl: '0 8px 16px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.10)',
} as const;

export const zIndex = {
  base: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 100,
  toast: 200,
  tooltip: 300,
  max: 500,
} as const;

export const animationDurations = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
} as const;

export const hapticPatterns = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  error: 'error',
  select: 'select',
} as const;

export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radii;
export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
export type ShadowKey = keyof typeof shadows;
export type ZIndexKey = keyof typeof zIndex;
export type AnimationDurationKey = keyof typeof animationDurations;
export type HapticPattern = (typeof hapticPatterns)[keyof typeof hapticPatterns];

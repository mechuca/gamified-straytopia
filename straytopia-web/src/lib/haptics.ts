import { HapticPattern } from './tokens';

const HAPTIC_ENABLED_KEY = 'straytopia-haptics-enabled';

export function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(HAPTIC_ENABLED_KEY);
  return stored !== 'false';
}

export function setEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HAPTIC_ENABLED_KEY, String(enabled));
}

function vibrate(pattern: number | number[]): void {
  if (typeof window === 'undefined') return;
  if (!isEnabled()) return;
  if (!navigator.vibrate) return;
  navigator.vibrate(pattern);
}

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: [40],
  success: [10, 50, 10],
  error: [30, 50, 30],
  select: 5,
};

export function haptic(pattern: HapticPattern): void {
  vibrate(patterns[pattern]);
}

export const hapticLight = () => haptic('light');
export const hapticMedium = () => haptic('medium');
export const hapticHeavy = () => haptic('heavy');
export const hapticSuccess = () => haptic('success');
export const hapticError = () => haptic('error');
export const hapticSelect = () => haptic('select');

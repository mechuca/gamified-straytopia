import { useMemo } from 'react';
import { useApp } from '@/store/app';
import { LIGHT, DARK, type ThemeColors } from '@/lib/theme';

export function useTheme(): ThemeColors {
  const darkMode = useApp((s) => s.darkMode);
  return useMemo(() => (darkMode ? DARK : LIGHT) as unknown as ThemeColors, [darkMode]);
}

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { LIGHT, DARK, type ThemeColors } from '@/lib/theme';
import { useApp } from '@/store/app';

const ThemeContext = createContext<ThemeColors>(LIGHT as unknown as ThemeColors);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const darkMode = useApp((s) => s.darkMode);
  const colors = useMemo(() => (darkMode ? DARK : LIGHT) as unknown as ThemeColors, [darkMode]);
  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useColor() {
  return useContext(ThemeContext);
}

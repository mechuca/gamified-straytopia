'use client';

import { motion } from 'framer-motion';
import { haptic } from '@/lib/haptics';
import { type ThemeMode } from '@/lib/theme';
import { useTheme } from '@/lib/useTheme';

interface ThemeModeSelectorProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const OPTIONS: Array<{ key: ThemeMode; label: string }> = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export function ThemeModeSelector({ mode, onChange }: ThemeModeSelectorProps) {
  const C = useTheme();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        padding: 8,
        borderRadius: 18,
        backgroundColor: C.cardMuted,
        border: `1px solid ${C.border}`,
      }}
    >
      {OPTIONS.map((option) => {
        const active = option.key === mode;

        return (
          <motion.button
            key={option.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              haptic('select');
              onChange(option.key);
            }}
            style={{
              minHeight: 44,
              borderRadius: 14,
              border: active ? `1px solid ${C.borderStrong}` : '1px solid transparent',
              backgroundColor: active ? C.surfaceElevated : 'transparent',
              color: active ? C.textPrimary : C.textSecondary,
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: active ? `0 8px 18px ${C.shadow}` : 'none',
            }}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

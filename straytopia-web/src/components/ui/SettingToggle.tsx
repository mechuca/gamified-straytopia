'use client';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface SettingToggleProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'select' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 40,
    success: [30, 50, 60],
    error: [50, 30, 80],
    select: 8,
  };
  navigator.vibrate(patterns[type]);
}

export function SettingToggle({ icon: Icon, label, description, checked, onChange, className = '' }: SettingToggleProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        haptic('select');
        onChange();
      }}
      className={`flex items-center justify-between w-full p-3.5 rounded-2xl border-none cursor-pointer ${className}`}
      style={{ backgroundColor: C.surfaceElevated, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 40,
            height: 40,
            backgroundColor: C.cardMuted,
          }}
        >
          <Icon size={20} color={checked ? C.jungle : C.muted} />
        </div>
        <div className="text-left">
          <div
            style={{
              fontFamily: 'Fredoka',
              fontWeight: 600,
              fontSize: 15,
              color: C.textPrimary,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: 'Nunito',
              fontWeight: 500,
              fontSize: 13,
              color: C.textSecondary,
            }}
          >
            {description}
          </div>
        </div>
      </div>
      <div
        className="relative"
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: checked ? C.primary : C.borderStrong,
          transition: 'background-color 0.2s',
        }}
      >
        <div
          className="absolute top-0.5"
          style={{
            left: checked ? 22 : 2,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: C.surfaceElevated,
            boxShadow: `0 4px 10px ${C.shadow}`,
            transition: 'left 0.2s',
          }}
        />
      </div>
    </motion.button>
  );
}

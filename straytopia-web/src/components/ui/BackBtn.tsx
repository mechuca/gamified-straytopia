'use client';
import { ArrowLeft } from 'lucide-react';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface BackBtnProps {
  onClick: () => void;
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

export function BackBtn({ onClick, className = '' }: BackBtnProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <button
      onClick={() => {
        haptic('select');
        onClick();
      }}
      aria-label="Go back"
      className={`bg-none border-none p-2 cursor-pointer flex min-h-11 min-w-11 items-center ${className}`}
      style={{ background: 'none', border: 'none' }}
    >
      <ArrowLeft size={22} color={C.ink2} />
    </button>
  );
}

'use client';
import { motion } from 'framer-motion';
import { getTheme, ThemeColors } from '@/lib/theme';
import { useApp } from '@/store/app';

type ButtonVariant = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'ink' | 'paper' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string; minHeight: string }> = {
  lg: { padding: '18px 24px', fontSize: '16px', minHeight: '52px' },
  md: { padding: '16px 22px', fontSize: '16px', minHeight: '52px' },
  sm: { padding: '10px 16px', fontSize: '14px', minHeight: '44px' },
};

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

export function Button({
  children,
  variant = 'jungle',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  const colors: Record<ButtonVariant, { bg: string; shadow: string; fg: string }> = {
    jungle: { bg: C.jungle, shadow: C.jungleDeep, fg: '#fff' },
    coral: { bg: C.coral, shadow: C.coralDeep, fg: '#fff' },
    gold: { bg: C.gold, shadow: C.goldDeep, fg: C.goldInk },
    sky: { bg: C.sky, shadow: C.skyDeep, fg: '#fff' },
    plum: { bg: C.plum, shadow: C.plumDeep, fg: '#fff' },
    ink: { bg: C.ink, shadow: '#000', fg: C.paper },
    paper: { bg: C.surface, shadow: C.hairline2, fg: C.ink },
    ghost: { bg: 'transparent', shadow: 'transparent', fg: C.ink2 },
  };

  const c = colors[variant];
  const isGhost = variant === 'ghost';
  const sz = sizeStyles[size];

  return (
    <motion.button
      whileTap={!disabled && !isGhost ? { y: 4 } : {}}
      onClick={() => {
        haptic('medium');
        onClick?.();
      }}
      disabled={disabled}
      className={`flex items-center justify-center gap-2.5 w-full font-semibold tracking-wide uppercase ${className}`}
      style={{
        padding: sz.padding,
        minHeight: sz.minHeight,
        borderRadius: 18,
        backgroundColor: c.bg,
        color: c.fg,
        fontSize: sz.fontSize,
        fontFamily: 'Fredoka, sans-serif',
        letterSpacing: 0.01,
        border: isGhost ? `2.5px solid ${C.hairline2}` : 'none',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: isGhost ? 0 : 4,
        boxShadow: isGhost ? 'none' : `0 4px 0 0 ${c.shadow}`,
      }}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </motion.button>
  );
}

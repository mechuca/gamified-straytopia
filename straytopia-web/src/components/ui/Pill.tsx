'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

type PillTone = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'ink' | 'paper';
type PillVariant = 'soft' | 'solid';

interface PillProps {
  children: React.ReactNode;
  tone?: PillTone | string;
  variant?: PillVariant;
  className?: string;
}

export function Pill({ children, tone = 'paper', variant = 'soft', className = '' }: PillProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  const softColors: Record<PillTone, { bg: string; fg: string }> = {
    jungle: { bg: C.jungleSoft, fg: C.jungleDeep },
    coral: { bg: C.coralSoft, fg: C.coralDeep },
    gold: { bg: C.goldSoft, fg: C.goldInk },
    sky: { bg: C.skySoft, fg: C.skyDeep },
    plum: { bg: C.plumSoft, fg: C.plumDeep },
    ink: { bg: C.paper2, fg: C.ink },
    paper: { bg: C.paper2, fg: C.ink2 },
  };

  const safeTone = (tone in softColors ? tone : 'paper') as PillTone;
  const c = softColors[safeTone];
  const bg = variant === 'solid' ? C[safeTone as keyof typeof C] || C.paper2 : c.bg;
  const fg = variant === 'solid' ? (safeTone === 'gold' ? C.goldInk : '#fff') : c.fg;

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full ${className}`}
      style={{
        backgroundColor: bg,
        fontSize: 13,
        fontWeight: 800,
        fontFamily: 'Nunito, sans-serif',
        color: fg,
      }}
    >
      {children}
    </span>
  );
}

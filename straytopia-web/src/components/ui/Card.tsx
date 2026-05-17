'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

type CardTone = 'surface' | 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper';

interface CardProps {
  children: React.ReactNode;
  tone?: CardTone;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, tone = 'surface', className = '', style, onClick }: CardProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  const bgMap: Record<CardTone, string> = {
    surface: C.card,
    jungle: C.primary,
    coral: C.danger,
    gold: C.warning,
    sky: C.info,
    plum: C.plum,
    paper: C.cardMuted,
  };

  const bg = bgMap[tone];
  const bordered = tone === 'surface';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-3xl p-4 ${className}`}
      style={{
        backgroundColor: bg,
        ...(bordered ? { border: `1px solid ${C.borderStrong}`, boxShadow: `0 10px 24px ${C.shadow}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

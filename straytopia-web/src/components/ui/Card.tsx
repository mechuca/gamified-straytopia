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
    surface: C.surface,
    jungle: C.jungle,
    coral: C.coral,
    gold: C.gold,
    sky: C.sky,
    plum: C.plum,
    paper: C.paper2,
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
        ...(bordered ? { border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

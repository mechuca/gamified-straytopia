'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

type AvatarTone = 'sky' | 'jungle' | 'coral' | 'gold' | 'plum' | 'paper';

interface AvatarProps {
  name: string;
  size?: number;
  tone?: AvatarTone | string;
  className?: string;
}

export function Avatar({ name, size = 40, tone = 'sky', className = '' }: AvatarProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  const colors: Record<AvatarTone, { bg: string; fg: string }> = {
    sky: { bg: C.sky, fg: '#fff' },
    jungle: { bg: C.jungle, fg: '#fff' },
    coral: { bg: C.coral, fg: '#fff' },
    gold: { bg: C.gold, fg: C.goldInk },
    plum: { bg: C.plum, fg: '#fff' },
    paper: { bg: C.paper2, fg: C.ink2 },
  };

  const safeTone = (tone in colors ? tone : 'sky') as AvatarTone;
  const c = colors[safeTone];

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: c.bg,
        color: c.fg,
        fontFamily: 'Fredoka, sans-serif',
        fontWeight: 600,
        fontSize: size * 0.42,
        border: `2.5px solid ${C.paper}`,
      }}
    >
      {name[0]}
    </div>
  );
}

'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

type BuddyTone = 'sky' | 'jungle' | 'coral' | 'gold';

interface BuddyAvatarProps {
  name: string;
  online: boolean;
  tone?: BuddyTone;
  className?: string;
}

export function BuddyAvatar({ name, online, tone = 'sky', className = '' }: BuddyAvatarProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  const colors: Record<BuddyTone, { bg: string; fg: string }> = {
    sky: { bg: C.sky, fg: '#fff' },
    jungle: { bg: C.jungle, fg: '#fff' },
    coral: { bg: C.coral, fg: '#fff' },
    gold: { bg: C.gold, fg: C.goldInk },
  };

  const c = colors[tone] || colors.sky;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 40,
          height: 40,
          backgroundColor: c.bg,
          color: c.fg,
          fontFamily: 'Fredoka',
          fontWeight: 600,
          fontSize: 16,
          border: `2.5px solid ${C.paper}`,
        }}
      >
        {name[0]}
      </div>
      {online && (
        <div
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: C.jungle,
            border: `2px solid ${C.paper}`,
          }}
        />
      )}
    </div>
  );
}

'use client';
import { Flame, Zap, Heart } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';

const C: ThemeColors = COLOR;

interface StatStripProps {
  points: number;
  streak: number;
  hearts: number;
}

export function StatStrip({ points, streak, hearts }: StatStripProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 p-3 rounded-[18px]" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
      <div className="flex items-center gap-1.5">
        <Flame size={22} color={C.coral} fill={C.coral} />
        <span className="font-['Fredoka'] font-bold text-xl" style={{ color: C.coralDeep }}>{streak}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Zap size={22} color={C.gold} fill={C.gold} />
        <span className="font-['Fredoka'] font-bold text-xl" style={{ color: C.goldDeep }}>{points}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Heart size={22} color={C.coral} fill={C.coral} />
        <span className="font-['Fredoka'] font-bold text-xl" style={{ color: C.coralDeep }}>{hearts}</span>
      </div>
    </div>
  );
}

'use client';
import { COLOR, ThemeColors } from '@/lib/theme';

const C: ThemeColors = COLOR;

export function NeighborhoodEngagementStrip() {
  const activeNow = 12;
  const todayMissions = 34;
  const weekGrowth = 23;

  return (
    <div className="mb-4 p-3.5 rounded-[24px]" style={{ backgroundColor: C.paper2 }}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: C.jungle }} />
        <span className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>Active in Indiranagar</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="font-['Fredoka'] font-semibold text-xl" style={{ color: C.jungleDeep }}>{activeNow}</div>
          <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>Active now</div>
        </div>
        <div className="text-center">
          <div className="font-['Fredoka'] font-semibold text-xl" style={{ color: C.skyDeep }}>{todayMissions}</div>
          <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>Missions today</div>
        </div>
        <div className="text-center">
          <div className="font-['Fredoka'] font-semibold text-xl" style={{ color: C.coralDeep }}>+{weekGrowth}%</div>
          <div className="font-['Nunito'] font-semibold text-[11px]" style={{ color: C.muted }}>This week</div>
        </div>
      </div>
    </div>
  );
}

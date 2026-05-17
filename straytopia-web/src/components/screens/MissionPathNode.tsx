'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { Mission } from '@/lib/mock';

const C: ThemeColors = COLOR;

function toneShadow(tone: string): keyof typeof C {
  const map: Record<string, keyof typeof C> = { jungle: 'jungleDeep', sky: 'skyDeep', plum: 'plumDeep', coral: 'coralDeep', gold: 'goldDeep' };
  return map[tone] || 'jungleDeep';
}

interface MissionPathNodeProps {
  mission: Mission;
  status: string;
  index: number;
  total: number;
  onPress: () => void;
}

export function MissionPathNode({ mission, status, index, total, onPress }: MissionPathNodeProps) {
  const MI = mission.icon;
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isLast = index === total - 1;

  const nodeBg = isCompleted ? C.jungle : isInProgress ? C.gold : isLocked ? C.paper2 : (C as any)[mission.tone] || C.jungle;
  const nodeFg = isCompleted ? '#fff' : isInProgress ? C.goldInk : isLocked ? C.muted : '#fff';
  const opacity = isLocked ? 0.5 : 1;

  return (
    <div className="flex flex-col items-center" style={{ opacity }}>
      <motion.div
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={!isLocked ? () => { haptic(isCompleted ? 'success' : 'medium'); onPress(); } : undefined}
        className="w-[72px] h-[72px] rounded-[36px] flex items-center justify-center mb-2"
        style={{
          backgroundColor: nodeBg,
          cursor: isLocked ? 'default' : 'pointer',
          border: `3px solid ${isCompleted ? C.jungleDeep : isLocked ? C.hairline : nodeFg}`,
          boxShadow: isCompleted ? `0 4px 0 0 ${C.jungleDeep}` : isInProgress ? `0 4px 0 0 ${C.goldDeep}` : isLocked ? 'none' : `0 4px 0 0 ${C[toneShadow(mission.tone)]}`,
        }}
      >
        {isCompleted ? <CheckCircle2 size={32} color="#fff" /> : isLocked ? <Lock size={28} color={C.muted} /> : <MI size={32} color={nodeFg} />}
      </motion.div>
      <div className="font-['Fredoka'] font-semibold text-sm text-center max-w-[120px]" style={{ color: isLocked ? C.muted : C.ink }}>{mission.title}</div>
      {!isLast && (
        <div className="w-[3px] h-8 rounded-sm my-1" style={{ backgroundColor: isCompleted ? C.jungle : isLocked ? C.hairline : C.paper3 }} />
      )}
    </div>
  );
}

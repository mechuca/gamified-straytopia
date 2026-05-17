'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { Mission, missionChecklists } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader } from '@/components/ui';
import { MissionMap } from './MissionMap';

const C: ThemeColors = COLOR;

interface ActiveMissionScreenProps {
  mission: Mission;
  onComplete: () => void;
  onBack: () => void;
  checklistItems: Record<string, boolean>;
  toggleChecklistItem: (item: string) => void;
}

export function ActiveMissionScreen({ mission, onComplete, onBack, checklistItems, toggleChecklistItem }: ActiveMissionScreenProps) {
  const checklist = missionChecklists[mission.id] || [];
  const allChecked = checklist.length > 0 && checklist.every((c) => checklistItems[c.key]);

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Active Mission" onBack={onBack} />
      <MascotView scene="mission_active" compact />

      <div className="mt-4 mb-4">
        <div className="font-['Fredoka'] font-semibold text-xl mb-1" style={{ color: C.ink }}>{mission.title}</div>
        <div className="font-['Nunito'] font-medium text-sm" style={{ color: C.ink2 }}>{mission.description}</div>
      </div>

      {mission.lat && mission.lng && (
        <MissionMap lat={mission.lat} lng={mission.lng} location={mission.location} distance={mission.distance} />
      )}

      <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Mission Steps</div>
      <div className="flex flex-col gap-2.5 mb-6">
        {checklist.map((c) => (
          <motion.div
            key={c.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptic('select'); toggleChecklistItem(c.key); }}
            className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer"
            style={{
              backgroundColor: checklistItems[c.key] ? C.jungleSoft : C.surface,
              border: `2px solid ${checklistItems[c.key] ? C.jungle : C.hairline}`,
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              backgroundColor: checklistItems[c.key] ? C.jungle : C.paper2,
              border: checklistItems[c.key] ? 'none' : `2px solid ${C.hairline2}`,
            }}>
              {checklistItems[c.key] && <Check size={18} color="#fff" />}
            </div>
            <span className="font-['Nunito'] font-semibold text-[15px]" style={{
              color: checklistItems[c.key] ? C.jungleDeep : C.ink,
              textDecoration: checklistItems[c.key] ? 'line-through' : 'none',
            }}>{c.label}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={onComplete}
        disabled={!allChecked}
        className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
      >
        {allChecked ? 'Submit Proof' : 'Complete all steps first'}
      </button>
    </div>
  );
}

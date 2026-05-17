'use client';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { Modal } from '@/components/ui';
import { Saathi } from '@/mascot';

const C: ThemeColors = COLOR;

interface LockedMissionModalProps {
  open: boolean;
  onClose: () => void;
}

export function LockedMissionModal({ open, onClose }: LockedMissionModalProps) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <Saathi mood="thinking" trigger="blink" size={64} />
        <div className="font-['Fredoka'] font-semibold text-xl mt-3 mb-2" style={{ color: C.ink }}>Mission Locked</div>
        <div className="font-['Nunito'] font-medium text-[15px] leading-relaxed mb-5" style={{ color: C.ink2 }}>Complete Offer Food to unlock this mission.</div>
        <button onClick={() => { haptic('light'); onClose(); }} className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}>Got it</button>
      </div>
    </Modal>
  );
}

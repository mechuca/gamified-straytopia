'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, Siren, Users, ChevronRight } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';

const C: ThemeColors = COLOR;

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export function ActionSheet({ open, onClose, onAction }: ActionSheetProps) {
  if (!open) return null;

  const actions = [
    { icon: AlertTriangle, label: 'Report Animal', desc: 'File a rescue report', tone: 'coral' as const, action: 'report' },
    { icon: Siren, label: 'SOS Emergency', desc: 'Alert nearby authorities', tone: 'coral' as const, action: 'sos' },
    { icon: Users, label: 'Invite Care Buddy', desc: 'Share Straytopia', tone: 'gold' as const, action: 'invite' },
  ];

  return (
    <div className="fixed inset-0 z-[150]" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 p-4 pb-10 rounded-t-[24px]" style={{ backgroundColor: C.paper }}>
        <div className="w-10 h-1 rounded-sm mx-auto mb-5" style={{ backgroundColor: C.hairline2 }} />
        <div className="font-['Fredoka'] font-semibold text-xl mb-5" style={{ color: C.ink }}>Quick Actions</div>
        {actions.map((a) => (
          <motion.button key={a.label} whileTap={{ scale: 0.98 }} onClick={() => { haptic('medium'); onAction(a.action); onClose(); }} className="flex items-center gap-3.5 w-full p-3 bg-none border-none cursor-pointer rounded-2xl">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${(C as any)[a.tone]}22` }}>
              <a.icon size={24} color={(C as any)[a.tone]} />
            </div>
            <div className="text-left">
              <div className="font-['Fredoka'] font-semibold text-base" style={{ color: C.ink }}>{a.label}</div>
              <div className="font-['Nunito'] font-medium text-[13px]" style={{ color: C.ink2 }}>{a.desc}</div>
            </div>
            <ChevronRight size={20} color={C.muted} className="ml-auto" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

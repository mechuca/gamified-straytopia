'use client';
import { motion } from 'framer-motion';
import { Home, BookOpen, Trophy, User, Plus } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';

const C: ThemeColors = COLOR;

interface TabBarProps {
  active: string;
  onChange: (tab: string) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stories', label: 'Impact', icon: BookOpen },
    { id: 'league', label: 'Ranks', icon: Trophy },
    { id: 'profile', label: 'You', icon: User },
  ];

  return (
    <div className="fixed left-3.5 right-3.5 bottom-[22px] h-[76px] rounded-[28px] grid grid-cols-5 items-center px-1 z-10 max-w-[500px] mx-auto" style={{ backgroundColor: C.surface, border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 }}>
      {tabs.map((t) => (
        <motion.button key={t.id} whileTap={{ scale: 0.9 }} onClick={() => { haptic('select'); onChange(t.id); }} aria-label={t.label} className="flex flex-col items-center justify-center gap-1 bg-none border-none cursor-pointer min-h-[44px]" style={{ color: active === t.id ? C.jungleDeep : C.muted }}>
          <t.icon size={24} fill={active === t.id ? C.jungleDeep : 'none'} color={active === t.id ? C.jungleDeep : C.muted} />
          <span className="text-[10px] font-extrabold font-['Nunito'] uppercase tracking-[0.06]">{t.label}</span>
        </motion.button>
      ))}
      <div className="flex flex-col items-center justify-center">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { haptic('heavy'); onChange('action'); }} aria-label="Quick actions" className="w-16 h-16 rounded-[22px] flex items-center justify-center -mt-7 cursor-pointer border-[3px]" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}`, borderColor: C.paper }}>
          <Plus size={30} color="#fff" />
        </motion.button>
      </div>
    </div>
  );
}

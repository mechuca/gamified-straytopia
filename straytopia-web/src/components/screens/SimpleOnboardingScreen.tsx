'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useApp } from '@/store/app';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { MascotView } from '@/mascot';

const C: ThemeColors = COLOR;

interface SimpleOnboardingScreenProps {
  onComplete: () => void;
}

export function SimpleOnboardingScreen({ onComplete }: SimpleOnboardingScreenProps) {
  const { neighborhood, setNeighborhood } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(neighborhood);
  const [detecting, setDetecting] = useState(false);

  const neighborhoods = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'BTM Layout', 'Marathahalli', 'MG Road', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Other'];
  const filtered = search ? neighborhoods.filter((n) => n.toLowerCase().includes(search.toLowerCase())) : neighborhoods;

  const handleDetectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setSelected('Indiranagar'); setDetecting(false); },
        () => { setSelected('Indiranagar'); setDetecting(false); }
      );
    } else {
      setSelected('Indiranagar');
      setDetecting(false);
    }
  };

  const handleContinue = () => {
    setNeighborhood(selected || 'Indiranagar');
    onComplete();
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-4">
        <MascotView scene="onboarding_mission" size="lg" showBubble={false} />
        <div className="font-['Fredoka'] font-semibold text-[26px] text-[var(--ink)] leading-tight" style={{ color: C.ink }}>Where do you care?</div>
        <div className="font-['Nunito'] font-medium text-[15px] text-[var(--ink2)] max-w-[280px] leading-relaxed" style={{ color: C.ink2 }}>Pick your area so we can show nearby animals and missions.</div>
      </div>

      <div className="px-6 flex flex-col gap-3.5 mb-20">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDetectLocation}
          disabled={detecting}
          className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl font-['Fredoka'] font-semibold text-[15px] cursor-pointer"
          style={{
            border: `2px solid ${C.jungle}`,
            backgroundColor: detecting ? C.paper2 : C.jungleSoft,
            color: C.jungleDeep,
            opacity: detecting ? 0.6 : 1,
          }}
        >
          <MapPin size={20} color={C.jungle} />
          {detecting ? 'Detecting...' : 'Auto-detect my location'}
        </motion.button>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your area..."
            className="w-full p-3.5 pl-11 rounded-2xl font-['Fredoka'] text-lg outline-none"
            style={{ border: `2px solid ${C.hairline}`, color: C.ink, backgroundColor: C.surface }}
          />
          <MapPin size={20} color={C.muted} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1.5">
          {filtered.map((n) => (
            <motion.button key={n} whileTap={{ scale: 0.98 }} onClick={() => { haptic('select'); setSelected(n); }} className="p-3 rounded-2xl text-left font-['Nunito'] font-bold text-[15px] cursor-pointer w-full" style={{
              backgroundColor: selected === n ? C.jungleSoft : 'transparent',
              border: `2px solid ${selected === n ? C.jungle : 'transparent'}`,
              color: selected === n ? C.jungleDeep : C.ink,
            }}>{n}</motion.button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-7 pt-4 border-t max-w-[480px] mx-auto" style={{ backgroundColor: C.paper, borderTopColor: C.hairline }}>
        <button
          onClick={() => { haptic('medium'); handleContinue(); }}
          className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1"
          style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

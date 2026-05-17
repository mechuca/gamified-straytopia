'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Siren, AlertCircle } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { MascotView } from '@/mascot';
import { ScreenHeader, Card } from '@/components/ui';

const C: ThemeColors = COLOR;

interface SOSScreenProps {
  onBack: () => void;
}

export function SOSScreen({ onBack }: SOSScreenProps) {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alerted, setAlerted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPress = () => {
    haptic('heavy');
    setPressing(true);
    setProgress(0);
    const startTime = Date.now();
    animRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / 3000, 1);
      setProgress(p);
      if (p >= 1) {
        if (animRef.current) clearInterval(animRef.current);
        setAlerted(true);
        setPressing(false);
      }
    }, 16);
    timerRef.current = setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
      setAlerted(true);
      setPressing(false);
    }, 3000);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animRef.current) clearInterval(animRef.current);
    setPressing(false);
    setProgress(0);
  };

  if (alerted) {
    return (
      <div className="px-4 pb-[100px]">
        <ScreenHeader title="SOS Sent" onBack={onBack} />
        <div className="flex flex-col items-center gap-6 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.coralSoft }}
          >
            <Siren size={48} color={C.coralDeep} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="font-['Fredoka'] font-semibold text-2xl mb-2" style={{ color: C.ink }}>Authorities Alerted</div>
            <div className="font-['Nunito'] font-medium text-[15px] max-w-[280px] leading-relaxed" style={{ color: C.ink2 }}>Emergency services and nearby rescue coordinators have been notified. Help is on the way.</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="max-w-[300px] p-4 rounded-[24px] text-center" style={{ backgroundColor: C.coral }}>
              <div className="font-['Nunito'] font-semibold text-sm text-white leading-relaxed">Your location has been shared with the nearest animal rescue team. Stay safe and keep distance from the animal.</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-2.5 w-full max-w-[300px]"
          >
            <button onClick={() => { haptic('medium'); onBack(); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}>Back to Home</button>
            <button onClick={() => { haptic('light'); setAlerted(false); setProgress(0); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>Cancel SOS</button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="SOS Emergency" onBack={onBack} />
      <div className="flex flex-col items-center gap-8 py-8">
        <div className="text-center">
          <div className="font-['Fredoka'] font-semibold text-[22px] mb-2" style={{ color: C.coralDeep }}>Emergency Alert</div>
          <div className="font-['Nunito'] font-medium text-[15px] max-w-[280px] leading-relaxed" style={{ color: C.ink2 }}>Press and hold for 3 seconds to alert nearby authorities and rescue teams.</div>
        </div>

        <motion.button
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          className="w-40 h-40 rounded-full relative flex items-center justify-center border-none cursor-pointer"
          style={{
            backgroundColor: pressing ? C.coral : C.coralSoft,
            boxShadow: pressing ? `0 0 40px ${C.coral}60` : 'none',
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <svg width="160" height="160" className="absolute top-0 left-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="74" fill="none" stroke={C.hairline} strokeWidth="6" />
            <circle
              cx="80" cy="80" r="74" fill="none" stroke={C.coralDeep} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 74}`}
              strokeDashoffset={`${2 * Math.PI * 74 * (1 - progress)}`}
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          <Siren size={48} color={pressing ? '#fff' : C.coralDeep} />
          {pressing && (
            <div className="absolute bottom-7 font-['Fredoka'] font-semibold text-lg text-white">
              {Math.round(progress * 100)}%
            </div>
          )}
        </motion.button>

        <div className="max-w-[300px] p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.paper2 }}>
          <AlertCircle size={18} color={C.coral} />
          <div className="font-['Nunito'] font-semibold text-sm" style={{ color: C.ink2 }}>This will send your location to nearby police stations and animal rescue organizations.</div>
        </div>
      </div>
    </div>
  );
}

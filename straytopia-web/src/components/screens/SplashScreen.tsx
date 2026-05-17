'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { MascotView } from '@/mascot';

const C: ThemeColors = COLOR;

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center gap-6" style={{ backgroundColor: C.jungle }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <MascotView scene="onboarding_welcome" size="lg" showBubble={false} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="font-['Fredoka'] font-bold text-[44px] text-white tracking-tight leading-none">
          {'Straytopia'.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06, ease: 'easeOut' }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="font-['Nunito'] font-semibold text-base text-white/85 max-w-[260px] leading-relaxed"
      >
        Spot a stray. Do one small thing. Make their day better.
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.2 }}
        className="mt-2 flex items-center gap-1.5"
      >
        <PawPrint size={16} color="rgba(255,255,255,0.5)" />
        <span className="font-['Nunito'] font-bold text-xs text-white/50 uppercase tracking-widest">Care starts here</span>
      </motion.div>
    </div>
  );
}

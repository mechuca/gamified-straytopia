'use client';
import { motion } from 'framer-motion';
import { PawPrint, Droplets, AlertTriangle, Heart, Users, MapPin, Trophy } from 'lucide-react';
import { useApp } from '@/store/app';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';

const C: ThemeColors = COLOR;

interface FeatureItem {
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
}

interface Slide {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

export function OnboardingIntroScreen() {
  const { onboardingPhase, advanceOnboarding, skipOnboarding } = useApp();
  const heroIconSize = 32;

  const slides: Slide[] = [
    {
      icon: PawPrint,
      title: 'Your neighborhood needs you',
      subtitle: 'Food, water, and small acts of care, right where you live.',
      features: [
        { icon: PawPrint, label: 'Feed or refill water', desc: 'Two minute help near you', color: 'jungle' },
        { icon: AlertTriangle, label: 'Report when needed', desc: 'Get rescue help faster', color: 'coral' },
      ],
    },
    {
      icon: Users,
      title: 'You are not alone',
      subtitle: 'Join a community that shows up, every day.',
      features: [
        { icon: Heart, label: 'Verified impact', desc: 'Stories and follow ups', color: 'coral' },
        { icon: Trophy, label: 'Ranks and badges', desc: 'Progress you can see', color: 'sky' },
      ],
    },
  ];

  const slide = slides[onboardingPhase] || slides[0];
  const isLast = onboardingPhase === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="absolute top-4 right-4 z-10">
        <motion.button whileTap={{ scale: 0.95 }} onClick={skipOnboarding} className="px-3.5 py-2 rounded-xl border-none bg-[var(--paper2)] font-['Nunito'] font-bold text-[13px] text-[var(--ink2)] cursor-pointer" style={{ backgroundColor: C.paper2, color: C.ink2 }}>
          Skip
        </motion.button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-6 pb-4 text-center gap-4 overflow-y-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center" style={{ backgroundColor: C.jungleSoft }}>
            <Icon size={heroIconSize} color={C.jungle} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="font-['Fredoka'] font-semibold text-[26px] text-[var(--ink)] leading-tight" style={{ color: C.ink }}>{slide.title}</div>
          <div className="font-['Nunito'] font-medium text-[15px] mt-1.5" style={{ color: C.ink2 }}>{slide.subtitle}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="w-full flex flex-col gap-2.5 mt-1">
          {slide.features.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }} className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (C as any)[`${f.color}Soft`] || C.jungleSoft }}>
                <f.icon size={20} color={(C as any)[f.color] || C.jungle} />
              </div>
              <div className="text-left">
                <div className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>{f.label}</div>
                <div className="font-['Nunito'] font-medium text-xs" style={{ color: C.ink2 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="px-6 pb-7 pt-4 border-t" style={{ borderTopColor: C.hairline, backgroundColor: C.paper }}>
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div key={i} className="h-2 rounded-sm transition-all duration-300" style={{ width: i === onboardingPhase ? 24 : 8, backgroundColor: i === onboardingPhase ? C.jungle : C.paper2 }} />
          ))}
        </div>
        <button
          onClick={() => { haptic('medium'); advanceOnboarding(); }}
          className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1"
          style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
        >
          {isLast ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

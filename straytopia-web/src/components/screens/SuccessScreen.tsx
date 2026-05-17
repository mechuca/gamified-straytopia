'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { Mission, badges as mockBadges } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader, Card, Confetti } from '@/components/ui';

const C: ThemeColors = COLOR;

interface BadgeUnlockAnimationProps {
  badgeId: string;
  onComplete: () => void;
}

function BadgeUnlockAnimation({ badgeId, onComplete }: BadgeUnlockAnimationProps) {
  const badge = mockBadges.find((b) => b.id === badgeId);
  if (!badge) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.3, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        className="w-[200px] p-8 rounded-[32px] flex flex-col items-center gap-4"
        style={{
          backgroundColor: (C as any)[badge.tone],
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <badge.icon size={40} color="#fff" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-['Fredoka'] font-semibold text-[22px] text-white text-center"
        >
          Badge Unlocked!
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="font-['Nunito'] font-semibold text-base text-white/90 text-center"
        >
          {badge.title}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="font-['Nunito'] font-medium text-[13px] text-white/70 text-center max-w-[160px] leading-relaxed"
        >
          {badge.description}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="mt-2 px-8 py-3 rounded-2xl border-none font-['Fredoka'] font-semibold text-base cursor-pointer"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

interface SuccessScreenProps {
  mission: Mission;
  onHome: () => void;
  onViewImpact: () => void;
  newlyEarnedBadge: string | null;
}

export function SuccessScreen({ mission, onHome, onViewImpact, newlyEarnedBadge }: SuccessScreenProps) {
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(!!newlyEarnedBadge);
  const [badgeDismissed, setBadgeDismissed] = useState(false);

  return (
    <div className="px-4 pb-[100px] relative">
      <Confetti />
      <ScreenHeader title="Mission Complete!" onBack={onHome} />
      <MascotView scene="mission_success" size="lg" showBubble={false} />

      <div className="flex flex-col items-center gap-5 py-4">
        <div className="font-['Fredoka'] font-semibold text-[28px] text-center" style={{ color: C.ink }}>First care mission completed</div>
        <div className="font-['Nunito'] font-medium text-base text-center max-w-[280px] leading-relaxed" style={{ color: C.ink2 }}>You helped one animal today.</div>

        <div className="flex gap-3 w-full max-w-[300px]">
          <div className="flex-1 text-center p-4 rounded-[24px]" style={{ backgroundColor: C.gold }}>
            <div className="font-['Fredoka'] font-semibold text-2xl" style={{ color: C.goldInk }}>+{mission.rewardPoints}</div>
            <div className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.goldDeep }}>Care Points</div>
          </div>
          <div className="flex-1 text-center p-4 rounded-[24px]" style={{ backgroundColor: C.coral }}>
            <div className="font-['Fredoka'] font-semibold text-2xl text-white">+1</div>
            <div className="font-['Nunito'] font-semibold text-[13px] text-white/80">Kindness Heart</div>
          </div>
          <div className="flex-1 text-center p-4 rounded-[24px]" style={{ backgroundColor: C.jungle }}>
            <div className="font-['Fredoka'] font-semibold text-2xl text-white">+1</div>
            <div className="font-['Nunito'] font-semibold text-[13px] text-white/80">Day Streak</div>
          </div>
        </div>

        {!badgeDismissed && newlyEarnedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              className="w-full max-w-[300px] text-center p-5 rounded-[24px] cursor-pointer"
              style={{ backgroundColor: newlyEarnedBadge === 'b1' ? C.gold : C.sky }}
              onClick={() => { haptic('medium'); setShowBadgeAnimation(true); }}
            >
              <Award size={32} color={newlyEarnedBadge === 'b1' ? C.goldInk : C.sky} className="mb-2" />
              <div className="font-['Fredoka'] font-semibold text-lg mb-1" style={{ color: newlyEarnedBadge === 'b1' ? C.goldInk : C.sky }}>
                {newlyEarnedBadge === 'b1' ? 'First Feeder' : 'Water Bearer'}
              </div>
              <div className="font-['Nunito'] font-medium text-sm" style={{ color: newlyEarnedBadge === 'b1' ? C.goldDeep : C.skyDeep }}>Tap to view badge animation</div>
            </div>
          </motion.div>
        )}

        <div className="w-full max-w-[300px] text-center p-4 rounded-[24px]" style={{ backgroundColor: C.jungle }}>
          <div className="font-['Fredoka'] font-semibold text-base text-white mb-1">
            {mission.id === 'm1' ? 'Refill Water' : mission.id === 'm2' ? 'Report Animal' : 'Next Mission'} unlocked
          </div>
          <div className="font-['Nunito'] font-medium text-sm text-white/80">Your next care mission is now available.</div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
          <button
            onClick={() => { haptic('medium'); onHome(); }}
            className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1"
            style={{ backgroundColor: C.jungle, boxShadow: `0 4px 0 0 ${C.jungleDeep}` }}
          >
            Continue to Home
          </button>
          <button
            onClick={() => { haptic('light'); onViewImpact(); }}
            className="w-full py-4 rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] mb-1"
            style={{ border: `2.5px solid ${C.hairline2}`, color: C.ink2 }}
          >
            View Impact
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBadgeAnimation && newlyEarnedBadge && (
          <BadgeUnlockAnimation
            badgeId={newlyEarnedBadge}
            onComplete={() => { setShowBadgeAnimation(false); setBadgeDismissed(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

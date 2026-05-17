'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotScene, MascotMood, MascotTrigger } from './mascotTypes';
import { BuddyMascot } from './BuddyMascot';
import { getMascotMessage } from './mascotMessages';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface MascotViewProps {
  scene: MascotScene;
  mood?: MascotMood;
  message?: string;
  sub?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  showBubble?: boolean;
  prefersReducedMotion?: boolean;
}

export function MascotView({
  scene,
  mood,
  message,
  sub,
  actionLabel,
  onAction,
  size = 'md',
  compact = false,
  showBubble = true,
  prefersReducedMotion = false,
}: MascotViewProps) {
  const darkMode = useApp((s) => s.darkMode);
  const COLOR = getTheme(darkMode);
  const config = getMascotMessage(scene);
  const finalMood = mood || config.mood;
  const finalMessage = message || config.message;
  const finalSub = sub || config.sub;
  const finalAction = actionLabel || config.actionLabel;

  const mascotSize = size === 'lg' ? 140 : size === 'sm' ? 72 : 100;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: COLOR.mascotBubble, borderRadius: 20, border: `1px solid ${COLOR.borderStrong}`, boxShadow: `0 12px 26px ${COLOR.shadow}` }}>
        <BuddyMascot scene={scene} size={56} prefersReducedMotion={prefersReducedMotion} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: COLOR.mascotBubbleText, lineHeight: 1.3 }}>{finalMessage}</div>
          {finalSub && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 13, color: COLOR.textMuted, marginTop: 2 }}>{finalSub}</div>}
        </div>
        {finalAction && onAction && (
          <button onClick={onAction} style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 14, color: COLOR.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>{finalAction}</button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
      <BuddyMascot scene={scene} size={mascotSize} prefersReducedMotion={prefersReducedMotion} />
      <AnimatePresence>
        {showBubble && finalMessage && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: COLOR.mascotBubble,
              borderRadius: 16,
              padding: '10px 16px',
              maxWidth: 280,
              textAlign: 'center',
              boxShadow: `0 12px 24px ${COLOR.shadow}`,
              border: `1px solid ${COLOR.borderStrong}`,
            }}
          >
            <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: COLOR.mascotBubbleText, lineHeight: 1.3 }}>{finalMessage}</div>
            {finalSub && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 12, color: COLOR.textMuted, marginTop: 4 }}>{finalSub}</div>}
          </motion.div>
        )}
      </AnimatePresence>
      {finalAction && onAction && (
        <button
          onClick={onAction}
          style={{
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            color: COLOR.primary,
            background: COLOR.primarySoft,
            border: 'none',
            borderRadius: 12,
            padding: '8px 20px',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          {finalAction}
        </button>
      )}
    </div>
  );
}

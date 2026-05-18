'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface MascotBubbleProps {
  text: string;
  sub?: string;
  visible: boolean;
  prefersReducedMotion?: boolean;
}

export function MascotBubble({ text, sub, visible, prefersReducedMotion }: MascotBubbleProps) {
  const darkMode = useApp((state) => state.darkMode);
  const C = getTheme(darkMode);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 12,
            backgroundColor: C.mascotBubble,
            borderRadius: 16,
            padding: '10px 14px',
            minWidth: 180,
            maxWidth: 260,
            boxShadow: `0 12px 24px ${C.shadow}`,
            border: `1px solid ${C.borderStrong}`,
            zIndex: 10,
            textAlign: 'center',
          }}
        >
          {/* Bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${C.borderStrong}`,
          }} />
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: `7px solid ${C.mascotBubble}`,
          }} />
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: C.mascotBubbleText, lineHeight: 1.3 }}>{text}</div>
          {sub && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 12, color: C.textMuted, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

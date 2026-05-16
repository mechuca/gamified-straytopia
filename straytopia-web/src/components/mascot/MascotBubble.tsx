'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotBubbleProps {
  text: string;
  sub?: string;
  visible: boolean;
  prefersReducedMotion?: boolean;
}

export function MascotBubble({ text, sub, visible, prefersReducedMotion }: MascotBubbleProps) {
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
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: '10px 14px',
            minWidth: 180,
            maxWidth: 260,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
            border: '2px solid #E8E1CD',
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
            borderTop: '8px solid #E8E1CD',
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
            borderTop: '7px solid #fff',
          }} />
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: 15, color: '#1A1B1F', lineHeight: 1.3 }}>{text}</div>
          {sub && <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 500, fontSize: 12, color: '#7C7E8A', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

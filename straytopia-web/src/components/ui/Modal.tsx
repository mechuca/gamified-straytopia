'use client';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: C.overlay }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-[85%] max-w-[380px] max-h-[80vh] overflow-y-auto rounded-3xl p-6 ${className}`}
        style={{ backgroundColor: C.surfaceElevated, border: `1px solid ${C.borderStrong}`, boxShadow: `0 20px 36px ${C.shadow}` }}
      >
        {children}
      </motion.div>
    </div>
  );
}

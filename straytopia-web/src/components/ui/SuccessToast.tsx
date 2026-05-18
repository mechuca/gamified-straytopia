'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme, withOpacity } from '@/lib/theme';
import { useApp } from '@/store/app';
import { CheckCircle } from 'lucide-react';

interface SuccessToastProps {
  message: string;
  sub?: string;
  onClose: () => void;
  className?: string;
}

export function SuccessToast({ message, sub, onClose, className = '' }: SuccessToastProps) {
  const [progress, setProgress] = useState(100);
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  useEffect(() => {
    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / 3000) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 16);
    const t = setTimeout(onClose, 3000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-4 right-4 z-[400] max-w-[500px] mx-auto ${className}`}
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          backgroundColor: C.success,
          padding: '14px 20px',
          boxShadow: `0 14px 28px ${C.shadow}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle size={22} color="#fff" />
          <div className="flex-1">
            <div
              style={{
                fontFamily: 'Fredoka',
                fontWeight: 600,
                fontSize: 16,
                color: '#fff',
              }}
            >
              {message}
            </div>
            {sub && (
              <div
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 500,
                  fontSize: 13,
                  color: withOpacity('#FFFFFF', 0.85),
                }}
              >
                {sub}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: withOpacity('#FFFFFF', 0.2) }}>
          <div
            className="rounded-b-2xl"
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: withOpacity('#FFFFFF', 0.8),
              transition: 'width 0.016s linear',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

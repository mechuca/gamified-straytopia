'use client';
import { motion } from 'framer-motion';

interface ConfettiProps {
  disabled?: boolean;
  className?: string;
}

export function Confetti({ disabled = false, className = '' }: ConfettiProps) {
  if (disabled) return null;

  const colors = ['#2DC653', '#FFC83D', '#FF5A4A', '#1CB0F6', '#A560E8'];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 900, opacity: 0.6, rotate: 720 }}
          transition={{
            duration: 1.6,
            delay: (i % 10) * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute top-0"
          style={{
            left: `${(i * 137) % 100}%`,
            width: 10,
            height: 14,
            borderRadius: 2,
            backgroundColor: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

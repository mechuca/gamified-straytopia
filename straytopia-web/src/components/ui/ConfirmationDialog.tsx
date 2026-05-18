'use client';
import { motion } from 'framer-motion';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Button } from './Button';

type ConfirmVariant = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'ink' | 'paper';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: ConfirmVariant;
  className?: string;
}

export function ConfirmationDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmVariant = 'jungle',
  className = '',
}: ConfirmationDialogProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: C.overlay }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-[85%] max-w-[380px] rounded-3xl p-6 ${className}`}
        style={{ backgroundColor: C.surfaceElevated, border: `1px solid ${C.borderStrong}`, boxShadow: `0 20px 36px ${C.shadow}` }}
      >
        <div
          className="mb-3 text-center"
          style={{
            fontFamily: 'Fredoka',
            fontWeight: 600,
            fontSize: 22,
            color: C.textPrimary,
          }}
        >
          {title}
        </div>
        <div
          className="mb-6 text-center leading-relaxed"
          style={{
            fontFamily: 'Nunito',
            fontWeight: 500,
            fontSize: 15,
            color: C.textSecondary,
          }}
        >
          {body}
        </div>
        <div className="flex flex-col gap-2.5">
          <Button variant={confirmVariant} size="lg" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

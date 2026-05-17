'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction, className = '' }: EmptyStateProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <div className={`text-center py-10 px-6 ${className}`}>
      <div
        className="mx-auto mb-4 flex items-center justify-center rounded-3xl"
        style={{
          width: 80,
          height: 80,
          backgroundColor: C.jungleSoft,
        }}
      >
        <Icon size={36} color={C.jungle} />
      </div>
      <div
        className="mb-2"
        style={{
          fontFamily: 'Fredoka',
          fontWeight: 600,
          fontSize: 20,
          color: C.ink,
        }}
      >
        {title}
      </div>
      <div
        className="mx-auto mb-5 max-w-xs leading-relaxed"
        style={{
          fontFamily: 'Nunito',
          fontWeight: 500,
          fontSize: 15,
          color: C.ink2,
        }}
      >
        {subtitle}
      </div>
      {actionLabel && onAction && (
        <Button variant="jungle" size="md" onClick={onAction} className="max-w-xs mx-auto">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

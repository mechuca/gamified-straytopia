'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';
import { BackBtn } from './BackBtn';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({ title, onBack, right, className = '' }: ScreenHeaderProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <div className={`flex items-center min-h-11 mb-5 ${className}`}>
      {onBack && <BackBtn onClick={onBack} />}
      <div className="flex-1" />
      <span
        style={{
          fontFamily: 'Fredoka',
          fontWeight: 600,
          fontSize: 22,
          color: C.ink,
        }}
      >
        {title}
      </span>
      <div className="flex-1 flex justify-end">{right}</div>
    </div>
  );
}

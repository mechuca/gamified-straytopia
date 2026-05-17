'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface BadgeProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  tone: string;
  earned?: boolean;
  className?: string;
}

export function Badge({ icon: Icon, title, tone, earned = false, className = '' }: BadgeProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${className}`}
      style={{
        backgroundColor: earned ? `${C[tone as keyof typeof C]}22` : C.paper2,
        opacity: earned ? 1 : 0.4,
      }}
    >
      <Icon size={22} color={earned ? C[tone as keyof typeof C] : C.muted} />
      <div
        className="text-center"
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          color: C.ink,
        }}
      >
        {title}
      </div>
    </div>
  );
}

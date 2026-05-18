'use client';
import { getTheme, withOpacity } from '@/lib/theme';
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
  const toneColor = C[tone as keyof typeof C] as string;
  const iconBg = earned ? withOpacity(toneColor, darkMode ? 0.22 : 0.14) : withOpacity(C.locked, darkMode ? 0.14 : 0.1);

  return (
    <div
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${className}`}
      style={{
        backgroundColor: earned ? withOpacity(toneColor, 0.12) : C.lockedSoft,
        border: `1px solid ${earned ? withOpacity(toneColor, 0.2) : C.border}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 30% 25%, ${withOpacity('#FFFFFF', earned ? 0.22 : 0.12)} 0%, transparent 55%), ${iconBg}`,
          border: `1px solid ${withOpacity(earned ? toneColor : C.borderStrong, earned ? 0.22 : 0.65)}`,
          boxShadow: earned ? `0 10px 18px ${withOpacity(toneColor, 0.12)}` : 'none',
        }}
      >
        <Icon size={20} color={earned ? toneColor : C.locked} />
      </div>
      <div
        className="text-center"
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          color: earned ? C.textPrimary : C.textSecondary,
        }}
      >
        {title}
      </div>
    </div>
  );
}

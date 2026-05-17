'use client';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface SkeletonProps {
  width: string | number;
  height: string | number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width, height, borderRadius = 12, className = '' }: SkeletonProps) {
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: C.paper2,
      }}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${C.paper3 || C.hairline} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { getTheme } from '@/lib/theme';
import { useApp } from '@/store/app';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ text, children, className = '' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const { darkMode } = useApp();
  const C = getTheme(darkMode);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="absolute bottom-full left-1/2 z-[100] max-w-[200px] whitespace-nowrap px-3 py-2 rounded-xl"
          style={{
            transform: 'translateX(-50%)',
            marginBottom: 8,
            backgroundColor: C.ink,
            color: C.paper,
            fontFamily: 'Nunito',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {text}
          <div
            className="absolute top-full left-1/2"
            style={{
              transform: 'translateX(-50%)',
              border: '6px solid transparent',
              borderTopColor: C.ink,
            }}
          />
        </div>
      )}
    </div>
  );
}

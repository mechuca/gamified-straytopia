'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'paper';
type Size = 'sm' | 'md' | 'lg';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[14px] border text-sm font-extrabold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jungle)] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'h-9 px-3',
        size === 'md' && 'h-11 px-4',
        size === 'lg' && 'h-12 px-5',
        variant === 'primary' && 'bg-[var(--ink)] text-white border-transparent shadow-[var(--shadow-sm)] hover:bg-black',
        variant === 'paper' && 'bg-white/70 text-[var(--ink)] border-[var(--border)] shadow-[var(--shadow-sm)] hover:bg-white',
        variant === 'ghost' && 'bg-transparent text-[var(--ink2)] border-transparent hover:bg-white/60',
        variant === 'danger' && 'bg-[var(--coral)] text-white border-transparent shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
        className
      )}
      {...props}
    />
  );
}

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
        'inline-flex items-center justify-center gap-2 rounded-[14px] border text-sm font-extrabold tracking-wide uppercase transition',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'h-9 px-3',
        size === 'md' && 'h-11 px-4',
        size === 'lg' && 'h-12 px-5',
        variant === 'primary' && 'bg-[var(--jungle)] text-white border-transparent shadow-[0_4px_0_0_var(--jungle-deep)] active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--jungle-deep)]',
        variant === 'paper' && 'bg-[var(--surface)] text-[var(--ink)] border-[var(--hairline2)] shadow-[0_4px_0_0_var(--hairline2)] active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--hairline2)]',
        variant === 'ghost' && 'bg-transparent text-[var(--ink2)] border-[var(--hairline)] hover:bg-[color-mix(in_srgb,var(--paper3)_55%,transparent)]',
        variant === 'danger' && 'bg-[var(--coral)] text-white border-transparent shadow-[0_4px_0_0_var(--coral-deep)] active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--coral-deep)]',
        className
      )}
      {...props}
    />
  );
}

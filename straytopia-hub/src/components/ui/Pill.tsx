import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

type Tone = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper' | 'ink';
type Variant = 'solid' | 'soft';

const toneClasses: Record<Tone, { solid: string; soft: string }> = {
  jungle: { solid: 'bg-[var(--jungle)] text-white', soft: 'bg-[var(--jungle-soft)] text-[var(--jungle-deep)]' },
  coral: { solid: 'bg-[var(--coral)] text-white', soft: 'bg-[var(--coral-soft)] text-[var(--coral-deep)]' },
  gold: { solid: 'bg-[var(--gold)] text-[var(--ink)]', soft: 'bg-[var(--gold-soft)] text-[var(--gold-deep)]' },
  sky: { solid: 'bg-[var(--sky)] text-white', soft: 'bg-[var(--sky-soft)] text-[var(--ink)]' },
  plum: { solid: 'bg-[var(--plum)] text-white', soft: 'bg-[var(--plum-soft)] text-[var(--ink)]' },
  paper: { solid: 'bg-white text-[var(--ink2)] border border-[var(--border)]', soft: 'bg-white/70 text-[var(--ink2)] border border-[var(--border)]' },
  ink: { solid: 'bg-[var(--ink)] text-white', soft: 'bg-white/70 text-[var(--ink2)] border border-[var(--border)]' },
};

export function Pill({
  className,
  tone = 'paper',
  variant = 'soft',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; variant?: Variant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold',
        toneClasses[tone][variant],
        className
      )}
      {...props}
    />
  );
}

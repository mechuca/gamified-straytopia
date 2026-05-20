import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

type Tone = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper' | 'ink';
type Variant = 'solid' | 'soft';

const toneClasses: Record<Tone, { solid: string; soft: string }> = {
  jungle: { solid: 'bg-[var(--jungle)] text-white', soft: 'bg-[var(--jungle-soft)] text-[var(--jungle-deep)]' },
  coral: { solid: 'bg-[var(--coral)] text-white', soft: 'bg-[var(--coral-soft)] text-[var(--coral-deep)]' },
  gold: { solid: 'bg-[var(--gold)] text-[var(--ink)]', soft: 'bg-[var(--gold-soft)] text-[var(--gold-deep)]' },
  sky: { solid: 'bg-[var(--sky)] text-white', soft: 'bg-[var(--sky-soft)] text-[var(--sky)]' },
  plum: { solid: 'bg-[var(--plum)] text-white', soft: 'bg-[var(--plum-soft)] text-[var(--plum)]' },
  paper: { solid: 'bg-[var(--paper2)] text-[var(--ink2)]', soft: 'bg-[var(--paper3)] text-[var(--ink2)]' },
  ink: { solid: 'bg-[var(--ink)] text-white', soft: 'bg-[color-mix(in_srgb,var(--ink)_10%,transparent)] text-[var(--ink2)]' },
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
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black tracking-widest uppercase',
        toneClasses[tone][variant],
        className
      )}
      {...props}
    />
  );
}

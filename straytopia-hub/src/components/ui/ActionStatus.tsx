import { Card } from '@/components/ui/Card';
import type { ReactNode } from 'react';

export function ActionStatus({ type, children }: { type: 'error' | 'success'; children: ReactNode }) {
  const className = type === 'error'
    ? 'border-[color-mix(in_srgb,var(--coral)_28%,transparent)] bg-[var(--coral-soft)] text-[var(--coral-deep)]'
    : 'border-[color-mix(in_srgb,var(--jungle)_26%,transparent)] bg-[var(--jungle-soft)] text-[var(--jungle-deep)]';

  return <Card className={`p-4 text-sm font-bold ${className}`}>{children}</Card>;
}

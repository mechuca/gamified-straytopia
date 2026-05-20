import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-[24px] border-[2.5px] border-b-[4px] border-[var(--hairline)] bg-[var(--surface)]',
        className
      )}
      {...props}
    />
  );
}

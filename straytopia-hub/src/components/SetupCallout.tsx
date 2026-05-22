import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

export function SetupCallout({ title = 'Demo workspace' }: { title?: string }) {
  return (
    <Card className="border-[color-mix(in_srgb,var(--gold)_26%,transparent)] bg-[color-mix(in_srgb,var(--gold-soft)_42%,white)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="fredoka text-[18px] font-semibold">{title}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">
            Live data is not connected yet. This preview uses safe sample data.
          </div>
        </div>
        <Pill tone="gold" variant="soft">demo mode</Pill>
      </div>

      <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-white/62 px-3 py-2 text-xs font-semibold text-[var(--muted)]">
        Connect Vercel env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable realtime.
      </div>

      <div className="mt-2 text-xs font-semibold text-[var(--muted)]">
        See: <Link className="underline" href="https://supabase.com/docs/guides/getting-started" target="_blank">Supabase setup docs</Link>
      </div>
    </Card>
  );
}

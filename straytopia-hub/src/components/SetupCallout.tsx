import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

export function SetupCallout({ title = 'Supabase Not Configured' }: { title?: string }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="fredoka text-[18px] font-semibold">{title}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--muted)]">
            This preview is running in UI-only mode. Add Supabase env vars to enable realtime.
          </div>
        </div>
        <Pill tone="gold" variant="soft">demo mode</Pill>
      </div>

      <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-white/70 p-4 text-sm font-semibold text-[var(--ink2)]">
        Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel and locally.
        Then run the migrations in `supabase/migrations/`.
      </div>

      <div className="mt-4 text-xs font-semibold text-[var(--muted)]">
        See: <Link className="underline" href="https://supabase.com/docs/guides/getting-started" target="_blank">Supabase setup docs</Link>
      </div>
    </Card>
  );
}

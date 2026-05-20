'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { SetupCallout } from '@/components/SetupCallout';

export default function OverviewPage() {
  const supabase = getSupabase();
  const [counts, setCounts] = useState({
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    tasks: 0,
  });

  async function load() {
    if (!supabase) return;
    const [cases, tasks] = await Promise.all([
      supabase.from('cases').select('status', { count: 'exact', head: false }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
    ]);

    const statuses = (cases.data as any[] | null) ?? [];
    const byStatus: Record<string, number> = {};
    for (const row of statuses) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    setCounts({
      submitted: byStatus.submitted ?? 0,
      under_review: byStatus.under_review ?? 0,
      accepted: byStatus.accepted ?? 0,
      rejected: byStatus.rejected ?? 0,
      tasks: tasks.count ?? 0,
    });
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const kpis = useMemo(() => [
    { label: 'Submitted', value: counts.submitted, tone: 'paper' as const },
    { label: 'Under review', value: counts.under_review, tone: 'gold' as const },
    { label: 'Accepted', value: counts.accepted, tone: 'sky' as const },
    { label: 'Rejected', value: counts.rejected, tone: 'coral' as const },
    { label: 'Tasks', value: counts.tasks, tone: 'jungle' as const },
  ], [counts]);

  return (
    <div className="grid gap-6">
      {!supabase && <SetupCallout />}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Core Funnel</div>
            <div className="fredoka mt-2 text-[22px] font-semibold">Cases</div>
          </div>
          <Pill tone="paper" variant="soft">Realtime</Pill>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-[20px] border border-[var(--border)] bg-white/60 px-4 py-4 shadow-[var(--shadow-sm)]">
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">{k.label}</div>
              <div className="mono mt-3 text-[26px] font-bold text-[var(--ink)]">{k.value}</div>
              <div className="mt-3"><Pill tone={k.tone as any} variant="soft">live</Pill></div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Operations</div>
              <div className="fredoka mt-2 text-[22px] font-semibold">What changed</div>
              <div className="mt-1 text-sm font-semibold text-[var(--muted)]">A clean audit trail for every case and task decision.</div>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              { label: 'Time to first response', value: '27 min', tone: 'gold' },
              { label: 'Resolution rate', value: '—', tone: 'jungle' },
              { label: 'Backlog age (P95)', value: '—', tone: 'coral' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-white/60 px-4 py-3">
                <div className="text-sm font-semibold text-[var(--ink2)]">{row.label}</div>
                <div className="flex items-center gap-3">
                  <div className="mono text-sm font-bold">{row.value}</div>
                  <Pill tone={row.tone as any} variant="soft">kpi</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Guided</div>
          <div className="fredoka mt-2 text-[22px] font-semibold">Ask the hub</div>
          <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Draft prompts that translate ops data into funding narratives.</div>

          <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-white/70 p-4 shadow-[var(--shadow-sm)]">
            <div className="text-sm font-semibold text-[var(--ink2)]">What would you like to explore next?</div>
            <div className="mt-3 rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)]">
              I want to understand why urgent cases in Indiranagar are taking longer than today cases.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

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
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{k.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="mono text-[30px] font-bold text-[var(--ink)]">{k.value}</div>
              <Pill tone={k.tone as any} variant="soft">live</Pill>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="fredoka text-[18px] font-semibold">How to test realtime</div>
        <div className="mt-2 text-sm font-semibold text-[var(--ink2)]">
          Submit a report in the mobile app. It should appear instantly in Cases. Accept it, and a task will be auto-created.
        </div>
      </Card>
    </div>
  );
}

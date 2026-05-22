'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { CaseRow, TaskRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { demoCases, demoTasks } from '@/lib/demoData';

export default function MelPage() {
  const supabase = getSupabase();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  async function load() {
    if (!supabase) {
      setCases(demoCases);
      setTasks(demoTasks);
      return;
    }
    const [c, t] = await Promise.all([
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(500),
    ]);
    setCases(((c.data ?? []) as unknown) as CaseRow[]);
    setTasks(((t.data ?? []) as unknown) as TaskRow[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_mel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const derived = useMemo(() => {
    const totalCases = cases.length;
    const resolved = cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    const rejected = cases.filter((c) => c.status === 'rejected').length;
    const accepted = cases.filter((c) => c.status === 'task_created' || c.status === 'accepted' || c.status === 'assigned' || c.status === 'in_progress' || c.status === 'resolved' || c.status === 'closed').length;
    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'completed').length;
    const backlog = cases.filter((c) => !['resolved', 'closed', 'rejected'].includes(c.status)).length;
    const resolutionRate = totalCases === 0 ? 0 : Math.round((resolved / totalCases) * 100);
    const acceptRate = totalCases === 0 ? 0 : Math.round((accepted / totalCases) * 100);
    const rejectRate = totalCases === 0 ? 0 : Math.round((rejected / totalCases) * 100);
    return { totalCases, resolved, backlog, resolutionRate, acceptRate, rejectRate, tasksTotal, tasksCompleted };
  }, [cases, tasks]);

  const kpis = [
    { label: 'Total cases', value: derived.totalCases, tone: 'paper' as const },
    { label: 'Backlog', value: derived.backlog, tone: derived.backlog > 0 ? 'gold' as const : 'paper' as const },
    { label: 'Resolved', value: derived.resolved, tone: 'jungle' as const },
    { label: 'Resolution rate', value: `${derived.resolutionRate}%`, tone: 'jungle' as const },
    { label: 'Acceptance rate', value: `${derived.acceptRate}%`, tone: 'sky' as const },
    { label: 'Rejection rate', value: `${derived.rejectRate}%`, tone: 'coral' as const },
    { label: 'Tasks', value: derived.tasksTotal, tone: 'paper' as const },
    { label: 'Tasks completed', value: derived.tasksCompleted, tone: 'jungle' as const },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{k.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="mono text-[26px] font-bold text-[var(--ink)]">{k.value}</div>
              <Pill tone={k.tone} variant="soft">funding</Pill>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="fredoka text-[18px] font-semibold">Funding narrative</div>
        <div className="mt-2 text-sm font-semibold text-[var(--ink2)]">
          This dashboard is derived from the same case and task ledger used in operations.
          It is designed to support audits and donor reporting without manual reconciliation.
        </div>
      </Card>
    </div>
  );
}

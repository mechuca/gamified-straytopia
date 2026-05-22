'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { demoCases, demoProofs, demoTasks } from '@/lib/demoData';

export default function OverviewPage() {
  const supabase = getSupabase();
  const [counts, setCounts] = useState({
    submitted: 0,
    under_review: 0,
    accepted: 0,
    rejected: 0,
    tasks: 0,
    pendingProofs: 0,
  });

  async function load() {
    if (!supabase) {
      const byStatus: Record<string, number> = {};
      for (const row of demoCases) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      setCounts({
        submitted: byStatus.submitted ?? 0,
        under_review: byStatus.under_review ?? 0,
        accepted: byStatus.accepted ?? 0,
        rejected: byStatus.rejected ?? 0,
        tasks: demoTasks.length,
        pendingProofs: demoProofs.filter((p) => p.verification_status === 'pending').length,
      });
      return;
    }
    const [cases, tasks, proofs] = await Promise.all([
      supabase.from('cases').select('status', { count: 'exact', head: false }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('proofs').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    ]);

    const statuses = (((cases.data ?? []) as unknown) as Array<{ status: string }>);
    const byStatus: Record<string, number> = {};
    for (const row of statuses) byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    setCounts({
      submitted: byStatus.submitted ?? 0,
      under_review: byStatus.under_review ?? 0,
      accepted: byStatus.accepted ?? 0,
      rejected: byStatus.rejected ?? 0,
      tasks: tasks.count ?? 0,
      pendingProofs: proofs.count ?? 0,
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

  const openCases = counts.submitted + counts.under_review + counts.accepted;
  const kpis = useMemo(() => [
    { label: 'Open cases', value: openCases, tone: openCases > 0 ? 'gold' as const : 'paper' as const, icon: AlertTriangle, caption: 'needs movement' },
    { label: 'In review', value: counts.under_review, tone: 'sky' as const, icon: Clock3, caption: 'triage queue' },
    { label: 'Active tasks', value: counts.tasks, tone: 'jungle' as const, icon: CheckCircle2, caption: 'field work' },
    { label: 'Proofs', value: counts.pendingProofs, tone: 'plum' as const, icon: ShieldCheck, caption: 'pending review' },
  ], [counts.pendingProofs, counts.tasks, counts.under_review, openCases]);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-[var(--hairline)] p-6 lg:border-r lg:border-b-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Today</div>
                <div className="fredoka mt-2 max-w-xl text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
                  Keep urgent work moving before it becomes backlog.
                </div>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">
                  The hub now separates incoming triage, assigned field work, and evidence review so ops can act from the same surface.
                </p>
              </div>
              <Pill tone="jungle" variant="soft">Live</Pill>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {kpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-[20px] border border-[var(--border)] bg-white/62 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-[14px] bg-[var(--paper2)] text-[var(--ink2)]">
                        <Icon size={17} />
                      </div>
                      <Pill tone={k.tone} variant="soft">{k.caption}</Pill>
                    </div>
                    <div className="mono mt-5 text-[30px] font-bold tracking-tight text-[var(--ink)]">{k.value}</div>
                    <div className="mt-1 text-xs font-extrabold tracking-[0.16em] uppercase text-[var(--muted)]">{k.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Decision Queue</div>
                <div className="fredoka mt-2 text-[22px] font-semibold">Ops posture</div>
              </div>
              <ArrowUpRight size={18} className="text-[var(--muted)]" />
            </div>

            <div className="mt-5 grid gap-3">
              {[
                { label: 'Submitted reports', value: counts.submitted, tone: 'paper' as const },
                { label: 'Under review', value: counts.under_review, tone: 'gold' as const },
                { label: 'Rejected / non-actionable', value: counts.rejected, tone: 'coral' as const },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-white/60 px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--ink2)]">{row.label}</div>
                  <div className="flex items-center gap-3">
                    <div className="mono text-sm font-bold">{row.value}</div>
                    <Pill tone={row.tone} variant="soft">cases</Pill>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Workflow</div>
            <div className="fredoka mt-2 text-[22px] font-semibold">What changed</div>
            <div className="mt-1 text-sm font-semibold text-[var(--muted)]">A cleaner audit trail for case and task decisions.</div>
          </div>
          <Pill tone="paper" variant="soft">Realtime</Pill>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { label: 'First response target', value: '< 30m', tone: 'gold' as const },
            { label: 'Proof review SLA', value: '< 2h', tone: 'plum' as const },
            { label: 'Resolution signal', value: 'Case + proof', tone: 'jungle' as const },
          ].map((row) => (
            <div key={row.label} className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
              <div className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--muted)]">{row.label}</div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="mono text-[22px] font-bold text-[var(--ink)]">{row.value}</div>
                <Pill tone={row.tone} variant="soft">target</Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>

        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Guided</div>
          <div className="fredoka mt-2 text-[22px] font-semibold">Next best action</div>
          <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Use the queue with the highest risk first.</div>

          <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-white/70 p-4">
            <div className="text-sm font-semibold text-[var(--ink2)]">Suggested focus</div>
            <div className="mt-3 rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)]">
              Review urgent cases first, then clear pending proofs so completed field work can count toward impact metrics.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

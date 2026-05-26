'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Hospital,
  LifeBuoy,
  MapPinned,
  ShieldAlert,
  Stethoscope,
  Utensils,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { LineChart, BarChart, RadialProgress, HeatmapGrid } from '@/components/dashboard/Charts';
import { getSupabase } from '@/lib/supabase/client';
import { buildOpsAnalytics, type OpsDataset } from '@/lib/opsAnalytics';
import type { Block, CaseRow, ProofRow, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { demoBlocks, demoCases, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

const emptyDataset: OpsDataset = {
  cases: [],
  tasks: [],
  proofs: [],
  blocks: [],
  shelters: [],
  templates: [],
};

function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper';
  href?: string;
}) {
  const body = (
    <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[var(--paper2)] text-[var(--ink2)] ring-1 ring-[var(--hairline)]">
          <Icon size={19} />
        </div>
        <Pill tone={tone} variant="soft">rows</Pill>
      </div>
      <div className="mono mt-5 text-[34px] font-black tracking-tight text-[var(--ink)]">{value}</div>
      <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">{label}</div>
      <div className="mt-3 text-sm font-semibold leading-5 text-[var(--ink2)]">{caption}</div>
    </Card>
  );

  if (!href) return body;
  return <Link href={href}>{body}</Link>;
}

function StatusRow({ label, value, tone }: { label: string; value: string | number; tone: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper' }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div className="text-sm font-black text-[var(--ink2)]">{label}</div>
      <div className="flex items-center gap-3">
        <div className="mono text-sm font-black text-[var(--ink)]">{value}</div>
        <Pill tone={tone} variant="soft">now</Pill>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const supabase = getSupabase();
  const [dataset, setDataset] = useState<OpsDataset>(emptyDataset);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        if (!mounted) return;
        setDataset({ cases: demoCases, tasks: demoTasks, proofs: demoProofs, blocks: demoBlocks, shelters: demoShelters, templates: demoTaskTemplates });
        setLoading(false);
        setLastUpdated(new Date());
        return;
      }

      const [cases, tasks, proofs, blocks, shelters, templates] = await Promise.all([
        supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(500),
        supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
        supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
        supabase.from('task_templates').select('*').order('type', { ascending: true }),
      ]);

      if (!mounted) return;
      setDataset({
        cases: ((cases.data ?? []) as unknown) as CaseRow[],
        tasks: ((tasks.data ?? []) as unknown) as TaskRow[],
        proofs: ((proofs.data ?? []) as unknown) as ProofRow[],
        blocks: ((blocks.data ?? []) as unknown) as Block[],
        shelters: ((shelters.data ?? []) as unknown) as Shelter[],
        templates: ((templates.data ?? []) as unknown) as TaskTemplateRow[],
      });
      setLoading(false);
      setLastUpdated(new Date());
    }

    load();
    if (!supabase) return () => { mounted = false; };

    const channel = supabase
      .channel('hub_overview_intelligence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const analytics = useMemo(() => buildOpsAnalytics(dataset), [dataset]);
  const healthScore = Math.max(0, Math.min(100, Math.round(92 - analytics.emergencyCases * 9 - analytics.pendingEscalations * 6 - analytics.failedMissions * 4 + analytics.missionCompletionRate * 0.18)));
  const healthTone = healthScore >= 80 ? 'jungle' : healthScore >= 62 ? 'gold' : 'coral';

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--paper2)]" />)}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="border-b border-[var(--hairline)] p-6 md:p-7 lg:border-r lg:border-b-0">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={healthTone} variant="soft">Operational posture {healthScore}%</Pill>
                  <Pill tone="paper" variant="soft">Updated {lastUpdated?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Pill>
                </div>
                <h2 className="fredoka mt-4 max-w-3xl text-[34px] font-semibold leading-tight tracking-tight md:text-[48px]">
                  City welfare operations, compressed into one calm decision surface.
                </h2>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)] md:text-base">
                  Emergencies stay visible, field work stays accountable, and every chart points to the next operational action.
                </p>
              </div>
              <Link href="/action-queue" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                Open queue
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              <StatusRow label="Pending escalations" value={analytics.pendingEscalations} tone={analytics.pendingEscalations > 0 ? 'coral' : 'jungle'} />
              <StatusRow label="Avg open age" value={`${analytics.responseMinutes}m`} tone={analytics.responseMinutes > 90 ? 'coral' : 'gold'} />
              <StatusRow label="Active alerts" value={analytics.notifications.length} tone="sky" />
            </div>
          </div>

          <div className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Rule-Based Recommendations</div>
                <div className="fredoka mt-2 text-2xl font-semibold">Next best moves</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[var(--plum-soft)] text-[var(--ink)] ring-1 ring-[color-mix(in_srgb,var(--plum)_20%,transparent)]">
                <BrainCircuit size={20} />
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={recommendation} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Action rule {index + 1}</div>
                  <div className="mt-2 text-sm font-bold leading-6 text-[var(--ink2)]">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard href="/cases" label="Active rescue cases" value={analytics.activeRescueCases} caption="Rescue, abandoned, or aggression cases that still need movement." icon={ShieldAlert} tone={analytics.activeRescueCases > 0 ? 'gold' : 'jungle'} />
        <MetricCard href="/cases" label="Emergency cases" value={analytics.emergencyCases} caption="Urgent open cases that should stay above normal operations." icon={LifeBuoy} tone={analytics.emergencyCases > 0 ? 'coral' : 'jungle'} />
        <MetricCard href="/tasks" label="Open feeding missions" value={analytics.openFeedingMissions} caption="Feeding routes and proof-pending community work from task rows." icon={Utensils} tone="sky" />
        <MetricCard href="/citizens" label="Citizen field tasks" value={analytics.activeCitizenTasks} caption="Active work assigned to citizen devices through the task ledger." icon={Users} tone={analytics.activeCitizenTasks > 0 ? 'sky' : 'paper'} />
        <MetricCard href="/shelters" label="Shelter readiness" value={`${analytics.shelterReadiness}%`} caption="Readiness derived only from current partner status values." icon={Hospital} tone={analytics.shelterReadiness < 60 ? 'coral' : 'gold'} />
        <MetricCard href="/tasks" label="Medical cases" value={analytics.medicalCases} caption="Open injured or sick reports requiring medical coordination." icon={Stethoscope} tone={analytics.medicalCases > 0 ? 'coral' : 'jungle'} />
        <MetricCard label="Adoption reports" value={analytics.adoptionReports} caption="Open adoption-category reports. A true adoption pipeline is not implemented yet." icon={HeartHandshake} tone="plum" />
        <MetricCard href="/mel" label="Today's resolved impact" value={analytics.todaysResolvedImpact} caption="Tasks completed and cases resolved today by updated timestamp." icon={CheckCircle2} tone="jungle" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Weekly Rescue Trends</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Where emergency load is moving</div>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Rising trend means dispatch should pre-position volunteers and partner shelters.</p>
            </div>
            <Pill tone="coral" variant="soft">Rescue</Pill>
          </div>
          <div className="mt-5">
            <LineChart points={analytics.rescueTrend} label="Seven day rescue and emergency volume trend" tone="coral" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Mission Completion Rate</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Are missions closing cleanly?</div>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Low completion means proof review, volunteer reliability, or shelter handoff is failing.</p>
            </div>
            <Pill tone="jungle" variant="soft">{analytics.missionCompletionRate}%</Pill>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[0.9fr_1.1fr] xl:grid-cols-1 2xl:grid-cols-[0.9fr_1.1fr]">
            <RadialProgress value={analytics.missionCompletionRate} label="Mission completion" tone={analytics.missionCompletionRate >= 70 ? 'jungle' : 'gold'} />
            <BarChart points={analytics.completionTrend} label="Seven day mission completion rate" tone="jungle" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">City Heatmaps</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Animal density and risk zones</div>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Higher risk zones need faster dispatch, feeding coverage, or shelter routing.</p>
            </div>
            <MapPinned size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5">
            <HeatmapGrid values={analytics.densityZones.map((zone) => ({ label: zone.name, value: zone.risk }))} label="Block risk heatmap" />
          </div>
          <div className="mt-5 grid gap-3">
            {analytics.densityZones.slice(0, 3).map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div>
                  <div className="text-sm font-black text-[var(--ink)]">{zone.name}</div>
                  <div className="mono mt-0.5 text-xs font-bold text-[var(--muted)]">{zone.code}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone={zone.emergency > 0 ? 'coral' : 'paper'} variant="soft">{zone.emergency} emergency</Pill>
                  <Pill tone="gold" variant="soft">{zone.open} open</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Operational Alerts</div>
              <div className="fredoka mt-2 text-2xl font-semibold">What needs attention now</div>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Derived from urgent cases, blocked tasks, and pending proof rows. Push notifications are not wired yet.</p>
            </div>
            <Bell size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5 grid gap-3">
            {analytics.notifications.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: `var(--${item.tone})`, boxShadow: `0 0 0 4px color-mix(in srgb, var(--${item.tone}) 16%, transparent)` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="truncate text-sm font-black text-[var(--ink)]">{item.title}</div>
                    <div className="mono shrink-0 text-[11px] font-bold text-[var(--muted)]">{item.time}</div>
                  </div>
                  <div className="mt-1 text-sm font-semibold leading-5 text-[var(--muted)]">{item.detail}</div>
                </div>
              </div>
            ))}
            {analytics.notifications.length === 0 && (
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm font-semibold text-[var(--muted)]">No urgent notifications. Keep monitoring active routes.</div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard href="/partners" label="Active partners" value={analytics.activeNgos} caption="Shelter/partner rows currently marked active or limited. Capacity intelligence lives in Partners." icon={Hospital} tone="jungle" />
        <MetricCard href="/blocks" label="Block activity signals" value={analytics.openCases + analytics.openFeedingMissions} caption="Open cases and feeding tasks contributing to block-level map intelligence." icon={MapPinned} tone="sky" />
        <MetricCard href="/action-queue" label="Failed missions" value={analytics.failedMissions} caption="Blocked, cancelled, or rejected proof paths needing QA review." icon={AlertTriangle} tone={analytics.failedMissions > 0 ? 'coral' : 'jungle'} />
        <MetricCard href="/proofs" label="Pending evidence" value={analytics.pendingProofs} caption="Proofs waiting for review before impact is credited." icon={Clock3} tone={analytics.pendingProofs > 0 ? 'plum' : 'jungle'} />
      </div>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPinned, Navigation, RadioTower } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, ProofRow, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { HeatmapGrid } from '@/components/dashboard/Charts';
import { buildOpsAnalytics, type OpsDataset } from '@/lib/opsAnalytics';
import { demoBlocks, demoCases, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

const emptyDataset: OpsDataset = { cases: [], tasks: [], proofs: [], blocks: [], shelters: [], templates: [] };

export default function BlocksPage() {
  const supabase = getSupabase();
  const [dataset, setDataset] = useState<OpsDataset>(emptyDataset);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        if (!mounted) return;
        setDataset({ cases: demoCases, tasks: demoTasks, proofs: demoProofs, blocks: demoBlocks, shelters: demoShelters, templates: demoTaskTemplates });
        return;
      }

      const [blocks, cases, tasks, proofs, shelters, templates] = await Promise.all([
        supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(300),
        supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
        supabase.from('task_templates').select('*').order('type', { ascending: true }),
      ]);

      if (!mounted) return;
      setDataset({
        blocks: ((blocks.data ?? []) as unknown) as Block[],
        cases: ((cases.data ?? []) as unknown) as CaseRow[],
        tasks: ((tasks.data ?? []) as unknown) as TaskRow[],
        proofs: ((proofs.data ?? []) as unknown) as ProofRow[],
        shelters: ((shelters.data ?? []) as unknown) as Shelter[],
        templates: ((templates.data ?? []) as unknown) as TaskTemplateRow[],
      });
    }

    load();
    if (!supabase) return () => { mounted = false; };
    const channel = supabase
      .channel('hub_map_intelligence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const analytics = useMemo(() => buildOpsAnalytics(dataset), [dataset]);
  const strongestZone = analytics.densityZones[0];

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[var(--hairline)] p-6 md:p-7 lg:border-r lg:border-b-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Map Intelligence</div>
                <h2 className="fredoka mt-2 text-[34px] font-semibold leading-tight md:text-[44px]">Block risk, without needing a heavy map first.</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">This view keeps the list fallback operational while the GIS layer is wired to migration 004 location metadata.</p>
              </div>
              <MapPinned size={22} className="text-[var(--muted)]" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mono text-3xl font-black text-[var(--ink)]">{analytics.openCases}</div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Open pins</div>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mono text-3xl font-black text-[var(--ink)]">{analytics.emergencyCases}</div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Emergency hotspots</div>
              </div>
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mono text-3xl font-black text-[var(--ink)]">{analytics.feedingMissionsToday}</div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Feeding clusters</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Live Map Activity</div>
                <div className="fredoka mt-2 text-2xl font-semibold">Dispatcher focus</div>
              </div>
              <Pill tone={strongestZone?.risk > 65 ? 'coral' : 'gold'} variant="soft">{strongestZone?.name ?? 'No zone'}</Pill>
            </div>
            <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(45,198,83,0.10),rgba(28,176,246,0.10),rgba(255,200,61,0.10))] p-5">
              <div className="grid min-h-[240px] grid-cols-2 gap-3 sm:grid-cols-4">
                {analytics.densityZones.map((zone) => (
                  <div key={zone.id} className="relative overflow-hidden rounded-[22px] border border-white/40 bg-white/54 p-4 backdrop-blur-xl dark:bg-white/10">
                    <div className="absolute right-3 top-3 h-12 w-12 rounded-full opacity-50 blur-xl" style={{ background: zone.risk > 65 ? 'var(--coral)' : zone.risk > 30 ? 'var(--gold)' : 'var(--jungle)' }} />
                    <div className="relative text-sm font-black text-[var(--ink)]">{zone.name}</div>
                    <div className="relative mono mt-2 text-3xl font-black text-[var(--ink)]">{zone.risk}</div>
                    <div className="relative mt-3 grid gap-1 text-xs font-bold text-[var(--muted)]">
                      <span>{zone.open} open</span>
                      <span>{zone.missions} missions</span>
                      <span>{zone.emergency} emergency</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Animal Density Zones</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Heatmap risk score</div>
            </div>
            <RadioTower size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5">
            <HeatmapGrid values={analytics.densityZones.map((zone) => ({ label: zone.name, value: zone.risk }))} label="Animal density heatmap by block" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Operational Layers</div>
              <div className="fredoka mt-2 text-2xl font-semibold">What the map should drive</div>
            </div>
            <Navigation size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
            <div className="grid grid-cols-[1fr_92px_92px_92px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              <div>Block</div>
              <div>Open</div>
              <div>Mission</div>
              <div>Action</div>
            </div>
            <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
              {analytics.densityZones.map((zone) => (
                <div key={zone.id} className="grid grid-cols-[1fr_92px_92px_92px] items-center gap-3 px-4 py-3">
                  <div>
                    <div className="text-sm font-black text-[var(--ink)]">{zone.name}</div>
                    <div className="mono mt-0.5 text-[12px] font-bold text-[var(--muted)]">{zone.code}</div>
                  </div>
                  <Pill tone={zone.open > 0 ? 'gold' : 'paper'} variant="soft">{zone.open}</Pill>
                  <Pill tone={zone.missions > 0 ? 'sky' : 'paper'} variant="soft">{zone.missions}</Pill>
                  <Pill tone={zone.risk > 65 ? 'coral' : zone.risk > 30 ? 'gold' : 'jungle'} variant="soft">{zone.risk > 65 ? 'Escalate' : zone.risk > 30 ? 'Watch' : 'Stable'}</Pill>
                </div>
              ))}
              {analytics.densityZones.length === 0 && (
                <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No block data configured.</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--gold-soft)] text-[var(--gold-deep)]">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-sm font-black text-[var(--ink)]">GIS readiness note</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">Migration 004 adds nullable lat/lng, accuracy, and privacy fields. The next production step is capturing those fields from reports, proofs, shelters, and task assignments, then replacing this block-level intelligence with true pins, routes, and overlays.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Droplets, Filter, Hospital, Layers3, LifeBuoy, MapPinned, Navigation, Stethoscope, Users, Utensils } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, CitizenRow, ProofRow, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { buildOpsAnalytics, type OpsDataset } from '@/lib/opsAnalytics';
import { demoBlocks, demoCases, demoCitizens, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

type Layer = 'feeding' | 'water' | 'rescue' | 'medical' | 'shelters' | 'volunteers';
type MapTone = 'jungle' | 'sky' | 'coral' | 'gold' | 'plum' | 'paper';
type MapPin = {
  id: string;
  layer: Layer;
  title: string;
  subtitle: string;
  status: string;
  href?: string;
  blockId: string | null;
  blockName: string;
  tone: MapTone;
  x: number;
  y: number;
  priority: number;
};

const emptyDataset: OpsDataset = { cases: [], tasks: [], proofs: [], blocks: [], shelters: [], templates: [] };

const layerMeta: Record<Layer, { label: string; description: string; tone: MapTone; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  feeding: { label: 'Feeding', description: 'Feeding cases and food-route field work', tone: 'jungle', icon: Utensils },
  water: { label: 'Water', description: 'Water reports, bowls, and refill missions', tone: 'sky', icon: Droplets },
  rescue: { label: 'Rescue', description: 'Urgent rescue, abandoned, and aggression signals', tone: 'coral', icon: LifeBuoy },
  medical: { label: 'Medical', description: 'Injured and sick animal care', tone: 'gold', icon: Stethoscope },
  shelters: { label: 'Shelters', description: 'Partner intake and capacity anchors', tone: 'plum', icon: Hospital },
  volunteers: { label: 'Volunteers', description: 'Citizen devices available as local responders', tone: 'paper', icon: Users },
};

const fallbackBlockPositions: Record<string, { x: number; y: number }> = {
  indiranagar: { x: 58, y: 42 },
  koramangala: { x: 42, y: 63 },
  jayanagar: { x: 30, y: 76 },
  whitefield: { x: 78, y: 34 },
  default: { x: 50, y: 50 },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stableOffset(seed: string, axis: 'x' | 'y') {
  const total = [...`${seed}:${axis}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (total % 17) - 8;
}

function blockPosition(block?: Block | null) {
  if (!block) return fallbackBlockPositions.default;
  const key = block.name.toLowerCase().replace(/[^a-z]/g, '');
  return fallbackBlockPositions[key] ?? fallbackBlockPositions.default;
}

function coordinatePosition(row: { latitude?: number | null; longitude?: number | null }, fallback: { x: number; y: number }, seed: string) {
  if (typeof row.latitude === 'number' && typeof row.longitude === 'number') {
    const x = ((row.longitude - 77.48) / (77.78 - 77.48)) * 100;
    const y = ((13.05 - row.latitude) / (13.05 - 12.86)) * 100;
    return { x: clamp(x, 6, 94), y: clamp(y, 6, 94) };
  }
  return {
    x: clamp(fallback.x + stableOffset(seed, 'x'), 8, 92),
    y: clamp(fallback.y + stableOffset(seed, 'y'), 8, 92),
  };
}

function isOpenCase(row: CaseRow) {
  return !['rejected', 'resolved', 'closed'].includes(row.status);
}

function templateType(task: TaskRow, templatesById: Map<string, TaskTemplateRow>) {
  return task.template_id ? templatesById.get(task.template_id)?.type ?? null : null;
}

function layerForCase(row: CaseRow): Layer | null {
  if (row.category === 'feeding') return 'feeding';
  if (row.category === 'water') return 'water';
  if (row.category === 'injured' || row.category === 'sick') return 'medical';
  if (['rescue', 'aggressive', 'abandoned'].includes(row.category)) return 'rescue';
  return null;
}

function layerForTask(row: TaskRow, templatesById: Map<string, TaskTemplateRow>): Layer | null {
  const type = templateType(row, templatesById);
  if (type === 'feed') return 'feeding';
  if (type === 'water_refill') return 'water';
  if (type === 'medical_check') return 'medical';
  if (type === 'rescue_assessment' || type === 'emergency_escalation') return 'rescue';
  return null;
}

function toneForLayer(layer: Layer): MapTone {
  return layerMeta[layer].tone;
}

function toneClass(tone: MapTone) {
  const classes: Record<MapTone, string> = {
    jungle: 'bg-[var(--jungle)] text-white shadow-[0_0_0_8px_color-mix(in_srgb,var(--jungle)_16%,transparent)]',
    sky: 'bg-[var(--sky)] text-white shadow-[0_0_0_8px_color-mix(in_srgb,var(--sky)_16%,transparent)]',
    coral: 'bg-[var(--coral)] text-white shadow-[0_0_0_8px_color-mix(in_srgb,var(--coral)_16%,transparent)]',
    gold: 'bg-[var(--gold)] text-[var(--ink)] shadow-[0_0_0_8px_color-mix(in_srgb,var(--gold)_18%,transparent)]',
    plum: 'bg-[var(--plum)] text-white shadow-[0_0_0_8px_color-mix(in_srgb,var(--plum)_16%,transparent)]',
    paper: 'bg-white text-[var(--ink)] shadow-[0_0_0_8px_rgba(255,255,255,0.55)]',
  };
  return classes[tone];
}

function pillTone(tone: MapTone) {
  return tone === 'paper' ? 'paper' : tone;
}

export default function BlocksPage() {
  const supabase = getSupabase();
  const [dataset, setDataset] = useState<OpsDataset>(emptyDataset);
  const [citizens, setCitizens] = useState<CitizenRow[]>([]);
  const [activeLayers, setActiveLayers] = useState<Layer[]>(['feeding', 'water', 'rescue', 'medical', 'shelters', 'volunteers']);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        if (!mounted) return;
        setDataset({ cases: demoCases, tasks: demoTasks, proofs: demoProofs, blocks: demoBlocks, shelters: demoShelters, templates: demoTaskTemplates });
        setCitizens(demoCitizens);
        return;
      }

      const [blocks, cases, tasks, proofs, shelters, templates, citizenRows] = await Promise.all([
        supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(300),
        supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
        supabase.from('task_templates').select('*').order('type', { ascending: true }),
        supabase.from('citizens').select('id,device_id,block_id,created_at,user_id').order('created_at', { ascending: false }).limit(300),
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
      setCitizens(((citizenRows.data ?? []) as unknown) as CitizenRow[]);
    }

    load();
    if (!supabase) return () => { mounted = false; };
    const channel = supabase
      .channel('hub_map_intelligence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const analytics = useMemo(() => buildOpsAnalytics(dataset), [dataset]);
  const mapState = useMemo(() => {
    const blockById = new Map(dataset.blocks.map((block) => [block.id, block]));
    const caseById = new Map(dataset.cases.map((row) => [row.id, row]));
    const templatesById = new Map(dataset.templates.map((template) => [template.id, template]));
    const pins: MapPin[] = [];

    for (const row of dataset.cases.filter(isOpenCase)) {
      const layer = layerForCase(row);
      if (!layer) continue;
      const block = row.block_id ? blockById.get(row.block_id) : null;
      const position = coordinatePosition(row, blockPosition(block), row.id);
      pins.push({
        id: `case:${row.id}`,
        layer,
        title: row.external_id,
        subtitle: row.location_text || row.description || 'Case location pending',
        status: `${row.severity} · ${row.status.replace('_', ' ')}`,
        href: `/action-queue?case=${row.id}`,
        blockId: row.block_id,
        blockName: block?.name ?? 'Unmapped block',
        tone: row.severity === 'urgent' ? 'coral' : toneForLayer(layer),
        x: position.x,
        y: position.y,
        priority: row.severity === 'urgent' ? 3 : 2,
      });
    }

    for (const row of dataset.tasks.filter((task) => !['completed', 'cancelled'].includes(task.status))) {
      const layer = layerForTask(row, templatesById);
      if (!layer) continue;
      const linkedCase = row.case_id ? caseById.get(row.case_id) : null;
      const block = row.block_id ? blockById.get(row.block_id) : linkedCase?.block_id ? blockById.get(linkedCase.block_id) : null;
      const position = coordinatePosition(row.latitude || row.longitude ? row : linkedCase ?? {}, blockPosition(block), row.id);
      pins.push({
        id: `task:${row.id}`,
        layer,
        title: templatesById.get(row.template_id ?? '')?.title ?? `${layerMeta[layer].label} task`,
        subtitle: linkedCase?.location_text || row.assigned_to_id || 'Field task location pending',
        status: `${row.priority} · ${row.status.replace('_', ' ')}`,
        href: `/action-queue?task=${row.id}`,
        blockId: row.block_id ?? linkedCase?.block_id ?? null,
        blockName: block?.name ?? 'Unmapped block',
        tone: row.priority === 'critical' || row.priority === 'high' ? 'coral' : toneForLayer(layer),
        x: position.x,
        y: position.y,
        priority: row.priority === 'critical' ? 4 : row.priority === 'high' ? 3 : 1,
      });
    }

    for (const shelter of dataset.shelters) {
      const block = shelter.block_id ? blockById.get(shelter.block_id) : null;
      const base = blockPosition(block);
      pins.push({
        id: `shelter:${shelter.id}`,
        layer: 'shelters',
        title: shelter.name,
        subtitle: block?.name ?? 'Shelter block not mapped',
        status: shelter.status,
        href: '/shelters',
        blockId: shelter.block_id,
        blockName: block?.name ?? 'Unmapped block',
        tone: shelter.status === 'limited' ? 'gold' : shelter.status === 'inactive' ? 'paper' : 'plum',
        x: clamp(base.x + 8, 8, 92),
        y: clamp(base.y - 8, 8, 92),
        priority: shelter.status === 'limited' ? 2 : 0,
      });
    }

    for (const citizen of citizens) {
      const block = citizen.block_id ? blockById.get(citizen.block_id) : null;
      const base = blockPosition(block);
      pins.push({
        id: `volunteer:${citizen.id}`,
        layer: 'volunteers',
        title: citizen.device_id,
        subtitle: block?.name ?? 'Volunteer block not mapped',
        status: 'field device',
        href: '/volunteers',
        blockId: citizen.block_id,
        blockName: block?.name ?? 'Unmapped block',
        tone: 'paper',
        x: clamp(base.x + stableOffset(citizen.id, 'x'), 8, 92),
        y: clamp(base.y + stableOffset(citizen.id, 'y'), 8, 92),
        priority: 0,
      });
    }

    return { pins: pins.sort((a, b) => a.priority - b.priority), blockById };
  }, [citizens, dataset]);

  const visiblePins = mapState.pins.filter((pin) => activeLayers.includes(pin.layer));
  const selectedPin = visiblePins.find((pin) => pin.id === selectedPinId) ?? visiblePins.sort((a, b) => b.priority - a.priority)[0] ?? null;
  const layerCounts = Object.fromEntries((Object.keys(layerMeta) as Layer[]).map((layer) => [layer, mapState.pins.filter((pin) => pin.layer === layer).length])) as Record<Layer, number>;
  const strongestZone = analytics.densityZones[0];

  function toggleLayer(layer: Layer) {
    setActiveLayers((current) => current.includes(layer) ? current.filter((item) => item !== layer) : [...current, layer]);
  }

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <div className="grid xl:grid-cols-[1.12fr_0.88fr]">
          <div className="border-b border-[var(--hairline)] p-5 md:p-7 xl:border-r xl:border-b-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="jungle" variant="soft">Hyperlocal ops map</Pill>
                  <Pill tone={strongestZone?.risk > 65 ? 'coral' : 'gold'} variant="soft">Focus: {strongestZone?.name ?? 'No zone'}</Pill>
                </div>
                <h2 className="fredoka mt-4 max-w-3xl text-[34px] font-semibold leading-tight md:text-[48px]">See feeding, water, and rescue load as one operating surface.</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)] md:text-base">The map reduces queue scanning by grouping live cases, field tasks, shelters, and volunteer devices by exact coordinates when available, otherwise by safe block-level fallbacks.</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-[var(--jungle-soft)] text-[var(--jungle-deep)] ring-1 ring-[color-mix(in_srgb,var(--jungle)_18%,transparent)]">
                <MapPinned size={22} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {([
                { label: 'Map signals', value: visiblePins.length, tone: 'ink' as const },
                { label: 'Urgent rescue', value: analytics.emergencyCases, tone: analytics.emergencyCases > 0 ? 'coral' as const : 'jungle' as const },
                { label: 'Open field work', value: analytics.openFeedingMissions + analytics.medicalCases + analytics.activeCitizenTasks, tone: 'sky' as const },
              ]).map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="mono text-3xl font-black text-[var(--ink)]">{stat.value}</div>
                  <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Layer Control</div>
                <div className="fredoka mt-2 text-2xl font-semibold">Choose what deserves attention</div>
              </div>
              <Filter size={20} className="text-[var(--muted)]" />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(Object.keys(layerMeta) as Layer[]).map((layer) => {
                const Icon = layerMeta[layer].icon;
                const enabled = activeLayers.includes(layer);
                return (
                  <button key={layer} type="button" onClick={() => toggleLayer(layer)} className={`rounded-[20px] border p-3 text-left transition ${enabled ? 'border-[var(--ink)] bg-[var(--surface)] shadow-[var(--shadow-sm)]' : 'border-[var(--border)] bg-[var(--paper2)] opacity-60 hover:opacity-100'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Icon size={16} /> {layerMeta[layer].label}</span>
                      <Pill tone={pillTone(layerMeta[layer].tone)} variant="soft">{layerCounts[layer]}</Pill>
                    </div>
                    <div className="mt-2 text-xs font-semibold leading-5 text-[var(--muted)]">{layerMeta[layer].description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--hairline)] p-5">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">City Map</div>
              <div className="fredoka mt-1 text-2xl font-semibold">Operational pins and risk fields</div>
            </div>
            <Pill tone="paper" variant="soft">{supabase ? 'live sync' : 'demo map'}</Pill>
          </div>
          <div className="relative min-h-[620px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--jungle)_16%,transparent),transparent_28%),radial-gradient(circle_at_78%_30%,color-mix(in_srgb,var(--sky)_16%,transparent),transparent_28%),linear-gradient(135deg,var(--paper)_0%,var(--paper2)_100%)]">
            <div className="absolute inset-0 opacity-[0.26]" style={{ backgroundImage: 'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
            <div className="absolute left-[10%] top-[18%] h-[58%] w-[76%] rounded-[46%] border border-[var(--border)] bg-white/28 shadow-inner backdrop-blur-[2px]" />
            {analytics.densityZones.map((zone) => {
              const block = mapState.blockById.get(zone.id);
              const position = blockPosition(block);
              return (
                <div key={zone.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" style={{ left: `${position.x}%`, top: `${position.y}%`, width: `${Math.max(88, zone.risk * 2.2)}px`, height: `${Math.max(88, zone.risk * 2.2)}px`, background: zone.risk > 65 ? 'color-mix(in srgb, var(--coral) 14%, transparent)' : zone.risk > 30 ? 'color-mix(in srgb, var(--gold) 14%, transparent)' : 'color-mix(in srgb, var(--jungle) 10%, transparent)' }}>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[11px] font-black text-[var(--ink)] shadow-[var(--shadow-sm)]">{zone.name}</div>
                </div>
              );
            })}
            {visiblePins.map((pin) => {
              const Icon = layerMeta[pin.layer].icon;
              return (
                <button key={pin.id} type="button" onClick={() => setSelectedPinId(pin.id)} className={`absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white transition hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ink)_14%,transparent)] ${toneClass(pin.tone)} ${selectedPin?.id === pin.id ? 'h-12 w-12 scale-110' : 'h-10 w-10'}`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} title={pin.title}>
                  <Icon size={selectedPin?.id === pin.id ? 20 : 16} />
                </button>
              );
            })}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-[22px] border border-white/60 bg-white/72 p-3 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <Navigation size={16} className="text-[var(--muted)]" />
              <span className="text-xs font-bold text-[var(--muted)]">Exact coordinates are used only when rows include lat/lng. Otherwise pins are safely grouped around the block centroid.</span>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 content-start">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Selected Signal</div>
                <div className="fredoka mt-2 text-2xl font-semibold">{selectedPin?.title ?? 'No active signal'}</div>
              </div>
              {selectedPin && <Pill tone={pillTone(selectedPin.tone)} variant="soft">{layerMeta[selectedPin.layer].label}</Pill>}
            </div>
            {selectedPin ? (
              <div className="mt-5 grid gap-4">
                <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Location</div>
                  <div className="mt-2 text-sm font-black text-[var(--ink)]">{selectedPin.blockName}</div>
                  <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">{selectedPin.subtitle}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--paper2)] p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Status</div>
                    <div className="mt-2 text-sm font-black text-[var(--ink)]">{selectedPin.status}</div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] bg-[var(--paper2)] p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Priority</div>
                    <div className="mt-2 text-sm font-black text-[var(--ink)]">{selectedPin.priority >= 3 ? 'High' : selectedPin.priority > 0 ? 'Normal' : 'Context'}</div>
                  </div>
                </div>
                {selectedPin.href && (
                  <Link href={selectedPin.href} className="inline-flex items-center justify-center rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-black text-white shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5">Open in operations</Link>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--paper2)] p-5 text-sm font-semibold leading-6 text-[var(--muted)]">Enable at least one layer to inspect live map signals.</div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--muted)]">Cognitive Load Reducer</div>
                <div className="fredoka mt-2 text-2xl font-semibold">What to do next</div>
              </div>
              <Layers3 size={20} className="text-[var(--muted)]" />
            </div>
            <div className="mt-5 grid gap-3">
              {analytics.densityZones.slice(0, 4).map((zone) => (
                <div key={zone.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black text-[var(--ink)]">{zone.name}</div>
                    <Pill tone={zone.risk > 65 ? 'coral' : zone.risk > 30 ? 'gold' : 'jungle'} variant="soft">{zone.risk > 65 ? 'Escalate' : zone.risk > 30 ? 'Watch' : 'Stable'}</Pill>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-bold text-[var(--muted)]">
                    <span>{zone.open} open</span>
                    <span>{zone.missions} tasks</span>
                    <span>{zone.emergency} urgent</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--gold-soft)] text-[var(--gold-deep)]">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-sm font-black text-[var(--ink)]">GIS readiness note</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">This is an operational map, not a public tracking map. Exact points should stay ops-only, and block fallback positions prevent exposing citizen-level location when a row only contains area context.</div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--jungle-soft)] text-[var(--jungle-deep)]">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-sm font-black text-[var(--ink)]">Next upgrade path</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">When the correct ops Supabase project has the spine schema and location capture active, this page can swap the stylized canvas for MapLibre while keeping the same layer model and detail drawer.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

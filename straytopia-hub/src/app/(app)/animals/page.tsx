'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { Activity, HeartPulse, PawPrint, ShieldCheck } from 'lucide-react';
import { ActionStatus } from '@/components/ui/ActionStatus';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { AnimalEventRow, AnimalRow, Block, CaseRow, ProofRow, Shelter, TaskRow } from '@/lib/types';

const animalSpecies = ['dog', 'cat', 'bird', 'cattle', 'other'] as const;
const lifecycleEvents = ['sighted', 'reported', 'rescue_requested', 'rescue_started', 'rescued', 'intake_started', 'treatment_started', 'stabilized', 'rehabilitated', 'fostered', 'adopted', 'released', 'monitoring_started', 'missing', 'deceased'];
const animalStatuses: AnimalRow['status'][] = ['unknown', 'street_observed', 'needs_help', 'under_observation', 'rescue_requested', 'rescue_in_progress', 'intake_pending', 'in_shelter', 'in_treatment', 'recovering', 'fostered', 'released', 'adopted', 'missing', 'deceased'];

function animalTone(status: AnimalRow['status']) {
  if (status === 'adopted' || status === 'released' || status === 'recovering') return 'jungle' as const;
  if (status === 'in_treatment' || status === 'rescue_in_progress' || status === 'needs_help') return 'coral' as const;
  if (status === 'in_shelter' || status === 'fostered' || status === 'intake_pending') return 'sky' as const;
  return 'gold' as const;
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

export default function AnimalsPage() {
  const supabase = getSupabase();
  const [animals, setAnimals] = useState<AnimalRow[]>([]);
  const [events, setEvents] = useState<AnimalEventRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [newAnimalCaseId, setNewAnimalCaseId] = useState('');
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState<(typeof animalSpecies)[number]>('dog');
  const [linkCaseId, setLinkCaseId] = useState('');
  const [eventType, setEventType] = useState(lifecycleEvents[0]!);
  const [nextStatus, setNextStatus] = useState('');
  const [eventNote, setEventNote] = useState('');

  async function load() {
    if (!supabase) return;
    const [animalRows, eventRows, caseRows, taskRows, proofRows, blockRows, shelterRows] = await Promise.all([
      supabase.from('animals').select('*').order('updated_at', { ascending: false }).limit(200),
      supabase.from('animal_events').select('*').order('occurred_at', { ascending: false }).limit(500),
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('tasks').select('*').not('animal_id', 'is', null).order('created_at', { ascending: false }).limit(500),
      supabase.from('proofs').select('*').not('animal_id', 'is', null).order('submitted_at', { ascending: false }).limit(500),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
    ]);

    const firstError = [animalRows.error, eventRows.error, caseRows.error, taskRows.error, proofRows.error].find(Boolean);
    setError(firstError?.message ?? null);
    setAnimals(((animalRows.data ?? []) as unknown) as AnimalRow[]);
    setEvents(((eventRows.data ?? []) as unknown) as AnimalEventRow[]);
    setCases(((caseRows.data ?? []) as unknown) as CaseRow[]);
    setTasks(((taskRows.data ?? []) as unknown) as TaskRow[]);
    setProofs(((proofRows.data ?? []) as unknown) as ProofRow[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
    setShelters(((shelterRows.data ?? []) as unknown) as Shelter[]);
    setSelectedId((prev) => prev ?? (((animalRows.data ?? [])[0] as AnimalRow | undefined)?.id ?? null));
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_animal_lifecycles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animal_events' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((shelter) => [shelter.id, shelter])), [shelters]);
  const selected = animals.find((animal) => animal.id === selectedId) ?? animals[0] ?? null;
  const selectedEvents = selected ? events.filter((event) => event.animal_id === selected.id) : [];
  const selectedCases = selected ? cases.filter((row) => row.animal_id === selected.id) : [];
  const selectedTasks = selected ? tasks.filter((row) => row.animal_id === selected.id) : [];
  const selectedProofs = selected ? proofs.filter((row) => row.animal_id === selected.id) : [];
  const unlinkedCases = cases.filter((row) => !row.animal_id && row.status !== 'rejected' && row.status !== 'closed');
  const activeAnimals = animals.filter((animal) => !['released', 'adopted', 'deceased'].includes(animal.status)).length;
  const treatmentAnimals = animals.filter((animal) => ['in_treatment', 'recovering', 'in_shelter'].includes(animal.status)).length;
  const stats: Array<{ label: string; value: number; tone: 'paper' | 'gold' | 'jungle' | 'sky' }> = [
    { label: 'Animal records', value: animals.length, tone: 'paper' },
    { label: 'Active care', value: activeAnimals, tone: activeAnimals > 0 ? 'gold' : 'jungle' },
    { label: 'Treatment or shelter', value: treatmentAnimals, tone: 'sky' },
    { label: 'Lifecycle events', value: events.length, tone: 'jungle' },
  ];

  async function runRpc(actionName: string, call: () => PromiseLike<{ error: { message: string } | null; data: unknown }>, success: string) {
    if (!supabase) return false;
    setBusyAction(actionName);
    setActionMessage(null);
    try {
      const result = await call();
      if (result.error) {
        setError(result.error.message);
        return false;
      }
      setError(null);
      setActionMessage(success);
      await load();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action failed. Try again.');
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function createAnimalFromCase() {
    if (!newAnimalCaseId) return;
    const ok = await runRpc('create-animal', () => supabase!.rpc('create_animal_from_case', { p_case_id: newAnimalCaseId, p_name: newAnimalName || null, p_species: newAnimalSpecies }), 'Animal lifecycle record created and linked.');
    if (ok) {
      setNewAnimalCaseId('');
      setNewAnimalName('');
    }
  }

  async function linkCaseToSelectedAnimal() {
    if (!selected || !linkCaseId) return;
    const ok = await runRpc('link-case', () => supabase!.rpc('link_case_to_animal', { p_case_id: linkCaseId, p_animal_id: selected.id }), 'Case linked to the selected animal.');
    if (ok) setLinkCaseId('');
  }

  async function addLifecycleEvent() {
    if (!selected) return;
    const ok = await runRpc('add-event', () => supabase!.rpc('add_animal_lifecycle_event', { p_animal_id: selected.id, p_event_type: eventType, p_next_status: nextStatus || null, p_note: eventNote }), 'Lifecycle event recorded.');
    if (ok) {
      setEventNote('');
      setNextStatus('');
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{stat.label}</div>
            <div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{stat.value}</div>
            <div className="mt-3"><Pill tone={stat.tone} variant="soft">live</Pill></div>
          </Card>
        ))}
      </div>

      {error && <ActionStatus type="error">Run migrations 006 and 009 to enable animal activation workflows. {error}</ActionStatus>}
      {actionMessage && <ActionStatus type="success">{actionMessage}</ActionStatus>}

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Activation</div>
            <div className="fredoka mt-2 text-2xl font-semibold">Create animal records from accepted field cases</div>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">This turns case work into longitudinal care without inventing animal identity beyond available evidence.</p>
          </div>
          <div className="grid w-full gap-2 md:w-auto md:grid-cols-[260px_160px_180px_auto]">
            <select value={newAnimalCaseId} onChange={(event) => setNewAnimalCaseId(event.target.value)} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
              <option value="">Select unlinked case</option>
              {unlinkedCases.map((row) => <option key={row.id} value={row.id}>{row.external_id} · {label(row.category)}</option>)}
            </select>
            <select value={newAnimalSpecies} onChange={(event) => setNewAnimalSpecies(event.target.value as (typeof animalSpecies)[number])} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
              {animalSpecies.map((species) => <option key={species} value={species}>{species}</option>)}
            </select>
            <input value={newAnimalName} onChange={(event) => setNewAnimalName(event.target.value)} placeholder="Optional name" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]" />
            <Button type="button" onClick={createAnimalFromCase} disabled={!supabase || !newAnimalCaseId || busyAction === 'create-animal'}>{busyAction === 'create-animal' ? 'Creating...' : 'Create record'}</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--hairline)] bg-[var(--paper)] p-4">
            <div className="flex items-center gap-3">
              <PawPrint size={18} className="text-[var(--muted)]" />
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Animal Lifecycles</div>
                <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">Longitudinal records, not one-off cases.</div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
            {animals.map((animal) => (
              <button key={animal.id} type="button" onClick={() => setSelectedId(animal.id)} className={`w-full px-4 py-3 text-left transition ${selected?.id === animal.id ? 'bg-[var(--jungle-soft)]' : 'hover:bg-[var(--paper)]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-[var(--ink)]">{animal.name ?? animal.public_code}</div>
                    <div className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">{animal.species} · {blockById.get(animal.primary_block_id ?? '')?.name ?? 'Unknown block'}</div>
                  </div>
                  <Pill tone={animalTone(animal.status)} variant="soft">{label(animal.status)}</Pill>
                </div>
              </button>
            ))}
            {animals.length === 0 && <div className="px-4 py-12 text-center text-sm font-semibold text-[var(--muted)]">No animal records yet. Link accepted cases to animals to start longitudinal care.</div>}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          {!selected ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <div className="fredoka text-[22px] font-semibold">No animal selected</div>
                <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Animal records appear after cases are linked to longitudinal care.</div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{selected.public_code}</div>
                  <div className="fredoka mt-2 text-[32px] font-semibold">{selected.name ?? `${selected.species} under care`}</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--muted)]">{selected.description || 'No description recorded yet.'}</div>
                </div>
                <Pill tone={animalTone(selected.status)} variant="solid">{label(selected.status)}</Pill>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <InfoCard icon={<PawPrint size={17} />} label="Species" value={selected.species} />
                <InfoCard icon={<Activity size={17} />} label="Identity" value={selected.identification_confidence} />
                <InfoCard icon={<HeartPulse size={17} />} label="Shelter" value={shelterById.get(selected.current_shelter_id ?? '')?.name ?? 'Not assigned'} />
                <InfoCard icon={<ShieldCheck size={17} />} label="Last seen" value={selected.last_seen_at ? new Date(selected.last_seen_at).toLocaleDateString() : 'Unknown'} />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Link Case</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <select value={linkCaseId} onChange={(event) => setLinkCaseId(event.target.value)} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
                      <option value="">Select unlinked case</option>
                      {unlinkedCases.map((row) => <option key={row.id} value={row.id}>{row.external_id} · {label(row.category)}</option>)}
                    </select>
                    <Button type="button" variant="paper" onClick={linkCaseToSelectedAnimal} disabled={!supabase || !linkCaseId || busyAction === 'link-case'}>{busyAction === 'link-case' ? 'Linking...' : 'Link'}</Button>
                  </div>
                </div>

                <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Record Event</div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <select value={eventType} onChange={(event) => setEventType(event.target.value)} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
                      {lifecycleEvents.map((event) => <option key={event} value={event}>{label(event)}</option>)}
                    </select>
                    <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
                      <option value="">Keep current status</option>
                      {animalStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
                    </select>
                    <input value={eventNote} onChange={(event) => setEventNote(event.target.value)} placeholder="Optional care note" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)] md:col-span-2" />
                    <Button type="button" variant="paper" onClick={addLifecycleEvent} disabled={!supabase || busyAction === 'add-event'} className="md:col-span-2">{busyAction === 'add-event' ? 'Recording...' : 'Record lifecycle event'}</Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
                <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                  <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Lifecycle Timeline</div>
                  <div className="mt-4 grid gap-3">
                    {selectedEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[12px] bg-[var(--jungle-soft)] text-sm font-black text-[var(--jungle-deep)]">{index + 1}</div>
                        <div>
                          <div className="text-sm font-black text-[var(--ink)]">{label(event.event_type)}</div>
                          <div className="text-xs font-semibold text-[var(--muted)]">{new Date(event.occurred_at).toLocaleString()} · {event.evidence_quality}</div>
                          {event.note && <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">{event.note}</div>}
                        </div>
                      </div>
                    ))}
                    {selectedEvents.length === 0 && <div className="text-sm font-semibold text-[var(--muted)]">No lifecycle events recorded yet.</div>}
                  </div>
                </div>

                <div className="grid gap-4">
                  <LinkedCard label="Linked cases" value={selectedCases.length} tone="gold" />
                  <LinkedCard label="Linked tasks" value={selectedTasks.length} tone="sky" />
                  <LinkedCard label="Linked proofs" value={selectedProofs.length} tone="jungle" />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
      <div className="text-[var(--muted)]">{icon}</div>
      <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-sm font-bold capitalize text-[var(--ink2)]">{value}</div>
    </div>
  );
}

function LinkedCard({ label, value, tone }: { label: string; value: number; tone: 'gold' | 'sky' | 'jungle' }) {
  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-black text-[var(--ink)]">{label}</div>
        <Pill tone={tone} variant="soft">records</Pill>
      </div>
      <div className="mono mt-4 text-[34px] font-black text-[var(--ink)]">{value}</div>
    </div>
  );
}

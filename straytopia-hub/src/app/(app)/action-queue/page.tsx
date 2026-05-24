'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, ProofRow, ProofVerificationStatus, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { AlertTriangle, ArrowUpRight, Check, Clock3, Compass, FileText, Image as ImageIcon, Layers3, Map as MapIcon, Search, ShieldCheck, Users, X } from 'lucide-react';
import { demoBlocks, demoCases, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

type Persona = 'ops' | 'shelter' | 'impact';
type Mode = 'work' | 'audit';
type WorkItemKind = 'case' | 'task' | 'proof';
type QueueFilter = 'all' | 'emergency' | 'unassigned' | 'proof' | 'blocked' | 'stale' | 'done';

type WorkItem = {
  key: string;
  kind: WorkItemKind;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  tone: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper' | 'ink';
  priority: number;
  dueLabel: string;
  primaryAction: string;
  caseRow?: CaseRow;
  taskRow?: TaskRow;
  proofRow?: ProofRow;
};

const queueFilters: Array<{ key: QueueFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'proof', label: 'Proof review' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'stale', label: 'Stale' },
  { key: 'done', label: 'Done' },
];

const openTaskStatuses: TaskRow['status'][] = ['queued', 'assigned', 'in_progress', 'proof_pending', 'blocked', 'escalated'];

function displayStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDoneItem(item: WorkItem) {
  if (item.kind === 'case') return Boolean(item.caseRow && ['rejected', 'resolved', 'closed'].includes(item.caseRow.status));
  if (item.kind === 'task') return Boolean(item.taskRow && ['completed', 'cancelled'].includes(item.taskRow.status));
  return Boolean(item.proofRow && ['verified', 'rejected'].includes(item.proofRow.verification_status));
}

function matchesQueueFilter(item: WorkItem, filter: QueueFilter) {
  if (filter === 'all') return true;
  if (filter === 'done') return isDoneItem(item);
  if (filter === 'emergency') return item.caseRow?.severity === 'urgent' || item.taskRow?.priority === 'critical' || item.dueLabel.includes('Overdue');
  if (filter === 'unassigned') return item.kind === 'task' ? item.taskRow?.status === 'queued' : item.caseRow?.status === 'submitted' || item.caseRow?.status === 'task_created';
  if (filter === 'proof') return item.kind === 'proof' || item.taskRow?.status === 'proof_pending';
  if (filter === 'blocked') return item.taskRow?.status === 'blocked' || item.caseRow?.status === 'rejected' || item.proofRow?.verification_status === 'rejected';
  if (filter === 'stale') return item.dueLabel.includes('Overdue') || Boolean(item.caseRow && ageMinutes(item.caseRow.updated_at) > 240) || Boolean(item.taskRow && ageMinutes(item.taskRow.updated_at) > 240);
  return true;
}

function rankedShelterSuggestions(shelters: Shelter[], tasks: TaskRow[], blockId: string | null | undefined) {
  return shelters
    .map((shelter) => {
      const activeLoad = tasks.filter((task) => task.shelter_id === shelter.id && openTaskStatuses.includes(task.status)).length;
      const reasons: string[] = [];
      let score = 0;
      if (blockId && shelter.block_id === blockId) {
        score += 40;
        reasons.push('same block');
      }
      if (shelter.status === 'active') {
        score += 35;
        reasons.push('active partner');
      }
      if (shelter.status === 'limited') {
        score += 8;
        reasons.push('limited capacity');
      }
      if (shelter.status === 'pending') reasons.push('pending partner');
      if (shelter.status === 'inactive') {
        score -= 100;
        reasons.push('inactive');
      }
      if (activeLoad > 0) reasons.push(`${activeLoad} open task${activeLoad === 1 ? '' : 's'}`);
      score -= activeLoad * 5;
      return { shelter, score, activeLoad, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

function statusTone(status: string): WorkItem['tone'] {
  if (status.includes('urgent') || status.includes('critical') || status.includes('rejected') || status.includes('overdue')) return 'coral';
  if (status.includes('review') || status.includes('queued') || status.includes('pending')) return 'gold';
  if (status.includes('assigned') || status.includes('progress')) return 'sky';
  if (status.includes('verified') || status.includes('completed') || status.includes('resolved')) return 'jungle';
  return 'paper';
}

function severityScore(c: CaseRow) {
  if (c.severity === 'urgent') return 90;
  if (c.severity === 'today') return 60;
  return 30;
}

function priorityScore(t: TaskRow) {
  if (t.priority === 'critical') return 95;
  if (t.priority === 'high') return 72;
  if (t.priority === 'medium') return 45;
  return 20;
}

function ageMinutes(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function dueLabel(createdAt: string, slaMinutes: number) {
  const left = slaMinutes - ageMinutes(createdAt);
  if (left < 0) return `Overdue by ${Math.abs(left)}m`;
  if (left < 60) return `${left}m left`;
  return `${Math.round(left / 60)}h left`;
}

function recommendationForCase(c: CaseRow) {
  if (c.category === 'injured' || c.category === 'sick') return 'Recommend medical check, high priority, photo + note proof.';
  if (c.category === 'water') return 'Recommend water refill task, medium SLA, proof photo required.';
  if (c.category === 'aggressive') return 'Recommend rescue assessment with safety warning before assignment.';
  if (c.category === 'rescue' || c.category === 'abandoned') return 'Recommend rescue assessment and nearest shelter assignment.';
  return 'Recommend follow-up task with proof photo.';
}

function proofTone(status: ProofVerificationStatus): WorkItem['tone'] {
  if (status === 'verified') return 'jungle';
  if (status === 'rejected') return 'coral';
  if (status === 'needs_review') return 'plum';
  return 'gold';
}

export default function ActionQueuePage() {
  const supabase = getSupabase();
  const [persona, setPersona] = useState<Persona>('ops');
  const [mode, setMode] = useState<Mode>('work');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [q, setQ] = useState('');
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const caseById = useMemo(() => new Map(cases.map((c) => [c.id, c])), [cases]);
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const templateById = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((s) => [s.id, s])), [shelters]);
  const defaultShelterId = shelters[0]?.id ?? null;

  async function load() {
    setLoadError(null);
    if (!supabase) {
      setCases(demoCases);
      setTasks(demoTasks);
      setProofs(demoProofs);
      setTemplates(demoTaskTemplates);
      setBlocks(demoBlocks);
      setShelters(demoShelters);
      setLastUpdated(new Date());
      return;
    }

    const [c, t, p, tt, b, s] = await Promise.all([
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(300),
      supabase.from('task_templates').select('*').order('type', { ascending: true }),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
    ]);

    const failure = [c.error, t.error, p.error, tt.error, b.error, s.error].find(Boolean);
    if (failure) {
      setLoadError(failure.message);
    }

    setCases(((c.data ?? []) as unknown) as CaseRow[]);
    setTasks(((t.data ?? []) as unknown) as TaskRow[]);
    setProofs(((p.data ?? []) as unknown) as ProofRow[]);
    setTemplates(((tt.data ?? []) as unknown) as TaskTemplateRow[]);
    setBlocks(((b.data ?? []) as unknown) as Block[]);
    setShelters(((s.data ?? []) as unknown) as Shelter[]);
    setLastUpdated(new Date());
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_action_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const workItems = useMemo(() => {
    const rows: WorkItem[] = [];
    for (const c of cases) {
      if (['rejected', 'resolved', 'closed'].includes(c.status) && mode === 'work' && queueFilter !== 'done') continue;
      const ageBonus = Math.min(25, Math.floor(ageMinutes(c.created_at) / 20));
      rows.push({
        key: `case:${c.id}`,
        kind: 'case',
        title: `${c.category.toUpperCase()} report`,
        subtitle: c.location_text || 'Location not provided',
        meta: c.external_id,
        status: displayStatus(c.status),
        tone: statusTone(c.status === 'submitted' && c.severity === 'urgent' ? 'urgent' : c.status),
        priority: severityScore(c) + ageBonus,
        dueLabel: dueLabel(c.created_at, c.severity === 'urgent' ? 30 : c.severity === 'today' ? 180 : 480),
        primaryAction: c.status === 'submitted' || c.status === 'under_review' ? 'Accept + create task' : 'Open report',
        caseRow: c,
      });
    }

    for (const t of tasks) {
      if (['completed', 'cancelled'].includes(t.status) && mode === 'work' && queueFilter !== 'done') continue;
      const tpl = t.template_id ? templateById.get(t.template_id) : null;
      const c = t.case_id ? caseById.get(t.case_id) : null;
      rows.push({
        key: `task:${t.id}`,
        kind: 'task',
        title: tpl?.title ?? 'Field work',
        subtitle: c?.location_text || (t.block_id ? blockById.get(t.block_id)?.name ?? 'Unknown block' : 'No location context'),
        meta: c?.external_id ?? 'Manual task',
        status: displayStatus(t.status),
        tone: statusTone(t.status),
        priority: priorityScore(t) + (t.status === 'queued' ? 12 : 0),
        dueLabel: t.due_at ? dueLabel(t.created_at, Math.max(15, Math.round((new Date(t.due_at).getTime() - new Date(t.created_at).getTime()) / 60000))) : 'No SLA set',
        primaryAction: t.status === 'queued' ? 'Assign nearest shelter' : 'Update field work',
        taskRow: t,
        caseRow: c ?? undefined,
      });
    }

    for (const p of proofs) {
      if (['verified', 'rejected'].includes(p.verification_status) && mode === 'work' && queueFilter !== 'done') continue;
      const t = taskById.get(p.task_id);
      const tpl = t?.template_id ? templateById.get(t.template_id) : null;
      const c = t?.case_id ? caseById.get(t.case_id) : null;
      rows.push({
        key: `proof:${p.id}`,
        kind: 'proof',
        title: `${tpl?.title ?? 'Evidence'} proof`,
        subtitle: p.note || 'No field note provided',
        meta: c?.external_id ?? 'Unlinked evidence',
        status: displayStatus(p.verification_status),
        tone: proofTone(p.verification_status),
        priority: 70 + Math.min(20, Math.floor(ageMinutes(p.submitted_at) / 30)),
        dueLabel: dueLabel(p.submitted_at, 120),
        primaryAction: 'Verify + complete task',
        proofRow: p,
        taskRow: t,
        caseRow: c ?? undefined,
      });
    }

    const qq = q.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (persona === 'shelter' && row.kind === 'proof') return false;
        if (persona === 'impact' && row.kind !== 'proof' && row.kind !== 'case') return false;
        if (!matchesQueueFilter(row, queueFilter)) return false;
        if (!qq) return true;
        return `${row.title} ${row.subtitle} ${row.meta} ${row.status}`.toLowerCase().includes(qq);
      })
      .sort((a, b) => b.priority - a.priority);
  }, [blockById, caseById, cases, mode, persona, proofs, q, queueFilter, taskById, tasks, templateById]);

  useEffect(() => {
    setSelectedKey((prev) => {
      if (prev && workItems.some((item) => item.key === prev)) return prev;
      return workItems[0]?.key ?? null;
    });
  }, [workItems]);

  const selected = workItems.find((item) => item.key === selectedKey) ?? workItems[0] ?? null;
  const selectedBlock = selected?.caseRow?.block_id ? blockById.get(selected.caseRow.block_id) : selected?.taskRow?.block_id ? blockById.get(selected.taskRow.block_id) : null;
  const selectedShelter = selected?.taskRow?.shelter_id ? shelterById.get(selected.taskRow.shelter_id) : selected?.caseRow?.shelter_id ? shelterById.get(selected.caseRow.shelter_id) : null;
  const selectedTemplate = selected?.taskRow?.template_id ? templateById.get(selected.taskRow.template_id) : null;
  const selectedShelterSuggestions = useMemo(() => rankedShelterSuggestions(shelters, tasks, selected?.taskRow?.block_id ?? selected?.caseRow?.block_id), [selected?.caseRow?.block_id, selected?.taskRow?.block_id, shelters, tasks]);
  const recommendedShelterId = selectedShelterSuggestions.find((suggestion) => suggestion.shelter.status !== 'inactive')?.shelter.id ?? defaultShelterId;
  const nearbySignals = selectedBlock ? cases.filter((c) => c.block_id === selectedBlock.id && !['rejected', 'resolved', 'closed'].includes(c.status)).length : 0;

  async function assignTask(item: WorkItem, shelterId: string | null) {
    if (!item.taskRow || !shelterId) return;
    if (!supabase) {
      setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? {
        ...t,
        shelter_id: shelterId,
        assigned_to_type: 'shelter',
        assigned_to_id: shelterId,
        status: t.status === 'queued' ? 'assigned' : t.status,
        updated_at: new Date().toISOString(),
      } : t));
      if (item.taskRow.case_id) {
        setCases((prev) => prev.map((c) => c.id === item.taskRow?.case_id ? { ...c, status: 'assigned', updated_at: new Date().toISOString() } : c));
      }
      return;
    }

    setBusyItem(item.key);
    await supabase.from('tasks').update({
      shelter_id: shelterId,
      assigned_to_type: 'shelter',
      assigned_to_id: shelterId,
      status: item.taskRow.status === 'queued' ? 'assigned' : item.taskRow.status,
    }).eq('id', item.taskRow.id);
    if (item.taskRow.case_id) await supabase.from('cases').update({ status: 'assigned' }).eq('id', item.taskRow.case_id);
    setBusyItem(null);
  }

  async function runPrimaryAction(item: WorkItem) {
    if (!supabase) {
      if (item.kind === 'case' && item.caseRow) {
        setCases((prev) => prev.map((c) => c.id === item.caseRow?.id ? { ...c, status: 'task_created', updated_at: new Date().toISOString() } : c));
      }
      if (item.kind === 'task' && item.taskRow) {
        await assignTask(item, recommendedShelterId ?? demoShelters[0]?.id ?? null);
      }
      if (item.kind === 'proof' && item.proofRow) {
        setProofs((prev) => prev.map((p) => p.id === item.proofRow?.id ? { ...p, verification_status: 'verified' } : p));
        if (item.taskRow) setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? { ...t, status: 'completed', updated_at: new Date().toISOString() } : t));
        if (item.caseRow) setCases((prev) => prev.map((c) => c.id === item.caseRow?.id ? { ...c, status: 'resolved', updated_at: new Date().toISOString() } : c));
      }
      return;
    }
    if (!supabase) return;
    setBusyItem(item.key);
    if (item.kind === 'case' && item.caseRow) {
      const { data: userData } = await supabase.auth.getUser();
      if (item.caseRow.status === 'submitted') {
        await supabase.from('cases').update({ status: 'under_review' }).eq('id', item.caseRow.id);
      }
      await supabase.from('case_reviews').insert({
        case_id: item.caseRow.id,
        reviewer_user_id: userData.user?.id ?? null,
        decision: 'accepted',
      });
    }
    if (item.kind === 'task' && item.taskRow && recommendedShelterId) {
      await assignTask(item, recommendedShelterId);
    }
    if (item.kind === 'proof' && item.proofRow) {
      await supabase.from('proofs').update({ verification_status: 'verified' }).eq('id', item.proofRow.id);
      if (item.taskRow) await supabase.from('tasks').update({ status: 'completed' }).eq('id', item.taskRow.id);
      if (item.caseRow) await supabase.from('cases').update({ status: 'resolved' }).eq('id', item.caseRow.id);
    }
    setBusyItem(null);
  }

  async function rejectSelected() {
    if (!supabase && selected) {
      if (selected.kind === 'case' && selected.caseRow) {
        setCases((prev) => prev.map((c) => c.id === selected.caseRow?.id ? {
          ...c,
          status: 'rejected',
          reject_reason_code: 'not_actionable',
          reject_reason_text: 'Rejected from demo action queue.',
          updated_at: new Date().toISOString(),
        } : c));
      }
      if (selected.kind === 'proof' && selected.proofRow) {
        setProofs((prev) => prev.map((p) => p.id === selected.proofRow?.id ? { ...p, verification_status: 'rejected' } : p));
      }
      return;
    }
    if (!supabase || !selected) return;
    setBusyItem(selected.key);
    if (selected.kind === 'case' && selected.caseRow) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('cases').update({ status: 'rejected', reject_reason_code: 'not_actionable', reject_reason_text: 'Rejected from action queue.' }).eq('id', selected.caseRow.id);
      await supabase.from('case_reviews').insert({ case_id: selected.caseRow.id, reviewer_user_id: userData.user?.id ?? null, decision: 'rejected', fixed_reason_code: 'not_actionable', free_text_reason: 'Rejected from action queue.' });
    }
    if (selected.kind === 'proof' && selected.proofRow) await supabase.from('proofs').update({ verification_status: 'rejected' }).eq('id', selected.proofRow.id);
    setBusyItem(null);
  }

  const stats = [
    { label: 'Needs triage', value: workItems.filter((i) => i.kind === 'case').length, tone: 'gold' as const },
    { label: 'Needs assignment', value: workItems.filter((i) => i.kind === 'task' && i.taskRow?.status === 'queued').length, tone: 'sky' as const },
    { label: 'Needs evidence review', value: workItems.filter((i) => i.kind === 'proof').length, tone: 'plum' as const },
    { label: 'At risk', value: workItems.filter((i) => i.dueLabel.includes('Overdue') || i.priority > 85).length, tone: 'coral' as const },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{stat.label}</div>
              <Pill tone={stat.tone} variant="soft">now</Pill>
            </div>
            <div className="mono mt-4 text-[30px] font-bold text-[var(--ink)]">{stat.value}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[420px_1fr]">
          <div className="border-b border-[var(--hairline)] lg:border-r lg:border-b-0">
            <div className="border-b border-[var(--hairline)] bg-[var(--paper)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Action Queue</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">Highest-risk work first. One decision per item.</div>
                </div>
                <Pill tone="ink" variant="soft">{mode}</Pill>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {queueFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setQueueFilter(filter.key)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${queueFilter === filter.key ? 'border-transparent bg-[var(--ink)] text-white' : 'border-[var(--border)] bg-white/70 text-[var(--ink2)] hover:bg-white'}`}
                    type="button"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-[var(--border)] bg-white/54 px-3 py-2 text-xs font-bold text-[var(--muted)]">
                <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : 'Loading workspace'}</span>
                <span>{loadError ? `Load issue: ${loadError}` : supabase ? 'Supabase realtime' : 'Demo ledger'}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {([
                  ['ops', 'Ops'],
                  ['shelter', 'Shelter'],
                  ['impact', 'Impact'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setPersona(value)}
                    className={`rounded-[14px] border px-3 py-2 text-xs font-extrabold transition ${persona === value ? 'border-transparent bg-[var(--ink)] text-white' : 'border-[var(--border)] bg-white/70 text-[var(--ink2)] hover:bg-white'}`}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {([
                  ['work', 'Work mode'],
                  ['audit', 'Audit mode'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={`rounded-[14px] border px-3 py-2 text-xs font-extrabold transition ${mode === value ? 'border-[var(--jungle)] bg-[var(--jungle-soft)] text-[var(--jungle-deep)]' : 'border-[var(--border)] bg-white/70 text-[var(--ink2)] hover:bg-white'}`}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-white/70 px-3">
                <Search size={15} className="text-[var(--muted)]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="urgent, proof, Indiranagar"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
                />
              </div>
            </div>

            <div className="max-h-[680px] divide-y divide-[var(--hairline)] overflow-y-auto bg-[var(--surface)]">
              {workItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedKey(item.key)}
                  className={`w-full px-4 py-3 text-left transition ${selected?.key === item.key ? 'bg-[var(--jungle-soft)]' : 'hover:bg-[var(--paper)]'}`}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.kind === 'case' && <FileText size={15} className="text-[var(--muted)]" />}
                        {item.kind === 'task' && <Compass size={15} className="text-[var(--muted)]" />}
                        {item.kind === 'proof' && <ImageIcon size={15} className="text-[var(--muted)]" />}
                        <div className="truncate text-sm font-extrabold text-[var(--ink)]">{item.title}</div>
                      </div>
                      <div className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">{item.meta} · {item.subtitle}</div>
                    </div>
                    <Pill tone={item.tone} variant="soft">{item.status}</Pill>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[var(--muted)]">{item.dueLabel}</span>
                    <span className="text-xs font-extrabold text-[var(--ink2)]">{item.primaryAction}</span>
                  </div>
                </button>
              ))}
              {workItems.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <div className="fredoka text-[18px] font-semibold">No action needed</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--muted)]">When new reports, field work, or evidence arrives, it will appear here.</div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {!selected ? (
              <div className="grid min-h-[460px] place-items-center text-center">
                <div>
                  <div className="fredoka text-[22px] font-semibold">Queue clear</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Accept a report, assign work, or verify evidence when new activity arrives.</div>
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{selected.kind}</div>
                    <div className="fredoka mt-2 text-[28px] font-semibold leading-tight">{selected.title}</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--muted)]">{selected.meta} · {selected.subtitle}</div>
                  </div>
                  <Pill tone={selected.tone} variant="solid">{selected.dueLabel}</Pill>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <MapIcon size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Block</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedBlock?.name ?? 'Unknown'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <Users size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Owner</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedShelter?.name ?? 'Unassigned'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <Layers3 size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Template</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedTemplate?.title ?? 'Recommended'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <ShieldCheck size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Confidence</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selected.priority > 85 ? 'Likely urgent' : selected.kind === 'proof' ? 'Needs proof check' : 'Human review'}</div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Inline Timeline</div>
                        <div className="fredoka mt-1 text-[20px] font-semibold">Decision history</div>
                      </div>
                      <Clock3 size={18} className="text-[var(--muted)]" />
                    </div>
                    <div className="mt-5 grid gap-4">
                      {[
                        ['Submitted', selected.caseRow?.created_at ?? selected.taskRow?.created_at ?? selected.proofRow?.submitted_at],
                        ['Reviewed', selected.caseRow?.status && selected.caseRow.status !== 'submitted' ? selected.caseRow.updated_at : null],
                        ['Assigned', selected.taskRow?.status === 'assigned' || selected.caseRow?.status === 'assigned' ? selected.taskRow?.updated_at ?? selected.caseRow?.updated_at : null],
                        ['Evidence submitted', selected.proofRow?.submitted_at ?? null],
                        ['Resolved', selected.caseRow?.status === 'resolved' ? selected.caseRow.updated_at : null],
                      ].map(([label, date], index) => (
                        <div key={label ?? index} className="flex items-center gap-3">
                          <div className={`grid h-8 w-8 place-items-center rounded-[12px] ${date ? 'bg-[var(--jungle)] text-white' : 'bg-[var(--paper2)] text-[var(--muted)]'}`}>
                            {date ? <Check size={15} /> : index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-[var(--ink)]">{label}</div>
                            <div className="text-xs font-semibold text-[var(--muted)]">{date ? new Date(date).toLocaleString() : 'Not yet'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                      <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Recommended action</div>
                      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--ink2)]">
                        {selected.caseRow ? recommendationForCase(selected.caseRow) : selected.kind === 'proof' ? 'Verify proof quality, then complete the linked task and case if evidence is clear.' : 'Assign nearest available shelter and keep task status current.'}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Map-first context</div>
                          <div className="mt-2 text-sm font-semibold text-[var(--ink2)]">{nearbySignals} open signal{nearbySignals === 1 ? '' : 's'} in this block</div>
                        </div>
                        <ArrowUpRight size={17} className="text-[var(--muted)]" />
                      </div>
                      <div className="mt-4 h-28 rounded-[18px] border border-[var(--border)] bg-[radial-gradient(circle_at_35%_45%,var(--jungle-soft),transparent_28%),radial-gradient(circle_at_68%_58%,var(--gold-soft),transparent_24%),white]" />
                    </div>
                  </div>
                </div>

                {selected.kind === 'task' && selected.taskRow && (
                  <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Dispatch Suggestions</div>
                        <div className="fredoka mt-1 text-[20px] font-semibold">Assign by block and partner status</div>
                      </div>
                      <Pill tone="paper" variant="soft">transparent score</Pill>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {selectedShelterSuggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={suggestion.shelter.id} className="rounded-[18px] border border-[var(--border)] bg-white/70 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-[var(--ink)]">{suggestion.shelter.name}</div>
                              <div className="mt-1 text-xs font-bold text-[var(--muted)]">{suggestion.reasons.join(' · ') || 'manual review'}</div>
                            </div>
                            <Pill tone={index === 0 ? 'jungle' : suggestion.shelter.status === 'limited' ? 'gold' : 'paper'} variant="soft">
                              {index === 0 ? 'Best' : displayStatus(suggestion.shelter.status)}
                            </Pill>
                          </div>
                          <Button
                            size="sm"
                            variant={index === 0 ? 'primary' : 'paper'}
                            className="mt-4 w-full"
                            disabled={busyItem === selected.key || suggestion.shelter.status === 'inactive'}
                            onClick={() => assignTask(selected, suggestion.shelter.id)}
                            type="button"
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <Button disabled={busyItem === selected.key} onClick={() => runPrimaryAction(selected)} type="button">
                    <Check size={16} />
                    {busyItem === selected.key ? 'Working...' : selected.primaryAction}
                  </Button>
                  <Button variant="paper" disabled={busyItem === selected.key || selected.kind === 'task'} onClick={rejectSelected} type="button">
                    <X size={16} />
                    Reject + notify
                  </Button>
                  <Button variant="paper" disabled={!supabase} type="button">
                    <AlertTriangle size={16} />
                    Escalate urgent case
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

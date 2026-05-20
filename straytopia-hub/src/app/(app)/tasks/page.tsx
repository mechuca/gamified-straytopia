'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { SetupCallout } from '@/components/SetupCallout';
import { CheckCircle2, ClipboardList, Plus } from 'lucide-react';

const demoTasks: TaskRow[] = [
  {
    id: 't-demo-1',
    case_id: null,
    template_id: null,
    block_id: null,
    shelter_id: null,
    status: 'queued',
    priority: 'high',
    assigned_to_type: null,
    assigned_to_id: null,
    due_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function toneForPriority(p: TaskRow['priority']) {
  if (p === 'critical') return 'coral' as const;
  if (p === 'high') return 'gold' as const;
  if (p === 'medium') return 'sky' as const;
  return 'paper' as const;
}

function toneForStatus(s: TaskRow['status']) {
  if (s === 'completed') return 'jungle' as const;
  if (s === 'blocked' || s === 'escalated') return 'coral' as const;
  if (s === 'assigned' || s === 'in_progress' || s === 'proof_pending') return 'gold' as const;
  return 'paper' as const;
}

export default function TasksPage() {
  const supabase = getSupabase();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createTemplateId, setCreateTemplateId] = useState<string>('');
  const [createBlockId, setCreateBlockId] = useState<string>('');
  const [createPriority, setCreatePriority] = useState<TaskRow['priority']>('medium');

  const templateById = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const caseById = useMemo(() => new Map(cases.map((c) => [c.id, c])), [cases]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((s) => [s.id, s])), [shelters]);

  async function load() {
    if (!supabase) {
      setTasks(demoTasks);
      return;
    }
    const [t, tt, c, b, s] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('task_templates').select('*').order('type', { ascending: true }),
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(400),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
    ]);
    setTasks((t.data as any) ?? []);
    setTemplates((tt.data as any) ?? []);
    setCases((c.data as any) ?? []);
    setBlocks((b.data as any) ?? []);
    setShelters((s.data as any) ?? []);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const defaultShelterId = shelters[0]?.id ?? null;

  return (
    <Card className="p-4 md:p-5">
      {!supabase && <SetupCallout />}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-[var(--muted)]" />
          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Backlog</div>
          <Pill tone="paper" variant="soft">{tasks.length} tasks</Pill>
        </div>

        <Button
          variant="paper"
          size="sm"
          onClick={() => {
            setCreateTemplateId(templates[0]?.id ?? '');
            setCreateBlockId(blocks[0]?.id ?? '');
            setCreatePriority('medium');
            setCreateOpen(true);
          }}
          disabled={!supabase}
          type="button"
        >
          <Plus size={14} />
          Create task
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
        <div className="grid grid-cols-[1.1fr_1fr_120px_120px_180px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
          <div>Task</div>
          <div>Linked case</div>
          <div>Priority</div>
          <div>Status</div>
          <div>Assign</div>
        </div>

        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {tasks.map((t) => {
            const tpl = t.template_id ? templateById.get(t.template_id) : null;
            const c = t.case_id ? caseById.get(t.case_id) : null;
            const b = t.block_id ? blockById.get(t.block_id) : null;
            const assignedShelter = t.shelter_id ? shelterById.get(t.shelter_id) : null;
            return (
              <div key={t.id} className="grid grid-cols-[1.1fr_1fr_120px_120px_180px] gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-[var(--ink)]">{tpl?.title ?? 'Task'}</div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">{b?.name ?? 'Unknown block'}</div>
                </div>
                <div className="min-w-0">
                  <div className="mono truncate text-[12px] font-bold text-[var(--ink2)]">{c?.external_id ?? '—'}</div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">{c?.category ? c.category.toUpperCase() : ''}</div>
                </div>
                <div className="flex items-center">
                  <Pill tone={toneForPriority(t.priority) as any} variant="soft">{t.priority}</Pill>
                </div>
                <div className="flex items-center">
                  <Pill tone={toneForStatus(t.status) as any} variant="soft">{t.status.replace('_', ' ')}</Pill>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className="truncate text-xs font-semibold text-[var(--muted)]">{assignedShelter?.name ?? 'Unassigned'}</div>
                  <Button
                    variant="paper"
                    size="sm"
                    disabled={!defaultShelterId || busyId === t.id || t.status === 'completed'}
                    onClick={async () => {
                      if (!supabase) return;
                      if (!defaultShelterId) return;
                      setBusyId(t.id);
                      await supabase.from('tasks').update({
                        shelter_id: defaultShelterId,
                        assigned_to_type: 'shelter',
                        assigned_to_id: defaultShelterId,
                        status: t.status === 'queued' ? 'assigned' : t.status,
                      }).eq('id', t.id);
                      // Also mark case assigned for mobile timeline.
                      if (t.case_id) {
                        await supabase.from('cases').update({ status: 'assigned' }).eq('id', t.case_id);
                      }
                      setBusyId(null);
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Assign
                  </Button>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No tasks yet. Accept a case to auto-create one.</div>
          )}
        </div>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-10">
          <Card className="w-full max-w-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="fredoka text-[20px] font-semibold">Create a task</div>
                <div className="mt-1 text-sm font-semibold text-[var(--muted)]">This will appear in the citizen app in realtime.</div>
              </div>
              <button className="rounded-[12px] border border-[var(--hairline)] px-3 py-2 text-xs font-black tracking-widest uppercase" onClick={() => setCreateOpen(false)} type="button">Close</button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Task template</label>
              <select
                value={createTemplateId}
                onChange={(e) => setCreateTemplateId(e.target.value)}
                className="h-11 rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>

              <label className="mt-2 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Block</label>
              <select
                value={createBlockId}
                onChange={(e) => setCreateBlockId(e.target.value)}
                className="h-11 rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]"
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <label className="mt-2 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Priority</label>
              <select
                value={createPriority}
                onChange={(e) => setCreatePriority(e.target.value as any)}
                className="h-11 rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} type="button">Cancel</Button>
              <Button
                onClick={async () => {
                  if (!supabase) return;
                  if (!createTemplateId || !createBlockId) return;
                  setBusyId('create');
                  await supabase.from('tasks').insert({
                    template_id: createTemplateId,
                    block_id: createBlockId,
                    status: 'queued',
                    priority: createPriority,
                  });
                  setBusyId(null);
                  setCreateOpen(false);
                }}
                disabled={!createTemplateId || !createBlockId || busyId === 'create'}
                type="button"
              >
                {busyId === 'create' ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}

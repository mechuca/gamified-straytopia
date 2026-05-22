'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, ProofRow, ProofVerificationStatus, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { Check, Image as ImageIcon, Search, X } from 'lucide-react';
import { demoBlocks, demoCases, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

function toneForProofStatus(s: ProofVerificationStatus) {
  if (s === 'verified') return 'jungle' as const;
  if (s === 'rejected') return 'coral' as const;
  if (s === 'needs_review') return 'plum' as const;
  return 'gold' as const;
}

function isLikelyHttpUrl(uri: string) {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

export default function ProofsPage() {
  const supabase = getSupabase();
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateRow[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ProofVerificationStatus>('pending');
  const [q, setQ] = useState('');

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const templateById = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const caseById = useMemo(() => new Map(cases.map((c) => [c.id, c])), [cases]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((s) => [s.id, s])), [shelters]);

  const selected = useMemo(() => proofs.find((p) => p.id === selectedId) ?? null, [proofs, selectedId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return proofs.filter((p) => {
      if (statusFilter !== 'all' && p.verification_status !== statusFilter) return false;
      if (!qq) return true;
      const t = taskById.get(p.task_id) ?? null;
      const tpl = t?.template_id ? templateById.get(t.template_id) : null;
      const c = t?.case_id ? caseById.get(t.case_id) : null;
      return (
        p.id.toLowerCase().includes(qq) ||
        (p.note ?? '').toLowerCase().includes(qq) ||
        (p.photo_uri ?? '').toLowerCase().includes(qq) ||
        (tpl?.title ?? '').toLowerCase().includes(qq) ||
        (c?.external_id ?? '').toLowerCase().includes(qq)
      );
    });
  }, [caseById, proofs, q, statusFilter, taskById, templateById]);

  async function load() {
    if (!supabase) {
      setTemplates(demoTaskTemplates);
      setCases(demoCases);
      setTasks(demoTasks);
      setProofs(demoProofs);
      setBlocks(demoBlocks);
      setShelters(demoShelters);
      setSelectedId((prev) => prev ?? demoProofs[0]?.id ?? null);
      return;
    }

    const [p, t, tt, c, b, s] = await Promise.all([
      supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(400),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(600),
      supabase.from('task_templates').select('*').order('type', { ascending: true }),
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(800),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
    ]);

    const proofRows = (((p.data ?? []) as unknown) as ProofRow[]);
    setProofs(proofRows);
    setTasks((((t.data ?? []) as unknown) as TaskRow[]));
    setTemplates((((tt.data ?? []) as unknown) as TaskTemplateRow[]));
    setCases((((c.data ?? []) as unknown) as CaseRow[]));
    setBlocks((((b.data ?? []) as unknown) as Block[]));
    setShelters((((s.data ?? []) as unknown) as Shelter[]));

    setSelectedId((prev) => {
      if (prev && proofRows.some((row) => row.id === prev)) return prev;
      return proofRows[0]?.id ?? null;
    });
  }

  async function setStatus(proof: ProofRow, next: ProofVerificationStatus) {
    if (!supabase) {
      setProofs((prev) => prev.map((p) => (p.id === proof.id ? { ...p, verification_status: next } : p)));
      return;
    }
    setBusyId(proof.id);
    await supabase.from('proofs').update({ verification_status: next }).eq('id', proof.id);
    setBusyId(null);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_proofs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const selectedTask = selected ? taskById.get(selected.task_id) ?? null : null;
  const selectedTemplate = selectedTask?.template_id ? templateById.get(selectedTask.template_id) ?? null : null;
  const selectedCase = selectedTask?.case_id ? caseById.get(selectedTask.case_id) ?? null : null;
  const selectedBlock = selectedTask?.block_id ? blockById.get(selectedTask.block_id) ?? null : null;
  const selectedShelter = selectedTask?.shelter_id ? shelterById.get(selectedTask.shelter_id) ?? null : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-[var(--hairline)] bg-[var(--paper)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-[var(--muted)]" />
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Review queue</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">Evidence waiting for ops decision.</div>
                </div>
              </div>

              <Pill tone="paper" variant="soft">{filtered.length}</Pill>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ProofVerificationStatus)}
                className="h-10 rounded-[14px] border border-[var(--border)] bg-white/70 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]"
              >
                <option value="pending">Pending</option>
                <option value="needs_review">Needs review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[14px] border border-[var(--border)] bg-white/70 px-3">
                <Search size={15} className="text-[var(--muted)]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
            {filtered.map((p) => {
              const isSelected = p.id === selectedId;
              const t = taskById.get(p.task_id) ?? null;
              const tpl = t?.template_id ? templateById.get(t.template_id) ?? null : null;
              const c = t?.case_id ? caseById.get(t.case_id) ?? null : null;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={
                    'w-full px-4 py-3 text-left transition ' +
                    (isSelected ? 'bg-[var(--jungle-soft)]' : 'hover:bg-[var(--paper)]')
                  }
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-[var(--ink)]">{tpl?.title ?? 'Task proof'}</div>
                      <div className="mono mt-1 truncate text-[12px] font-bold text-[var(--ink2)]">{c?.external_id ?? 'Unlinked case'}</div>
                    </div>
                    <Pill tone={toneForProofStatus(p.verification_status)} variant="soft">
                      {p.verification_status.replace('_', ' ')}
                    </Pill>
                  </div>

                  <div className="mt-2 truncate text-xs font-semibold text-[var(--muted)]">{(p.note ?? '').slice(0, 88) || 'No note'}</div>
                  <div className="mt-1 text-xs font-semibold text-[var(--muted)]">{new Date(p.submitted_at).toLocaleString()}</div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No proofs match your filters.</div>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-5">
        {!selected ? (
          <div className="grid min-h-[420px] place-items-center">
            <div className="text-center">
              <div className="fredoka text-[18px] font-semibold">Select a proof</div>
              <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Review photo and note, then verify or reject.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Proof</div>
                <div className="mono mt-2 text-sm font-bold text-[var(--ink2)]">{selected.id}</div>
                <div className="mt-1 text-xs font-semibold text-[var(--muted)]">Submitted {new Date(selected.submitted_at).toLocaleString()}</div>
              </div>
              <Pill tone={toneForProofStatus(selected.verification_status)} variant="solid">
                {selected.verification_status.replace('_', ' ')}
              </Pill>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Pill tone="paper" variant="soft">{selectedTemplate?.title ?? 'Task'}</Pill>
              <Pill tone="paper" variant="soft">{selectedCase?.external_id ?? 'No case'}</Pill>
              <Pill tone="paper" variant="soft">{selectedBlock?.name ?? 'Unknown block'}</Pill>
              <Pill tone="paper" variant="soft">{selectedShelter?.name ?? 'Unassigned'}</Pill>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-4">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Photo</div>
                {selected.photo_uri ? (
                  <>
                    {isLikelyHttpUrl(selected.photo_uri) ? (
                      <img
                        src={selected.photo_uri}
                        alt="Proof photo"
                        className="mt-3 aspect-[16/10] w-full rounded-[16px] border border-[var(--border)] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="mt-2 rounded-[14px] border border-[var(--border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--muted)]">
                        {selected.photo_uri}
                      </div>
                    )}
                    {isLikelyHttpUrl(selected.photo_uri) && (
                      <a
                        className="mt-3 inline-block text-xs font-semibold text-[var(--ink2)] underline"
                        href={selected.photo_uri}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open original
                      </a>
                    )}
                  </>
                ) : (
                  <div className="mt-2 text-sm font-semibold text-[var(--muted)]">No photo attached.</div>
                )}
              </div>

              <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-4">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Note</div>
                <div className="mt-2 whitespace-pre-wrap text-sm font-semibold text-[var(--ink2)]">{selected.note || 'No note provided.'}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="danger"
                disabled={busyId === selected.id}
                onClick={() => setStatus(selected, 'rejected')}
                type="button"
              >
                <X size={16} />
                Reject
              </Button>
              <Button
                disabled={busyId === selected.id}
                onClick={() => setStatus(selected, 'verified')}
                type="button"
              >
                <Check size={16} />
                Verify
              </Button>
            </div>

            <div className="mt-3">
              <Button
                variant="paper"
                size="sm"
                disabled={busyId === selected.id}
                onClick={() => setStatus(selected, 'needs_review')}
                type="button"
              >
                Mark needs review
              </Button>
            </div>
          </>
        )}
        </Card>
      </div>
    </div>
  );
}

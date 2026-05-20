'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, Shelter } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { SetupCallout } from '@/components/SetupCallout';
import { Check, Filter, X } from 'lucide-react';

const demoCases: CaseRow[] = [
  {
    id: 'demo-1',
    external_id: 'SY-7421',
    citizen_id: null,
    block_id: null,
    shelter_id: null,
    category: 'rescue',
    severity: 'urgent',
    description: 'Dog trapped near market drain, needs urgent help.',
    location_text: 'Main Market, 1st cross',
    status: 'submitted',
    reject_reason_code: null,
    reject_reason_text: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    external_id: 'SY-1054',
    citizen_id: null,
    block_id: null,
    shelter_id: null,
    category: 'water',
    severity: 'today',
    description: 'Water station empty near park.',
    location_text: 'Park Street corner',
    status: 'under_review',
    reject_reason_code: null,
    reject_reason_text: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

const rejectReasons = [
  { code: 'duplicate_case', label: 'Duplicate case' },
  { code: 'out_of_block', label: 'Out of block' },
  { code: 'insufficient_detail', label: 'Insufficient detail' },
  { code: 'not_actionable', label: 'Not actionable' },
  { code: 'safety_risk', label: 'Safety risk' },
  { code: 'wrong_category', label: 'Wrong category' },
  { code: 'already_resolved', label: 'Already resolved' },
  { code: 'needs_more_info', label: 'Needs more info' },
  { code: 'other', label: 'Other' },
];

function toneForSeverity(sev: CaseRow['severity']) {
  if (sev === 'urgent') return 'coral' as const;
  if (sev === 'today') return 'gold' as const;
  return 'jungle' as const;
}

function toneForStatus(status: CaseRow['status']) {
  if (status === 'rejected') return 'coral' as const;
  if (status === 'resolved' || status === 'closed') return 'jungle' as const;
  if (status === 'accepted' || status === 'task_created' || status === 'assigned') return 'sky' as const;
  if (status === 'under_review') return 'gold' as const;
  return 'paper' as const;
}

export default function CasesPage() {
  const supabase = getSupabase();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | CaseRow['status']>('all');
  const [q, setQ] = useState('');

  const selected = useMemo(() => cases.find((c) => c.id === selectedId) ?? null, [cases, selectedId]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((s) => [s.id, s])), [shelters]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return cases.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!qq) return true;
      return (
        c.external_id.toLowerCase().includes(qq) ||
        c.category.toLowerCase().includes(qq) ||
        c.severity.toLowerCase().includes(qq) ||
        c.location_text.toLowerCase().includes(qq) ||
        c.description.toLowerCase().includes(qq)
      );
    });
  }, [cases, q, statusFilter]);

  async function load() {
    if (!supabase) {
      setCases(demoCases);
      return;
    }
    const [{ data: cData }, { data: bData }, { data: sData }] = await Promise.all([
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
    ]);
    setCases((cData as any) ?? []);
    setBlocks((bData as any) ?? []);
    setShelters((sData as any) ?? []);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'case_reviews' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function acceptCase(c: CaseRow) {
    if (!supabase) return;
    setBusyId(c.id);
    const { data: userData } = await supabase.auth.getUser();
    // Mark under_review immediately for clarity.
    if (c.status === 'submitted') {
      await supabase.from('cases').update({ status: 'under_review' }).eq('id', c.id);
    }
    await supabase.from('case_reviews').insert({
      case_id: c.id,
      reviewer_user_id: userData.user?.id ?? null,
      decision: 'accepted',
    });
    setBusyId(null);
  }

  async function rejectCase(c: CaseRow, payload: { fixed_reason_code: string; free_text_reason: string }) {
    if (!supabase) return;
    setBusyId(c.id);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('cases').update({
      status: 'rejected',
      reject_reason_code: payload.fixed_reason_code,
      reject_reason_text: payload.free_text_reason,
    }).eq('id', c.id);
    await supabase.from('case_reviews').insert({
      case_id: c.id,
      reviewer_user_id: userData.user?.id ?? null,
      decision: 'rejected',
      fixed_reason_code: payload.fixed_reason_code,
      free_text_reason: payload.free_text_reason,
    });
    setBusyId(null);
  }

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(rejectReasons[0]!.code);
  const [rejectText, setRejectText] = useState('');

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      {!supabase && <SetupCallout />}
      <Card className="p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Queue</div>
            <Pill tone="paper" variant="soft">{filtered.length} cases</Pill>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, location, notes…"
                className="h-11 w-full rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-4 text-sm font-semibold outline-none focus:border-[var(--jungle)] md:w-[280px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-[var(--muted)]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-11 rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]"
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under review</option>
                <option value="accepted">Accepted</option>
                <option value="task_created">Task created</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
          <div className="grid grid-cols-[120px_1fr_110px_110px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
            <div>Case</div>
            <div>Details</div>
            <div>Severity</div>
            <div>Status</div>
          </div>
          <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
            {filtered.map((c) => {
              const b = c.block_id ? blockById.get(c.block_id) : null;
              const s = c.shelter_id ? shelterById.get(c.shelter_id) : null;
              const isSelected = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={
                    'grid w-full grid-cols-[120px_1fr_110px_110px] gap-3 px-4 py-3 text-left transition ' +
                    (isSelected ? 'bg-[var(--jungle-soft)]' : 'hover:bg-[var(--paper)]')
                  }
                  type="button"
                >
                  <div>
                    <div className="mono text-[12px] font-bold text-[var(--ink)]">{c.external_id}</div>
                    <div className="mt-1 text-xs font-semibold text-[var(--muted)]">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-[var(--ink)]">{c.category.toUpperCase()}</div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-[var(--ink2)]">{c.location_text || 'No location'}</div>
                    <div className="mt-0.5 truncate text-xs font-semibold text-[var(--muted)]">{b?.name ?? 'Unknown block'}{s ? ` · ${s.name}` : ''}</div>
                  </div>
                  <div className="flex items-center justify-start">
                    <Pill tone={toneForSeverity(c.severity)} variant="soft">{c.severity}</Pill>
                  </div>
                  <div className="flex items-center justify-start">
                    <Pill tone={toneForStatus(c.status) as any} variant="soft">{c.status.replace('_', ' ')}</Pill>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No cases match your filters.</div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-5">
        {!selected ? (
          <div className="grid min-h-[320px] place-items-center">
            <div className="text-center">
              <div className="fredoka text-[18px] font-semibold">Select a case</div>
              <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Review details, then accept or reject.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mono text-sm font-bold">{selected.external_id}</div>
                <div className="mt-1 text-xs font-semibold text-[var(--muted)]">Created {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <Pill tone={toneForSeverity(selected.severity)} variant="solid">{selected.severity}</Pill>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-4">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Location</div>
                <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">{selected.location_text || 'Not provided'}</div>
              </div>
              <div className="rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-4">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Notes</div>
                <div className="mt-1 whitespace-pre-wrap text-sm font-semibold text-[var(--ink2)]">{selected.description || 'No additional notes.'}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="paper" variant="soft">{selected.category}</Pill>
                <Pill tone={toneForStatus(selected.status) as any} variant="soft">{selected.status.replace('_', ' ')}</Pill>
              </div>
            </div>

            {selected.status === 'rejected' && (
              <div className="mt-4 rounded-[18px] border border-[color-mix(in_srgb,var(--coral)_30%,transparent)] bg-[var(--coral-soft)] p-4">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--coral-deep)]">Rejected</div>
                <div className="mt-1 text-sm font-semibold text-[var(--coral-deep)]">
                  {selected.reject_reason_code ?? 'reason'}
                  {selected.reject_reason_text ? ` · ${selected.reject_reason_text}` : ''}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="danger"
                disabled={busyId === selected.id || selected.status !== 'submitted' && selected.status !== 'under_review'}
                onClick={() => {
                  setRejectOpen(true);
                  setRejectText('');
                  setRejectReason(rejectReasons[0]!.code);
                }}
              >
                <X size={16} />
                Reject
              </Button>
              <Button
                disabled={busyId === selected.id || selected.status === 'rejected' || selected.status === 'resolved' || selected.status === 'closed'}
                onClick={() => acceptCase(selected)}
              >
                <Check size={16} />
                {busyId === selected.id ? 'Working…' : 'Accept'}
              </Button>
            </div>

            {rejectOpen && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-10">
                <Card className="w-full max-w-lg p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="fredoka text-[20px] font-semibold">Reject case</div>
                      <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Choose a reason and add a note for audit.</div>
                    </div>
                    <button className="rounded-[12px] border border-[var(--hairline)] px-3 py-2 text-xs font-black tracking-widest uppercase" onClick={() => setRejectOpen(false)} type="button">Close</button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <label className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Fixed reason</label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="h-11 rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-3 text-sm font-bold outline-none focus:border-[var(--coral)]"
                    >
                      {rejectReasons.map((r) => (
                        <option key={r.code} value={r.code}>{r.label}</option>
                      ))}
                    </select>

                    <label className="mt-2 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Free text note</label>
                    <textarea
                      value={rejectText}
                      onChange={(e) => setRejectText(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-4 py-3 text-sm font-semibold outline-none focus:border-[var(--coral)]"
                      placeholder="Add context for why this was rejected…"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="ghost" onClick={() => setRejectOpen(false)} type="button">Cancel</Button>
                    <Button
                      variant="danger"
                      disabled={!rejectText.trim() || busyId === selected.id}
                      onClick={async () => {
                        await rejectCase(selected, { fixed_reason_code: rejectReason, free_text_reason: rejectText.trim() });
                        setRejectOpen(false);
                      }}
                      type="button"
                    >
                      Reject case
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

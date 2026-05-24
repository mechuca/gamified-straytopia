'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, Database, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { OperationalEventRow } from '@/lib/types';
import { demoCases, demoProofs, demoTasks } from '@/lib/demoData';

function label(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function demoEvents(): OperationalEventRow[] {
  const rows: OperationalEventRow[] = [];
  for (const c of demoCases.slice(0, 5)) {
    rows.push({
      id: `event-${c.id}`,
      actor_user_id: null,
      actor_role: 'demo',
      action: `cases.${c.status === 'submitted' ? 'insert' : 'update'}`,
      entity_table: 'cases',
      entity_id: c.id,
      case_id: c.id,
      task_id: null,
      proof_id: null,
      reason: c.reject_reason_text,
      before_state: null,
      after_state: { status: c.status, category: c.category, severity: c.severity },
      metadata: { status_to: c.status },
      created_at: c.updated_at,
    });
  }
  for (const t of demoTasks.slice(0, 4)) {
    rows.push({
      id: `event-${t.id}`,
      actor_user_id: null,
      actor_role: 'demo',
      action: `tasks.${t.status === 'queued' ? 'insert' : 'update'}`,
      entity_table: 'tasks',
      entity_id: t.id,
      case_id: t.case_id,
      task_id: t.id,
      proof_id: null,
      reason: null,
      before_state: null,
      after_state: { status: t.status, priority: t.priority },
      metadata: { status_to: t.status },
      created_at: t.updated_at,
    });
  }
  for (const p of demoProofs.slice(0, 3)) {
    rows.push({
      id: `event-${p.id}`,
      actor_user_id: null,
      actor_role: 'demo',
      action: `proofs.${p.verification_status === 'pending' ? 'insert' : 'update'}`,
      entity_table: 'proofs',
      entity_id: p.id,
      case_id: null,
      task_id: p.task_id,
      proof_id: p.id,
      reason: p.note,
      before_state: null,
      after_state: { verification_status: p.verification_status },
      metadata: { verification_status_to: p.verification_status },
      created_at: p.submitted_at,
    });
  }
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default function AuditPage() {
  const supabase = getSupabase();
  const [events, setEvents] = useState<OperationalEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);
      if (!supabase) {
        if (!mounted) return;
        setEvents(demoEvents());
        setLoading(false);
        setLastUpdated(new Date());
        return;
      }

      const { data, error: queryError } = await supabase
        .from('operational_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(120);

      if (!mounted) return;
      if (queryError) {
        setError(queryError.message);
        setEvents([]);
      } else {
        setEvents(((data ?? []) as unknown) as OperationalEventRow[]);
      }
      setLoading(false);
      setLastUpdated(new Date());
    }

    load();
    if (!supabase) return () => { mounted = false; };
    const channel = supabase
      .channel('hub_audit_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operational_events' }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const stats = useMemo(() => {
    const tables = new Set(events.map((event) => event.entity_table));
    const opsEvents = events.filter((event) => event.actor_role === 'ops').length;
    return { total: events.length, tables: tables.size, opsEvents };
  }, [events]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Events</div>
            <Clock3 size={17} className="text-[var(--muted)]" />
          </div>
          <div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{stats.total}</div>
          <div className="mt-2 text-sm font-semibold text-[var(--muted)]">Latest operational changes in this workspace.</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Tables</div>
            <Database size={17} className="text-[var(--muted)]" />
          </div>
          <div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{stats.tables}</div>
          <div className="mt-2 text-sm font-semibold text-[var(--muted)]">Cases, tasks, proofs, and reviews when migration 004 is applied.</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Freshness</div>
            <ShieldCheck size={17} className="text-[var(--muted)]" />
          </div>
          <div className="mt-4 text-sm font-black text-[var(--ink)]">{lastUpdated ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Not loaded'}</div>
          <div className="mt-2 text-sm font-semibold text-[var(--muted)]">Audit log updates by realtime when Supabase is connected.</div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-[var(--hairline)] bg-[var(--paper)] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Audit Trail</div>
            <div className="fredoka mt-1 text-[24px] font-semibold">Operational event ledger</div>
          </div>
          <Pill tone={error ? 'coral' : 'jungle'} variant="soft">{error ? 'Needs setup' : supabase ? 'Connected' : 'Demo ledger'}</Pill>
        </div>

        {error && (
          <div className="border-b border-[var(--hairline)] bg-[var(--gold-soft)] px-5 py-4 text-sm font-semibold text-[var(--gold-deep)]">
            Could not read `operational_events`. Apply migration 004 and ensure the current user has `ops` access. Error: {error}
          </div>
        )}

        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {loading ? (
            <div className="p-8 text-sm font-semibold text-[var(--muted)]">Loading audit events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="fredoka text-[20px] font-semibold">No audit events yet</div>
              <div className="mt-2 text-sm font-semibold text-[var(--muted)]">Once operators change cases, tasks, or proofs, events will appear here.</div>
            </div>
          ) : events.map((event) => {
            const statusTo = event.metadata?.status_to ?? event.metadata?.verification_status_to ?? event.metadata?.decision;
            return (
              <div key={event.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_180px_180px] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-black text-[var(--ink)]">{label(event.action)}</div>
                    <Pill tone="paper" variant="soft">{event.entity_table}</Pill>
                    {statusTo ? <Pill tone="sky" variant="soft">{String(statusTo).replace(/_/g, ' ')}</Pill> : null}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-[var(--muted)]">
                    {event.reason || event.entity_id || 'No reason captured'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[var(--ink2)]">{event.actor_role ?? 'system'}</div>
                <div className="mono text-xs font-bold text-[var(--muted)]">{new Date(event.created_at).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

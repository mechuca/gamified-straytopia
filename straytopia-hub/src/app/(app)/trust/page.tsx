'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { ActionStatus } from '@/components/ui/ActionStatus';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { ProofQualityScoreRow, TrustEventRow, TrustScoreRow } from '@/lib/types';

function toneForRisk(risk: TrustScoreRow['risk_level']) {
  if (risk === 'low') return 'jungle' as const;
  if (risk === 'watch') return 'gold' as const;
  if (risk === 'high') return 'coral' as const;
  return 'paper' as const;
}

export default function TrustPage() {
  const supabase = getSupabase();
  const [scores, setScores] = useState<TrustScoreRow[]>([]);
  const [events, setEvents] = useState<TrustEventRow[]>([]);
  const [proofScores, setProofScores] = useState<ProofQualityScoreRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  async function load() {
    if (!supabase) return;
    const [scoreRows, eventRows, qualityRows] = await Promise.all([
      supabase.from('trust_scores').select('*').order('score', { ascending: true }).limit(300),
      supabase.from('trust_events').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('proof_quality_scores').select('*').order('created_at', { ascending: false }).limit(300),
    ]);
    const firstError = [scoreRows.error, eventRows.error, qualityRows.error].find(Boolean);
    setError(firstError?.message ?? null);
    setScores(((scoreRows.data ?? []) as unknown) as TrustScoreRow[]);
    setEvents(((eventRows.data ?? []) as unknown) as TrustEventRow[]);
    setProofScores(((qualityRows.data ?? []) as unknown) as ProofQualityScoreRow[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_trust_systems')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trust_scores' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trust_events' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proof_quality_scores' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const avgScore = useMemo(() => scores.length ? Math.round(scores.reduce((sum, row) => sum + row.score, 0) / scores.length) : 0, [scores]);
  const watchCount = scores.filter((row) => row.risk_level === 'watch' || row.risk_level === 'high').length;
  const fraudWatch = proofScores.filter((row) => row.fraud_risk_score >= 60).length;

  async function recalculateTrust() {
    if (!supabase) return;
    setRecalculating(true);
    setActionMessage(null);
    try {
      const result = await supabase.rpc('recalculate_trust_scores');
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setError(null);
      setActionMessage(`${result.data ?? 0} trust snapshots recalculated.`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Trust recalculation failed. Try again.');
    } finally {
      setRecalculating(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Trust subjects" value={scores.length} tone="paper" />
        <Metric label="Average trust" value={avgScore} tone={avgScore >= 70 ? 'jungle' : avgScore >= 45 ? 'gold' : 'coral'} />
        <Metric label="Watch list" value={watchCount} tone={watchCount > 0 ? 'gold' : 'jungle'} />
        <Metric label="Proof fraud watch" value={fraudWatch} tone={fraudWatch > 0 ? 'coral' : 'jungle'} />
      </div>

      {error && <ActionStatus type="error">Run migrations 006 and 009 to enable trust activation workflows. {error}</ActionStatus>}
      {actionMessage && <ActionStatus type="success">{actionMessage}</ActionStatus>}

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Activation</div>
            <div className="fredoka mt-2 text-2xl font-semibold">Recalculate private operational trust</div>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">The first scoring pass uses completed tasks, blocked or cancelled work, and proof verification outcomes. Scores remain ops-only.</p>
          </div>
          <Button type="button" onClick={recalculateTrust} disabled={!supabase || recalculating}>{recalculating ? 'Recalculating...' : 'Recalculate trust'}</Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Trust Systems</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Explainable safety signals</div>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">Scores are operational aids, not public labels. Every score needs evidence.</p>
            </div>
            <Sparkles size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
            <div className="grid grid-cols-[1fr_110px_110px_110px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              <div>Subject</div><div>Score</div><div>Evidence</div><div>Risk</div>
            </div>
            <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
              {scores.map((score) => (
                <div key={score.id} className="grid grid-cols-[1fr_110px_110px_110px] items-center gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-[var(--ink)]">{score.subject_type}</div>
                    <div className="mono mt-0.5 truncate text-[12px] font-bold text-[var(--muted)]">{score.subject_id}</div>
                  </div>
                  <Pill tone={score.score >= 70 ? 'jungle' : score.score >= 45 ? 'gold' : 'coral'} variant="soft">{score.score}</Pill>
                  <Pill tone={score.evidence_score >= 70 ? 'jungle' : 'gold'} variant="soft">{score.evidence_score}</Pill>
                  <Pill tone={toneForRisk(score.risk_level)} variant="soft">{score.risk_level}</Pill>
                </div>
              ))}
              {scores.length === 0 && <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No trust snapshots yet. They should be generated from verified work, proof quality, and assignment history.</div>}
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Recent Trust Events</div>
                <div className="fredoka mt-2 text-2xl font-semibold">Why scores changed</div>
              </div>
              <ShieldCheck size={20} className="text-[var(--muted)]" />
            </div>
            <div className="mt-5 grid gap-3">
              {events.slice(0, 8).map((event) => (
                <div key={event.id} className="rounded-[18px] border border-[var(--border)] bg-white/62 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black text-[var(--ink)]">{event.event_type}</div>
                    <Pill tone={event.score_delta < 0 ? 'coral' : 'jungle'} variant="soft">{event.score_delta > 0 ? '+' : ''}{event.score_delta}</Pill>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[var(--muted)]">{event.subject_type} · {new Date(event.created_at).toLocaleString()}</div>
                  {event.reason && <div className="mt-2 text-sm font-semibold text-[var(--ink2)]">{event.reason}</div>}
                </div>
              ))}
              {events.length === 0 && <div className="text-sm font-semibold text-[var(--muted)]">No trust events yet.</div>}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--gold-soft)] text-[var(--gold-deep)]"><TriangleAlert size={18} /></div>
              <div>
                <div className="text-sm font-black text-[var(--ink)]">Humane trust rule</div>
                <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">Do not expose trust scores publicly. Use them to route safer assignments, flag proof review, and support coaching before penalties.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'paper' | 'jungle' | 'gold' | 'coral' }) {
  return <Card className="p-5"><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div><div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{value}</div><div className="mt-3"><Pill tone={tone} variant="soft">now</Pill></div></Card>;
}

'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, TrendingUp, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { AreaForecastRow, Block } from '@/lib/types';

function forecastLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function riskTone(score: number) {
  if (score >= 70) return 'coral' as const;
  if (score >= 35) return 'gold' as const;
  return 'jungle' as const;
}

export default function ForecastsPage() {
  const supabase = getSupabase();
  const [forecasts, setForecasts] = useState<AreaForecastRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const [forecastRows, blockRows] = await Promise.all([
      supabase.from('area_forecasts').select('*').order('risk_score', { ascending: false }).order('created_at', { ascending: false }).limit(300),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
    ]);
    setError(forecastRows.error?.message ?? null);
    setForecasts(((forecastRows.data ?? []) as unknown) as AreaForecastRow[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_area_forecasts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'area_forecasts' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function generateForecasts() {
    if (!supabase) return;
    setGenerating(true);
    const result = await supabase.rpc('generate_area_forecasts', { p_window_hours: 72 });
    setGenerating(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setLastGenerated(`${result.data ?? 0} forecasts generated`);
    await load();
  }

  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const highRisk = forecasts.filter((forecast) => forecast.risk_score >= 70).length;
  const topForecast = forecasts[0] ?? null;

  return (
    <div className="grid gap-6">
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Predictive Intelligence</div>
            <div className="fredoka mt-2 text-[32px] font-semibold leading-tight">Transparent risk forecasts, not black-box city surveillance.</div>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[var(--muted)]">Forecasts are generated from current operational rows by block. They should trigger human review, not automated punishment or public scoring.</p>
          </div>
          <Button onClick={generateForecasts} disabled={!supabase || generating} type="button">
            <WandSparkles size={16} />
            {generating ? 'Generating...' : 'Generate forecasts'}
          </Button>
        </div>
        {lastGenerated && <div className="mt-4"><Pill tone="jungle" variant="soft">{lastGenerated}</Pill></div>}
        {error && <div className="mt-4 rounded-[16px] border border-[color-mix(in_srgb,var(--coral)_28%,transparent)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-bold text-[var(--coral-deep)]">Run migrations 006 and 008 to enable forecast generation. {error}</div>}
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Forecast rows" value={forecasts.length} tone="paper" />
        <Metric label="High risk" value={highRisk} tone={highRisk > 0 ? 'coral' : 'jungle'} />
        <Metric label="Top signal" value={topForecast?.risk_score ?? 0} tone={topForecast ? riskTone(topForecast.risk_score) : 'paper'} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Forecast Queue</div><div className="fredoka mt-2 text-2xl font-semibold">Human review triggers</div></div>
          <TrendingUp size={20} className="text-[var(--muted)]" />
        </div>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
          <div className="grid grid-cols-[1fr_160px_120px_140px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]"><div>Block and action</div><div>Type</div><div>Risk</div><div>Confidence</div></div>
          <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
            {forecasts.map((forecast) => (
              <div key={forecast.id} className="grid grid-cols-[1fr_160px_120px_140px] items-center gap-3 px-4 py-3">
                <div className="min-w-0"><div className="text-sm font-black text-[var(--ink)]">{blockById.get(forecast.block_id ?? '')?.name ?? 'Unknown block'}</div><div className="mt-1 text-xs font-semibold leading-5 text-[var(--muted)]">{forecast.recommended_action}</div></div>
                <Pill tone="paper" variant="soft">{forecastLabel(forecast.forecast_type)}</Pill>
                <Pill tone={riskTone(forecast.risk_score)} variant="soft">{forecast.risk_score}</Pill>
                <Pill tone={forecast.confidence === 'high' ? 'coral' : forecast.confidence === 'medium' ? 'gold' : 'paper'} variant="soft">{forecast.confidence}</Pill>
              </div>
            ))}
            {forecasts.length === 0 && <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No forecasts generated yet. Run the generator after migrations are applied.</div>}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--plum-soft)] text-[var(--ink)]"><BrainCircuit size={18} /></div>
          <div><div className="text-sm font-black text-[var(--ink)]">Forecast ethics</div><div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">This is rule-based operational forecasting. Keep it explainable, reversible, and focused on care capacity, not surveillance.</div></div>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'paper' | 'jungle' | 'gold' | 'coral' }) {
  return <Card className="p-5"><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div><div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{value}</div><div className="mt-3"><Pill tone={tone} variant="soft">now</Pill></div></Card>;
}

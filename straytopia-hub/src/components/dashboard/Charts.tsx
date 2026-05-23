import { clsx } from 'clsx';
import type { TrendPoint } from '@/lib/opsAnalytics';

function chartPath(points: TrendPoint[], width: number, height: number, padding = 10) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : width - padding * 2;
  return points
    .map((point, index) => {
      const x = padding + index * step;
      const y = height - padding - (point.value / max) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function LineChart({ points, label, tone = 'jungle' }: { points: TrendPoint[]; label: string; tone?: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' }) {
  const width = 360;
  const height = 140;
  const path = chartPath(points, width, height);
  const area = `${path} L ${width - 10} ${height - 10} L 10 ${height - 10} Z`;

  return (
    <div role="img" aria-label={label} className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[140px] w-full overflow-visible">
        <defs>
          <linearGradient id={`${tone}-area`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`var(--${tone})`} stopOpacity="0.28" />
            <stop offset="100%" stopColor={`var(--${tone})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line key={ratio} x1="10" x2="350" y1={height * ratio} y2={height * ratio} stroke="var(--hairline)" strokeDasharray="4 6" />
        ))}
        <path d={area} fill={`url(#${tone}-area)`} />
        <path d={path} fill="none" stroke={`var(--${tone})`} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {points.map((point, index) => {
          const max = Math.max(1, ...points.map((p) => p.value));
          const x = 10 + index * ((width - 20) / Math.max(1, points.length - 1));
          const y = height - 10 - (point.value / max) * (height - 20);
          return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="3.5" fill="var(--card-solid)" stroke={`var(--${tone})`} strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
        {points.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  );
}

export function BarChart({ points, label, tone = 'sky' }: { points: TrendPoint[]; label: string; tone?: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <div role="img" aria-label={label} className="grid h-[154px] grid-cols-7 items-end gap-2 pt-4">
      {points.map((point) => (
        <div key={point.label} className="flex min-w-0 flex-col items-center gap-2">
          <div className="relative flex h-[110px] w-full items-end overflow-hidden rounded-full bg-[var(--paper2)] ring-1 ring-[var(--hairline)]">
            <div
              className="w-full rounded-full"
              style={{ height: point.value === 0 ? '0%' : `${Math.max(8, (point.value / max) * 100)}%`, background: `linear-gradient(180deg, var(--${tone}) 0%, color-mix(in_srgb, var(--${tone}) 58%, transparent) 100%)` }}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export function RadialProgress({ value, label, tone = 'jungle' }: { value: number; label: string; tone?: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-4" role="img" aria-label={`${label}: ${safeValue}%`}>
      <div
        className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(var(--${tone}) ${safeValue * 3.6}deg, var(--paper2) 0deg)` }}
      >
        <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[var(--card-solid)] ring-1 ring-[var(--hairline)]">
          <span className="mono text-xl font-black text-[var(--ink)]">{safeValue}%</span>
        </div>
      </div>
      <div>
        <div className="text-sm font-black text-[var(--ink)]">{label}</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-[var(--muted)]">Operational target is 80% or better.</div>
      </div>
    </div>
  );
}

export function HeatmapGrid({ values, label }: { values: Array<{ label: string; value: number }>; label: string }) {
  return (
    <div role="img" aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {values.map((item) => (
        <div
          key={item.label}
          className={clsx(
            'rounded-[18px] border p-4 transition',
            item.value >= 70 ? 'border-[color-mix(in_srgb,var(--coral)_28%,transparent)] bg-[var(--coral-soft)]' : item.value >= 35 ? 'border-[color-mix(in_srgb,var(--gold)_32%,transparent)] bg-[var(--gold-soft)]' : 'border-[var(--border)] bg-white/62'
          )}
        >
          <div className="mono text-2xl font-black text-[var(--ink)]">{item.value}</div>
          <div className="mt-2 text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

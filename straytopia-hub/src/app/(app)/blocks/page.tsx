'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { demoBlocks, demoCases } from '@/lib/demoData';

export default function BlocksPage() {
  const supabase = getSupabase();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);

  async function load() {
    if (!supabase) {
      setBlocks(demoBlocks);
      setCases(demoCases);
      return;
    }
    const [b, c] = await Promise.all([
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('cases').select('id,block_id,status').order('created_at', { ascending: false }).limit(400),
    ]);
    setBlocks(((b.data ?? []) as unknown) as Block[]);
    setCases(((c.data ?? []) as unknown) as CaseRow[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_blocks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const countsByBlock = useMemo(() => {
    const map = new Map<string, { total: number; open: number; resolved: number }>();
    for (const c of cases) {
      if (!c.block_id) continue;
      const cur = map.get(c.block_id) ?? { total: 0, open: 0, resolved: 0 };
      cur.total += 1;
      if (c.status === 'resolved' || c.status === 'closed') cur.resolved += 1;
      else if (c.status !== 'rejected') cur.open += 1;
      map.set(c.block_id, cur);
    }
    return map;
  }, [cases]);

  return (
    <Card className="p-4 md:p-5">
      <div className="overflow-hidden rounded-[20px] border border-[var(--hairline)]">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
          <div>Block</div>
          <div>Total</div>
          <div>Open</div>
          <div>Resolved</div>
        </div>
        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {blocks.map((b) => {
            const c = countsByBlock.get(b.id) ?? { total: 0, open: 0, resolved: 0 };
            return (
              <div key={b.id} className="grid grid-cols-[1fr_120px_120px_120px] gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-extrabold text-[var(--ink)]">{b.name}</div>
                  <div className="mono mt-0.5 text-[12px] font-bold text-[var(--muted)]">{b.code}</div>
                </div>
                <div className="mono text-[14px] font-bold">{c.total}</div>
                <div><Pill tone={c.open > 0 ? 'gold' : 'paper'} variant="soft">{c.open}</Pill></div>
                <div><Pill tone={c.resolved > 0 ? 'jungle' : 'paper'} variant="soft">{c.resolved}</Pill></div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No blocks configured.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

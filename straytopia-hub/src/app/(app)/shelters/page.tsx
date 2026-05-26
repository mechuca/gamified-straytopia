'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, Shelter } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { demoBlocks, demoShelters } from '@/lib/demoData';

export default function SheltersPage() {
  const supabase = getSupabase();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  async function load() {
    if (!supabase) {
      setShelters(demoShelters);
      setBlocks(demoBlocks);
      return;
    }
    const [shelterRows, blockRows] = await Promise.all([
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
    ]);
    setShelters(((shelterRows.data ?? []) as unknown) as Shelter[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_shelters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocks' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);

  return (
    <Card className="p-4 md:p-5">
      <div className="overflow-hidden rounded-[20px] border border-[var(--hairline)]">
        <div className="grid grid-cols-[1fr_180px_140px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
          <div>Shelter</div>
          <div>Coverage</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {shelters.map((s) => {
            const block = s.block_id ? blockById.get(s.block_id) : null;
            return (
              <div key={s.id} className="grid grid-cols-[1fr_180px_140px] gap-3 px-4 py-3">
                <div className="text-sm font-extrabold text-[var(--ink)]">{s.name}</div>
                <div className="text-xs font-semibold text-[var(--muted)]">{block?.name ?? 'Citywide'}</div>
                <div>
                  <Pill tone={s.status === 'active' ? 'jungle' : s.status === 'limited' ? 'gold' : 'paper'} variant="soft">{s.status}</Pill>
                </div>
              </div>
            );
          })}
          {shelters.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No shelters yet.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

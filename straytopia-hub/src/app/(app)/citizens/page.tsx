'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import type { Block } from '@/lib/types';
import { demoBlocks, demoCitizens } from '@/lib/demoData';

type CitizenRow = {
  id: string;
  device_id: string;
  block_id?: string | null;
  created_at: string;
};

export default function CitizensPage() {
  const supabase = getSupabase();
  const [citizens, setCitizens] = useState<CitizenRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  async function load() {
    if (!supabase) {
      setCitizens(demoCitizens);
      setBlocks(demoBlocks);
      return;
    }
    const [citizenRows, blockRows] = await Promise.all([
      supabase.from('citizens').select('id,device_id,block_id,created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
    ]);
    setCitizens(((citizenRows.data ?? []) as unknown) as CitizenRow[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_citizens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, () => load())
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
        <div className="grid grid-cols-[1fr_180px_220px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
          <div>Device</div>
          <div>Block</div>
          <div>Joined</div>
        </div>
        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {citizens.map((c) => {
            const block = c.block_id ? blockById.get(c.block_id) : null;
            return (
              <div key={c.id} className="grid grid-cols-[1fr_180px_220px] gap-3 px-4 py-3">
                <div className="mono truncate text-[12px] font-bold text-[var(--ink2)]">{c.device_id}</div>
                <div className="text-xs font-semibold text-[var(--muted)]">{block?.name ?? 'Unknown'}</div>
                <div className="text-xs font-semibold text-[var(--muted)]">{new Date(c.created_at).toLocaleString()}</div>
              </div>
            );
          })}
          {citizens.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No citizens synced yet.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

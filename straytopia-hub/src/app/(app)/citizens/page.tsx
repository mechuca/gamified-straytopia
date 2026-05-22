'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
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

  async function load() {
    if (!supabase) {
      setCitizens(demoCitizens);
      return;
    }
    const { data } = await supabase.from('citizens').select('id,device_id,created_at').order('created_at', { ascending: false }).limit(200);
    setCitizens(((data ?? []) as unknown) as CitizenRow[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_citizens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
            const block = demoBlocks.find((b) => b.id === c.block_id);
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

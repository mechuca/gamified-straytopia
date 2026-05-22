'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Shelter } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';

export default function SheltersPage() {
  const supabase = getSupabase();
  const [shelters, setShelters] = useState<Shelter[]>([]);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true });
    setShelters(((data ?? []) as unknown) as Shelter[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_shelters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="p-4 md:p-5">
      <div className="overflow-hidden rounded-[20px] border border-[var(--hairline)]">
        <div className="grid grid-cols-[1fr_140px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">
          <div>Shelter</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
          {shelters.map((s) => (
            <div key={s.id} className="grid grid-cols-[1fr_140px] gap-3 px-4 py-3">
              <div className="text-sm font-extrabold text-[var(--ink)]">{s.name}</div>
              <div>
                <Pill tone={s.status === 'active' ? 'jungle' : s.status === 'limited' ? 'gold' : 'paper'} variant="soft">{s.status}</Pill>
              </div>
            </div>
          ))}
          {shelters.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No shelters yet.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

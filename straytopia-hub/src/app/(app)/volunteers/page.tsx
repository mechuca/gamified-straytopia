'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { BatteryMedium, MapPinned, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CitizenRow, TaskAssignmentRow, TaskRow, TrustScoreRow, VolunteerProfileRow } from '@/lib/types';
import { demoBlocks, demoCitizens, demoTasks } from '@/lib/demoData';

function statusTone(status: VolunteerProfileRow['status']) {
  if (status === 'active') return 'jungle' as const;
  if (status === 'paused' || status === 'pending') return 'gold' as const;
  return 'coral' as const;
}

export default function VolunteersPage() {
  const supabase = getSupabase();
  const [profiles, setProfiles] = useState<VolunteerProfileRow[]>([]);
  const [citizens, setCitizens] = useState<CitizenRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignmentRow[]>([]);
  const [trustScores, setTrustScores] = useState<TrustScoreRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState(false);

  async function load() {
    if (!supabase) {
      setCitizens(demoCitizens);
      setTasks(demoTasks);
      setBlocks(demoBlocks);
      return;
    }
    const [profileRows, citizenRows, taskRows, assignmentRows, scoreRows, blockRows] = await Promise.all([
      supabase.from('volunteer_profiles').select('*').order('updated_at', { ascending: false }).limit(300),
      supabase.from('citizens').select('id,device_id,block_id,created_at,user_id').order('created_at', { ascending: false }).limit(500),
      supabase.from('tasks').select('*').eq('assigned_to_type', 'citizen').order('created_at', { ascending: false }).limit(500),
      supabase.from('task_assignments').select('*').in('assigned_to_type', ['citizen', 'volunteer']).order('created_at', { ascending: false }).limit(500),
      supabase.from('trust_scores').select('*').in('subject_type', ['citizen', 'volunteer', 'device']).order('score', { ascending: true }).limit(500),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
    ]);
    const firstError = [profileRows.error, assignmentRows.error, scoreRows.error].find(Boolean);
    setError(firstError?.message ?? null);
    setProfiles(((profileRows.data ?? []) as unknown) as VolunteerProfileRow[]);
    setCitizens(((citizenRows.data ?? []) as unknown) as CitizenRow[]);
    setTasks(((taskRows.data ?? []) as unknown) as TaskRow[]);
    setAssignments(((assignmentRows.data ?? []) as unknown) as TaskAssignmentRow[]);
    setTrustScores(((scoreRows.data ?? []) as unknown) as TrustScoreRow[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_volunteer_intelligence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteer_profiles' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignments' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const trustBySubject = useMemo(() => new Map(trustScores.map((score) => [`${score.subject_type}:${score.subject_id}`, score])), [trustScores]);
  const activeTaskDevices = new Set(tasks.filter((task) => !['completed', 'cancelled'].includes(task.status)).map((task) => task.assigned_to_id).filter(Boolean));
  const completedAssignments = assignments.filter((row) => row.status === 'completed').length;
  const declinedAssignments = assignments.filter((row) => row.status === 'declined' || row.status === 'expired').length;
  const reliability = assignments.length ? Math.round((completedAssignments / Math.max(1, completedAssignments + declinedAssignments)) * 100) : 0;

  async function onboardVolunteers() {
    if (!supabase) return;
    setOnboarding(true);
    setActionMessage(null);
    const result = await supabase.rpc('onboard_citizen_volunteers');
    setOnboarding(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setError(null);
    setActionMessage(`${result.data ?? 0} volunteer profiles created from citizen devices.`);
    await load();
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Volunteer profiles" value={profiles.length} tone="paper" />
        <Metric label="Citizen devices" value={citizens.length} tone="sky" />
        <Metric label="Active mobile work" value={activeTaskDevices.size} tone={activeTaskDevices.size > 0 ? 'gold' : 'jungle'} />
        <Metric label="Assignment reliability" value={reliability} tone={reliability >= 70 ? 'jungle' : reliability > 0 ? 'gold' : 'paper'} suffix="%" />
      </div>

      {error && <Card className="p-4 text-sm font-bold text-[var(--coral-deep)]">Run migration 006 to enable volunteer intelligence tables. {error}</Card>}
      {actionMessage && <Card className="p-4 text-sm font-bold text-[var(--jungle-deep)]">{actionMessage}</Card>}

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Activation</div>
            <div className="fredoka mt-2 text-2xl font-semibold">Create volunteer profiles from synced citizen devices</div>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">Profiles start pending so ops can review locality, availability, and safety before assigning higher-trust work.</p>
          </div>
          <Button type="button" onClick={onboardVolunteers} disabled={!supabase || onboarding}>{onboarding ? 'Onboarding...' : 'Onboard volunteers'}</Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Volunteer Intelligence</div><div className="fredoka mt-2 text-2xl font-semibold">Readiness beyond device IDs</div></div>
            <Users size={20} className="text-[var(--muted)]" />
          </div>
          <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
            <div className="grid grid-cols-[1fr_120px_120px_130px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]"><div>Volunteer</div><div>Status</div><div>Locality</div><div>Trust</div></div>
            <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
              {profiles.map((profile) => {
                const trust = trustBySubject.get(`volunteer:${profile.id}`) ?? (profile.citizen_id ? trustBySubject.get(`citizen:${profile.citizen_id}`) : undefined);
                return (
                  <div key={profile.id} className="grid grid-cols-[1fr_120px_120px_130px] items-center gap-3 px-4 py-3">
                    <div className="min-w-0"><div className="truncate text-sm font-black text-[var(--ink)]">{profile.skills.join(', ') || 'General helper'}</div><div className="mono mt-0.5 truncate text-[12px] font-bold text-[var(--muted)]">{profile.citizen_id ?? profile.id}</div></div>
                    <Pill tone={statusTone(profile.status)} variant="soft">{profile.status}</Pill>
                    <div className="text-xs font-bold text-[var(--muted)]">{blockById.get(profile.home_block_id ?? '')?.name ?? 'Unknown'}</div>
                    <Pill tone={(trust?.score ?? 0) >= 70 ? 'jungle' : trust ? 'gold' : 'paper'} variant="soft">{trust?.score ?? 'no score'}</Pill>
                  </div>
                );
              })}
              {profiles.length === 0 && <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No volunteer profiles yet. Current assignments still work through citizen device IDs.</div>}
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <InsightCard icon={<MapPinned size={18} />} title="Locality Participation" body={`${activeTaskDevices.size} device-bound helpers currently have active work. Add home blocks and service radius to improve trust-weighted dispatch.`} />
          <InsightCard icon={<BatteryMedium size={18} />} title="Burnout Watch" body="Burnout should be derived from repeated assignments, declined work, late proofs, and long active streaks. The data model is ready once assignments are consistently written." />
          <InsightCard icon={<ShieldCheck size={18} />} title="Trusted Helper Scoring" body="Scores must come from verified evidence, completed assignment history, and safety events. Never expose scores as public badges." />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone, suffix = '' }: { label: string; value: number; tone: 'paper' | 'jungle' | 'gold' | 'sky'; suffix?: string }) {
  return <Card className="p-5"><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div><div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{value}{suffix}</div><div className="mt-3"><Pill tone={tone} variant="soft">now</Pill></div></Card>;
}

function InsightCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <Card className="p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--sky-soft)] text-[var(--ink)]">{icon}</div><div><div className="text-sm font-black text-[var(--ink)]">{title}</div><div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">{body}</div></div></div></Card>;
}

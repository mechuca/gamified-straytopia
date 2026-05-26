'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { Ambulance, Handshake, Hospital, Stethoscope } from 'lucide-react';
import { ActionStatus } from '@/components/ui/ActionStatus';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, OrganizationCapabilityRow, OrganizationCapacitySnapshotRow, OrganizationProfileRow, Shelter, TrustScoreRow } from '@/lib/types';
import { demoBlocks, demoShelters } from '@/lib/demoData';

function orgTone(status: OrganizationProfileRow['status']) {
  if (status === 'active') return 'jungle' as const;
  if (status === 'limited' || status === 'pending') return 'gold' as const;
  return 'coral' as const;
}

export default function PartnersPage() {
  const supabase = getSupabase();
  const [organizations, setOrganizations] = useState<OrganizationProfileRow[]>([]);
  const [capabilities, setCapabilities] = useState<OrganizationCapabilityRow[]>([]);
  const [capacity, setCapacity] = useState<OrganizationCapacitySnapshotRow[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [trustScores, setTrustScores] = useState<TrustScoreRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [capacityOrgId, setCapacityOrgId] = useState('');
  const [capacityTotal, setCapacityTotal] = useState('');
  const [capacityAvailable, setCapacityAvailable] = useState('');
  const [emergencySlots, setEmergencySlots] = useState('');
  const [intakeStatus, setIntakeStatus] = useState<OrganizationCapacitySnapshotRow['intake_status']>('unknown');
  const [capacityNote, setCapacityNote] = useState('');

  async function load() {
    if (!supabase) {
      setShelters(demoShelters);
      setBlocks(demoBlocks);
      return;
    }
    const [orgRows, capRows, capacityRows, shelterRows, blockRows, scoreRows] = await Promise.all([
      supabase.from('organization_profiles').select('*').order('updated_at', { ascending: false }).limit(300),
      supabase.from('organization_capabilities').select('*').order('updated_at', { ascending: false }).limit(800),
      supabase.from('organization_capacity_snapshots').select('*').order('captured_at', { ascending: false }).limit(800),
      supabase.from('shelters').select('*').order('name', { ascending: true }).limit(300),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('trust_scores').select('*').in('subject_type', ['shelter', 'organization']).limit(500),
    ]);
    const firstError = [orgRows.error, capRows.error, capacityRows.error, scoreRows.error].find(Boolean);
    setError(firstError?.message ?? null);
    setOrganizations(((orgRows.data ?? []) as unknown) as OrganizationProfileRow[]);
    setCapabilities(((capRows.data ?? []) as unknown) as OrganizationCapabilityRow[]);
    setCapacity(((capacityRows.data ?? []) as unknown) as OrganizationCapacitySnapshotRow[]);
    setShelters(((shelterRows.data ?? []) as unknown) as Shelter[]);
    setBlocks(((blockRows.data ?? []) as unknown) as Block[]);
    setTrustScores(((scoreRows.data ?? []) as unknown) as TrustScoreRow[]);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_partner_intelligence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_profiles' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_capacity_snapshots' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_capabilities' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const blockById = useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const trustBySubject = useMemo(() => new Map(trustScores.map((score) => [`${score.subject_type}:${score.subject_id}`, score])), [trustScores]);
  const latestCapacity = useMemo(() => {
    const rows = new Map<string, OrganizationCapacitySnapshotRow>();
    for (const snapshot of capacity) if (!rows.has(snapshot.organization_id)) rows.set(snapshot.organization_id, snapshot);
    return rows;
  }, [capacity]);
  const activePartners = organizations.filter((org) => org.status === 'active').length;
  const emergencyReady = organizations.filter((org) => org.emergency_ready).length;
  const openIntake = capacity.filter((row) => row.intake_status === 'open').length;

  async function onboardOrganizations() {
    if (!supabase) return;
    setBusyAction('onboard-orgs');
    setActionMessage(null);
    try {
      const result = await supabase.rpc('onboard_shelter_organizations');
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setError(null);
      setActionMessage(`${result.data ?? 0} organization profiles created from shelters.`);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Organization onboarding failed. Try again.');
    } finally {
      setBusyAction(null);
    }
  }

  async function recordCapacity() {
    if (!supabase || !capacityOrgId) return;
    setBusyAction('capacity');
    setActionMessage(null);
    try {
      const result = await supabase.rpc('record_organization_capacity_snapshot', {
        p_organization_id: capacityOrgId,
        p_capacity_total: capacityTotal ? Number(capacityTotal) : null,
        p_capacity_available: capacityAvailable ? Number(capacityAvailable) : null,
        p_emergency_slots_available: emergencySlots ? Number(emergencySlots) : null,
        p_intake_status: intakeStatus,
        p_note: capacityNote,
      });
      if (result.error) {
        setError(result.error.message);
        return;
      }
      setError(null);
      setActionMessage('Capacity snapshot recorded.');
      setCapacityTotal('');
      setCapacityAvailable('');
      setEmergencySlots('');
      setCapacityNote('');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Capacity update failed. Try again.');
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Organizations" value={organizations.length || shelters.length} tone="paper" />
        <Metric label="Active partners" value={activePartners} tone="jungle" />
        <Metric label="Emergency ready" value={emergencyReady} tone={emergencyReady > 0 ? 'coral' : 'paper'} />
        <Metric label="Open intake snapshots" value={openIntake} tone={openIntake > 0 ? 'sky' : 'gold'} />
      </div>

      {error && <ActionStatus type="error">Run migrations 006 and 009 to enable partner activation workflows. {error}</ActionStatus>}
      {actionMessage && <ActionStatus type="success">{actionMessage}</ActionStatus>}

      <Card className="p-5">
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Activation</div>
              <div className="fredoka mt-2 text-2xl font-semibold">Onboard partners and update live capacity</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">Shelters become organization profiles first, then capacity snapshots keep dispatch decisions grounded in current reality.</p>
            </div>
            <Button type="button" onClick={onboardOrganizations} disabled={!supabase || busyAction === 'onboard-orgs'}>{busyAction === 'onboard-orgs' ? 'Onboarding...' : 'Onboard shelters'}</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <select value={capacityOrgId} onChange={(event) => setCapacityOrgId(event.target.value)} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)] md:col-span-3">
              <option value="">Select organization</option>
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
            <input value={capacityTotal} onChange={(event) => setCapacityTotal(event.target.value)} inputMode="numeric" placeholder="Total slots" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]" />
            <input value={capacityAvailable} onChange={(event) => setCapacityAvailable(event.target.value)} inputMode="numeric" placeholder="Available" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]" />
            <input value={emergencySlots} onChange={(event) => setEmergencySlots(event.target.value)} inputMode="numeric" placeholder="Emergency" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]" />
            <select value={intakeStatus} onChange={(event) => setIntakeStatus(event.target.value as OrganizationCapacitySnapshotRow['intake_status'])} className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)]">
              <option value="unknown">Unknown</option>
              <option value="open">Open</option>
              <option value="limited">Limited</option>
              <option value="closed">Closed</option>
            </select>
            <input value={capacityNote} onChange={(event) => setCapacityNote(event.target.value)} placeholder="Capacity note" className="h-11 rounded-[14px] border border-[var(--hairline2)] bg-white/75 px-3 text-sm font-bold outline-none focus:border-[var(--jungle)] md:col-span-2" />
            <Button type="button" variant="paper" onClick={recordCapacity} disabled={!supabase || !capacityOrgId || busyAction === 'capacity'} className="md:col-span-3">{busyAction === 'capacity' ? 'Recording...' : 'Record capacity snapshot'}</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">NGO Intelligence</div><div className="fredoka mt-2 text-2xl font-semibold">Capacity, capability, and reliability</div></div>
          <Handshake size={20} className="text-[var(--muted)]" />
        </div>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-[var(--hairline)]">
          <div className="grid grid-cols-[1fr_130px_130px_130px_110px] gap-3 bg-[var(--paper2)] px-4 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--muted)]"><div>Partner</div><div>Status</div><div>Block</div><div>Intake</div><div>Trust</div></div>
          <div className="divide-y divide-[var(--hairline)] bg-[var(--surface)]">
            {organizations.map((org) => {
              const snapshot = latestCapacity.get(org.id);
              const trust = trustBySubject.get(`organization:${org.id}`) ?? (org.shelter_id ? trustBySubject.get(`shelter:${org.shelter_id}`) : undefined);
              return (
                <div key={org.id} className="grid grid-cols-[1fr_130px_130px_130px_110px] items-center gap-3 px-4 py-3">
                  <div className="min-w-0"><div className="truncate text-sm font-black text-[var(--ink)]">{org.name}</div><div className="mt-1 flex flex-wrap gap-1">{capabilities.filter((cap) => cap.organization_id === org.id).slice(0, 3).map((cap) => <Pill key={cap.id} tone={cap.level === 'advanced' ? 'jungle' : cap.level === 'unavailable' ? 'coral' : 'paper'} variant="soft">{cap.capability}</Pill>)}</div></div>
                  <Pill tone={orgTone(org.status)} variant="soft">{org.status}</Pill>
                  <div className="text-xs font-bold text-[var(--muted)]">{blockById.get(org.primary_block_id ?? '')?.name ?? 'Citywide'}</div>
                  <Pill tone={snapshot?.intake_status === 'open' ? 'jungle' : snapshot?.intake_status === 'limited' ? 'gold' : snapshot ? 'coral' : 'paper'} variant="soft">{snapshot?.intake_status ?? 'unknown'}</Pill>
                  <Pill tone={(trust?.score ?? 0) >= 70 ? 'jungle' : trust ? 'gold' : 'paper'} variant="soft">{trust?.score ?? 'no score'}</Pill>
                </div>
              );
            })}
            {organizations.length === 0 && <div className="px-4 py-10 text-center text-sm font-semibold text-[var(--muted)]">No organization profiles yet. Existing shelters remain visible on Shelter Coordination until partners are onboarded.</div>}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Note icon={<Hospital size={18} />} title="Intake capacity" body="Use capacity snapshots to avoid routing animals to full shelters." />
        <Note icon={<Stethoscope size={18} />} title="Medical capability" body="Medical and isolation capabilities should drive injured/sick case assignment." />
        <Note icon={<Ambulance size={18} />} title="Emergency readiness" body="Emergency-ready partners should be visible before escalation pressure rises." />
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'paper' | 'jungle' | 'gold' | 'sky' | 'coral' }) {
  return <Card className="p-5"><div className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</div><div className="mono mt-4 text-[32px] font-black text-[var(--ink)]">{value}</div><div className="mt-3"><Pill tone={tone} variant="soft">now</Pill></div></Card>;
}

function Note({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <Card className="p-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--jungle-soft)] text-[var(--jungle-deep)]">{icon}</div><div><div className="text-sm font-black text-[var(--ink)]">{title}</div><div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">{body}</div></div></div></Card>;
}

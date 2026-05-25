'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

type CheckStatus = 'ready' | 'partial' | 'missing';

type ReadinessCheck = {
  label: string;
  status: CheckStatus;
  detail: string;
};

function toneForStatus(status: CheckStatus) {
  if (status === 'ready') return 'jungle' as const;
  if (status === 'partial') return 'gold' as const;
  return 'coral' as const;
}

function statusLabel(status: CheckStatus) {
  if (status === 'ready') return 'Ready';
  if (status === 'partial') return 'Partial';
  return 'Missing';
}

export default function SystemReadinessPage() {
  const supabase = getSupabase();
  const [checks, setChecks] = useState<ReadinessCheck[]>([
    {
      label: 'Supabase configuration',
      status: isSupabaseConfigured() ? 'partial' : 'missing',
      detail: isSupabaseConfigured() ? 'Environment variables are present. Checking tables...' : 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured, so the hub is using demo data.',
    },
  ]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const [
        cases,
        tasks,
        proofs,
        citizens,
        audit,
        notifications,
        duplicateLinks,
        locationMetadata,
        domainEvents,
        animals,
        animalEvents,
        taskAssignments,
        trustScores,
        volunteerProfiles,
        organizationProfiles,
        areaForecasts,
        storageMetadata,
        proofQuality,
      ] = await Promise.all([
        supabase.from('cases').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('proofs').select('id', { count: 'exact', head: true }),
        supabase.from('citizens').select('id', { count: 'exact', head: true }),
        supabase.from('operational_events').select('id', { count: 'exact', head: true }),
        supabase.from('notification_outbox').select('id', { count: 'exact', head: true }),
        supabase.from('case_duplicate_links').select('id', { count: 'exact', head: true }),
        supabase.from('cases').select('id,latitude,longitude,location_privacy').limit(1),
        supabase.from('domain_events').select('id', { count: 'exact', head: true }),
        supabase.from('animals').select('id', { count: 'exact', head: true }),
        supabase.from('animal_events').select('id', { count: 'exact', head: true }),
        supabase.from('task_assignments').select('id', { count: 'exact', head: true }),
        supabase.from('trust_scores').select('id', { count: 'exact', head: true }),
        supabase.from('volunteer_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('organization_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('area_forecasts').select('id', { count: 'exact', head: true }),
        supabase.from('proofs').select('id,media_storage_path,media_mime_type,media_size_bytes').limit(1),
        supabase.from('proof_quality_scores').select('id', { count: 'exact', head: true }),
      ]);

      setChecks([
        {
          label: 'Supabase configuration',
          status: 'ready',
          detail: 'Hub has Supabase env vars and can query the project.',
        },
        {
          label: 'Mobile report intake',
          status: cases.error ? 'missing' : 'ready',
          detail: cases.error ? cases.error.message : `${cases.count ?? 0} case rows readable by ops.`,
        },
        {
          label: 'Task dispatch spine',
          status: tasks.error ? 'missing' : 'ready',
          detail: tasks.error ? tasks.error.message : `${tasks.count ?? 0} task rows readable by ops.`,
        },
        {
          label: 'Proof review spine',
          status: proofs.error ? 'missing' : 'ready',
          detail: proofs.error ? proofs.error.message : `${proofs.count ?? 0} proof rows readable by ops.`,
        },
        {
          label: 'Citizen device assignment',
          status: citizens.error ? 'missing' : 'ready',
          detail: citizens.error ? citizens.error.message : `${citizens.count ?? 0} citizen devices available for mobile-visible assignments.`,
        },
        {
          label: 'Audit ledger migration',
          status: audit.error ? 'missing' : 'ready',
          detail: audit.error ? 'Run migration 004_audit_location_metadata.sql.' : `${audit.count ?? 0} operational event rows available.`,
        },
        {
          label: 'Notification outbox migration',
          status: notifications.error ? 'missing' : 'ready',
          detail: notifications.error ? 'Run migration 005_operation_queue_foundations.sql. This does not enable a push provider by itself.' : `${notifications.count ?? 0} outbox rows available for future delivery workers.`,
        },
        {
          label: 'Duplicate review migration',
          status: duplicateLinks.error ? 'missing' : 'ready',
          detail: duplicateLinks.error ? 'Run migration 005_operation_queue_foundations.sql.' : `${duplicateLinks.count ?? 0} explicit duplicate links recorded.`,
        },
        {
          label: 'Location privacy metadata',
          status: locationMetadata.error ? 'missing' : 'ready',
          detail: locationMetadata.error ? 'Run migration 004_audit_location_metadata.sql.' : 'Cases expose location privacy fields needed for future exact/area-safe handling.',
        },
        {
          label: 'Domain event stream',
          status: domainEvents.error ? 'missing' : 'ready',
          detail: domainEvents.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${domainEvents.count ?? 0} domain events available for product workflows.`,
        },
        {
          label: 'Animal lifecycle records',
          status: animals.error || animalEvents.error ? 'missing' : 'ready',
          detail: animals.error || animalEvents.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${animals.count ?? 0} animals and ${animalEvents.count ?? 0} lifecycle events available.`,
        },
        {
          label: 'Assignment history',
          status: taskAssignments.error ? 'missing' : 'ready',
          detail: taskAssignments.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${taskAssignments.count ?? 0} assignment decisions recorded.`,
        },
        {
          label: 'Trust score foundation',
          status: trustScores.error ? 'missing' : 'ready',
          detail: trustScores.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${trustScores.count ?? 0} trust snapshots available for volunteers, partners, reviewers, and devices.`,
        },
        {
          label: 'Volunteer intelligence',
          status: volunteerProfiles.error ? 'missing' : 'ready',
          detail: volunteerProfiles.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${volunteerProfiles.count ?? 0} volunteer profiles available beyond device IDs.`,
        },
        {
          label: 'NGO coordination intelligence',
          status: organizationProfiles.error ? 'missing' : 'ready',
          detail: organizationProfiles.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${organizationProfiles.count ?? 0} partner organization profiles available.`,
        },
        {
          label: 'Predictive intelligence outputs',
          status: areaForecasts.error ? 'missing' : 'ready',
          detail: areaForecasts.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${areaForecasts.count ?? 0} forecast rows available. Predictions are not claimed until rows are generated.`,
        },
        {
          label: 'Evidence media metadata',
          status: storageMetadata.error ? 'missing' : 'ready',
          detail: storageMetadata.error ? 'Run migrations 004 and 007. Storage bucket policy must also exist for uploads.' : 'Proof rows expose storage path, MIME type, and byte-size metadata.',
        },
        {
          label: 'Proof quality scoring',
          status: proofQuality.error ? 'missing' : 'ready',
          detail: proofQuality.error ? 'Run migration 006_system_alignment_foundations.sql.' : `${proofQuality.count ?? 0} proof quality rows available for verification intelligence.`,
        },
      ]);
    }

    load();
  }, [supabase]);

  const readyCount = checks.filter((check) => check.status === 'ready').length;
  const missingCount = checks.filter((check) => check.status === 'missing').length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Ready systems</div>
          <div className="mono mt-4 text-[34px] font-bold text-[var(--ink)]">{readyCount}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Missing systems</div>
          <div className="mono mt-4 text-[34px] font-bold text-[var(--ink)]">{missingCount}</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Mode</div>
          <div className="mt-4"><Pill tone={supabase ? 'jungle' : 'gold'} variant="soft">{supabase ? 'Supabase live' : 'Demo data'}</Pill></div>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">System readiness</div>
            <div className="fredoka mt-1 text-[24px] font-semibold">Operational truth before demo claims</div>
            <div className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[var(--muted)]">This page separates live backend capability from planned integrations. Push delivery, storage upload, and exact GIS should not be claimed until their rows and workers are actually connected.</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {checks.map((check) => (
            <div key={check.label} className="flex flex-wrap items-start justify-between gap-4 rounded-[20px] border border-[var(--border)] bg-white/62 p-4">
              <div>
                <div className="text-sm font-black text-[var(--ink)]">{check.label}</div>
                <div className="mt-1 text-sm font-semibold leading-6 text-[var(--muted)]">{check.detail}</div>
              </div>
              <Pill tone={toneForStatus(check.status)} variant="soft">{statusLabel(check.status)}</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

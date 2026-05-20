import { supabase } from '@/app/lib/supabase';
import { getDeviceId } from '@/app/lib/deviceId';
import type { Report } from '@/app/store/reports';

type MissionType = 'feeding' | 'water' | 'rescue' | 'medical' | 'urgent';

type SpineCaseStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'task_created'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export function mapSpineStatusToMobileStatus(status: SpineCaseStatus) {
  if (status === 'submitted') return 'submitted' as const;
  if (status === 'under_review' || status === 'accepted' || status === 'task_created') return 'reviewing' as const;
  if (status === 'assigned' || status === 'in_progress') return 'dispatched' as const;
  if (status === 'resolved' || status === 'closed') return 'resolved' as const;
  return 'failed' as const;
}

export async function syncReportToSpine(report: Report, opts?: { blockName?: string | null }) {
  if (!supabase) return;
  try {
    const deviceId = await getDeviceId();

    // Ensure citizen exists.
    const citizenUpsert = await supabase
      .from('citizens')
      .upsert({ device_id: deviceId }, { onConflict: 'device_id' })
      .select('id')
      .single();

    const citizenId = citizenUpsert.data?.id ?? null;

    // Resolve block by name when possible.
    let blockId: string | null = null;
    const blockName = opts?.blockName?.trim();
    if (blockName) {
      const { data: b } = await supabase
        .from('blocks')
        .select('id,name')
        .ilike('name', blockName)
        .limit(1);
      blockId = b?.[0]?.id ?? null;
    }

    await supabase.from('cases').upsert(
      {
        external_id: report.id,
        citizen_id: citizenId,
        block_id: blockId,
        category: report.type,
        severity: report.severity,
        description: report.description || '',
        location_text: report.location || '',
        status: 'submitted',
      },
      { onConflict: 'external_id' }
    );
  } catch {
    // Prototype: never block the local flow.
  }
}

function templateTypeForMission(type: MissionType) {
  if (type === 'feeding') return 'feed';
  if (type === 'water') return 'water_refill';
  if (type === 'rescue') return 'rescue_assessment';
  if (type === 'medical') return 'medical_check';
  return 'emergency_escalation';
}

export async function upsertMissionTask(params: {
  missionId: string;
  missionType: MissionType;
  missionTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'proof_pending' | 'completed' | 'blocked';
  blockName?: string | null;
}) {
  if (!supabase) return;
  try {
    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;

    let blockId: string | null = null;
    const blockName = params.blockName?.trim();
    if (blockName) {
      const { data: b } = await supabase
        .from('blocks')
        .select('id,name')
        .ilike('name', blockName)
        .limit(1);
      blockId = b?.[0]?.id ?? null;
    }

    const tplType = templateTypeForMission(params.missionType);
    const { data: tpl } = await supabase
      .from('task_templates')
      .select('id')
      .eq('type', tplType)
      .maybeSingle();

    const priority = params.severity === 'critical' ? 'critical' : params.severity === 'high' ? 'high' : params.severity === 'medium' ? 'medium' : 'low';

    await supabase.from('tasks').upsert(
      {
        external_ref: externalRef,
        template_id: tpl?.id ?? null,
        block_id: blockId,
        status: params.status,
        priority,
        assigned_to_type: 'citizen',
        assigned_to_id: deviceId,
      },
      { onConflict: 'external_ref' }
    );
  } catch {
    // Prototype: never block the local flow.
  }
}

export async function insertMissionProof(params: {
  missionId: string;
  photoUri: string;
  note?: string;
}) {
  if (!supabase) return;
  try {
    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('external_ref', externalRef)
      .maybeSingle();

    if (!task?.id) return;
    await supabase.from('proofs').insert({
      task_id: task.id,
      photo_uri: params.photoUri,
      note: params.note ?? null,
      captured_at: new Date().toISOString(),
      verification_status: 'pending',
    });
  } catch {
    // ignore
  }
}

export async function updateMissionProofStatus(params: {
  missionId: string;
  verificationStatus: 'verified' | 'rejected' | 'needs_review';
}) {
  if (!supabase) return;
  try {
    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('external_ref', externalRef)
      .maybeSingle();
    if (!task?.id) return;

    await supabase
      .from('proofs')
      .update({ verification_status: params.verificationStatus })
      .eq('task_id', task.id)
      .eq('verification_status', 'pending');
  } catch {
    // ignore
  }
}

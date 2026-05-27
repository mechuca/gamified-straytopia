import { ensureAuthed, supabase } from '@/app/lib/supabase';
import { getDeviceId } from '@/app/lib/deviceId';
import type { Report } from '@/app/store/reports';
import type { CareLocationMetadata } from '@/app/lib/location';
import { drainSyncOutbox, enqueueSyncOperation, type SyncOperation } from '@/app/lib/syncOutbox';

type MissionType = 'feeding' | 'water' | 'rescue' | 'medical' | 'urgent';

type PickedMedia = {
  uri: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
};

type MissionTaskParams = {
  missionId: string;
  opsTaskId?: string | null;
  missionType: MissionType;
  missionTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'proof_pending' | 'completed' | 'blocked';
  blockName?: string | null;
  locationMetadata?: CareLocationMetadata | null;
};

type MissionProofParams = {
  missionId: string;
  opsTaskId?: string | null;
  photoUri: string;
  note?: string;
  media?: PickedMedia | null;
  locationMetadata?: CareLocationMetadata | null;
};

export type VolunteerAvailabilityStatus = 'available' | 'busy' | 'offline' | 'paused';

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

function mimeFromUri(uri: string, fallback?: string | null) {
  if (fallback) return fallback;
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
}

async function uploadEvidenceMedia(params: { uri: string; folder: 'reports' | 'proofs'; entityId: string; media?: PickedMedia | null }) {
  if (!supabase) return null;
  try {
    const mimeType = mimeFromUri(params.uri, params.media?.mimeType);
    const extension = mimeType.split('/')[1] || 'jpg';
    const storagePath = `${params.folder}/${params.entityId}/${Date.now()}.${extension}`;
    const response = await fetch(params.uri);
    const body = await response.arrayBuffer();
    const uploaded = await supabase.storage.from('straytopia-evidence').upload(storagePath, body, {
      contentType: mimeType,
      upsert: true,
    });
    if (uploaded.error) return null;
    return {
      storagePath,
      mimeType,
      sizeBytes: params.media?.fileSize ?? body.byteLength,
    };
  } catch {
    return null;
  }
}

async function resolveBlockId(blockName?: string | null) {
  if (!supabase) return null;
  const normalized = blockName?.trim();
  if (!normalized) return null;
  const { data } = await supabase
    .from('blocks')
    .select('id,name')
    .ilike('name', normalized)
    .limit(1);
  return data?.[0]?.id ?? null;
}

async function syncReportDirect(report: Report, opts?: { blockName?: string | null }, enqueueOnFailure = true) {
  if (!supabase) return;
  try {
    await ensureAuthed();
    const deviceId = await getDeviceId();

    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id ?? null;

    // Ensure citizen exists.
    const citizenUpsert = await supabase
      .from('citizens')
      .upsert({ device_id: deviceId, user_id: userId }, { onConflict: 'device_id' })
      .select('id')
      .single();

    const citizenId = citizenUpsert.data?.id ?? null;

    const blockId = await resolveBlockId(opts?.blockName);
    const media = report.photoUri
      ? await uploadEvidenceMedia({ uri: report.photoUri, folder: 'reports', entityId: report.id, media: report.media ?? null })
      : null;

    const locationMetadata = report.locationMetadata ?? null;
    const synced = await supabase.from('cases').upsert(
      {
        external_id: report.id,
        citizen_id: citizenId,
        block_id: blockId,
        category: report.type,
        severity: report.severity,
        description: report.description || '',
        location_text: report.location || '',
        media_uri: media?.storagePath ?? report.photoUri ?? null,
        latitude: locationMetadata?.latitude ?? null,
        longitude: locationMetadata?.longitude ?? null,
        location_accuracy_meters: locationMetadata?.location_accuracy_meters ?? null,
        location_captured_at: locationMetadata?.location_captured_at ?? null,
        location_privacy: locationMetadata?.location_privacy ?? 'area',
        status: 'submitted',
      },
      { onConflict: 'external_id' }
    );
    if (synced.error) throw synced.error;
  } catch (error) {
    if (enqueueOnFailure) await enqueueSyncOperation('report', { id: report.id, report, blockName: opts?.blockName ?? null }, error);
  }
}

export async function syncReportToSpine(report: Report, opts?: { blockName?: string | null }) {
  return syncReportDirect(report, opts, true);
}

function templateTypeForMission(type: MissionType) {
  if (type === 'feeding') return 'feed';
  if (type === 'water') return 'water_refill';
  if (type === 'rescue') return 'rescue_assessment';
  if (type === 'medical') return 'medical_check';
  return 'emergency_escalation';
}

async function upsertMissionTaskDirect(params: MissionTaskParams, enqueueOnFailure = true) {
  if (!supabase) return;
  try {
    await ensureAuthed();
    if (params.opsTaskId) {
      const nextStatus = params.status === 'assigned' ? 'in_progress' : params.status;
      const synced = await supabase.rpc('mobile_update_assigned_task_status', {
        p_task_id: params.opsTaskId,
        p_next_status: nextStatus,
        p_reason: null,
      });
      if (synced.error) throw synced.error;
      return;
    }

    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;

    const blockId = await resolveBlockId(params.blockName);

    const tplType = templateTypeForMission(params.missionType);
    const { data: tpl } = await supabase
      .from('task_templates')
      .select('id')
      .eq('type', tplType)
      .maybeSingle();

    const priority = params.severity === 'critical' ? 'critical' : params.severity === 'high' ? 'high' : params.severity === 'medium' ? 'medium' : 'low';

    const locationMetadata = params.locationMetadata ?? null;
    const synced = await supabase.from('tasks').upsert(
      {
        external_ref: externalRef,
        template_id: tpl?.id ?? null,
        block_id: blockId,
        status: params.status,
        priority,
        assigned_to_type: 'citizen',
        assigned_to_id: deviceId,
        latitude: locationMetadata?.latitude ?? null,
        longitude: locationMetadata?.longitude ?? null,
        location_accuracy_meters: locationMetadata?.location_accuracy_meters ?? null,
        location_captured_at: locationMetadata?.location_captured_at ?? null,
        location_privacy: locationMetadata?.location_privacy ?? 'area',
      },
      { onConflict: 'external_ref' }
    );
    if (synced.error) throw synced.error;
  } catch (error) {
    if (enqueueOnFailure) await enqueueSyncOperation('mission_task', { ...params, id: params.missionId }, error);
  }
}

export async function upsertMissionTask(params: MissionTaskParams) {
  return upsertMissionTaskDirect(params, true);
}

async function insertMissionProofDirect(params: MissionProofParams, enqueueOnFailure = true) {
  if (!supabase) return;
  try {
    await ensureAuthed();
    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;
    const { data: task } = params.opsTaskId
      ? await supabase
          .from('tasks')
          .select('id')
          .eq('id', params.opsTaskId)
          .eq('assigned_to_type', 'citizen')
          .eq('assigned_to_id', deviceId)
          .maybeSingle()
      : await supabase
          .from('tasks')
          .select('id')
          .eq('external_ref', externalRef)
          .maybeSingle();

    if (!task?.id) throw new Error('Mission task not found for proof upload');

    const media = await uploadEvidenceMedia({ uri: params.photoUri, folder: 'proofs', entityId: params.missionId, media: params.media ?? null });
    const locationMetadata = params.locationMetadata ?? null;
    const existing = await supabase
      .from('proofs')
      .select('id')
      .eq('task_id', task.id)
      .eq('photo_uri', media?.storagePath ?? params.photoUri)
      .maybeSingle();
    if (existing.data?.id) return;

    const inserted = await supabase.from('proofs').insert({
      task_id: task.id,
      photo_uri: media?.storagePath ?? params.photoUri,
      note: params.note ?? null,
      captured_at: new Date().toISOString(),
      verification_status: 'pending',
      latitude: locationMetadata?.latitude ?? null,
      longitude: locationMetadata?.longitude ?? null,
      location_accuracy_meters: locationMetadata?.location_accuracy_meters ?? null,
      location_captured_at: locationMetadata?.location_captured_at ?? null,
      media_storage_path: media?.storagePath ?? null,
      media_mime_type: media?.mimeType ?? params.media?.mimeType ?? null,
      media_size_bytes: media?.sizeBytes ?? params.media?.fileSize ?? null,
    });
    if (inserted.error) throw inserted.error;
  } catch (error) {
    if (enqueueOnFailure) await enqueueSyncOperation('mission_proof', { ...params, id: params.missionId }, error);
  }
}

export async function insertMissionProof(params: MissionProofParams) {
  return insertMissionProofDirect(params, true);
}

export async function updateMissionProofStatus(params: {
  missionId: string;
  opsTaskId?: string | null;
  verificationStatus: 'verified' | 'rejected' | 'needs_review';
}) {
  if (!supabase) return;
  try {
    await ensureAuthed();
    const deviceId = await getDeviceId();
    const externalRef = `mission:${deviceId}:${params.missionId}`;
    const { data: task } = params.opsTaskId
      ? await supabase
          .from('tasks')
          .select('id')
          .eq('id', params.opsTaskId)
          .eq('assigned_to_type', 'citizen')
          .eq('assigned_to_id', deviceId)
          .maybeSingle()
      : await supabase
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

export async function respondToOpsTaskAssignment(params: {
  taskId: string;
  response: 'accepted' | 'declined';
  reason?: string | null;
}) {
  if (!supabase) return;
  await ensureAuthed();
  const result = await supabase.rpc('mobile_respond_to_task_assignment', {
    p_task_id: params.taskId,
    p_response: params.response,
    p_reason: params.reason ?? null,
  });
  if (result.error) throw result.error;
}

export async function setVolunteerAvailability(params: {
  status: VolunteerAvailabilityStatus;
  skills?: string[];
  transportModes?: string[];
  note?: string;
  openTaskLimit?: number;
  availableUntil?: string | null;
}) {
  if (!supabase) return null;
  await ensureAuthed();
  const deviceId = await getDeviceId();
  const result = await supabase.rpc('mobile_set_volunteer_availability', {
    p_device_id: deviceId,
    p_status: params.status,
    p_skills: params.skills ?? [],
    p_transport_modes: params.transportModes ?? [],
    p_note: params.note ?? '',
    p_open_task_limit: params.openTaskLimit ?? 1,
    p_available_until: params.availableUntil ?? null,
  });
  if (result.error) throw result.error;
  return result.data;
}

export async function processQueuedSpineSync() {
  return drainSyncOutbox(async (operation: SyncOperation) => {
    if (operation.type === 'report') {
      const report = operation.payload.report as Report | undefined;
      if (!report) return;
      await syncReportDirect(report, { blockName: (operation.payload.blockName as string | null | undefined) ?? null }, false);
      return;
    }

    if (operation.type === 'mission_task') {
      await upsertMissionTaskDirect(operation.payload as unknown as MissionTaskParams, false);
      return;
    }

    if (operation.type === 'mission_proof') {
      await insertMissionProofDirect(operation.payload as unknown as MissionProofParams, false);
    }
  });
}

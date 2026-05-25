import { useEffect } from 'react';
import { ensureAuthed, supabase } from '@/app/lib/supabase';
import { getDeviceId } from '@/app/lib/deviceId';
import { useMissions } from '@/app/store/missions';

type MissionTaskRow = {
  id: string;
  external_ref: string | null;
  status: string;
};

type ProofRow = {
  task_id: string;
  verification_status: string;
};

function missionIdFromExternalRef(externalRef: string | null) {
  return externalRef?.split(':').at(-1) ?? null;
}

export function useMissionHubSync() {
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const sb = client;
    let mounted = true;
    let taskById = new Map<string, MissionTaskRow>();

    async function load() {
      await ensureAuthed();
      const deviceId = await getDeviceId();
      const { data } = await sb
        .from('tasks')
        .select('id,external_ref,status')
        .eq('assigned_to_type', 'citizen')
        .eq('assigned_to_id', deviceId)
        .like('external_ref', `mission:${deviceId}:%`);

      if (!mounted) return;
      const tasks = ((data ?? []) as unknown) as MissionTaskRow[];
      taskById = new Map(tasks.map((task) => [task.id, task]));

      for (const task of tasks) {
        const missionId = missionIdFromExternalRef(task.external_ref);
        if (!missionId) continue;
        if (task.status === 'completed') useMissions.getState().verifyMissionFromHub(missionId, 'verified');
        if (task.status === 'blocked' || task.status === 'cancelled') useMissions.getState().verifyMissionFromHub(missionId, 'rejected');
        if (task.status === 'proof_pending') useMissions.getState().markMissionReviewFromHub(missionId);
      }
    }

    async function loadProofs() {
      await load();
      const taskIds = Array.from(taskById.keys());
      if (taskIds.length === 0) return;
      const { data } = await sb
        .from('proofs')
        .select('task_id,verification_status')
        .in('task_id', taskIds)
        .order('submitted_at', { ascending: false });

      if (!mounted) return;
      for (const proof of (((data ?? []) as unknown) as ProofRow[])) {
        const task = taskById.get(proof.task_id);
        const missionId = missionIdFromExternalRef(task?.external_ref ?? null);
        if (!missionId) continue;
        if (proof.verification_status === 'verified') useMissions.getState().verifyMissionFromHub(missionId, 'verified');
        if (proof.verification_status === 'rejected') useMissions.getState().verifyMissionFromHub(missionId, 'rejected');
        if (proof.verification_status === 'needs_review') useMissions.getState().verifyMissionFromHub(missionId, 'review');
      }
    }

    void loadProofs();
    const channel = sb
      .channel('mobile_mission_hub_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => void loadProofs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => void loadProofs())
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);
}

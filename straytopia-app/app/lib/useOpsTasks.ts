import { useEffect, useState } from 'react';
import { ensureAuthed, supabase } from '@/app/lib/supabase';
import { getDeviceId } from '@/app/lib/deviceId';
import { useMissions, type AnimalType, type MissionType, type OpsMissionInput } from '@/app/store/missions';

export type OpsTask = {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  case_id: string | null;
  template_id: string | null;
  template_title?: string | null;
  template_description?: string | null;
  required_proof?: string | null;
  sla_minutes?: number | null;
  category?: string | null;
  severity?: string | null;
  location_text?: string | null;
  assignment_status?: string | null;
};

type RawTask = Omit<OpsTask, 'template_title' | 'template_description' | 'required_proof' | 'sla_minutes' | 'category' | 'severity' | 'location_text' | 'assignment_status'> & {
  task_templates?: { title?: string | null; description?: string | null; required_proof?: string | null; sla_minutes?: number | null } | null;
  cases?: { category?: string | null; severity?: string | null; location_text?: string | null } | null;
  task_assignments?: Array<{ status?: string | null; created_at?: string | null }> | null;
};

function missionTypeForTask(task: OpsTask): MissionType {
  const category = task.category ?? task.template_title?.toLowerCase() ?? '';
  if (category.includes('water')) return 'water';
  if (category.includes('injured') || category.includes('sick') || category.includes('medical')) return 'medical';
  if (category.includes('rescue') || category.includes('abandoned') || category.includes('aggressive')) return 'rescue';
  if (task.priority === 'critical') return 'urgent';
  return 'feeding';
}

function animalTypeForCategory(category?: string | null): AnimalType {
  if (category === 'adoption') return 'other';
  return 'dog';
}

function urgencyForTask(priority: string): OpsMissionInput['urgency'] {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

function pointsForPriority(priority: string) {
  if (priority === 'critical') return 120;
  if (priority === 'high') return 80;
  if (priority === 'medium') return 50;
  return 30;
}

function statusForOpsTask(task: OpsTask): OpsMissionInput['status'] {
  if (task.status === 'in_progress') return 'in-progress';
  if (task.status === 'proof_pending') return 'verifying';
  if (task.status === 'completed') return 'completed';
  if (task.status === 'blocked' || task.assignment_status === 'declined') return 'rejected';
  if (task.assignment_status === 'accepted') return 'accepted';
  return 'available';
}

function taskToMission(task: OpsTask): OpsMissionInput {
  const type = missionTypeForTask(task);
  const urgency = urgencyForTask(task.priority);
  return {
    id: `ops:${task.id}`,
    opsTaskId: task.id,
    caseId: task.case_id,
    type,
    title: task.template_title || `${task.category ?? 'Care'} task`,
    description: task.template_description || 'Shelter ops assigned this care task from a verified report or care route.',
    animalType: animalTypeForCategory(task.category),
    location: task.location_text || 'Ops shared area',
    distance: 'assigned',
    estimatedTime: task.sla_minutes ? Math.max(10, Math.round(task.sla_minutes / 6)) : 20,
    urgency,
    proofRequired: task.required_proof || 'Photo proof for ops review',
    impactPoints: pointsForPriority(task.priority),
    safetyNote: urgency === 'critical' ? 'Do not attempt unsafe rescue. Keep distance and submit a field update.' : 'Stay aware of traffic, people, and animal stress signals.',
    status: statusForOpsTask(task),
  };
}

export function useOpsTasks() {
  const [tasks, setTasks] = useState<OpsTask[]>([]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const sb = client;
    let mounted = true;
    let deviceId: string | null = null;

    async function load() {
      await ensureAuthed();
      deviceId = deviceId ?? (await getDeviceId());
      const { data } = await sb
        .from('tasks')
        .select('id,status,priority,created_at,case_id,template_id,task_templates(title,description,required_proof,sla_minutes),cases(category,severity,location_text),task_assignments(status,created_at)')
        .in('status', ['queued', 'assigned', 'in_progress', 'proof_pending'])
        .eq('assigned_to_type', 'citizen')
        .eq('assigned_to_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!mounted) return;
      const normalized = (((data ?? []) as unknown) as RawTask[]).map((t) => ({
        id: t.id,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
        case_id: t.case_id,
        template_id: t.template_id,
        template_title: t.task_templates?.title ?? null,
        template_description: t.task_templates?.description ?? null,
        required_proof: t.task_templates?.required_proof ?? null,
        sla_minutes: t.task_templates?.sla_minutes ?? null,
        category: t.cases?.category ?? null,
        severity: t.cases?.severity ?? null,
        location_text: t.cases?.location_text ?? null,
        assignment_status: [...(t.task_assignments ?? [])].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0]?.status ?? null,
      }));
      setTasks(normalized);
      useMissions.getState().syncOpsMissions(normalized.map(taskToMission));
    }

    load();
    const channel = sb
      .channel('mobile_ops_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  return tasks;
}

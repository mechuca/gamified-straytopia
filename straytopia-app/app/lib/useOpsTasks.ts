import { useEffect, useState } from 'react';
import { ensureAuthed, supabase } from '@/app/lib/supabase';
import { getDeviceId } from '@/app/lib/deviceId';

export type OpsTask = {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  case_id: string | null;
  template_id: string | null;
  template_title?: string | null;
};

type RawTask = Omit<OpsTask, 'template_title'> & { task_templates?: { title?: string | null } | null };

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
        .select('id,status,priority,created_at,case_id,template_id,task_templates(title)')
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
      }));
      setTasks(normalized);
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

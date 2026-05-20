import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export type OpsTask = {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  case_id: string | null;
  template_id: string | null;
  template_title?: string | null;
};

export function useOpsTasks() {
  const [tasks, setTasks] = useState<OpsTask[]>([]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const sb = client;
    let mounted = true;

    async function load() {
      const { data } = await sb
        .from('tasks')
        .select('id,status,priority,created_at,case_id,template_id,task_templates(title)')
        .in('status', ['queued', 'assigned', 'in_progress', 'proof_pending'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (!mounted) return;
      const normalized = ((data as any[]) ?? []).map((t) => ({
        ...t,
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

import { useEffect, useState } from 'react';
import { ensureAuthed, supabase } from '@/app/lib/supabase';
import { useReports, type ReportStatus } from '@/app/store/reports';
import { mapSpineStatusToMobileStatus } from '@/app/lib/spineSync';

export type TrackedReport = {
  external_id: string;
  status: string;
  severity: string;
  category: string;
  location_text: string;
  created_at: string;
  updated_at: string;
  latest_task_status: string | null;
  latest_notification_title: string | null;
  latest_notification_body: string | null;
};

function timelineFor(row: TrackedReport, mapped: ReportStatus, createdAt: number) {
  const updatedAt = new Date(row.updated_at).getTime();
  return [
    { step: 'Report submitted', at: createdAt },
    ...(mapped !== 'submitted' ? [{ step: mapped === 'failed' ? 'Rejected by ops' : 'Ops review started', at: updatedAt }] : []),
    ...(mapped === 'dispatched' || mapped === 'resolved' ? [{ step: row.latest_task_status ? `Task ${row.latest_task_status.replace('_', ' ')}` : 'Help assigned', at: updatedAt }] : []),
    ...(mapped === 'resolved' ? [{ step: 'Case resolved', at: updatedAt }] : []),
  ];
}

export function useReportTracking() {
  const [trackedReports, setTrackedReports] = useState<TrackedReport[]>([]);
  const updateReport = useReports((s) => s.updateReport);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const sb = client;
    let mounted = true;

    async function load() {
      await ensureAuthed();
      const result = await sb.rpc('mobile_get_report_tracking');
      if (!mounted || result.error) return;
      const rows = (result.data ?? []) as TrackedReport[];
      setTrackedReports(rows);
      for (const row of rows) {
        const mapped = mapSpineStatusToMobileStatus(row.status as Parameters<typeof mapSpineStatusToMobileStatus>[0]);
        updateReport(row.external_id, {
          status: mapped,
          timeline: timelineFor(row, mapped, new Date(row.created_at).getTime()),
        });
      }
    }

    load();
    const channel = sb
      .channel('mobile_report_tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_outbox' }, () => load())
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, [updateReport]);

  return trackedReports;
}

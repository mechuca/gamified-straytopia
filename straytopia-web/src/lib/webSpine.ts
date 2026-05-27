'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle, Droplets, Eye, PawPrint, Stethoscope } from 'lucide-react';
import type { Mission } from '@/lib/mock';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const webSupabase = url && anonKey
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export type WebCaseStatus = 'submitted' | 'reviewing' | 'dispatched' | 'resolved' | 'failed';

export type VerifiedImpact = {
  stats: {
    completed_missions: number;
    reports_filed: number;
    resolved_reports: number;
    verified_points: number;
  };
  stories: Array<{ id: string; title: string; body: string; badge: string; occurred_at: string }>;
  leaderboard: Array<{ rank: number; name: string; points: number; mission_count: number; is_me: boolean }>;
};

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

type RawOpsTask = {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  case_id: string | null;
  template_id: string | null;
  task_templates?: { title?: string | null; description?: string | null; required_proof?: string | null; sla_minutes?: number | null } | null;
  cases?: { category?: string | null; severity?: string | null; location_text?: string | null } | null;
  task_assignments?: Array<{ status?: string | null; created_at?: string | null }> | null;
};

const emptyImpact: VerifiedImpact = {
  stats: { completed_missions: 0, reports_filed: 0, resolved_reports: 0, verified_points: 0 },
  stories: [],
  leaderboard: [],
};

function getStoredDeviceId() {
  if (typeof window === 'undefined') return 'web-device-ssr';
  const key = 'straytopia-web-device-id';
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = `web-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  window.localStorage.setItem(key, value);
  return value;
}

export function hasWebSpine() {
  return Boolean(webSupabase);
}

export async function ensureWebCitizen() {
  if (!webSupabase) return null;
  const deviceId = getStoredDeviceId();
  const session = await webSupabase.auth.getSession();
  if (!session.data.session) {
    const anon = await webSupabase.auth.signInAnonymously();
    if (anon.error) throw anon.error;
  }
  const user = await webSupabase.auth.getUser();
  const userId = user.data.user?.id ?? null;
  const result = await webSupabase
    .from('citizens')
    .upsert({ device_id: deviceId, user_id: userId }, { onConflict: 'device_id' })
    .select('id,device_id')
    .single();
  if (result.error) throw result.error;
  return { deviceId, citizenId: result.data.id as string };
}

function categoryForCondition(condition: string) {
  const value = condition.toLowerCase();
  if (value.includes('sick')) return 'sick';
  if (value.includes('injured')) return 'injured';
  if (value.includes('aggressive')) return 'aggressive';
  if (value.includes('abandoned')) return 'abandoned';
  if (value.includes('trapped') || value.includes('danger')) return 'rescue';
  return 'other';
}

function severityForUrgency(urgency: 'low' | 'medium' | 'high' | 'critical') {
  if (urgency === 'critical' || urgency === 'high') return 'urgent';
  if (urgency === 'medium') return 'today';
  return 'soon';
}

function mapSpineCaseStatus(status: string): WebCaseStatus {
  if (status === 'submitted') return 'submitted';
  if (status === 'under_review' || status === 'accepted' || status === 'task_created') return 'reviewing';
  if (status === 'assigned' || status === 'in_progress') return 'dispatched';
  if (status === 'resolved' || status === 'closed') return 'resolved';
  return 'failed';
}

async function uploadDataUrl(dataUrl: string | null, folder: 'reports' | 'proofs', entityId: string) {
  if (!webSupabase || !dataUrl?.startsWith('data:')) return null;
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split('/')[1] || 'jpg';
  const storagePath = `${folder}/${entityId}/${Date.now()}.${extension}`;
  const uploaded = await webSupabase.storage.from('straytopia-evidence').upload(storagePath, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });
  if (uploaded.error) return null;
  return storagePath;
}

export async function createWebReport(params: {
  externalId: string;
  condition: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  photo: string | null;
  locationText?: string;
}) {
  if (!webSupabase) return;
  const citizen = await ensureWebCitizen();
  if (!citizen) return;
  const mediaPath = await uploadDataUrl(params.photo, 'reports', params.externalId);
  const result = await webSupabase.from('cases').upsert(
    {
      external_id: params.externalId,
      citizen_id: citizen.citizenId,
      category: categoryForCondition(params.condition),
      severity: severityForUrgency(params.urgency),
      description: params.notes || params.condition,
      location_text: params.locationText || 'Web report area',
      media_uri: mediaPath ?? params.photo,
      status: 'submitted',
    },
    { onConflict: 'external_id' }
  );
  if (result.error) throw result.error;
}

export async function createWebSosReport(externalId: string) {
  return createWebReport({
    externalId,
    condition: 'In Danger',
    urgency: 'critical',
    notes: 'SOS: immediate danger reported from web.',
    photo: null,
    locationText: 'SOS web location pending',
  });
}

function taskTone(priority: string) {
  if (priority === 'critical' || priority === 'high') return 'coral';
  if (priority === 'medium') return 'gold';
  return 'jungle';
}

function missionIcon(category?: string | null) {
  if (category === 'water') return Droplets;
  if (category === 'injured' || category === 'sick') return Stethoscope;
  if (category === 'rescue' || category === 'aggressive' || category === 'abandoned') return AlertTriangle;
  if (category === 'other') return Eye;
  return PawPrint;
}

function statusForTask(task: RawOpsTask) {
  const assignmentStatus = [...(task.task_assignments ?? [])].sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())[0]?.status;
  if (task.status === 'completed') return 'completed';
  if (task.status === 'in_progress') return 'in_progress';
  if (task.status === 'proof_pending') return 'proof_required';
  if (task.status === 'blocked' || assignmentStatus === 'declined') return 'locked';
  return 'available';
}

function taskToMission(task: RawOpsTask): Mission {
  const title = task.task_templates?.title || `${task.cases?.category ?? 'Care'} task`;
  return {
    id: `ops:${task.id}`,
    title,
    subtitle: 'From shelter ops',
    description: task.task_templates?.description || 'Shelter ops assigned this work from a live report or care route.',
    icon: missionIcon(task.cases?.category),
    status: statusForTask(task),
    order: 1,
    rewardPoints: task.priority === 'critical' ? 120 : task.priority === 'high' ? 80 : task.priority === 'medium' ? 50 : 30,
    rewardHearts: 1,
    requiresProof: true,
    proofType: 'photo',
    location: task.cases?.location_text || 'Ops shared area',
    distance: 'assigned',
    time: task.task_templates?.sla_minutes ? Math.max(10, Math.round(task.task_templates.sla_minutes / 6)) : 20,
    urgency: task.priority === 'critical' ? 'critical' : task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low',
    safety: task.priority === 'critical' ? 'Do not attempt unsafe rescue. Keep distance and submit a field update.' : 'Stay aware of traffic, people, and animal stress signals.',
    tone: taskTone(task.priority),
  };
}

export function useWebOpsMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [statusById, setStatusById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!webSupabase) return;
    const sb = webSupabase;
    let mounted = true;
    let deviceId: string | null = null;

    async function load() {
      const citizen = await ensureWebCitizen();
      if (!citizen) return;
      deviceId = citizen.deviceId;
      const result = await sb
        .from('tasks')
        .select('id,status,priority,created_at,case_id,template_id,task_templates(title,description,required_proof,sla_minutes),cases(category,severity,location_text),task_assignments(status,created_at)')
        .in('status', ['queued', 'assigned', 'in_progress', 'proof_pending'])
        .eq('assigned_to_type', 'citizen')
        .eq('assigned_to_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!mounted || result.error) return;
      const rows = (result.data ?? []) as unknown as RawOpsTask[];
      const nextMissions = rows.map(taskToMission);
      setMissions(nextMissions);
      setStatusById(Object.fromEntries(nextMissions.map((mission) => [mission.id, mission.status])));
    }

    load();
    const channel = sb
      .channel('web_ops_missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignments' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  return { missions, statusById };
}

export async function acceptWebOpsTask(missionId: string) {
  if (!webSupabase || !missionId.startsWith('ops:')) return;
  await ensureWebCitizen();
  const taskId = missionId.replace('ops:', '');
  const accepted = await webSupabase.rpc('mobile_respond_to_task_assignment', { p_task_id: taskId, p_response: 'accepted', p_reason: 'Accepted from web.' });
  if (accepted.error) throw accepted.error;
  const started = await webSupabase.rpc('mobile_update_assigned_task_status', { p_task_id: taskId, p_next_status: 'in_progress', p_reason: null });
  if (started.error) throw started.error;
}

export async function submitWebOpsProof(missionId: string, params: { photo: string | null }) {
  if (!webSupabase || !missionId.startsWith('ops:')) return;
  await ensureWebCitizen();
  const taskId = missionId.replace('ops:', '');
  const mediaPath = await uploadDataUrl(params.photo, 'proofs', taskId);
  const proof = await webSupabase.from('proofs').insert({
    task_id: taskId,
    photo_uri: mediaPath ?? `web-proof:${Date.now()}`,
    note: mediaPath ? 'Proof submitted from web.' : 'Proof submitted from web without uploaded media.',
    captured_at: new Date().toISOString(),
    verification_status: 'pending',
  });
  if (proof.error) throw proof.error;
  const status = await webSupabase.rpc('mobile_update_assigned_task_status', { p_task_id: taskId, p_next_status: 'proof_pending', p_reason: null });
  if (status.error) throw status.error;
}

function normalizeImpact(value: unknown): VerifiedImpact {
  const root = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const stats = root.stats && typeof root.stats === 'object' ? root.stats as Record<string, unknown> : {};
  return {
    stats: {
      completed_missions: Number(stats.completed_missions ?? 0),
      reports_filed: Number(stats.reports_filed ?? 0),
      resolved_reports: Number(stats.resolved_reports ?? 0),
      verified_points: Number(stats.verified_points ?? 0),
    },
    stories: Array.isArray(root.stories) ? root.stories as VerifiedImpact['stories'] : [],
    leaderboard: Array.isArray(root.leaderboard) ? root.leaderboard as VerifiedImpact['leaderboard'] : [],
  };
}

export function useWebVerifiedImpact() {
  const [impact, setImpact] = useState<VerifiedImpact>(emptyImpact);

  useEffect(() => {
    if (!webSupabase) return;
    const sb = webSupabase;
    let mounted = true;

    async function load() {
      await ensureWebCitizen();
      const result = await sb.rpc('mobile_get_verified_impact');
      if (!mounted || result.error) return;
      setImpact(normalizeImpact(result.data));
    }

    load();
    const channel = sb
      .channel('web_verified_impact')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  return impact;
}

export function useWebReportTracking() {
  const [reports, setReports] = useState<TrackedReport[]>([]);

  useEffect(() => {
    if (!webSupabase) return;
    const sb = webSupabase;
    let mounted = true;

    async function load() {
      await ensureWebCitizen();
      const result = await sb.rpc('mobile_get_report_tracking');
      if (!mounted || result.error) return;
      setReports((result.data ?? []) as TrackedReport[]);
    }

    load();
    const channel = sb
      .channel('web_report_tracking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_outbox' }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  return reports.map((report) => ({ ...report, mobileStatus: mapSpineCaseStatus(report.status) }));
}

export async function setWebVolunteerAvailability(status: 'available' | 'paused') {
  if (!webSupabase) return;
  const citizen = await ensureWebCitizen();
  if (!citizen) return;
  const result = await webSupabase.rpc('mobile_set_volunteer_availability', {
    p_device_id: citizen.deviceId,
    p_status: status,
    p_skills: ['feed', 'water_refill', 'rescue_assessment'],
    p_transport_modes: ['walk'],
    p_note: status === 'available' ? 'Available for nearby web assignments.' : '',
    p_open_task_limit: status === 'available' ? 1 : 0,
    p_available_until: null,
  });
  if (result.error) throw result.error;
}

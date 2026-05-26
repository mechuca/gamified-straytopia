'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Block, CaseRow, CitizenRow, ProofRow, ProofVerificationStatus, Shelter, TaskRow, TaskTemplateRow } from '@/lib/types';
import { ActionStatus } from '@/components/ui/ActionStatus';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { AlertTriangle, Check, Clock3, Compass, FileText, Image as ImageIcon, Layers3, Map as MapIcon, Search, ShieldCheck, Users, X } from 'lucide-react';
import { demoBlocks, demoCases, demoCitizens, demoProofs, demoShelters, demoTaskTemplates, demoTasks } from '@/lib/demoData';

type WorkItemKind = 'case' | 'task' | 'proof';
type QueueStage = 'intake' | 'dispatch' | 'field' | 'proof' | 'exception' | 'done';
type QueueFilter = 'all' | 'urgent' | 'review' | 'assign' | 'verify' | 'blocked';
type WorkSource = 'mobile_report' | 'mobile_mission' | 'hub_dispatch' | 'field_proof';

type WorkItem = {
  key: string;
  kind: WorkItemKind;
  title: string;
  subtitle: string;
  meta: string;
  status: string;
  stage: QueueStage;
  source: WorkSource;
  sourceLabel: string;
  mobileStatus: string;
  mobileImpact: string;
  tone: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'paper' | 'ink';
  priority: number;
  dueLabel: string;
  primaryAction: string;
  duplicateMatches?: CaseRow[];
  caseRow?: CaseRow;
  taskRow?: TaskRow;
  proofRow?: ProofRow;
};

const queueFilters: Array<{ key: QueueFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'review', label: 'Review' },
  { key: 'assign', label: 'Assign' },
  { key: 'verify', label: 'Verify' },
  { key: 'blocked', label: 'Blocked' },
];

const openTaskStatuses: TaskRow['status'][] = ['queued', 'assigned', 'in_progress', 'proof_pending', 'blocked', 'escalated'];

const stageCopy: Record<QueueStage, { label: string; mobile: string; hub: string; tone: WorkItem['tone'] }> = {
  intake: {
    label: 'Mobile intake',
    mobile: 'Citizen sees Report submitted or Under review.',
    hub: 'Validate category, urgency, block, and duplicate risk.',
    tone: 'gold',
  },
  dispatch: {
    label: 'Dispatch',
    mobile: 'Citizen sees Under review until a task is assigned.',
    hub: 'Assign shelter or mobile volunteer with an auditable reason.',
    tone: 'sky',
  },
  field: {
    label: 'In field',
    mobile: 'Citizen sees Volunteer assigned or an active mission task.',
    hub: 'Track SLA, owner, safety notes, and stalled work.',
    tone: 'plum',
  },
  proof: {
    label: 'Proof review',
    mobile: 'Citizen has submitted photo evidence and waits for review.',
    hub: 'Verify proof before credit, closure, or rejection.',
    tone: 'jungle',
  },
  exception: {
    label: 'Exception',
    mobile: 'Citizen sees failed/rejected only when the case or proof is rejected.',
    hub: 'Resolve blocked work, rejected proof, or emergency escalation.',
    tone: 'coral',
  },
  done: {
    label: 'Closed',
    mobile: 'Citizen sees Resolved once the case is closed.',
    hub: 'Keep the audit trail available for learning and impact reporting.',
    tone: 'paper',
  },
};

function displayStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function isMobileMissionTask(task: TaskRow | undefined) {
  return Boolean(task?.external_ref?.startsWith('mission:'));
}

function mobileCaseStatus(status: CaseRow['status']) {
  if (status === 'submitted') return 'Mobile: submitted';
  if (status === 'under_review' || status === 'accepted' || status === 'task_created') return 'Mobile: reviewing';
  if (status === 'assigned' || status === 'in_progress') return 'Mobile: dispatched';
  if (status === 'resolved' || status === 'closed') return 'Mobile: resolved';
  return 'Mobile: failed';
}

function mobileTaskStatus(task: TaskRow) {
  if (isMobileMissionTask(task)) return `Mission: ${displayStatus(task.status)}`;
  if (task.assigned_to_type === 'citizen') return `Assigned in mobile: ${displayStatus(task.status)}`;
  return 'Ops task, not directly visible in mobile unless assigned to citizen';
}

function sourceForTask(task: TaskRow): WorkSource {
  if (isMobileMissionTask(task)) return 'mobile_mission';
  if (task.assigned_to_type === 'citizen') return 'mobile_mission';
  return 'hub_dispatch';
}

function sourceLabel(source: WorkSource) {
  if (source === 'mobile_report') return 'Citizen report';
  if (source === 'mobile_mission') return 'Mobile mission';
  if (source === 'field_proof') return 'Field proof';
  return 'Hub dispatch';
}

function stageForCase(c: CaseRow): QueueStage {
  if (c.status === 'rejected') return 'exception';
  if (c.status === 'resolved' || c.status === 'closed') return 'done';
  if (c.status === 'submitted' || c.status === 'under_review' || c.status === 'accepted') return 'intake';
  if (c.status === 'task_created') return 'dispatch';
  return 'field';
}

function stageForTask(t: TaskRow): QueueStage {
  if (t.status === 'completed' || t.status === 'cancelled') return 'done';
  if (t.status === 'blocked' || t.status === 'escalated') return 'exception';
  if (t.status === 'proof_pending') return 'proof';
  if (t.status === 'queued') return 'dispatch';
  return 'field';
}

function stageForProof(p: ProofRow): QueueStage {
  if (p.verification_status === 'verified') return 'done';
  if (p.verification_status === 'rejected') return 'exception';
  return 'proof';
}

function isUrgentItem(item: WorkItem) {
  return item.priority >= 85 || item.stage === 'exception' || item.dueLabel.startsWith('Overdue');
}

function matchesQueueFilter(item: WorkItem, filter: QueueFilter) {
  if (filter === 'all') return true;
  if (filter === 'urgent') return isUrgentItem(item);
  if (filter === 'review') return item.stage === 'intake';
  if (filter === 'assign') return item.stage === 'dispatch';
  if (filter === 'verify') return item.stage === 'proof';
  if (filter === 'blocked') return item.stage === 'exception';
  return true;
}

function normalizedText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function duplicateReportCandidates(target: CaseRow, allCases: CaseRow[]) {
  const targetLocation = normalizedText(target.location_text);
  return allCases
    .filter((candidate) => {
      if (candidate.id === target.id) return false;
      if (candidate.status === 'closed' || candidate.status === 'resolved') return false;
      const sameBlock = Boolean(target.block_id && candidate.block_id === target.block_id);
      const sameCategory = candidate.category === target.category;
      const candidateLocation = normalizedText(candidate.location_text);
      const locationOverlap = Boolean(targetLocation && candidateLocation && (targetLocation.includes(candidateLocation) || candidateLocation.includes(targetLocation)));
      const closeInTime = Math.abs(new Date(target.created_at).getTime() - new Date(candidate.created_at).getTime()) <= 72 * 60 * 60 * 1000;
      return closeInTime && (sameBlock || locationOverlap) && (sameCategory || locationOverlap);
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
}

function rankedShelterSuggestions(shelters: Shelter[], tasks: TaskRow[], blockId: string | null | undefined) {
  return shelters
    .map((shelter) => {
      const activeLoad = tasks.filter((task) => task.shelter_id === shelter.id && openTaskStatuses.includes(task.status)).length;
      const reasons: string[] = [];
      let score = 0;
      if (blockId && shelter.block_id === blockId) {
        score += 40;
        reasons.push('same block');
      }
      if (shelter.status === 'active') {
        score += 35;
        reasons.push('active partner');
      }
      if (shelter.status === 'limited') {
        score += 8;
        reasons.push('limited capacity');
      }
      if (shelter.status === 'pending') reasons.push('pending partner');
      if (shelter.status === 'inactive') {
        score -= 100;
        reasons.push('inactive');
      }
      if (activeLoad > 0) reasons.push(`${activeLoad} open task${activeLoad === 1 ? '' : 's'}`);
      score -= activeLoad * 5;
      return { shelter, score, activeLoad, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

function rankedCitizenSuggestions(citizens: CitizenRow[], tasks: TaskRow[], blockId: string | null | undefined) {
  return citizens
    .map((citizen) => {
      const activeLoad = tasks.filter((task) => task.assigned_to_type === 'citizen' && task.assigned_to_id === citizen.device_id && openTaskStatuses.includes(task.status)).length;
      const reasons: string[] = [];
      let score = 12;
      if (blockId && citizen.block_id === blockId) {
        score += 45;
        reasons.push('same block');
      }
      if (activeLoad === 0) {
        score += 20;
        reasons.push('no open mobile tasks');
      } else {
        reasons.push(`${activeLoad} open mobile task${activeLoad === 1 ? '' : 's'}`);
      }
      score -= activeLoad * 8;
      return { citizen, score, activeLoad, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

function severityScore(c: CaseRow) {
  if (c.severity === 'urgent') return 90;
  if (c.severity === 'today') return 60;
  return 30;
}

function priorityScore(t: TaskRow) {
  if (t.priority === 'critical') return 95;
  if (t.priority === 'high') return 72;
  if (t.priority === 'medium') return 45;
  return 20;
}

function ageMinutes(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function dueLabel(createdAt: string, slaMinutes: number) {
  const left = slaMinutes - ageMinutes(createdAt);
  if (left < 0) return `Overdue by ${Math.abs(left)}m`;
  if (left < 60) return `${left}m left`;
  return `${Math.round(left / 60)}h left`;
}

function recommendationForCase(c: CaseRow) {
  if (c.category === 'injured' || c.category === 'sick') return 'Recommend medical check, high priority, photo + note proof.';
  if (c.category === 'water') return 'Recommend water refill task, medium SLA, proof photo required.';
  if (c.category === 'aggressive') return 'Recommend rescue assessment with safety warning before assignment.';
  if (c.category === 'rescue' || c.category === 'abandoned') return 'Recommend rescue assessment and nearest shelter assignment.';
  return 'Recommend follow-up task with proof photo.';
}

function proofTone(status: ProofVerificationStatus): WorkItem['tone'] {
  if (status === 'verified') return 'jungle';
  if (status === 'rejected') return 'coral';
  if (status === 'needs_review') return 'plum';
  return 'gold';
}

function canRunPrimaryAction(item: WorkItem) {
  if (item.kind === 'case') return Boolean(item.caseRow && (item.caseRow.status === 'submitted' || item.caseRow.status === 'under_review'));
  if (item.kind === 'task') return Boolean(item.taskRow && (item.taskRow.status === 'queued' || item.taskRow.status === 'assigned'));
  return Boolean(item.proofRow && (item.proofRow.verification_status === 'pending' || item.proofRow.verification_status === 'needs_review'));
}

export default function ActionQueuePage() {
  const supabase = getSupabase();
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [q, setQ] = useState('');
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [templates, setTemplates] = useState<TaskTemplateRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [citizens, setCitizens] = useState<CitizenRow[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const caseById = useMemo(() => new Map(cases.map((c) => [c.id, c])), [cases]);
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const templateById = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const blockById = useMemo(() => new Map(blocks.map((b) => [b.id, b])), [blocks]);
  const shelterById = useMemo(() => new Map(shelters.map((s) => [s.id, s])), [shelters]);
  const citizenById = useMemo(() => new Map(citizens.map((citizen) => [citizen.id, citizen])), [citizens]);
  const citizenByDevice = useMemo(() => new Map(citizens.map((citizen) => [citizen.device_id, citizen])), [citizens]);
  const defaultShelterId = shelters[0]?.id ?? null;

  async function load() {
    setLoadError(null);
    if (!supabase) {
      setCases(demoCases);
      setTasks(demoTasks);
      setProofs(demoProofs);
      setTemplates(demoTaskTemplates);
      setBlocks(demoBlocks);
      setShelters(demoShelters);
      setCitizens(demoCitizens);
      setLastUpdated(new Date());
      return;
    }

    const [c, t, p, tt, b, s, cz] = await Promise.all([
      supabase.from('cases').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('proofs').select('*').order('submitted_at', { ascending: false }).limit(300),
      supabase.from('task_templates').select('*').order('type', { ascending: true }),
      supabase.from('blocks').select('id,name,code').order('name', { ascending: true }),
      supabase.from('shelters').select('id,name,block_id,status').order('name', { ascending: true }),
      supabase.from('citizens').select('id,device_id,block_id,created_at,user_id').order('created_at', { ascending: false }).limit(300),
    ]);

    const failure = [c.error, t.error, p.error, tt.error, b.error, s.error, cz.error].find(Boolean);
    if (failure) {
      setLoadError(failure.message);
    }

    setCases(((c.data ?? []) as unknown) as CaseRow[]);
    setTasks(((t.data ?? []) as unknown) as TaskRow[]);
    setProofs(((p.data ?? []) as unknown) as ProofRow[]);
    setTemplates(((tt.data ?? []) as unknown) as TaskTemplateRow[]);
    setBlocks(((b.data ?? []) as unknown) as Block[]);
    setShelters(((s.data ?? []) as unknown) as Shelter[]);
    setCitizens(((cz.data ?? []) as unknown) as CitizenRow[]);
    setLastUpdated(new Date());
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel('hub_action_queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allWorkItems = useMemo(() => {
    const rows: WorkItem[] = [];
    for (const c of cases) {
      if (['resolved', 'closed'].includes(c.status)) continue;
      const ageBonus = Math.min(25, Math.floor(ageMinutes(c.created_at) / 20));
      const stage = stageForCase(c);
      const duplicateMatches = duplicateReportCandidates(c, cases);
      rows.push({
        key: `case:${c.id}`,
        kind: 'case',
        title: `${c.category.toUpperCase()} report`,
        subtitle: c.location_text || 'Location not provided',
        meta: c.external_id,
        status: displayStatus(c.status),
        stage,
        source: 'mobile_report',
        sourceLabel: sourceLabel('mobile_report'),
        mobileStatus: mobileCaseStatus(c.status),
        mobileImpact: c.status === 'rejected' ? 'The reporter sees a failed/rejected state.' : c.status === 'resolved' || c.status === 'closed' ? 'The reporter sees resolved.' : c.status === 'assigned' || c.status === 'in_progress' ? 'The reporter sees volunteer assigned.' : 'The reporter is waiting for review.',
        tone: stage === 'exception' ? 'coral' : stageCopy[stage].tone,
        priority: severityScore(c) + ageBonus + (duplicateMatches.length > 0 ? 8 : 0),
        dueLabel: dueLabel(c.created_at, c.severity === 'urgent' ? 30 : c.severity === 'today' ? 180 : 480),
        primaryAction: c.status === 'submitted' || c.status === 'under_review' ? 'Review + create task' : stage === 'dispatch' ? 'Dispatch field work' : 'Open report',
        duplicateMatches,
        caseRow: c,
      });
    }

    for (const t of tasks) {
      if (['completed', 'cancelled'].includes(t.status)) continue;
      const tpl = t.template_id ? templateById.get(t.template_id) : null;
      const c = t.case_id ? caseById.get(t.case_id) : null;
      const stage = stageForTask(t);
      const source = sourceForTask(t);
      rows.push({
        key: `task:${t.id}`,
        kind: 'task',
        title: tpl?.title ?? 'Field work',
        subtitle: c?.location_text || (t.block_id ? blockById.get(t.block_id)?.name ?? 'Unknown block' : 'No location context'),
        meta: c?.external_id ?? 'Manual task',
        status: displayStatus(t.status),
        stage,
        source,
        sourceLabel: sourceLabel(source),
        mobileStatus: mobileTaskStatus(t),
        mobileImpact: t.assigned_to_type === 'citizen' ? 'This task is readable by the assigned mobile device.' : t.status === 'queued' ? 'Assign to a citizen to make it appear under From shelter ops.' : 'Shelter-owned work updates the report status, not a specific mobile task card.',
        tone: stageCopy[stage].tone,
        priority: priorityScore(t) + (t.status === 'queued' ? 12 : 0),
        dueLabel: t.due_at ? dueLabel(t.created_at, Math.max(15, Math.round((new Date(t.due_at).getTime() - new Date(t.created_at).getTime()) / 60000))) : 'No SLA set',
        primaryAction: t.status === 'queued' ? 'Assign owner' : t.status === 'assigned' ? 'Start field work' : t.status === 'proof_pending' ? 'Review linked proof' : 'Open field context',
        taskRow: t,
        caseRow: c ?? undefined,
      });
    }

    for (const p of proofs) {
      if (p.verification_status === 'verified') continue;
      const t = taskById.get(p.task_id);
      const tpl = t?.template_id ? templateById.get(t.template_id) : null;
      const c = t?.case_id ? caseById.get(t.case_id) : null;
      const stage = stageForProof(p);
      rows.push({
        key: `proof:${p.id}`,
        kind: 'proof',
        title: `${tpl?.title ?? 'Evidence'} proof`,
        subtitle: p.note || 'No field note provided',
        meta: c?.external_id ?? 'Unlinked evidence',
        status: displayStatus(p.verification_status),
        stage,
        source: 'field_proof',
        sourceLabel: sourceLabel('field_proof'),
        mobileStatus: t ? mobileTaskStatus(t) : 'Unlinked proof',
        mobileImpact: p.verification_status === 'rejected' ? 'The mission/report needs a clear rejection reason.' : 'The mobile user is waiting for evidence review.',
        tone: proofTone(p.verification_status),
        priority: 70 + Math.min(20, Math.floor(ageMinutes(p.submitted_at) / 30)),
        dueLabel: dueLabel(p.submitted_at, 120),
        primaryAction: 'Verify + complete task',
        proofRow: p,
        taskRow: t,
        caseRow: c ?? undefined,
      });
    }

    return rows.sort((a, b) => b.priority - a.priority);
  }, [blockById, caseById, cases, proofs, taskById, tasks, templateById]);

  const workItems = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return allWorkItems
      .filter((row) => {
        if (!matchesQueueFilter(row, queueFilter)) return false;
        if (!qq) return true;
        return `${row.title} ${row.subtitle} ${row.meta} ${row.status} ${row.sourceLabel} ${row.mobileStatus}`.toLowerCase().includes(qq);
      });
  }, [allWorkItems, q, queueFilter]);

  useEffect(() => {
    setSelectedKey((prev) => {
      if (prev && workItems.some((item) => item.key === prev)) return prev;
      return workItems[0]?.key ?? null;
    });
  }, [workItems]);

  const selected = workItems.find((item) => item.key === selectedKey) ?? workItems[0] ?? null;
  const selectedBlock = selected?.caseRow?.block_id ? blockById.get(selected.caseRow.block_id) : selected?.taskRow?.block_id ? blockById.get(selected.taskRow.block_id) : null;
  const selectedShelter = selected?.taskRow?.shelter_id ? shelterById.get(selected.taskRow.shelter_id) : selected?.caseRow?.shelter_id ? shelterById.get(selected.caseRow.shelter_id) : null;
  const selectedCitizen = selected?.taskRow?.assigned_to_type === 'citizen' && selected.taskRow.assigned_to_id ? citizenByDevice.get(selected.taskRow.assigned_to_id) : selected?.caseRow?.citizen_id ? citizenById.get(selected.caseRow.citizen_id) : null;
  const selectedTemplate = selected?.taskRow?.template_id ? templateById.get(selected.taskRow.template_id) : null;
  const selectedShelterSuggestions = useMemo(() => rankedShelterSuggestions(shelters, tasks, selected?.taskRow?.block_id ?? selected?.caseRow?.block_id), [selected?.caseRow?.block_id, selected?.taskRow?.block_id, shelters, tasks]);
  const selectedCitizenSuggestions = useMemo(() => rankedCitizenSuggestions(citizens, tasks, selected?.taskRow?.block_id ?? selected?.caseRow?.block_id), [citizens, selected?.caseRow?.block_id, selected?.taskRow?.block_id, tasks]);
  const recommendedShelterId = selectedShelterSuggestions.find((suggestion) => suggestion.shelter.status !== 'inactive')?.shelter.id ?? defaultShelterId;
  const nearbySignals = selectedBlock ? cases.filter((c) => c.block_id === selectedBlock.id && !['rejected', 'resolved', 'closed'].includes(c.status)).length : 0;

  async function recordDomainEvent(item: WorkItem, eventType: string, summary: string, payload: Record<string, unknown> = {}) {
    if (!supabase) return;
    const result = await supabase.from('domain_events').insert({
      event_type: eventType,
      actor_role: 'ops',
      case_id: item.caseRow?.id ?? item.taskRow?.case_id ?? null,
      task_id: item.taskRow?.id ?? null,
      proof_id: item.proofRow?.id ?? null,
      animal_id: item.caseRow?.animal_id ?? item.taskRow?.animal_id ?? item.proofRow?.animal_id ?? null,
      block_id: item.caseRow?.block_id ?? item.taskRow?.block_id ?? null,
      shelter_id: item.caseRow?.shelter_id ?? item.taskRow?.shelter_id ?? null,
      summary,
      payload,
    });
    if (result.error) throw result.error;
  }

  async function recordAssignment(item: WorkItem, assignedToType: 'shelter' | 'citizen', assignedToId: string, reason: string) {
    if (!supabase || !item.taskRow) return;
    const result = await supabase.from('task_assignments').insert({
      task_id: item.taskRow.id,
      assigned_to_type: assignedToType,
      assigned_to_id: assignedToId,
      assignment_reason: reason,
      status: 'offered',
    });
    if (result.error) throw result.error;
    await recordDomainEvent(item, 'task.assigned', `Assigned ${item.title} to ${assignedToType}.`, { assigned_to_type: assignedToType, assigned_to_id: assignedToId, reason });
  }

  async function updateCaseStatus(caseId: string, nextStatus: CaseRow['status'], reason?: string, fallbackPatch: Partial<CaseRow> = {}) {
    if (!supabase) return;
    const rpcResult = await supabase.rpc('ops_update_case_status', { p_case_id: caseId, p_next_status: nextStatus, p_reason: reason ?? null });
    if (!rpcResult.error) return;
    const fallbackResult = await supabase.from('cases').update({ status: nextStatus, ...fallbackPatch }).eq('id', caseId);
    if (fallbackResult.error) throw fallbackResult.error;
  }

  async function updateTaskStatus(taskId: string, nextStatus: TaskRow['status'], reason?: string, fallbackPatch: Partial<TaskRow> = {}) {
    if (!supabase) return;
    const rpcResult = await supabase.rpc('ops_update_task_status', { p_task_id: taskId, p_next_status: nextStatus, p_reason: reason ?? null });
    if (!rpcResult.error) return;
    const fallbackResult = await supabase.from('tasks').update({ status: nextStatus, ...fallbackPatch }).eq('id', taskId);
    if (fallbackResult.error) throw fallbackResult.error;
  }

  async function updateProofStatus(proofId: string, nextStatus: ProofVerificationStatus, reason?: string) {
    if (!supabase) return;
    const rpcResult = await supabase.rpc('ops_update_proof_status', { p_proof_id: proofId, p_next_status: nextStatus, p_reason: reason ?? null });
    if (!rpcResult.error) return;
    const fallbackResult = await supabase.from('proofs').update({ verification_status: nextStatus }).eq('id', proofId);
    if (fallbackResult.error) throw fallbackResult.error;
  }

  async function assignTask(item: WorkItem, shelterId: string | null) {
    if (!item.taskRow || !shelterId) return;
    setActionError(null);
    setActionMessage(null);
    if (!supabase) {
      setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? {
        ...t,
        shelter_id: shelterId,
        assigned_to_type: 'shelter',
        assigned_to_id: shelterId,
        status: t.status === 'queued' ? 'assigned' : t.status,
        updated_at: new Date().toISOString(),
      } : t));
      if (item.taskRow.case_id) {
        setCases((prev) => prev.map((c) => c.id === item.taskRow?.case_id ? { ...c, status: 'assigned', updated_at: new Date().toISOString() } : c));
      }
      setActionMessage('Task assigned in demo data.');
      return;
    }

    setBusyItem(item.key);
    try {
      const taskResult = await supabase.from('tasks').update({
        shelter_id: shelterId,
        assigned_to_type: 'shelter',
        assigned_to_id: shelterId,
      }).eq('id', item.taskRow.id);
      if (taskResult.error) throw taskResult.error;
      if (item.taskRow.status === 'queued') await updateTaskStatus(item.taskRow.id, 'assigned');
      if (item.taskRow.case_id) await updateCaseStatus(item.taskRow.case_id, 'assigned');
      await recordAssignment(item, 'shelter', shelterId, 'Assigned from action queue recommendation.');
      setActionMessage(`${item.title} assigned to shelter.`);
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Task assignment failed. Try again.');
    } finally {
      setBusyItem(null);
    }
  }

  async function assignTaskToCitizen(item: WorkItem, citizen: CitizenRow | null) {
    if (!item.taskRow || !citizen) return;
    setActionError(null);
    setActionMessage(null);
    if (!supabase) {
      setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? {
        ...t,
        assigned_to_type: 'citizen',
        assigned_to_id: citizen.device_id,
        status: t.status === 'queued' ? 'assigned' : t.status,
        updated_at: new Date().toISOString(),
      } : t));
      if (item.taskRow.case_id) {
        setCases((prev) => prev.map((c) => c.id === item.taskRow?.case_id ? { ...c, status: 'assigned', updated_at: new Date().toISOString() } : c));
      }
      setActionMessage('Task assigned to mobile volunteer in demo data.');
      return;
    }

    setBusyItem(item.key);
    try {
      const taskResult = await supabase.from('tasks').update({
        assigned_to_type: 'citizen',
        assigned_to_id: citizen.device_id,
      }).eq('id', item.taskRow.id);
      if (taskResult.error) throw taskResult.error;
      if (item.taskRow.status === 'queued') await updateTaskStatus(item.taskRow.id, 'assigned');
      if (item.taskRow.case_id) await updateCaseStatus(item.taskRow.case_id, 'assigned');
      await recordAssignment(item, 'citizen', citizen.device_id, 'Assigned to mobile volunteer from action queue.');
      setActionMessage(`${item.title} assigned to mobile volunteer.`);
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Mobile assignment failed. Try again.');
    } finally {
      setBusyItem(null);
    }
  }

  async function runPrimaryAction(item: WorkItem) {
    if (!canRunPrimaryAction(item)) return;
    setActionError(null);
    setActionMessage(null);
    if (!supabase) {
      if (item.kind === 'case' && item.caseRow) {
        setCases((prev) => prev.map((c) => c.id === item.caseRow?.id ? { ...c, status: 'task_created', updated_at: new Date().toISOString() } : c));
      }
      if (item.kind === 'task' && item.taskRow) {
        if (item.taskRow.status === 'queued') {
          await assignTask(item, recommendedShelterId ?? demoShelters[0]?.id ?? null);
        } else if (item.taskRow.status === 'assigned') {
          setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? { ...t, status: 'in_progress', updated_at: new Date().toISOString() } : t));
          if (item.caseRow) setCases((prev) => prev.map((c) => c.id === item.caseRow?.id ? { ...c, status: 'in_progress', updated_at: new Date().toISOString() } : c));
        }
      }
      if (item.kind === 'proof' && item.proofRow) {
        setProofs((prev) => prev.map((p) => p.id === item.proofRow?.id ? { ...p, verification_status: 'verified' } : p));
        if (item.taskRow) setTasks((prev) => prev.map((t) => t.id === item.taskRow?.id ? { ...t, status: 'completed', updated_at: new Date().toISOString() } : t));
        if (item.caseRow) setCases((prev) => prev.map((c) => c.id === item.caseRow?.id ? { ...c, status: 'resolved', updated_at: new Date().toISOString() } : c));
      }
      setActionMessage(`${item.primaryAction} completed in demo data.`);
      return;
    }
    if (!supabase) return;
    setBusyItem(item.key);
    try {
      if (item.kind === 'case' && item.caseRow) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (item.caseRow.status === 'submitted') {
          await updateCaseStatus(item.caseRow.id, 'under_review');
        }
        const reviewResult = await supabase.from('case_reviews').insert({
          case_id: item.caseRow.id,
          reviewer_user_id: userData.user?.id ?? null,
          decision: 'accepted',
        });
        if (reviewResult.error) throw reviewResult.error;
        await recordDomainEvent(item, 'case.accepted', `Accepted ${item.meta} for operational follow-up.`, { source: item.source });
      }
      if (item.kind === 'task' && item.taskRow?.status === 'queued' && recommendedShelterId) {
        await assignTask(item, recommendedShelterId);
        return;
      }
      if (item.kind === 'task' && item.taskRow?.status === 'assigned') {
        await updateTaskStatus(item.taskRow.id, 'in_progress');
        if (item.taskRow.case_id) await updateCaseStatus(item.taskRow.case_id, 'in_progress');
        await recordDomainEvent(item, 'task.started', `Started ${item.title}.`, { previous_status: item.taskRow.status });
      }
      if (item.kind === 'proof' && item.proofRow) {
        await updateProofStatus(item.proofRow.id, 'verified');
        if (item.taskRow) await updateTaskStatus(item.taskRow.id, 'completed');
        if (item.caseRow) await updateCaseStatus(item.caseRow.id, 'resolved');
        await recordDomainEvent(item, 'proof.verified', `Verified evidence for ${item.meta}.`, { verification_status: 'verified' });
      }
      setActionMessage(`${item.primaryAction} completed.`);
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Action failed. Try again.');
    } finally {
      setBusyItem(null);
    }
  }

  async function rejectSelected() {
    setActionError(null);
    setActionMessage(null);
    if (!supabase && selected) {
      if (selected.kind === 'case' && selected.caseRow) {
        setCases((prev) => prev.map((c) => c.id === selected.caseRow?.id ? {
          ...c,
          status: 'rejected',
          reject_reason_code: 'not_actionable',
          reject_reason_text: 'Rejected from demo action queue.',
          updated_at: new Date().toISOString(),
        } : c));
      }
      if (selected.kind === 'proof' && selected.proofRow) {
        setProofs((prev) => prev.map((p) => p.id === selected.proofRow?.id ? { ...p, verification_status: 'rejected' } : p));
      }
      setActionMessage('Selected item rejected in demo data.');
      return;
    }
    if (!supabase || !selected) return;
    setBusyItem(selected.key);
    try {
      if (selected.kind === 'case' && selected.caseRow) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        await updateCaseStatus(selected.caseRow.id, 'rejected', 'Rejected from action queue.', { reject_reason_code: 'not_actionable', reject_reason_text: 'Rejected from action queue.' });
        const reviewResult = await supabase.from('case_reviews').insert({ case_id: selected.caseRow.id, reviewer_user_id: userData.user?.id ?? null, decision: 'rejected', fixed_reason_code: 'not_actionable', free_text_reason: 'Rejected from action queue.' });
        if (reviewResult.error) throw reviewResult.error;
        await recordDomainEvent(selected, 'case.rejected', `Rejected ${selected.meta}.`, { reason: 'not_actionable' });
      }
      if (selected.kind === 'proof' && selected.proofRow) {
        await updateProofStatus(selected.proofRow.id, 'rejected', 'Rejected from action queue.');
        await recordDomainEvent(selected, 'proof.rejected', `Rejected evidence for ${selected.meta}.`, { reason: 'not_actionable' });
      }
      setActionMessage(`${selected.title} rejected and mobile state updated.`);
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Rejection failed. Try again.');
    } finally {
      setBusyItem(null);
    }
  }

  async function escalateSelected() {
    if (!selected) return;
    setActionError(null);
    setActionMessage(null);
    if (!supabase) {
      if (selected.taskRow) setTasks((prev) => prev.map((task) => task.id === selected.taskRow?.id ? { ...task, status: 'escalated', priority: 'critical', updated_at: new Date().toISOString() } : task));
      setActionMessage('Selected item escalated in demo data.');
      return;
    }
    setBusyItem(selected.key);
    try {
      if (selected.taskRow) {
        await updateTaskStatus(selected.taskRow.id, 'escalated', 'Escalated urgent case from action queue.', { priority: 'critical' });
      }
      if (selected.caseRow && selected.caseRow.status === 'submitted') {
        await updateCaseStatus(selected.caseRow.id, 'under_review', 'Escalated urgent case from action queue.');
      }
      await recordDomainEvent(selected, selected.taskRow ? 'task.escalated' : 'case.escalated', `Escalated ${selected.meta} for urgent ops review.`, { source: 'action_queue' });
      setActionMessage(`${selected.title} escalated for urgent review.`);
      await load();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Escalation failed. Try again.');
    } finally {
      setBusyItem(null);
    }
  }

  const filterCounts: Record<QueueFilter, number> = {
    all: allWorkItems.length,
    urgent: allWorkItems.filter(isUrgentItem).length,
    review: allWorkItems.filter((item) => item.stage === 'intake').length,
    assign: allWorkItems.filter((item) => item.stage === 'dispatch').length,
    verify: allWorkItems.filter((item) => item.stage === 'proof').length,
    blocked: allWorkItems.filter((item) => item.stage === 'exception').length,
  };

  const summaryStats = [
    { label: 'Open work', value: allWorkItems.length, tone: 'ink' as const },
    { label: 'Urgent', value: filterCounts.urgent, tone: filterCounts.urgent > 0 ? 'coral' as const : 'jungle' as const },
    { label: 'Needs assignment', value: filterCounts.assign, tone: 'sky' as const },
    { label: 'Proofs waiting', value: filterCounts.verify, tone: 'jungle' as const },
  ];

  const historySteps = selected ? [
    ['Submitted', selected.caseRow?.created_at ?? selected.taskRow?.created_at ?? selected.proofRow?.submitted_at],
    ['Reviewed', selected.caseRow?.status && selected.caseRow.status !== 'submitted' ? selected.caseRow.updated_at : null],
    ['Assigned', selected.taskRow?.status === 'assigned' || selected.caseRow?.status === 'assigned' ? selected.taskRow?.updated_at ?? selected.caseRow?.updated_at : null],
    ['Evidence submitted', selected.proofRow?.submitted_at ?? null],
    ['Resolved', selected.caseRow?.status === 'resolved' ? selected.caseRow.updated_at : null],
  ] : [];

  return (
    <div className="grid gap-5">
      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Today&apos;s work queue</div>
            <h2 className="fredoka mt-2 text-[30px] font-semibold leading-tight md:text-[38px]">One inbox for the next operational decision.</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">Review reports, assign field work, verify proof, and unblock exceptions without switching modes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={supabase ? 'jungle' : 'gold'} variant="soft">{supabase ? 'live sync' : 'demo ledger'}</Pill>
            <Pill tone="paper" variant="soft">{lastUpdated ? `updated ${lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : 'loading'}</Pill>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="rounded-[20px] border border-[var(--border)] bg-white/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{stat.label}</div>
                <Pill tone={stat.tone} variant="soft">now</Pill>
              </div>
              <div className="mono mt-3 text-[28px] font-black text-[var(--ink)]">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {queueFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setQueueFilter(filter.key)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${queueFilter === filter.key ? 'border-transparent bg-[var(--ink)] text-white' : 'border-[var(--border)] bg-white/70 text-[var(--ink2)] hover:bg-white'}`}
                type="button"
              >
                {filter.label} <span className="mono opacity-70">{filterCounts[filter.key]}</span>
              </button>
            ))}
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-[16px] border border-[var(--border)] bg-white/70 px-3 lg:w-[320px]">
            <Search size={15} className="shrink-0 text-[var(--muted)]" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search area, case, proof"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
        {loadError && <div className="mt-4"><ActionStatus type="error">Load issue: {loadError}</ActionStatus></div>}
        {actionError && <div className="mt-4"><ActionStatus type="error">{actionError}</ActionStatus></div>}
        {actionMessage && <div className="mt-4"><ActionStatus type="success">{actionMessage}</ActionStatus></div>}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[390px_1fr]">
          <div className="border-b border-[var(--hairline)] lg:border-r lg:border-b-0">
            <div className="border-b border-[var(--hairline)] bg-[var(--paper)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Action Queue</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">Highest-risk work first. One decision per item.</div>
                </div>
                <Pill tone={queueFilter === 'urgent' || queueFilter === 'blocked' ? 'coral' : 'ink'} variant="soft">{workItems.length}</Pill>
              </div>
            </div>

            <div className="max-h-[680px] divide-y divide-[var(--hairline)] overflow-y-auto bg-[var(--surface)]">
              {workItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedKey(item.key)}
                  className={`w-full px-4 py-3 text-left transition ${selected?.key === item.key ? 'bg-[var(--jungle-soft)]' : 'hover:bg-[var(--paper)]'}`}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.kind === 'case' && <FileText size={15} className="text-[var(--muted)]" />}
                        {item.kind === 'task' && <Compass size={15} className="text-[var(--muted)]" />}
                        {item.kind === 'proof' && <ImageIcon size={15} className="text-[var(--muted)]" />}
                        <div className="truncate text-sm font-extrabold text-[var(--ink)]">{item.title}</div>
                      </div>
                      <div className="mt-1 truncate text-xs font-semibold text-[var(--muted)]">{item.meta} · {item.subtitle}</div>
                    </div>
                    <Pill tone={item.tone} variant="soft">{item.status}</Pill>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {isUrgentItem(item) && <Pill tone="coral" variant="soft">urgent</Pill>}
                    <Pill tone={stageCopy[item.stage].tone} variant="soft">{stageCopy[item.stage].label}</Pill>
                    {item.duplicateMatches && item.duplicateMatches.length > 0 && <Pill tone="coral" variant="soft">possible duplicate</Pill>}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[var(--muted)]">{item.dueLabel}</span>
                    <span className="text-xs font-extrabold text-[var(--ink2)]">{item.primaryAction}</span>
                  </div>
                </button>
              ))}
              {workItems.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <div className="fredoka text-[18px] font-semibold">No action needed</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--muted)]">When new reports, field work, or evidence arrives, it will appear here.</div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {!selected ? (
              <div className="grid min-h-[460px] place-items-center text-center">
                <div>
                  <div className="fredoka text-[22px] font-semibold">Queue clear</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Accept a report, assign work, or verify evidence when new activity arrives.</div>
                </div>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{selected.sourceLabel} · {stageCopy[selected.stage].label}</div>
                    <div className="fredoka mt-2 text-[28px] font-semibold leading-tight">{selected.title}</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--muted)]">{selected.meta} · {selected.subtitle}</div>
                  </div>
                  <Pill tone={selected.tone} variant="solid">{selected.dueLabel}</Pill>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <MapIcon size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Block</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedBlock?.name ?? 'Unknown'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <Users size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Owner</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedShelter?.name ?? selectedCitizen?.device_id ?? 'Unassigned'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <Layers3 size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Template</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selectedTemplate?.title ?? 'Recommended'}</div>
                  </div>
                  <div className="rounded-[18px] border border-[var(--border)] bg-white/60 p-4">
                    <ShieldCheck size={17} className="text-[var(--muted)]" />
                    <div className="mt-3 text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Confidence</div>
                    <div className="mt-1 text-sm font-bold text-[var(--ink2)]">{selected.priority > 85 ? 'Likely urgent' : selected.kind === 'proof' ? 'Needs proof check' : 'Human review'}</div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Recommended action</div>
                        <div className="fredoka mt-1 text-[20px] font-semibold">{selected.primaryAction}</div>
                      </div>
                      <Pill tone={stageCopy[selected.stage].tone} variant="soft">{selected.mobileStatus}</Pill>
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-6 text-[var(--ink2)]">
                      {selected.caseRow ? recommendationForCase(selected.caseRow) : selected.kind === 'proof' ? 'Verify proof quality, then complete the linked task and case if evidence is clear.' : selected.taskRow?.assigned_to_type === 'citizen' ? 'Keep the task state aligned with the mobile mission flow: assigned, in progress, proof pending, completed.' : 'Assign the best owner, shelter or mobile volunteer, and keep task status current.'}
                    </div>
                    <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-[var(--paper)] p-4">
                      <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Mobile impact</div>
                      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--ink2)]">{selected.mobileImpact}</div>
                    </div>
                    {selected.duplicateMatches && selected.duplicateMatches.length > 0 && (
                      <div className="mt-4 rounded-[18px] border border-[color-mix(in_srgb,var(--coral)_28%,transparent)] bg-[var(--coral-soft)] p-4">
                        <div className="text-[11px] font-black tracking-widest uppercase text-[var(--coral-deep)]">Possible duplicate</div>
                        <div className="mt-2 text-sm font-semibold leading-6 text-[var(--coral-deep)]">Similar reports: {selected.duplicateMatches.map((match) => match.external_id).join(', ')}.</div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">History</div>
                        <div className="fredoka mt-1 text-[20px] font-semibold">Decision trail</div>
                      </div>
                      <Clock3 size={18} className="text-[var(--muted)]" />
                    </div>
                    <div className="mt-5 grid gap-3">
                      {historySteps.map(([label, date], index) => (
                        <div key={label ?? index} className="flex items-center gap-3">
                          <div className={`grid h-8 w-8 place-items-center rounded-[12px] text-sm font-black ${date ? 'bg-[var(--jungle)] text-white' : 'bg-[var(--paper2)] text-[var(--muted)]'}`}>{date ? <Check size={15} /> : index + 1}</div>
                          <div>
                            <div className="text-sm font-extrabold text-[var(--ink)]">{label}</div>
                            <div className="text-xs font-semibold text-[var(--muted)]">{date ? new Date(date).toLocaleString() : 'Not yet'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selected.kind === 'task' && selected.taskRow && (
                  <div className="rounded-[22px] border border-[var(--border)] bg-white/62 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Assignment</div>
                          <div className="fredoka mt-1 text-[20px] font-semibold">Best owner for this task</div>
                        </div>
                        <Pill tone="paper" variant="soft">{nearbySignals} nearby open</Pill>
                      </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {selectedShelterSuggestions.slice(0, 2).map((suggestion, index) => (
                        <div key={suggestion.shelter.id} className="rounded-[18px] border border-[var(--border)] bg-white/70 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-black text-[var(--ink)]">{suggestion.shelter.name}</div>
                              <div className="mt-1 text-xs font-bold text-[var(--muted)]">{suggestion.reasons.join(' · ') || 'manual review'}</div>
                            </div>
                            <Pill tone={index === 0 ? 'jungle' : suggestion.shelter.status === 'limited' ? 'gold' : 'paper'} variant="soft">
                              {index === 0 ? 'Best' : displayStatus(suggestion.shelter.status)}
                            </Pill>
                          </div>
                          <Button
                            size="sm"
                            variant={index === 0 ? 'primary' : 'paper'}
                            className="mt-4 w-full"
                            disabled={busyItem === selected.key || suggestion.shelter.status === 'inactive'}
                            onClick={() => assignTask(selected, suggestion.shelter.id)}
                            type="button"
                          >
                            Assign
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 border-t border-[var(--hairline)] pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Mobile volunteers</div>
                          <div className="mt-1 text-sm font-semibold text-[var(--ink2)]">Assigning to a device makes the task visible in the mobile app under From shelter ops.</div>
                        </div>
                        <Pill tone="sky" variant="soft">device-bound</Pill>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {selectedCitizenSuggestions.slice(0, 2).map((suggestion, index) => (
                          <div key={suggestion.citizen.id} className="rounded-[18px] border border-[var(--border)] bg-white/70 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="mono truncate text-xs font-black text-[var(--ink)]">{suggestion.citizen.device_id}</div>
                                <div className="mt-1 text-xs font-bold text-[var(--muted)]">{suggestion.reasons.join(' · ') || 'manual review'}</div>
                              </div>
                              <Pill tone={index === 0 ? 'jungle' : 'paper'} variant="soft">{index === 0 ? 'Best' : 'Option'}</Pill>
                            </div>
                            <Button
                              size="sm"
                              variant={index === 0 ? 'primary' : 'paper'}
                              className="mt-4 w-full"
                              disabled={busyItem === selected.key}
                              onClick={() => assignTaskToCitizen(selected, suggestion.citizen)}
                              type="button"
                            >
                              Assign to mobile
                            </Button>
                          </div>
                        ))}
                        {selectedCitizenSuggestions.length === 0 && (
                          <div className="rounded-[18px] border border-dashed border-[var(--border)] bg-white/54 p-4 text-sm font-semibold text-[var(--muted)] md:col-span-2">No synced citizen devices are available for mobile assignment.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <Button disabled={busyItem === selected.key || !canRunPrimaryAction(selected)} onClick={() => runPrimaryAction(selected)} type="button">
                    <Check size={16} />
                    {busyItem === selected.key ? 'Working...' : selected.primaryAction}
                  </Button>
                  <Button variant="paper" disabled={busyItem === selected.key || selected.kind === 'task'} onClick={rejectSelected} type="button">
                    <X size={16} />
                    Reject + update mobile
                  </Button>
                  <Button variant="paper" disabled={busyItem === selected.key || !selected} onClick={escalateSelected} type="button">
                    <AlertTriangle size={16} />
                    {busyItem === selected.key ? 'Escalating...' : 'Escalate urgent case'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export type CaseCategory =
  | 'injured'
  | 'feeding'
  | 'water'
  | 'rescue'
  | 'sick'
  | 'aggressive'
  | 'abandoned'
  | 'adoption'
  | 'other';

export type CaseSeverity = 'urgent' | 'today' | 'soon';

export type CaseStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'task_created'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface Block {
  id: string;
  name: string;
  code: string;
}

export interface Shelter {
  id: string;
  name: string;
  block_id: string | null;
  status: 'pending' | 'active' | 'limited' | 'inactive';
}

export interface CaseRow {
  id: string;
  external_id: string;
  citizen_id: string | null;
  block_id: string | null;
  shelter_id: string | null;
  category: CaseCategory;
  severity: CaseSeverity;
  description: string;
  location_text: string;
  status: CaseStatus;
  reject_reason_code: string | null;
  reject_reason_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplateRow {
  id: string;
  type:
    | 'feed'
    | 'water_refill'
    | 'rescue_assessment'
    | 'medical_check'
    | 'follow_up'
    | 'intake_transfer'
    | 'proof_review'
    | 'emergency_escalation';
  title: string;
  description: string;
  required_proof: string;
  sla_minutes: number;
}

export type TaskStatus =
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'proof_pending'
  | 'completed'
  | 'blocked'
  | 'escalated'
  | 'cancelled';

export interface TaskRow {
  id: string;
  case_id: string | null;
  template_id: string | null;
  block_id: string | null;
  shelter_id: string | null;
  external_ref?: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to_type: 'shelter' | 'staff' | 'volunteer' | 'citizen' | null;
  assigned_to_id: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProofVerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';

export interface ProofRow {
  id: string;
  task_id: string;
  photo_uri: string | null;
  note: string | null;
  captured_at: string | null;
  submitted_at: string;
  verification_status: ProofVerificationStatus;
  created_at: string;
}

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

export interface CitizenRow {
  id: string;
  device_id: string;
  block_id: string | null;
  created_at: string;
  updated_at?: string | null;
  user_id?: string | null;
}

export interface CaseRow {
  id: string;
  animal_id?: string | null;
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
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy_meters?: number | null;
  location_captured_at?: string | null;
  location_privacy?: 'exact_ops_only' | 'area' | 'public_safe';
  media_uri?: string | null;
  duplicate_of_case_id?: string | null;
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
  animal_id?: string | null;
  template_id: string | null;
  block_id: string | null;
  shelter_id: string | null;
  external_ref?: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to_type: 'shelter' | 'staff' | 'volunteer' | 'citizen' | null;
  assigned_to_id: string | null;
  due_at: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy_meters?: number | null;
  location_captured_at?: string | null;
  location_privacy?: 'exact_ops_only' | 'area' | 'public_safe';
  outcome_reason_code?: string | null;
  outcome_reason_text?: string | null;
  created_at: string;
  updated_at: string;
}

export type ProofVerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';

export interface ProofRow {
  id: string;
  task_id: string;
  animal_id?: string | null;
  photo_uri: string | null;
  note: string | null;
  captured_at: string | null;
  submitted_at: string;
  verification_status: ProofVerificationStatus;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy_meters?: number | null;
  location_captured_at?: string | null;
  media_storage_path?: string | null;
  media_mime_type?: string | null;
  media_size_bytes?: number | null;
  created_at: string;
}

export interface OperationalEventRow {
  id: string;
  actor_user_id: string | null;
  actor_role: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  case_id: string | null;
  task_id: string | null;
  proof_id: string | null;
  reason: string | null;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type AnimalStatus =
  | 'unknown'
  | 'street_observed'
  | 'needs_help'
  | 'under_observation'
  | 'rescue_requested'
  | 'rescue_in_progress'
  | 'intake_pending'
  | 'in_shelter'
  | 'in_treatment'
  | 'recovering'
  | 'fostered'
  | 'released'
  | 'adopted'
  | 'missing'
  | 'deceased';

export interface AnimalRow {
  id: string;
  public_code: string;
  primary_block_id: string | null;
  current_shelter_id: string | null;
  species: 'dog' | 'cat' | 'bird' | 'cattle' | 'other';
  name: string | null;
  sex: 'female' | 'male' | 'unknown' | null;
  approximate_age: string | null;
  description: string;
  status: AnimalStatus;
  identification_confidence: 'low' | 'medium' | 'high' | 'confirmed';
  last_seen_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnimalEventRow {
  id: string;
  animal_id: string;
  event_type: string;
  case_id: string | null;
  task_id: string | null;
  proof_id: string | null;
  block_id: string | null;
  shelter_id: string | null;
  note: string;
  evidence_quality: 'unverified' | 'weak' | 'acceptable' | 'strong';
  occurred_at: string;
  created_by: string | null;
  created_at: string;
}

export interface DomainEventRow {
  id: string;
  event_type: string;
  actor_user_id: string | null;
  actor_role: string | null;
  case_id: string | null;
  task_id: string | null;
  proof_id: string | null;
  animal_id: string | null;
  block_id: string | null;
  shelter_id: string | null;
  subject_type: string | null;
  subject_id: string | null;
  summary: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface TrustScoreRow {
  id: string;
  subject_type: 'citizen' | 'volunteer' | 'shelter' | 'organization' | 'reviewer' | 'device';
  subject_id: string;
  score: number;
  reliability_score: number;
  evidence_score: number;
  safety_score: number;
  risk_level: 'low' | 'watch' | 'high' | 'unknown';
  rationale: string;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignmentRow {
  id: string;
  task_id: string;
  assigned_to_type: 'shelter' | 'staff' | 'volunteer' | 'citizen';
  assigned_to_id: string;
  assigned_by: string | null;
  assignment_reason: string;
  recommendation_id: string | null;
  status: 'offered' | 'accepted' | 'declined' | 'expired' | 'cancelled' | 'completed';
  accepted_at: string | null;
  declined_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRecommendationRow {
  id: string;
  task_id: string;
  assignee_type: 'shelter' | 'staff' | 'volunteer' | 'citizen';
  assignee_id: string;
  score: number;
  reasons: string[];
  status: 'suggested' | 'accepted' | 'overridden' | 'expired';
  created_at: string;
}

export interface TrustEventRow {
  id: string;
  subject_type: TrustScoreRow['subject_type'];
  subject_id: string;
  event_type: string;
  score_delta: number;
  case_id: string | null;
  task_id: string | null;
  proof_id: string | null;
  reason: string;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface VolunteerProfileRow {
  id: string;
  citizen_id: string | null;
  user_id: string | null;
  home_block_id: string | null;
  status: 'pending' | 'active' | 'paused' | 'suspended';
  service_radius_km: number | null;
  skills: string[];
  transport_modes: string[];
  availability_note: string;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerAvailabilityRow {
  id: string;
  citizen_id: string | null;
  device_id: string;
  block_id: string | null;
  status: 'available' | 'busy' | 'offline' | 'paused';
  skills: string[];
  transport_modes: string[];
  open_task_limit: number;
  available_until: string | null;
  note: string;
  updated_at: string;
  created_at: string;
}

export interface OrganizationProfileRow {
  id: string;
  shelter_id: string | null;
  name: string;
  organization_type: 'ngo' | 'shelter' | 'clinic' | 'foster_network' | 'city_partner';
  status: 'pending' | 'active' | 'limited' | 'inactive' | 'suspended';
  primary_block_id: string | null;
  service_blocks: string[];
  emergency_ready: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCapabilityRow {
  id: string;
  organization_id: string;
  capability: 'rescue' | 'medical' | 'surgery' | 'isolation' | 'foster' | 'adoption' | 'ambulance' | 'feeding' | 'water';
  level: 'basic' | 'standard' | 'advanced' | 'unavailable';
  capacity_note: string;
  updated_at: string;
}

export interface OrganizationCapacitySnapshotRow {
  id: string;
  organization_id: string;
  species: string;
  capacity_total: number | null;
  capacity_available: number | null;
  emergency_slots_available: number | null;
  intake_status: 'open' | 'limited' | 'closed' | 'unknown';
  note: string;
  captured_at: string;
  created_by: string | null;
}

export interface AreaForecastRow {
  id: string;
  block_id: string | null;
  forecast_type: 'rescue_surge' | 'feeding_gap' | 'water_gap' | 'volunteer_shortage' | 'shelter_overload';
  window_start: string;
  window_end: string;
  risk_score: number;
  confidence: 'low' | 'medium' | 'high';
  drivers: Record<string, unknown>;
  recommended_action: string;
  model_version: string;
  created_at: string;
}

export interface ProofQualityScoreRow {
  id: string;
  proof_id: string;
  quality_score: number;
  fraud_risk_score: number;
  location_match: 'match' | 'nearby' | 'mismatch' | 'unknown';
  time_match: 'match' | 'stale' | 'future' | 'unknown';
  reviewer_user_id: string | null;
  notes: string;
  created_at: string;
}

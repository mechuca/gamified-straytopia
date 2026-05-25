-- System alignment foundations.
-- Additive only: animal lifecycle, domain events, trust, assignments, partner intelligence, and forecasts.

-- 1) Domain event stream. This complements operational_events, which remains the audit ledger.
create table if not exists public.domain_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  case_id uuid references public.cases(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  proof_id uuid references public.proofs(id) on delete set null,
  animal_id uuid,
  block_id uuid references public.blocks(id) on delete set null,
  shelter_id uuid references public.shelters(id) on delete set null,
  subject_type text,
  subject_id text,
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.domain_events enable row level security;

drop policy if exists "domain_events_ops_all" on public.domain_events;
create policy "domain_events_ops_all" on public.domain_events
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 2) Animal lifecycle. Cases and tasks are work items; animals are the longitudinal care record.
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  primary_block_id uuid references public.blocks(id) on delete set null,
  current_shelter_id uuid references public.shelters(id) on delete set null,
  species text not null default 'dog' check (species in ('dog', 'cat', 'bird', 'cattle', 'other')),
  name text,
  sex text check (sex in ('female', 'male', 'unknown')),
  approximate_age text,
  description text not null default '',
  status text not null default 'street_observed' check (status in (
    'unknown',
    'street_observed',
    'needs_help',
    'under_observation',
    'rescue_requested',
    'rescue_in_progress',
    'intake_pending',
    'in_shelter',
    'in_treatment',
    'recovering',
    'fostered',
    'released',
    'adopted',
    'missing',
    'deceased'
  )),
  identification_confidence text not null default 'low' check (identification_confidence in ('low', 'medium', 'high', 'confirmed')),
  last_seen_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.animal_events (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals(id) on delete cascade,
  event_type text not null check (event_type in (
    'sighted',
    'reported',
    'rescue_requested',
    'rescue_started',
    'rescued',
    'intake_started',
    'treatment_started',
    'stabilized',
    'rehabilitated',
    'fostered',
    'adopted',
    'released',
    'monitoring_started',
    'missing',
    'deceased'
  )),
  case_id uuid references public.cases(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  proof_id uuid references public.proofs(id) on delete set null,
  block_id uuid references public.blocks(id) on delete set null,
  shelter_id uuid references public.shelters(id) on delete set null,
  note text not null default '',
  evidence_quality text not null default 'unverified' check (evidence_quality in ('unverified', 'weak', 'acceptable', 'strong')),
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.animals enable row level security;
alter table public.animal_events enable row level security;

drop policy if exists "animals_ops_all" on public.animals;
create policy "animals_ops_all" on public.animals
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "animal_events_ops_all" on public.animal_events;
create policy "animal_events_ops_all" on public.animal_events
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 3) Assignment history. Current tasks hold the latest owner; this preserves every dispatch decision.
create table if not exists public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  assigned_to_type text not null check (assigned_to_type in ('shelter', 'staff', 'volunteer', 'citizen')),
  assigned_to_id text not null,
  assigned_by uuid references auth.users(id) on delete set null,
  assignment_reason text not null default '',
  recommendation_id uuid,
  status text not null default 'offered' check (status in ('offered', 'accepted', 'declined', 'expired', 'cancelled', 'completed')),
  accepted_at timestamptz,
  declined_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.task_assignments enable row level security;

drop policy if exists "task_assignments_ops_all" on public.task_assignments;
create policy "task_assignments_ops_all" on public.task_assignments
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 4) Trust infrastructure. Scores are explainable snapshots; events are the evidence behind them.
create table if not exists public.trust_scores (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('citizen', 'volunteer', 'shelter', 'organization', 'reviewer', 'device')),
  subject_id text not null,
  score integer not null default 50 check (score >= 0 and score <= 100),
  reliability_score integer not null default 50 check (reliability_score >= 0 and reliability_score <= 100),
  evidence_score integer not null default 50 check (evidence_score >= 0 and evidence_score <= 100),
  safety_score integer not null default 50 check (safety_score >= 0 and safety_score <= 100),
  risk_level text not null default 'unknown' check (risk_level in ('low', 'watch', 'high', 'unknown')),
  rationale text not null default '',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_type, subject_id)
);

create table if not exists public.trust_events (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('citizen', 'volunteer', 'shelter', 'organization', 'reviewer', 'device')),
  subject_id text not null,
  event_type text not null,
  score_delta integer not null default 0,
  case_id uuid references public.cases(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  proof_id uuid references public.proofs(id) on delete set null,
  reason text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.trust_scores enable row level security;
alter table public.trust_events enable row level security;

drop policy if exists "trust_scores_ops_all" on public.trust_scores;
create policy "trust_scores_ops_all" on public.trust_scores
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "trust_events_ops_all" on public.trust_events;
create policy "trust_events_ops_all" on public.trust_events
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 5) Volunteer and NGO intelligence. Keep PII out of the first schema pass.
create table if not exists public.volunteer_profiles (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid references public.citizens(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  home_block_id uuid references public.blocks(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'suspended')),
  service_radius_km numeric(5,2),
  skills text[] not null default '{}'::text[],
  transport_modes text[] not null default '{}'::text[],
  availability_note text not null default '',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_profiles (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid references public.shelters(id) on delete set null,
  name text not null,
  organization_type text not null default 'ngo' check (organization_type in ('ngo', 'shelter', 'clinic', 'foster_network', 'city_partner')),
  status text not null default 'pending' check (status in ('pending', 'active', 'limited', 'inactive', 'suspended')),
  primary_block_id uuid references public.blocks(id) on delete set null,
  service_blocks uuid[] not null default '{}'::uuid[],
  emergency_ready boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_capabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization_profiles(id) on delete cascade,
  capability text not null check (capability in ('rescue', 'medical', 'surgery', 'isolation', 'foster', 'adoption', 'ambulance', 'feeding', 'water')),
  level text not null default 'basic' check (level in ('basic', 'standard', 'advanced', 'unavailable')),
  capacity_note text not null default '',
  updated_at timestamptz not null default now(),
  unique (organization_id, capability)
);

create table if not exists public.organization_capacity_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organization_profiles(id) on delete cascade,
  species text not null default 'all',
  capacity_total integer,
  capacity_available integer,
  emergency_slots_available integer,
  intake_status text not null default 'unknown' check (intake_status in ('open', 'limited', 'closed', 'unknown')),
  note text not null default '',
  captured_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.volunteer_profiles enable row level security;
alter table public.organization_profiles enable row level security;
alter table public.organization_capabilities enable row level security;
alter table public.organization_capacity_snapshots enable row level security;

drop policy if exists "volunteer_profiles_ops_all" on public.volunteer_profiles;
create policy "volunteer_profiles_ops_all" on public.volunteer_profiles
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "organization_profiles_ops_all" on public.organization_profiles;
create policy "organization_profiles_ops_all" on public.organization_profiles
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "organization_capabilities_ops_all" on public.organization_capabilities;
create policy "organization_capabilities_ops_all" on public.organization_capabilities
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "organization_capacity_snapshots_ops_all" on public.organization_capacity_snapshots;
create policy "organization_capacity_snapshots_ops_all" on public.organization_capacity_snapshots
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 6) Predictive intelligence. These tables store forecast outputs, not claims that prediction exists yet.
create table if not exists public.area_forecasts (
  id uuid primary key default gen_random_uuid(),
  block_id uuid references public.blocks(id) on delete cascade,
  forecast_type text not null check (forecast_type in ('rescue_surge', 'feeding_gap', 'water_gap', 'volunteer_shortage', 'shelter_overload')),
  window_start timestamptz not null,
  window_end timestamptz not null,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  confidence text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  drivers jsonb not null default '{}'::jsonb,
  recommended_action text not null default '',
  model_version text not null default 'manual-v1',
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_recommendations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  assignee_type text not null check (assignee_type in ('shelter', 'volunteer', 'citizen', 'staff')),
  assignee_id text not null,
  score integer not null check (score >= 0 and score <= 100),
  reasons text[] not null default '{}'::text[],
  status text not null default 'suggested' check (status in ('suggested', 'accepted', 'overridden', 'expired')),
  created_at timestamptz not null default now()
);

create table if not exists public.proof_quality_scores (
  id uuid primary key default gen_random_uuid(),
  proof_id uuid not null references public.proofs(id) on delete cascade,
  quality_score integer not null check (quality_score >= 0 and quality_score <= 100),
  fraud_risk_score integer not null default 0 check (fraud_risk_score >= 0 and fraud_risk_score <= 100),
  location_match text not null default 'unknown' check (location_match in ('match', 'nearby', 'mismatch', 'unknown')),
  time_match text not null default 'unknown' check (time_match in ('match', 'stale', 'future', 'unknown')),
  reviewer_user_id uuid references auth.users(id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (proof_id)
);

alter table public.area_forecasts enable row level security;
alter table public.assignment_recommendations enable row level security;
alter table public.proof_quality_scores enable row level security;

drop policy if exists "area_forecasts_ops_all" on public.area_forecasts;
create policy "area_forecasts_ops_all" on public.area_forecasts
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "assignment_recommendations_ops_all" on public.assignment_recommendations;
create policy "assignment_recommendations_ops_all" on public.assignment_recommendations
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "proof_quality_scores_ops_all" on public.proof_quality_scores;
create policy "proof_quality_scores_ops_all" on public.proof_quality_scores
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- 7) Updated-at triggers and indexes.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_animals_updated_at') then
    create trigger set_animals_updated_at before update on public.animals for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_task_assignments_updated_at') then
    create trigger set_task_assignments_updated_at before update on public.task_assignments for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_trust_scores_updated_at') then
    create trigger set_trust_scores_updated_at before update on public.trust_scores for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_volunteer_profiles_updated_at') then
    create trigger set_volunteer_profiles_updated_at before update on public.volunteer_profiles for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_organization_profiles_updated_at') then
    create trigger set_organization_profiles_updated_at before update on public.organization_profiles for each row execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'domain_events_case_id_created_at_idx') then
    create index domain_events_case_id_created_at_idx on public.domain_events (case_id, occurred_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'domain_events_event_type_idx') then
    create index domain_events_event_type_idx on public.domain_events (event_type, occurred_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'animals_status_block_idx') then
    create index animals_status_block_idx on public.animals (status, primary_block_id, updated_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'animal_events_animal_id_idx') then
    create index animal_events_animal_id_idx on public.animal_events (animal_id, occurred_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'task_assignments_task_id_idx') then
    create index task_assignments_task_id_idx on public.task_assignments (task_id, created_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'trust_events_subject_idx') then
    create index trust_events_subject_idx on public.trust_events (subject_type, subject_id, created_at desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'area_forecasts_block_type_idx') then
    create index area_forecasts_block_type_idx on public.area_forecasts (block_id, forecast_type, window_start desc);
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'assignment_recommendations_task_id_idx') then
    create index assignment_recommendations_task_id_idx on public.assignment_recommendations (task_id, score desc);
  end if;
end;
$$;

-- 8) Link core work rows to an animal when available. Nullable so this does not disrupt existing rows.
alter table public.cases
  add column if not exists animal_id uuid references public.animals(id) on delete set null;

alter table public.tasks
  add column if not exists animal_id uuid references public.animals(id) on delete set null;

alter table public.proofs
  add column if not exists animal_id uuid references public.animals(id) on delete set null;

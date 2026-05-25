-- Activation workflows.
-- Adds guarded RPCs for lifecycle creation, onboarding, capacity snapshots, trust scoring, and optional forecast scheduling.

create or replace function public.create_animal_from_case(
  p_case_id uuid,
  p_name text default null,
  p_species text default 'dog'
)
returns public.animals
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  case_row public.cases;
  animal_row public.animals;
  event_type_value text;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can create animal lifecycle records';
  end if;

  select * into case_row from public.cases where id = p_case_id for update;
  if not found then
    raise exception 'Case not found';
  end if;

  if case_row.animal_id is not null then
    select * into animal_row from public.animals where id = case_row.animal_id;
    return animal_row;
  end if;

  insert into public.animals (
    public_code,
    primary_block_id,
    current_shelter_id,
    species,
    name,
    description,
    status,
    identification_confidence,
    last_seen_at,
    created_by
  ) values (
    'AN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    case_row.block_id,
    case_row.shelter_id,
    case when p_species in ('dog', 'cat', 'bird', 'cattle', 'other') then p_species else 'other' end,
    nullif(trim(coalesce(p_name, '')), ''),
    concat_ws(' · ', case_row.category, nullif(case_row.location_text, ''), nullif(case_row.description, '')),
    case when case_row.severity = 'urgent' then 'rescue_requested' else 'needs_help' end,
    'low',
    coalesce(case_row.location_captured_at, case_row.created_at),
    auth.uid()
  ) returning * into animal_row;

  update public.cases set animal_id = animal_row.id where id = case_row.id;
  update public.tasks set animal_id = animal_row.id where case_id = case_row.id;
  update public.proofs p set animal_id = animal_row.id from public.tasks t where p.task_id = t.id and t.case_id = case_row.id;

  event_type_value := case when case_row.severity = 'urgent' then 'rescue_requested' else 'reported' end;
  insert into public.animal_events (animal_id, event_type, case_id, block_id, shelter_id, note, evidence_quality, occurred_at, created_by)
  values (animal_row.id, event_type_value, case_row.id, case_row.block_id, case_row.shelter_id, 'Created from rescue case ' || case_row.external_id, 'unverified', case_row.created_at, auth.uid());

  insert into public.domain_events (event_type, actor_user_id, actor_role, case_id, animal_id, block_id, shelter_id, summary, payload)
  values ('animal.linked_to_case', auth.uid(), 'ops', case_row.id, animal_row.id, case_row.block_id, case_row.shelter_id, 'Created animal lifecycle record from case.', jsonb_build_object('external_id', case_row.external_id));

  return animal_row;
end;
$$;

create or replace function public.add_animal_lifecycle_event(
  p_animal_id uuid,
  p_event_type text,
  p_next_status text default null,
  p_note text default ''
)
returns public.animal_events
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  animal_row public.animals;
  event_row public.animal_events;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can add animal lifecycle events';
  end if;

  select * into animal_row from public.animals where id = p_animal_id for update;
  if not found then
    raise exception 'Animal not found';
  end if;

  if p_event_type not in ('sighted','reported','rescue_requested','rescue_started','rescued','intake_started','treatment_started','stabilized','rehabilitated','fostered','adopted','released','monitoring_started','missing','deceased') then
    raise exception 'Invalid animal event type: %', p_event_type;
  end if;

  insert into public.animal_events (animal_id, event_type, block_id, shelter_id, note, evidence_quality, created_by)
  values (animal_row.id, p_event_type, animal_row.primary_block_id, animal_row.current_shelter_id, coalesce(p_note, ''), 'acceptable', auth.uid())
  returning * into event_row;

  if p_next_status is not null then
    if p_next_status not in ('unknown','street_observed','needs_help','under_observation','rescue_requested','rescue_in_progress','intake_pending','in_shelter','in_treatment','recovering','fostered','released','adopted','missing','deceased') then
      raise exception 'Invalid animal status: %', p_next_status;
    end if;
    update public.animals set status = p_next_status, updated_at = now() where id = animal_row.id;
  end if;

  insert into public.domain_events (event_type, actor_user_id, actor_role, animal_id, block_id, shelter_id, summary, payload)
  values ('animal.' || p_event_type, auth.uid(), 'ops', animal_row.id, animal_row.primary_block_id, animal_row.current_shelter_id, 'Animal lifecycle event recorded.', jsonb_build_object('next_status', p_next_status));

  return event_row;
end;
$$;

create or replace function public.link_case_to_animal(
  p_case_id uuid,
  p_animal_id uuid
)
returns public.animals
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  case_row public.cases;
  animal_row public.animals;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can link cases to animal lifecycle records';
  end if;

  select * into case_row from public.cases where id = p_case_id for update;
  if not found then
    raise exception 'Case not found';
  end if;

  select * into animal_row from public.animals where id = p_animal_id for update;
  if not found then
    raise exception 'Animal not found';
  end if;

  update public.cases set animal_id = animal_row.id where id = case_row.id;
  update public.tasks set animal_id = animal_row.id where case_id = case_row.id;
  update public.proofs p set animal_id = animal_row.id from public.tasks t where p.task_id = t.id and t.case_id = case_row.id;

  insert into public.animal_events (animal_id, event_type, case_id, block_id, shelter_id, note, evidence_quality, occurred_at, created_by)
  values (animal_row.id, 'reported', case_row.id, case_row.block_id, case_row.shelter_id, 'Linked to existing rescue case ' || case_row.external_id, 'unverified', now(), auth.uid());

  insert into public.domain_events (event_type, actor_user_id, actor_role, case_id, animal_id, block_id, shelter_id, summary, payload)
  values ('animal.linked_to_case', auth.uid(), 'ops', case_row.id, animal_row.id, case_row.block_id, case_row.shelter_id, 'Linked case to existing animal lifecycle record.', jsonb_build_object('external_id', case_row.external_id));

  return animal_row;
end;
$$;

create or replace function public.onboard_citizen_volunteers()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_count integer;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can onboard volunteers';
  end if;

  insert into public.volunteer_profiles (citizen_id, user_id, home_block_id, status, skills, transport_modes, availability_note, last_active_at)
  select c.id, c.user_id, c.block_id, 'pending', array['field_support']::text[], array[]::text[], 'Created from synced citizen device.', c.updated_at
  from public.citizens c
  where not exists (select 1 from public.volunteer_profiles vp where vp.citizen_id = c.id);

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function public.onboard_shelter_organizations()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_count integer;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can onboard organizations';
  end if;

  insert into public.organization_profiles (shelter_id, name, organization_type, status, primary_block_id, service_blocks, emergency_ready)
  select s.id, s.name, 'shelter', s.status, s.block_id, case when s.block_id is null then array[]::uuid[] else array[s.block_id]::uuid[] end, s.status = 'active'
  from public.shelters s
  where not exists (select 1 from public.organization_profiles op where op.shelter_id = s.id);

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

create or replace function public.record_organization_capacity_snapshot(
  p_organization_id uuid,
  p_capacity_total integer default null,
  p_capacity_available integer default null,
  p_emergency_slots_available integer default null,
  p_intake_status text default 'unknown',
  p_note text default ''
)
returns public.organization_capacity_snapshots
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  snapshot_row public.organization_capacity_snapshots;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can update capacity';
  end if;

  if p_intake_status not in ('open', 'limited', 'closed', 'unknown') then
    raise exception 'Invalid intake status: %', p_intake_status;
  end if;

  insert into public.organization_capacity_snapshots (organization_id, capacity_total, capacity_available, emergency_slots_available, intake_status, note, created_by)
  values (p_organization_id, p_capacity_total, p_capacity_available, p_emergency_slots_available, p_intake_status, coalesce(p_note, ''), auth.uid())
  returning * into snapshot_row;

  return snapshot_row;
end;
$$;

create or replace function public.recalculate_trust_scores()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  affected_count integer := 0;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can recalculate trust scores';
  end if;

  with citizen_stats as (
    select
      t.assigned_to_id as subject_id,
      count(*) filter (where t.status = 'completed') as completed_tasks,
      count(*) filter (where t.status in ('blocked', 'cancelled')) as failed_tasks,
      count(p.id) filter (where p.verification_status = 'verified') as verified_proofs,
      count(p.id) filter (where p.verification_status = 'rejected') as rejected_proofs
    from public.tasks t
    left join public.proofs p on p.task_id = t.id
    where t.assigned_to_type = 'citizen' and t.assigned_to_id is not null
    group by t.assigned_to_id
  ), upserted as (
    insert into public.trust_scores (subject_type, subject_id, score, reliability_score, evidence_score, safety_score, risk_level, rationale, calculated_at)
    select
      'device',
      subject_id,
      greatest(0, least(100, 50 + completed_tasks * 8 + verified_proofs * 8 - failed_tasks * 10 - rejected_proofs * 18))::integer,
      greatest(0, least(100, 50 + completed_tasks * 10 - failed_tasks * 12))::integer,
      greatest(0, least(100, 50 + verified_proofs * 12 - rejected_proofs * 20))::integer,
      greatest(0, least(100, 70 - failed_tasks * 12 - rejected_proofs * 15))::integer,
      case when rejected_proofs > 1 or failed_tasks > 2 then 'watch' when completed_tasks + verified_proofs > 3 then 'low' else 'unknown' end,
      'Rule-based score from completed tasks, blocked/cancelled tasks, and proof decisions.',
      now()
    from citizen_stats
    on conflict (subject_type, subject_id) do update set
      score = excluded.score,
      reliability_score = excluded.reliability_score,
      evidence_score = excluded.evidence_score,
      safety_score = excluded.safety_score,
      risk_level = excluded.risk_level,
      rationale = excluded.rationale,
      calculated_at = now(),
      updated_at = now()
    returning 1
  ) select count(*) into affected_count from upserted;

  return affected_count;
end;
$$;

create or replace function public.install_area_forecast_schedule()
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  if not public.is_ops() then
    raise exception 'Only ops users can install forecast schedules';
  end if;

  begin
    execute 'create extension if not exists pg_cron';
  exception when others then
    return 'pg_cron is not available. Use the Forecasts page manual generator or enable pg_cron in Supabase.';
  end;

  begin
    execute $sql$select cron.unschedule('straytopia-area-forecasts')$sql$;
  exception when others then
    null;
  end;

  execute $sql$select cron.schedule('straytopia-area-forecasts', '15 * * * *', 'select public.generate_area_forecasts(72);')$sql$;
  return 'Scheduled hourly area forecast generation.';
end;
$fn$;

grant execute on function public.create_animal_from_case(uuid, text, text) to authenticated;
grant execute on function public.add_animal_lifecycle_event(uuid, text, text, text) to authenticated;
grant execute on function public.link_case_to_animal(uuid, uuid) to authenticated;
grant execute on function public.onboard_citizen_volunteers() to authenticated;
grant execute on function public.onboard_shelter_organizations() to authenticated;
grant execute on function public.record_organization_capacity_snapshot(uuid, integer, integer, integer, text, text) to authenticated;
grant execute on function public.recalculate_trust_scores() to authenticated;
grant execute on function public.install_area_forecast_schedule() to authenticated;

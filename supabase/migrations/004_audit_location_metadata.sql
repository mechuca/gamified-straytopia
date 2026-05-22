-- Operational audit ledger and location/privacy metadata.
-- Safe additive migration: nullable columns, append-only events, and triggers.

-- 1) Location and privacy metadata used by reports, dispatch, proofs, and partners.
alter table public.cases
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_meters integer,
  add column if not exists location_captured_at timestamptz,
  add column if not exists location_privacy text not null default 'area' check (location_privacy in ('exact_ops_only', 'area', 'public_safe')),
  add column if not exists media_uri text;

alter table public.tasks
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_meters integer,
  add column if not exists location_captured_at timestamptz,
  add column if not exists location_privacy text not null default 'area' check (location_privacy in ('exact_ops_only', 'area', 'public_safe')),
  add column if not exists outcome_reason_code text,
  add column if not exists outcome_reason_text text;

alter table public.proofs
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_meters integer,
  add column if not exists location_captured_at timestamptz,
  add column if not exists media_storage_path text,
  add column if not exists media_mime_type text,
  add column if not exists media_size_bytes integer;

alter table public.shelters
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_accuracy_meters integer,
  add column if not exists capacity_total integer,
  add column if not exists capacity_available integer,
  add column if not exists capacity_updated_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cases_latitude_range') then
    alter table public.cases add constraint cases_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cases_longitude_range') then
    alter table public.cases add constraint cases_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tasks_latitude_range') then
    alter table public.tasks add constraint tasks_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tasks_longitude_range') then
    alter table public.tasks add constraint tasks_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'proofs_latitude_range') then
    alter table public.proofs add constraint proofs_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'proofs_longitude_range') then
    alter table public.proofs add constraint proofs_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shelters_latitude_range') then
    alter table public.shelters add constraint shelters_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shelters_longitude_range') then
    alter table public.shelters add constraint shelters_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cases_location_accuracy_nonnegative') then
    alter table public.cases add constraint cases_location_accuracy_nonnegative check (location_accuracy_meters is null or location_accuracy_meters >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tasks_location_accuracy_nonnegative') then
    alter table public.tasks add constraint tasks_location_accuracy_nonnegative check (location_accuracy_meters is null or location_accuracy_meters >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'proofs_location_accuracy_nonnegative') then
    alter table public.proofs add constraint proofs_location_accuracy_nonnegative check (location_accuracy_meters is null or location_accuracy_meters >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shelters_location_accuracy_nonnegative') then
    alter table public.shelters add constraint shelters_location_accuracy_nonnegative check (location_accuracy_meters is null or location_accuracy_meters >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'shelters_capacity_nonnegative') then
    alter table public.shelters add constraint shelters_capacity_nonnegative check (
      (capacity_total is null or capacity_total >= 0)
      and (capacity_available is null or capacity_available >= 0)
      and (capacity_total is null or capacity_available is null or capacity_available <= capacity_total)
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'proofs_media_size_nonnegative') then
    alter table public.proofs add constraint proofs_media_size_nonnegative check (media_size_bytes is null or media_size_bytes >= 0);
  end if;
end;
$$;

-- 2) Append-only operational event log for mutations that affect live work.
create table if not exists public.operational_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  case_id uuid,
  task_id uuid,
  proof_id uuid,
  reason text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.operational_events enable row level security;

drop policy if exists "operational_events_ops_read" on public.operational_events;
create policy "operational_events_ops_read" on public.operational_events
  for select to authenticated
  using (public.is_ops());

drop policy if exists "operational_events_ops_insert" on public.operational_events;
create policy "operational_events_ops_insert" on public.operational_events
  for insert to authenticated
  with check (public.is_ops());

create or replace function public.write_operational_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  old_payload jsonb;
  new_payload jsonb;
  row_id uuid;
  linked_case_id uuid;
  linked_task_id uuid;
  linked_proof_id uuid;
  actor_role_value text;
begin
  if TG_OP = 'UPDATE' and to_jsonb(new) = to_jsonb(old) then
    return new;
  end if;

  if TG_OP in ('UPDATE', 'DELETE') then
    old_payload := to_jsonb(old);
  end if;

  if TG_OP in ('INSERT', 'UPDATE') then
    new_payload := to_jsonb(new);
  end if;

  row_id := coalesce((new_payload ->> 'id')::uuid, (old_payload ->> 'id')::uuid);

  if TG_TABLE_NAME = 'cases' then
    linked_case_id := row_id;
  elsif TG_TABLE_NAME = 'case_reviews' then
    linked_case_id := coalesce((new_payload ->> 'case_id')::uuid, (old_payload ->> 'case_id')::uuid);
  elsif TG_TABLE_NAME = 'tasks' then
    linked_task_id := row_id;
    linked_case_id := coalesce((new_payload ->> 'case_id')::uuid, (old_payload ->> 'case_id')::uuid);
  elsif TG_TABLE_NAME = 'proofs' then
    linked_proof_id := row_id;
    linked_task_id := coalesce((new_payload ->> 'task_id')::uuid, (old_payload ->> 'task_id')::uuid);
    select t.case_id into linked_case_id from public.tasks t where t.id = linked_task_id;
  end if;

  select p.role into actor_role_value
  from public.user_profiles p
  where p.user_id = auth.uid()
  limit 1;

  insert into public.operational_events (
    actor_user_id,
    actor_role,
    action,
    entity_table,
    entity_id,
    case_id,
    task_id,
    proof_id,
    reason,
    before_state,
    after_state,
    metadata
  ) values (
    auth.uid(),
    actor_role_value,
    TG_TABLE_NAME || '.' || lower(TG_OP),
    TG_TABLE_NAME,
    row_id,
    linked_case_id,
    linked_task_id,
    linked_proof_id,
    coalesce(
      new_payload ->> 'reject_reason_text',
      new_payload ->> 'free_text_reason',
      new_payload ->> 'outcome_reason_text',
      new_payload ->> 'note',
      old_payload ->> 'reject_reason_text',
      old_payload ->> 'free_text_reason',
      old_payload ->> 'outcome_reason_text',
      old_payload ->> 'note'
    ),
    old_payload,
    new_payload,
    jsonb_strip_nulls(jsonb_build_object(
      'operation', TG_OP,
      'status_from', old_payload ->> 'status',
      'status_to', new_payload ->> 'status',
      'verification_status_from', old_payload ->> 'verification_status',
      'verification_status_to', new_payload ->> 'verification_status',
      'decision', new_payload ->> 'decision'
    ))
  );

  if TG_OP = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_cases_changes') then
    create trigger audit_cases_changes
      after insert or update or delete on public.cases
      for each row execute function public.write_operational_event();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'audit_case_reviews_changes') then
    create trigger audit_case_reviews_changes
      after insert or update or delete on public.case_reviews
      for each row execute function public.write_operational_event();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'audit_tasks_changes') then
    create trigger audit_tasks_changes
      after insert or update or delete on public.tasks
      for each row execute function public.write_operational_event();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'audit_proofs_changes') then
    create trigger audit_proofs_changes
      after insert or update or delete on public.proofs
      for each row execute function public.write_operational_event();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'operational_events_case_id_created_at_idx'
  ) then
    create index operational_events_case_id_created_at_idx on public.operational_events (case_id, created_at desc);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'operational_events_task_id_created_at_idx'
  ) then
    create index operational_events_task_id_created_at_idx on public.operational_events (task_id, created_at desc);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'operational_events_created_at_idx'
  ) then
    create index operational_events_created_at_idx on public.operational_events (created_at desc);
  end if;
end;
$$;

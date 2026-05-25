-- Media and transition hardening.
-- Additive only: evidence storage bucket, proof transition RPC, and domain events for core status changes.

-- 1) Private evidence bucket for report/proof media.
insert into storage.buckets (id, name, public)
values ('straytopia-evidence', 'straytopia-evidence', false)
on conflict (id) do update set public = false;

drop policy if exists "straytopia_evidence_ops_read" on storage.objects;
create policy "straytopia_evidence_ops_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'straytopia-evidence' and public.is_ops());

drop policy if exists "straytopia_evidence_authenticated_upload" on storage.objects;
create policy "straytopia_evidence_authenticated_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'straytopia-evidence');

drop policy if exists "straytopia_evidence_authenticated_update_own" on storage.objects;
create policy "straytopia_evidence_authenticated_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'straytopia-evidence' and owner = auth.uid())
  with check (bucket_id = 'straytopia-evidence' and owner = auth.uid());

-- 2) Guarded proof status transitions.
create or replace function public.ops_update_proof_status(p_proof_id uuid, p_next_status text, p_reason text default null)
returns public.proofs
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.proofs;
  updated_row public.proofs;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can update proof status';
  end if;

  select * into current_row from public.proofs where id = p_proof_id for update;
  if not found then
    raise exception 'Proof not found';
  end if;

  if p_next_status not in ('pending', 'verified', 'rejected', 'needs_review') then
    raise exception 'Invalid proof status: %', p_next_status;
  end if;

  if not (
    current_row.verification_status = p_next_status
    or (current_row.verification_status in ('pending', 'needs_review') and p_next_status in ('verified', 'rejected', 'needs_review'))
  ) then
    raise exception 'Invalid proof transition from % to %', current_row.verification_status, p_next_status;
  end if;

  update public.proofs
    set verification_status = p_next_status,
        note = case when p_next_status = 'rejected' and p_reason is not null then concat_ws(E'\n', nullif(note, ''), p_reason) else note end
    where id = p_proof_id
    returning * into updated_row;

  return updated_row;
end;
$$;

-- 3) Domain events for core operational transitions. These are product workflow signals, not audit replacements.
create or replace function public.write_domain_event_for_core_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  event_name text;
  event_payload jsonb;
  linked_case_id uuid;
  linked_task_id uuid;
  linked_proof_id uuid;
  linked_animal_id uuid;
  linked_block_id uuid;
  linked_shelter_id uuid;
  actor_role_value text;
begin
  if TG_OP <> 'UPDATE' then
    return new;
  end if;

  if TG_TABLE_NAME = 'cases' then
    if old.status is not distinct from new.status then
      return new;
    end if;
    event_name := 'case.' || replace(new.status, '_', '-');
    linked_case_id := new.id;
    linked_animal_id := new.animal_id;
    linked_block_id := new.block_id;
    linked_shelter_id := new.shelter_id;
    event_payload := jsonb_strip_nulls(jsonb_build_object('table', TG_TABLE_NAME, 'status_from', old.status, 'status_to', new.status));
  elsif TG_TABLE_NAME = 'tasks' then
    if old.status is not distinct from new.status then
      return new;
    end if;
    event_name := 'task.' || replace(new.status, '_', '-');
    linked_task_id := new.id;
    linked_case_id := new.case_id;
    linked_animal_id := new.animal_id;
    linked_block_id := new.block_id;
    linked_shelter_id := new.shelter_id;
    event_payload := jsonb_strip_nulls(jsonb_build_object('table', TG_TABLE_NAME, 'status_from', old.status, 'status_to', new.status));
  elsif TG_TABLE_NAME = 'proofs' then
    if old.verification_status is not distinct from new.verification_status then
      return new;
    end if;
    event_name := 'proof.' || replace(new.verification_status, '_', '-');
    linked_proof_id := new.id;
    linked_task_id := new.task_id;
    linked_animal_id := new.animal_id;
    select t.case_id, t.block_id, t.shelter_id into linked_case_id, linked_block_id, linked_shelter_id from public.tasks t where t.id = new.task_id;
    event_payload := jsonb_strip_nulls(jsonb_build_object('table', TG_TABLE_NAME, 'verification_status_from', old.verification_status, 'verification_status_to', new.verification_status));
  else
    return new;
  end if;

  select p.role into actor_role_value
  from public.user_profiles p
  where p.user_id = auth.uid()
  limit 1;

  insert into public.domain_events (
    event_type,
    actor_user_id,
    actor_role,
    case_id,
    task_id,
    proof_id,
    animal_id,
    block_id,
    shelter_id,
    summary,
    payload
  ) values (
    event_name,
    auth.uid(),
    actor_role_value,
    linked_case_id,
    linked_task_id,
    linked_proof_id,
    linked_animal_id,
    linked_block_id,
    linked_shelter_id,
    TG_TABLE_NAME || ' status changed',
    event_payload
  );

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'domain_events_cases_status') then
    create trigger domain_events_cases_status
      after update on public.cases
      for each row execute function public.write_domain_event_for_core_transition();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'domain_events_tasks_status') then
    create trigger domain_events_tasks_status
      after update on public.tasks
      for each row execute function public.write_domain_event_for_core_transition();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'domain_events_proofs_status') then
    create trigger domain_events_proofs_status
      after update on public.proofs
      for each row execute function public.write_domain_event_for_core_transition();
  end if;
end;
$$;

-- 4) Evidence helper indexes.
do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'proofs_media_storage_path_idx') then
    create index proofs_media_storage_path_idx on public.proofs (media_storage_path) where media_storage_path is not null;
  end if;
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'cases_media_uri_idx') then
    create index cases_media_uri_idx on public.cases (media_uri) where media_uri is not null;
  end if;
end;
$$;

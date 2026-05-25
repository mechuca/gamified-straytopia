-- Operation queue integrity foundations.
-- Additive only: duplicate links, mobile notification outbox, and guarded status transitions.

-- 1) Duplicate report review support.
alter table public.cases
  add column if not exists duplicate_of_case_id uuid references public.cases(id) on delete set null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cases_not_duplicate_of_self') then
    alter table public.cases add constraint cases_not_duplicate_of_self check (duplicate_of_case_id is null or duplicate_of_case_id <> id);
  end if;
end;
$$;

create table if not exists public.case_duplicate_links (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  duplicate_case_id uuid not null references public.cases(id) on delete cascade,
  confidence text not null default 'possible' check (confidence in ('possible', 'likely', 'confirmed')),
  reason text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (case_id, duplicate_case_id),
  check (case_id <> duplicate_case_id)
);

alter table public.case_duplicate_links enable row level security;

drop policy if exists "case_duplicate_links_ops_all" on public.case_duplicate_links;
create policy "case_duplicate_links_ops_all" on public.case_duplicate_links
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'cases_duplicate_of_case_id_idx') then
    create index cases_duplicate_of_case_id_idx on public.cases (duplicate_of_case_id);
  end if;

  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'case_duplicate_links_case_id_idx') then
    create index case_duplicate_links_case_id_idx on public.case_duplicate_links (case_id, created_at desc);
  end if;
end;
$$;

create or replace function public.find_case_duplicate_candidates(p_case_id uuid)
returns table (
  candidate_case_id uuid,
  candidate_external_id text,
  reason text,
  candidate_created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with target as (
    select id, block_id, category, location_text, created_at
    from public.cases
    where id = p_case_id
  )
  select
    c.id,
    c.external_id,
    concat_ws(', ',
      case when c.block_id = t.block_id then 'same block' end,
      case when c.category = t.category then 'same category' end,
      case
        when lower(regexp_replace(coalesce(c.location_text, ''), '[^a-z0-9]+', ' ', 'g')) <> ''
          and lower(regexp_replace(coalesce(t.location_text, ''), '[^a-z0-9]+', ' ', 'g')) <> ''
          and (
            lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
            or lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
          )
        then 'similar location'
      end
    ) as reason,
    c.created_at
  from public.cases c
  cross join target t
  where c.id <> t.id
    and c.status not in ('resolved', 'closed')
    and abs(extract(epoch from (c.created_at - t.created_at))) <= 259200
    and (
      c.block_id = t.block_id
      or (
        nullif(lower(regexp_replace(coalesce(c.location_text, ''), '[^a-z0-9]+', ' ', 'g')), '') is not null
        and nullif(lower(regexp_replace(coalesce(t.location_text, ''), '[^a-z0-9]+', ' ', 'g')), '') is not null
        and (
          lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
          or lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
        )
      )
    )
    and (
      c.category = t.category
      or (
        nullif(lower(regexp_replace(coalesce(c.location_text, ''), '[^a-z0-9]+', ' ', 'g')), '') is not null
        and nullif(lower(regexp_replace(coalesce(t.location_text, ''), '[^a-z0-9]+', ' ', 'g')), '') is not null
        and (
          lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
          or lower(regexp_replace(t.location_text, '[^a-z0-9]+', ' ', 'g')) like '%' || lower(regexp_replace(c.location_text, '[^a-z0-9]+', ' ', 'g')) || '%'
        )
      )
    )
  order by c.created_at desc
  limit 5;
$$;

-- 2) Notification outbox. This is provider-neutral and does not claim push delivery.
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null check (recipient_type in ('citizen', 'shelter', 'ops')),
  recipient_citizen_id uuid references public.citizens(id) on delete set null,
  recipient_device_id text,
  channel text not null default 'in_app' check (channel in ('in_app', 'push', 'sms', 'email')),
  title text not null,
  body text not null default '',
  case_id uuid references public.cases(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  proof_id uuid references public.proofs(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'cancelled')),
  visible_after_at timestamptz not null default now(),
  delivered_at timestamptz,
  failure_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_outbox enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_notification_outbox_updated_at') then
    create trigger set_notification_outbox_updated_at
      before update on public.notification_outbox
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

drop policy if exists "notification_outbox_ops_all" on public.notification_outbox;
create policy "notification_outbox_ops_all" on public.notification_outbox
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "notification_outbox_citizen_read" on public.notification_outbox;
create policy "notification_outbox_citizen_read" on public.notification_outbox
  for select to authenticated
  using (
    recipient_type = 'citizen'
    and (
      recipient_citizen_id = public.current_citizen_id()
      or recipient_device_id = public.current_device_id()
    )
    and channel = 'in_app'
    and status in ('pending', 'sent')
    and visible_after_at <= now()
  );

do $$
begin
  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'notification_outbox_status_idx') then
    create index notification_outbox_status_idx on public.notification_outbox (status, visible_after_at, created_at desc);
  end if;

  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'notification_outbox_case_id_idx') then
    create index notification_outbox_case_id_idx on public.notification_outbox (case_id, created_at desc);
  end if;

  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'notification_outbox_recipient_device_idx') then
    create index notification_outbox_recipient_device_idx on public.notification_outbox (recipient_device_id, visible_after_at desc);
  end if;
end;
$$;

-- 3) Guarded transitions for future hub writes.
create or replace function public.ops_update_case_status(p_case_id uuid, p_next_status text, p_reason text default null)
returns public.cases
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.cases;
  updated_row public.cases;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can update case status';
  end if;

  select * into current_row from public.cases where id = p_case_id for update;
  if not found then
    raise exception 'Case not found';
  end if;

  if p_next_status not in ('submitted','under_review','accepted','rejected','task_created','assigned','in_progress','resolved','closed') then
    raise exception 'Invalid case status: %', p_next_status;
  end if;

  if not (
    (current_row.status = p_next_status)
    or (current_row.status = 'submitted' and p_next_status in ('under_review','accepted','rejected'))
    or (current_row.status = 'under_review' and p_next_status in ('accepted','rejected','task_created'))
    or (current_row.status = 'accepted' and p_next_status in ('task_created','assigned','rejected'))
    or (current_row.status = 'task_created' and p_next_status in ('assigned','in_progress','rejected'))
    or (current_row.status = 'assigned' and p_next_status in ('in_progress','resolved','rejected'))
    or (current_row.status = 'in_progress' and p_next_status in ('resolved','rejected'))
    or (current_row.status = 'resolved' and p_next_status = 'closed')
  ) then
    raise exception 'Invalid case transition from % to %', current_row.status, p_next_status;
  end if;

  update public.cases
    set status = p_next_status,
        reject_reason_text = case when p_next_status = 'rejected' then coalesce(p_reason, reject_reason_text) else reject_reason_text end
    where id = p_case_id
    returning * into updated_row;

  return updated_row;
end;
$$;

create or replace function public.ops_update_task_status(p_task_id uuid, p_next_status text, p_reason text default null)
returns public.tasks
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_row public.tasks;
  updated_row public.tasks;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can update task status';
  end if;

  select * into current_row from public.tasks where id = p_task_id for update;
  if not found then
    raise exception 'Task not found';
  end if;

  if p_next_status not in ('queued','assigned','in_progress','proof_pending','completed','blocked','escalated','cancelled') then
    raise exception 'Invalid task status: %', p_next_status;
  end if;

  if not (
    (current_row.status = p_next_status)
    or (current_row.status = 'queued' and p_next_status in ('assigned','blocked','escalated','cancelled'))
    or (current_row.status = 'assigned' and p_next_status in ('in_progress','blocked','escalated','cancelled'))
    or (current_row.status = 'in_progress' and p_next_status in ('proof_pending','completed','blocked','escalated','cancelled'))
    or (current_row.status = 'proof_pending' and p_next_status in ('completed','blocked','cancelled'))
    or (current_row.status = 'blocked' and p_next_status in ('assigned','in_progress','cancelled'))
    or (current_row.status = 'escalated' and p_next_status in ('assigned','in_progress','cancelled'))
  ) then
    raise exception 'Invalid task transition from % to %', current_row.status, p_next_status;
  end if;

  update public.tasks
    set status = p_next_status,
        outcome_reason_text = case when p_next_status in ('blocked','cancelled') then coalesce(p_reason, outcome_reason_text) else outcome_reason_text end
    where id = p_task_id
    returning * into updated_row;

  return updated_row;
end;
$$;

-- Mobile ops closure.
-- Additive only: volunteer availability, mobile-safe assignment responses,
-- report tracking, verified impact, notification processing, and dispatch scoring.

create table if not exists public.volunteer_availability (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid references public.citizens(id) on delete set null,
  device_id text not null unique,
  block_id uuid references public.blocks(id) on delete set null,
  status text not null default 'offline' check (status in ('available', 'busy', 'offline', 'paused')),
  skills text[] not null default '{}'::text[],
  transport_modes text[] not null default '{}'::text[],
  open_task_limit integer not null default 1 check (open_task_limit >= 0 and open_task_limit <= 10),
  available_until timestamptz,
  note text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.volunteer_availability enable row level security;

drop policy if exists "volunteer_availability_ops_all" on public.volunteer_availability;
create policy "volunteer_availability_ops_all" on public.volunteer_availability
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

drop policy if exists "volunteer_availability_citizen_read" on public.volunteer_availability;
create policy "volunteer_availability_citizen_read" on public.volunteer_availability
  for select to authenticated
  using (device_id = public.current_device_id());

drop policy if exists "task_assignments_citizen_read" on public.task_assignments;
create policy "task_assignments_citizen_read" on public.task_assignments
  for select to authenticated
  using (assigned_to_type = 'citizen' and assigned_to_id = public.current_device_id());

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_volunteer_availability_updated_at') then
    create trigger set_volunteer_availability_updated_at
      before update on public.volunteer_availability
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'volunteer_availability_status_idx') then
    create index volunteer_availability_status_idx on public.volunteer_availability (status, block_id, updated_at desc);
  end if;

  if not exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'volunteer_profiles_citizen_unique') then
    create unique index volunteer_profiles_citizen_unique on public.volunteer_profiles (citizen_id) where citizen_id is not null;
  end if;
end;
$$;

create or replace function public.mobile_set_volunteer_availability(
  p_device_id text,
  p_status text,
  p_skills text[] default '{}'::text[],
  p_transport_modes text[] default '{}'::text[],
  p_note text default '',
  p_open_task_limit integer default 1,
  p_available_until timestamptz default null
)
returns public.volunteer_availability
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_device_id text;
  v_user_id uuid;
  v_citizen public.citizens;
  v_row public.volunteer_availability;
begin
  v_device_id := coalesce(nullif(public.current_device_id(), ''), nullif(trim(p_device_id), ''));
  if v_device_id is null or trim(v_device_id) = '' then
    raise exception 'Device id is required';
  end if;
  if p_status not in ('available', 'busy', 'offline', 'paused') then
    raise exception 'Invalid availability status: %', p_status;
  end if;

  v_user_id := auth.uid();

  insert into public.citizens (device_id, user_id)
  values (v_device_id, v_user_id)
  on conflict (device_id) do update set user_id = coalesce(public.citizens.user_id, excluded.user_id)
  returning * into v_citizen;

  update public.volunteer_profiles
    set user_id = coalesce(user_id, v_user_id),
        home_block_id = coalesce(home_block_id, v_citizen.block_id),
        status = case when p_status = 'available' then 'active' when p_status = 'paused' then 'paused' else status end,
        skills = coalesce(p_skills, '{}'::text[]),
        transport_modes = coalesce(p_transport_modes, '{}'::text[]),
        availability_note = coalesce(p_note, ''),
        last_active_at = now()
    where citizen_id = v_citizen.id;

  if not found then
    insert into public.volunteer_profiles (citizen_id, user_id, home_block_id, status, skills, transport_modes, availability_note, last_active_at)
    values (
      v_citizen.id,
      v_user_id,
      v_citizen.block_id,
      case when p_status = 'available' then 'active' when p_status = 'paused' then 'paused' else 'pending' end,
      coalesce(p_skills, '{}'::text[]),
      coalesce(p_transport_modes, '{}'::text[]),
      coalesce(p_note, ''),
      now()
    );
  end if;

  insert into public.volunteer_availability (citizen_id, device_id, block_id, status, skills, transport_modes, open_task_limit, available_until, note)
  values (
    v_citizen.id,
    v_device_id,
    v_citizen.block_id,
    p_status,
    coalesce(p_skills, '{}'::text[]),
    coalesce(p_transport_modes, '{}'::text[]),
    greatest(0, least(10, coalesce(p_open_task_limit, 1))),
    p_available_until,
    coalesce(p_note, '')
  )
  on conflict (device_id) do update set
    citizen_id = excluded.citizen_id,
    block_id = excluded.block_id,
    status = excluded.status,
    skills = excluded.skills,
    transport_modes = excluded.transport_modes,
    open_task_limit = excluded.open_task_limit,
    available_until = excluded.available_until,
    note = excluded.note,
    updated_at = now()
  returning * into v_row;

  insert into public.domain_events (event_type, actor_user_id, actor_role, block_id, subject_type, subject_id, summary, payload)
  values (
    'volunteer.availability_updated',
    v_user_id,
    'citizen',
    v_citizen.block_id,
    'device',
    v_device_id,
    'Volunteer availability updated from mobile.',
    jsonb_build_object('status', p_status, 'skills', coalesce(p_skills, '{}'::text[]))
  );

  return v_row;
end;
$$;

create or replace function public.mobile_respond_to_task_assignment(
  p_task_id uuid,
  p_response text,
  p_reason text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_device_id text;
  v_task public.tasks;
  v_assignment_id uuid;
begin
  v_device_id := public.current_device_id();
  if v_device_id is null or trim(v_device_id) = '' then
    raise exception 'Device id is required';
  end if;
  if p_response not in ('accepted', 'declined') then
    raise exception 'Invalid assignment response: %', p_response;
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
    and assigned_to_type = 'citizen'
    and assigned_to_id = v_device_id
  for update;
  if not found then
    raise exception 'Assigned task not found for this device';
  end if;

  select id into v_assignment_id
  from public.task_assignments
  where task_id = p_task_id
    and assigned_to_type = 'citizen'
    and assigned_to_id = v_device_id
    and status in ('offered', 'accepted')
  order by created_at desc
  limit 1;

  if v_assignment_id is null then
    insert into public.task_assignments (task_id, assigned_to_type, assigned_to_id, assignment_reason, status)
    values (p_task_id, 'citizen', v_device_id, coalesce(p_reason, 'Mobile assignment response.'), 'offered')
    returning id into v_assignment_id;
  end if;

  if p_response = 'accepted' then
    update public.task_assignments
      set status = 'accepted', accepted_at = coalesce(accepted_at, now())
      where id = v_assignment_id;

    update public.tasks
      set status = case when status = 'queued' then 'assigned' else status end
      where id = p_task_id
      returning * into v_task;

    if v_task.case_id is not null then
      update public.cases
        set status = case when status in ('submitted', 'under_review', 'accepted', 'task_created') then 'assigned' else status end
        where id = v_task.case_id;
    end if;
  else
    update public.task_assignments
      set status = 'declined', declined_at = coalesce(declined_at, now())
      where id = v_assignment_id;

    update public.tasks
      set assigned_to_type = null,
          assigned_to_id = null,
          status = 'queued',
          outcome_reason_text = coalesce(p_reason, 'Declined by mobile volunteer.')
      where id = p_task_id
      returning * into v_task;
  end if;

  insert into public.domain_events (event_type, actor_user_id, actor_role, case_id, task_id, block_id, shelter_id, subject_type, subject_id, summary, payload)
  values (
    'task.assignment_' || p_response,
    auth.uid(),
    'citizen',
    v_task.case_id,
    v_task.id,
    v_task.block_id,
    v_task.shelter_id,
    'device',
    v_device_id,
    'Mobile volunteer ' || p_response || ' assignment.',
    jsonb_build_object('reason', coalesce(p_reason, ''))
  );

  return v_task;
end;
$$;

create or replace function public.mobile_update_assigned_task_status(
  p_task_id uuid,
  p_next_status text,
  p_reason text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_device_id text;
  v_task public.tasks;
begin
  v_device_id := public.current_device_id();
  if v_device_id is null or trim(v_device_id) = '' then
    raise exception 'Device id is required';
  end if;
  if p_next_status not in ('in_progress', 'proof_pending', 'blocked', 'completed') then
    raise exception 'Invalid mobile task status: %', p_next_status;
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
    and assigned_to_type = 'citizen'
    and assigned_to_id = v_device_id
  for update;
  if not found then
    raise exception 'Assigned task not found for this device';
  end if;

  if not (
    (v_task.status = p_next_status)
    or (v_task.status in ('queued', 'assigned') and p_next_status in ('in_progress', 'blocked'))
    or (v_task.status = 'in_progress' and p_next_status in ('proof_pending', 'blocked', 'completed'))
    or (v_task.status = 'proof_pending' and p_next_status in ('completed', 'blocked'))
  ) then
    raise exception 'Invalid mobile transition from % to %', v_task.status, p_next_status;
  end if;

  update public.tasks
    set status = p_next_status,
        outcome_reason_text = case when p_next_status = 'blocked' then coalesce(p_reason, outcome_reason_text) else outcome_reason_text end
    where id = p_task_id
    returning * into v_task;

  if v_task.case_id is not null then
    update public.cases
      set status = case when p_next_status = 'in_progress' then 'in_progress' when p_next_status = 'completed' then 'resolved' else status end
      where id = v_task.case_id;
  end if;

  insert into public.domain_events (event_type, actor_user_id, actor_role, case_id, task_id, block_id, shelter_id, subject_type, subject_id, summary, payload)
  values ('task.mobile_status_updated', auth.uid(), 'citizen', v_task.case_id, v_task.id, v_task.block_id, v_task.shelter_id, 'device', v_device_id, 'Mobile task status updated.', jsonb_build_object('status', p_next_status));

  return v_task;
end;
$$;

create or replace function public.mobile_get_report_tracking()
returns table (
  external_id text,
  status text,
  severity text,
  category text,
  location_text text,
  created_at timestamptz,
  updated_at timestamptz,
  latest_task_status text,
  latest_notification_title text,
  latest_notification_body text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with current_citizen as (
    select id, device_id from public.citizens where device_id = public.current_device_id() limit 1
  ), latest_task as (
    select distinct on (t.case_id) t.case_id, t.status
    from public.tasks t
    join public.cases c on c.id = t.case_id
    join current_citizen cc on cc.id = c.citizen_id
    order by t.case_id, t.updated_at desc
  ), latest_note as (
    select distinct on (n.case_id) n.case_id, n.title, n.body
    from public.notification_outbox n
    join current_citizen cc on n.recipient_device_id = cc.device_id or n.recipient_citizen_id = cc.id
    where n.channel = 'in_app' and n.status in ('pending', 'sent')
    order by n.case_id, n.created_at desc
  )
  select c.external_id, c.status, c.severity, c.category, c.location_text, c.created_at, c.updated_at, lt.status, ln.title, ln.body
  from public.cases c
  join current_citizen cc on cc.id = c.citizen_id
  left join latest_task lt on lt.case_id = c.id
  left join latest_note ln on ln.case_id = c.id
  order by c.created_at desc
  limit 50;
$$;

create or replace function public.mobile_get_verified_impact()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with current_device as (
    select public.current_device_id() as device_id
  ), current_citizen as (
    select id, device_id from public.citizens where device_id = (select device_id from current_device) limit 1
  ), own_cases as (
    select c.* from public.cases c join current_citizen cc on cc.id = c.citizen_id
  ), own_tasks as (
    select t.*
    from public.tasks t
    where t.assigned_to_type = 'citizen'
      and t.assigned_to_id = (select device_id from current_device)
  ), verified_tasks as (
    select distinct t.id, t.case_id, t.priority, t.updated_at, tt.title as template_title, c.location_text
    from own_tasks t
    left join public.task_templates tt on tt.id = t.template_id
    left join public.cases c on c.id = t.case_id
    left join public.proofs p on p.task_id = t.id
    where t.status = 'completed' or p.verification_status = 'verified'
  ), leaderboard as (
    select
      row_number() over (order by count(*) desc, max(t.updated_at) desc) as rank,
      t.assigned_to_id as device_id,
      count(*)::integer as mission_count,
      sum(case when t.priority = 'critical' then 120 when t.priority = 'high' then 80 when t.priority = 'medium' then 50 else 30 end)::integer as points
    from public.tasks t
    left join public.proofs p on p.task_id = t.id
    where t.assigned_to_type = 'citizen'
      and (t.status = 'completed' or p.verification_status = 'verified')
    group by t.assigned_to_id
    order by count(*) desc, max(t.updated_at) desc
    limit 20
  ), stories as (
    select jsonb_agg(jsonb_build_object(
      'id', 'task:' || vt.id::text,
      'title', coalesce(vt.template_title, 'Verified care task'),
      'body', 'Verified by ops' || case when vt.location_text is not null and vt.location_text <> '' then ' near ' || vt.location_text else '' end || '.',
      'badge', 'VERIFIED CARE',
      'occurred_at', vt.updated_at
    ) order by vt.updated_at desc) as rows
    from verified_tasks vt
  ), stats as (
    select jsonb_build_object(
      'completed_missions', (select count(*) from verified_tasks),
      'reports_filed', (select count(*) from own_cases),
      'resolved_reports', (select count(*) from own_cases where status in ('resolved', 'closed')),
      'verified_points', coalesce((select sum(case when priority = 'critical' then 120 when priority = 'high' then 80 when priority = 'medium' then 50 else 30 end) from verified_tasks), 0)
    ) as row
  )
  select jsonb_build_object(
    'stats', (select row from stats),
    'stories', coalesce((select rows from stories), '[]'::jsonb),
    'leaderboard', coalesce((
      select jsonb_agg(jsonb_build_object(
        'rank', rank,
        'name', case when device_id = (select device_id from current_device) then 'You' else 'Helper ' || rank::text end,
        'points', points,
        'mission_count', mission_count,
        'is_me', device_id = (select device_id from current_device)
      ) order by rank)
      from leaderboard
    ), '[]'::jsonb)
  );
$$;

create or replace function public.queue_mobile_status_notification()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_citizen public.citizens;
  v_title text;
  v_body text;
begin
  if TG_OP <> 'UPDATE' or old.status is not distinct from new.status then
    return new;
  end if;
  if new.citizen_id is null then
    return new;
  end if;

  select * into v_citizen from public.citizens where id = new.citizen_id;
  if not found then
    return new;
  end if;

  v_title := case
    when new.status in ('under_review', 'accepted', 'task_created') then 'Report is under review'
    when new.status in ('assigned', 'in_progress') then 'Help has been assigned'
    when new.status in ('resolved', 'closed') then 'Report marked resolved'
    when new.status = 'rejected' then 'Report could not be actioned'
    else 'Report updated'
  end;
  v_body := 'Case ' || new.external_id || ' is now ' || replace(new.status, '_', ' ') || '.';

  insert into public.notification_outbox (recipient_type, recipient_citizen_id, recipient_device_id, channel, title, body, case_id, status, metadata)
  values ('citizen', v_citizen.id, v_citizen.device_id, 'in_app', v_title, v_body, new.id, 'pending', jsonb_build_object('status', new.status));

  return new;
end;
$$;

drop trigger if exists case_mobile_status_notification on public.cases;
create trigger case_mobile_status_notification
  after update on public.cases
  for each row execute function public.queue_mobile_status_notification();

create or replace function public.process_notification_outbox(p_limit integer default 50)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can process notifications';
  end if;

  with due as (
    select id
    from public.notification_outbox
    where status = 'pending'
      and channel = 'in_app'
      and visible_after_at <= now()
    order by created_at asc
    limit greatest(1, least(500, coalesce(p_limit, 50)))
    for update skip locked
  ), updated as (
    update public.notification_outbox n
      set status = 'sent', delivered_at = now(), updated_at = now()
      from due
      where n.id = due.id
      returning n.*
  )
  insert into public.domain_events (event_type, actor_user_id, actor_role, case_id, task_id, proof_id, subject_type, subject_id, summary, payload)
  select 'notification.sent', auth.uid(), 'ops', case_id, task_id, proof_id, recipient_type, coalesce(recipient_device_id, recipient_citizen_id::text), title, jsonb_build_object('channel', channel)
  from updated;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.refresh_assignment_recommendations(p_task_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_task public.tasks;
  v_template public.task_templates;
  v_inserted integer;
begin
  if not public.is_ops() then
    raise exception 'Only ops users can refresh assignment recommendations';
  end if;

  select * into v_task from public.tasks where id = p_task_id;
  if not found then
    raise exception 'Task not found';
  end if;
  select * into v_template from public.task_templates where id = v_task.template_id;

  update public.assignment_recommendations
    set status = 'expired'
    where task_id = p_task_id and status = 'suggested';

  insert into public.assignment_recommendations (task_id, assignee_type, assignee_id, score, reasons)
  select p_task_id, 'citizen', c.device_id,
    greatest(0, least(100,
      12
      + case when c.block_id = v_task.block_id then 28 else 0 end
      + case when va.status = 'available' and (va.available_until is null or va.available_until > now()) then 24 else -20 end
      + case when coalesce(ts.score, 50) >= 70 then 14 when coalesce(ts.score, 50) < 40 then -18 else 0 end
      + case when coalesce(array_length(va.skills, 1), 0) = 0 then 0 when coalesce(v_template.type, '') = any(va.skills) then 14 else 0 end
      - (select count(*)::integer * 8 from public.tasks open_t where open_t.assigned_to_type = 'citizen' and open_t.assigned_to_id = c.device_id and open_t.status in ('assigned', 'in_progress', 'proof_pending', 'blocked'))
    )),
    array_remove(array[
      case when c.block_id = v_task.block_id then 'same block' end,
      case when va.status = 'available' then 'available now' end,
      case when coalesce(ts.score, 50) >= 70 then 'trusted history' end,
      case when coalesce(v_template.type, '') = any(va.skills) then 'matching skill' end
    ], null)
  from public.citizens c
  left join public.volunteer_availability va on va.device_id = c.device_id
  left join public.trust_scores ts on ts.subject_type = 'device' and ts.subject_id = c.device_id
  where va.status = 'available'
     or c.block_id = v_task.block_id
  order by 4 desc
  limit 8;

  insert into public.assignment_recommendations (task_id, assignee_type, assignee_id, score, reasons)
  select p_task_id, 'shelter', s.id::text,
    greatest(0, least(100,
      18
      + case when s.block_id = v_task.block_id then 24 else 0 end
      + case when s.status = 'active' then 18 when s.status = 'limited' then 4 when s.status = 'inactive' then -70 else 0 end
      + case when coalesce(ts.score, 50) >= 70 then 12 when coalesce(ts.score, 50) < 40 then -16 else 0 end
      + case when latest.capacity_available is null then 0 when latest.capacity_available > 0 then 16 else -24 end
      + case when latest.emergency_slots_available is null then 0 when latest.emergency_slots_available > 0 and v_task.priority = 'critical' then 14 else 0 end
      - (select count(*)::integer * 6 from public.tasks open_t where open_t.shelter_id = s.id and open_t.status in ('assigned', 'in_progress', 'proof_pending', 'blocked'))
    )),
    array_remove(array[
      case when s.block_id = v_task.block_id then 'same block' end,
      case when s.status = 'active' then 'active partner' end,
      case when coalesce(ts.score, 50) >= 70 then 'trusted partner' end,
      case when latest.capacity_available > 0 then latest.capacity_available::text || ' open capacity' end,
      case when latest.emergency_slots_available > 0 and v_task.priority = 'critical' then 'emergency slot' end
    ], null)
  from public.shelters s
  left join public.organization_profiles op on op.shelter_id = s.id
  left join public.trust_scores ts on ts.subject_type in ('shelter', 'organization') and ts.subject_id in (s.id::text, op.id::text)
  left join lateral (
    select capacity_available, emergency_slots_available
    from public.organization_capacity_snapshots ocs
    where ocs.organization_id = op.id
    order by captured_at desc
    limit 1
  ) latest on true
  where s.status <> 'inactive'
  order by 4 desc
  limit 8;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

grant execute on function public.mobile_set_volunteer_availability(text, text, text[], text[], text, integer, timestamptz) to authenticated;
grant execute on function public.mobile_respond_to_task_assignment(uuid, text, text) to authenticated;
grant execute on function public.mobile_update_assigned_task_status(uuid, text, text) to authenticated;
grant execute on function public.mobile_get_report_tracking() to authenticated;
grant execute on function public.mobile_get_verified_impact() to authenticated;
grant execute on function public.process_notification_outbox(integer) to authenticated;
grant execute on function public.refresh_assignment_recommendations(uuid) to authenticated;

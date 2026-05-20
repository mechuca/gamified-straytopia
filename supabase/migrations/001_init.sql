-- Straytopia spine schema (v1)
-- Safe to run once on a new Supabase project.

create extension if not exists "pgcrypto";

-- Blocks
create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shelters
create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  block_id uuid references public.blocks(id) on delete set null,
  status text not null default 'active' check (status in ('pending', 'active', 'limited', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Citizens (device-local identity, not PII by default)
create table if not exists public.citizens (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  block_id uuid references public.blocks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cases (reports from mobile)
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  citizen_id uuid references public.citizens(id) on delete set null,
  block_id uuid references public.blocks(id) on delete set null,
  shelter_id uuid references public.shelters(id) on delete set null,
  category text not null check (category in ('injured','feeding','water','rescue','sick','aggressive','abandoned','adoption','other')),
  severity text not null check (severity in ('urgent','today','soon')),
  description text not null default '',
  location_text text not null default '',
  status text not null default 'submitted' check (status in ('submitted','under_review','accepted','rejected','task_created','assigned','in_progress','resolved','closed')),
  reject_reason_code text,
  reject_reason_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case reviews (accept/reject)
create table if not exists public.case_reviews (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  reviewer_user_id uuid,
  decision text not null check (decision in ('accepted','rejected')),
  fixed_reason_code text,
  free_text_reason text,
  created_at timestamptz not null default now()
);

-- Task templates
create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null unique check (type in ('feed','water_refill','rescue_assessment','medical_check','follow_up','intake_transfer','proof_review','emergency_escalation')),
  title text not null,
  description text not null default '',
  required_proof text not null default 'photo',
  sla_minutes int not null default 180,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  template_id uuid references public.task_templates(id) on delete set null,
  block_id uuid references public.blocks(id) on delete set null,
  shelter_id uuid references public.shelters(id) on delete set null,
  status text not null default 'queued' check (status in ('queued','assigned','in_progress','proof_pending','completed','blocked','escalated','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  assigned_to_type text check (assigned_to_type in ('shelter','staff','volunteer','citizen')),
  assigned_to_id text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_blocks_updated_at') then
    create trigger set_blocks_updated_at before update on public.blocks for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_shelters_updated_at') then
    create trigger set_shelters_updated_at before update on public.shelters for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_citizens_updated_at') then
    create trigger set_citizens_updated_at before update on public.citizens for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_cases_updated_at') then
    create trigger set_cases_updated_at before update on public.cases for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_task_templates_updated_at') then
    create trigger set_task_templates_updated_at before update on public.task_templates for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_tasks_updated_at') then
    create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
  end if;
end;
$$;

-- Helper: map case category to task template
create or replace function public.template_type_for_case(category text)
returns text
language sql
immutable
as $$
  select case
    when category = 'feeding' then 'feed'
    when category = 'water' then 'water_refill'
    when category in ('injured','sick') then 'medical_check'
    when category in ('rescue','aggressive','abandoned') then 'rescue_assessment'
    else 'follow_up'
  end;
$$;

-- Auto-create a task when a case is accepted.
create or replace function public.create_task_on_case_accept()
returns trigger
language plpgsql
as $$
declare
  t_type text;
  t_template_id uuid;
  new_task_id uuid;
begin
  if new.decision <> 'accepted' then
    return new;
  end if;

  -- Update case status.
  update public.cases
    set status = 'accepted'
    where id = new.case_id;

  t_type := public.template_type_for_case((select category from public.cases where id = new.case_id));
  select id into t_template_id from public.task_templates where type = t_type;

  insert into public.tasks (case_id, template_id, block_id, shelter_id, status, priority)
  select c.id, t_template_id, c.block_id, c.shelter_id, 'queued', (case when c.severity = 'urgent' then 'critical' when c.severity = 'today' then 'high' else 'medium' end)
  from public.cases c
  where c.id = new.case_id
  returning id into new_task_id;

  update public.cases
    set status = 'task_created'
    where id = new.case_id;

  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'case_review_accept_creates_task') then
    create trigger case_review_accept_creates_task
      after insert on public.case_reviews
      for each row execute function public.create_task_on_case_accept();
  end if;
end;
$$;

-- Minimal seed data
insert into public.blocks (name, code)
values ('Indiranagar', 'BLK-INDIR')
on conflict (code) do nothing;

insert into public.shelters (name, block_id)
select 'Indiranagar Shelter', b.id
from public.blocks b
where b.code = 'BLK-INDIR'
and not exists (select 1 from public.shelters s where s.name = 'Indiranagar Shelter');

insert into public.task_templates (type, title, description, required_proof, sla_minutes)
values
  ('feed', 'Feed', 'Offer safe food to the animal(s) and submit a proof photo.', 'photo', 240),
  ('water_refill', 'Water Refill', 'Refill a water point and submit a proof photo.', 'photo', 240),
  ('rescue_assessment', 'Rescue Assessment', 'Assess the situation, capture proof, and escalate if needed.', 'photo_location', 60),
  ('medical_check', 'Medical Check', 'Observe symptoms, capture proof, and recommend next step.', 'photo_note', 180),
  ('follow_up', 'Follow Up', 'Revisit and confirm status update with proof.', 'photo', 360),
  ('intake_transfer', 'Intake / Transfer', 'Confirm safe transfer and record handoff proof.', 'note', 120),
  ('proof_review', 'Proof Review', 'Review proof quality and status.', 'none', 120),
  ('emergency_escalation', 'Emergency Escalation', 'Escalate the case to emergency response.', 'none', 15)
on conflict (type) do nothing;

-- RLS
alter table public.blocks enable row level security;
alter table public.shelters enable row level security;
alter table public.citizens enable row level security;
alter table public.cases enable row level security;
alter table public.case_reviews enable row level security;
alter table public.task_templates enable row level security;
alter table public.tasks enable row level security;

-- For v1 manual testing, allow any authenticated user to read/write.
-- Tighten later with shelter/block scoping.

create policy "blocks_rw_auth" on public.blocks
  for all to authenticated
  using (true)
  with check (true);

create policy "shelters_rw_auth" on public.shelters
  for all to authenticated
  using (true)
  with check (true);

create policy "citizens_rw_auth" on public.citizens
  for all to authenticated
  using (true)
  with check (true);

-- Citizen app uses anon key. For v1 manual testing, allow anon read/write.
-- Tighten later using device_id binding and shelter/block scopes.
create policy "citizens_rw_anon" on public.citizens
  for all to anon
  using (true)
  with check (true);

create policy "cases_rw_auth" on public.cases
  for all to authenticated
  using (true)
  with check (true);

create policy "cases_rw_anon" on public.cases
  for all to anon
  using (true)
  with check (true);

create policy "case_reviews_rw_auth" on public.case_reviews
  for all to authenticated
  using (true)
  with check (true);

create policy "task_templates_r_auth" on public.task_templates
  for select to authenticated
  using (true);

create policy "task_templates_r_anon" on public.task_templates
  for select to anon
  using (true);

create policy "task_templates_w_auth" on public.task_templates
  for insert to authenticated
  with check (true);

create policy "task_templates_u_auth" on public.task_templates
  for update to authenticated
  using (true)
  with check (true);

create policy "tasks_rw_auth" on public.tasks
  for all to authenticated
  using (true)
  with check (true);

create policy "tasks_r_anon" on public.tasks
  for select to anon
  using (true);

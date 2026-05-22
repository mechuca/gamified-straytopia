-- Security tightening for Straytopia spine.
-- Adds auth-bound profiles and replaces permissive anon RLS with
-- role-scoped policies for citizen vs ops users.

-- 1) Profiles: bind auth.users -> app roles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ops', 'shelter', 'citizen')),
  block_id uuid references public.blocks(id) on delete set null,
  shelter_id uuid references public.shelters(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_user_profiles_updated_at') then
    create trigger set_user_profiles_updated_at
      before update on public.user_profiles
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

-- Self read and ops management
drop policy if exists "profiles_self_read" on public.user_profiles;
create policy "profiles_self_read" on public.user_profiles
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles_ops_manage" on public.user_profiles;
create policy "profiles_ops_manage" on public.user_profiles
  for all to authenticated
  using (exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid() and p.role = 'ops'
  ))
  with check (exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid() and p.role = 'ops'
  ));

-- 2) Citizens: optionally bind device identity to auth user
alter table public.citizens
  add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'citizens_user_id_fkey'
  ) then
    alter table public.citizens
      add constraint citizens_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'citizens_user_id_unique'
  ) then
    create unique index citizens_user_id_unique on public.citizens (user_id);
  end if;
end;
$$;

-- Helper functions for RLS
create or replace function public.is_ops()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_profiles p
    where p.user_id = auth.uid() and p.role = 'ops'
  );
$$;

create or replace function public.current_device_id()
returns text
language sql
stable
as $$
  select c.device_id
  from public.citizens c
  where c.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_citizen_id()
returns uuid
language sql
stable
as $$
  select c.id
  from public.citizens c
  where c.user_id = auth.uid()
  limit 1;
$$;

-- 3) Replace permissive anon policies with scoped ones

-- Blocks: read for all authed (citizen needs to resolve block names)
drop policy if exists "blocks_rw_auth" on public.blocks;
drop policy if exists "blocks_rw_anon" on public.blocks;

create policy "blocks_read_auth" on public.blocks
  for select to authenticated
  using (true);

create policy "blocks_read_anon" on public.blocks
  for select to anon
  using (true);

create policy "blocks_ops_write" on public.blocks
  for insert to authenticated
  with check (public.is_ops());

create policy "blocks_ops_update" on public.blocks
  for update to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "blocks_ops_delete" on public.blocks
  for delete to authenticated
  using (public.is_ops());

-- Shelters: readable for authed; ops writes
drop policy if exists "shelters_rw_auth" on public.shelters;

create policy "shelters_read_auth" on public.shelters
  for select to authenticated
  using (true);

create policy "shelters_ops_write" on public.shelters
  for insert to authenticated
  with check (public.is_ops());

create policy "shelters_ops_update" on public.shelters
  for update to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "shelters_ops_delete" on public.shelters
  for delete to authenticated
  using (public.is_ops());

-- Citizens: citizen can upsert only their own row; ops can manage all
drop policy if exists "citizens_rw_auth" on public.citizens;
drop policy if exists "citizens_rw_anon" on public.citizens;

create policy "citizens_ops_all" on public.citizens
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "citizens_self_read" on public.citizens
  for select to authenticated
  using (user_id = auth.uid());

create policy "citizens_self_write" on public.citizens
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "citizens_self_update" on public.citizens
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Cases: citizen reads/writes only their own cases; ops can manage all
drop policy if exists "cases_rw_auth" on public.cases;
drop policy if exists "cases_rw_anon" on public.cases;

create policy "cases_ops_all" on public.cases
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "cases_citizen_read" on public.cases
  for select to authenticated
  using (citizen_id = public.current_citizen_id());

create policy "cases_citizen_write" on public.cases
  for insert to authenticated
  with check (citizen_id = public.current_citizen_id());

create policy "cases_citizen_update" on public.cases
  for update to authenticated
  using (citizen_id = public.current_citizen_id())
  with check (citizen_id = public.current_citizen_id());

-- Case reviews: ops only
drop policy if exists "case_reviews_rw_auth" on public.case_reviews;

create policy "case_reviews_ops" on public.case_reviews
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

-- Task templates: read for all, ops write
drop policy if exists "task_templates_r_auth" on public.task_templates;
drop policy if exists "task_templates_r_anon" on public.task_templates;
drop policy if exists "task_templates_w_auth" on public.task_templates;
drop policy if exists "task_templates_u_auth" on public.task_templates;

create policy "task_templates_read_auth" on public.task_templates
  for select to authenticated
  using (true);

create policy "task_templates_read_anon" on public.task_templates
  for select to anon
  using (true);

create policy "task_templates_ops_write" on public.task_templates
  for insert to authenticated
  with check (public.is_ops());

create policy "task_templates_ops_update" on public.task_templates
  for update to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "task_templates_ops_delete" on public.task_templates
  for delete to authenticated
  using (public.is_ops());

-- Tasks: citizen reads only tasks assigned to their device; ops manages all
drop policy if exists "tasks_rw_auth" on public.tasks;
drop policy if exists "tasks_r_anon" on public.tasks;

create policy "tasks_ops_all" on public.tasks
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "tasks_citizen_read" on public.tasks
  for select to authenticated
  using (
    assigned_to_type = 'citizen'
    and assigned_to_id = public.current_device_id()
  );

-- Citizen task upserts are allowed only for their own external_ref tasks
-- (missions). Prevents them from modifying arbitrary ops tasks.
create policy "tasks_citizen_upsert" on public.tasks
  for insert to authenticated
  with check (
    assigned_to_type = 'citizen'
    and assigned_to_id = public.current_device_id()
    and external_ref like ('mission:' || public.current_device_id() || ':%')
  );

create policy "tasks_citizen_update" on public.tasks
  for update to authenticated
  using (
    assigned_to_type = 'citizen'
    and assigned_to_id = public.current_device_id()
    and external_ref like ('mission:' || public.current_device_id() || ':%')
  )
  with check (
    assigned_to_type = 'citizen'
    and assigned_to_id = public.current_device_id()
    and external_ref like ('mission:' || public.current_device_id() || ':%')
  );

-- Proofs: citizen can insert/read proofs only for their own tasks; ops can manage all
drop policy if exists "proofs_rw_auth" on public.proofs;
drop policy if exists "proofs_rw_anon" on public.proofs;

create policy "proofs_ops_all" on public.proofs
  for all to authenticated
  using (public.is_ops())
  with check (public.is_ops());

create policy "proofs_citizen_read" on public.proofs
  for select to authenticated
  using (
    exists (
      select 1
      from public.tasks t
      where t.id = proofs.task_id
        and t.assigned_to_type = 'citizen'
        and t.assigned_to_id = public.current_device_id()
    )
  );

create policy "proofs_citizen_insert" on public.proofs
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.tasks t
      where t.id = proofs.task_id
        and t.assigned_to_type = 'citizen'
        and t.assigned_to_id = public.current_device_id()
    )
  );

-- NOTE: RLS is now locked down. Mobile must authenticate (anonymous auth)
-- to read/write its own records. Hub ops users must have a profile row
-- with role='ops'.

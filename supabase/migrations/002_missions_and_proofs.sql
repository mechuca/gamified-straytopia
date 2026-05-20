-- Add mission/proof support to the spine.

alter table public.tasks
  add column if not exists external_ref text;

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'tasks_external_ref_unique'
  ) then
    create unique index tasks_external_ref_unique on public.tasks (external_ref);
  end if;
end;
$$;

create table if not exists public.proofs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  photo_uri text,
  note text,
  captured_at timestamptz,
  submitted_at timestamptz not null default now(),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','needs_review')),
  created_at timestamptz not null default now()
);

alter table public.proofs enable row level security;

-- v1 manual testing policies
create policy "proofs_rw_auth" on public.proofs
  for all to authenticated
  using (true)
  with check (true);

create policy "proofs_rw_anon" on public.proofs
  for all to anon
  using (true)
  with check (true);

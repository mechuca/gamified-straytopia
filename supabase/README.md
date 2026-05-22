# Supabase (Straytopia Spine)

This folder contains the database schema used by both:
- `straytopia-app` (citizen mobile/web)
- `straytopia-hub` (operations hub)

## Setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run `migrations/001_init.sql`.
3. Then run `migrations/002_missions_and_proofs.sql`.
4. Then run `migrations/003_security_and_rls.sql`.
5. Configure environment variables.

### Ops hub (`straytopia-hub`)

Set in Vercel and locally:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Mobile app (`straytopia-app`)

Set in Vercel and locally:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Manual Test

1. Start `straytopia-hub` and sign in with an Ops user.
2. Start `straytopia-app` and submit a report.
3. Confirm the report appears in hub `Cases` in realtime.
4. Accept the case in hub.
5. Confirm the report timeline updates in the mobile app.

## Ops User

For v1 manual testing:
- Create a user in Supabase Auth (Email/Password).
- Sign in via `straytopia-hub` at `/login`.

Then create an ops profile row:

```sql
insert into public.user_profiles (user_id, role)
values ('<auth.users.id>', 'ops')
on conflict (user_id) do update set role = excluded.role;
```

RLS policies are tightened in `003_security_and_rls.sql`:
- Citizens must authenticate (anonymous auth in mobile) and can only read/write their own rows.
- Ops users can read/write everything, but only if they have `user_profiles.role = 'ops'`.

# Supabase (Straytopia Spine)

This folder contains the database schema used by both:
- `straytopia-app` (citizen mobile/web)
- `straytopia-hub` (operations hub)

## Setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run `migrations/001_init.sql`.
3. Then run `migrations/002_missions_and_proofs.sql`.
3. Configure environment variables.

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

RLS policies in `001_init.sql` currently allow:
- `authenticated`: read/write (ops hub)
- `anon`: read/write cases/citizens and read tasks/templates (citizen app)

Tighten these policies before production.

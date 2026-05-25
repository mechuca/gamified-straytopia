# Supabase (Straytopia Spine)

This folder contains the database schema used by both:
- `straytopia-app` (citizen mobile/web)
- `straytopia-hub` (operations hub)

## Setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run `migrations/001_init.sql`.
3. Then run `migrations/002_missions_and_proofs.sql`.
4. Then run `migrations/003_security_and_rls.sql`.
5. Then run `migrations/004_audit_location_metadata.sql`.
6. Then run `migrations/005_operation_queue_foundations.sql`.
7. Then run `migrations/006_system_alignment_foundations.sql`.
8. Then run `migrations/007_media_and_transition_hardening.sql`.
9. Then run `migrations/008_forecast_generation_job.sql`.
10. Configure environment variables.

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

`004_audit_location_metadata.sql` adds:
- Nullable lat/lng, accuracy, privacy, media, outcome, and shelter capacity metadata.
- `operational_events`, an ops-readable append-only ledger automatically populated by triggers on `cases`, `case_reviews`, `tasks`, and `proofs`.

`005_operation_queue_foundations.sql` adds:
- Duplicate case links and duplicate-candidate lookup support.
- A provider-neutral `notification_outbox` table for future in-app/push delivery.
- Guarded ops transition functions for case and task status updates.

`006_system_alignment_foundations.sql` adds:
- `domain_events` for product-level workflow events separate from the audit ledger.
- `animals` and `animal_events` so cases/tasks/proofs can connect to longitudinal animal care.
- `task_assignments` for dispatch history instead of only the latest task owner.
- `trust_scores` and `trust_events` for volunteer, partner, reviewer, and device trust infrastructure.
- `volunteer_profiles`, `organization_profiles`, capabilities, and capacity snapshots for real coordination.
- `area_forecasts`, `assignment_recommendations`, and `proof_quality_scores` as storage for future predictive outputs, without claiming predictions exist before rows are generated.

`007_media_and_transition_hardening.sql` adds:
- Private `straytopia-evidence` storage bucket policies for report/proof media.
- Guarded `ops_update_proof_status` RPC for proof verification transitions.
- Domain-event triggers for case, task, and proof status changes.
- Media helper indexes for proof storage paths and case media references.

`008_forecast_generation_job.sql` adds:
- `generate_area_forecasts(p_window_hours)` for transparent rule-based rescue surge, feeding gap, water gap, volunteer shortage, and shelter overload forecasts.
- The hub Forecasts screen can call this RPC manually after migrations are applied.

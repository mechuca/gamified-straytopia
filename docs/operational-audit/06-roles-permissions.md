# 06 Roles And Permissions

## Current Implemented Roles
- `citizen`: anonymous-auth mobile user scoped to own cases/tasks/proofs.
- `ops`: hub user with full access if `user_profiles.role='ops'`.
- `shelter`: schema role exists but policies are not fully shelter-scoped yet.

## Required Role Matrix

### Public User
- Screens: report, status tracking, limited missions.
- Actions: submit report, view own status.
- Restrictions: cannot see exact sensitive rescue locations globally.

### Volunteer / Feeder / Rescuer
- Screens: missions, accepted task, proof upload.
- Actions: accept, update, submit proof, cancel with reason.
- Restrictions: own assigned tasks only.

### Foster / Adopter
- Screens: future adoption/foster pipeline.
- Actions: express interest, submit profile, track status.
- Restrictions: no operational rescue data.

### NGO Admin / Shelter Manager
- Screens: partner dashboard, assigned cases/tasks, capacity.
- Actions: update capacity, accept assignments, close partner tasks.
- Restrictions: scoped to shelter/block.

### Vet / Medical Partner
- Screens: medical queue.
- Actions: triage medical cases, update treatment state.
- Restrictions: medical cases only.

### Dispatcher / City Lead / Super Admin
- Screens: hub queues, map, analytics, audit logs.
- Actions: assign, escalate, override, close, manage partners.
- Restrictions: city lead scoped by city; super admin global.

### Donor
- Screens: impact and donation receipts.
- Actions: donate, view anonymized impact.
- Restrictions: no sensitive operational location.

## Permission Gaps
- Shelter/user scoping is not fully enforced in hub UI.
- No route-level feature gating by fine role.
- Migration 004 adds an operational event ledger for core case/task/proof mutations, but there is no hub audit-log screen or required override reason policy yet.
- No abuse/rate-limit layer beyond Supabase policies.

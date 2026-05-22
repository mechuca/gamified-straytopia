# 01 Feature Inventory

Audit date: 2026-05-23  
Scope: `straytopia-app`, `straytopia-hub`, Supabase spine migrations.

## Mobile App Inventory

### Navigation And Core Screens
- `app/index.tsx`: app entry and routing gate.
- `(tabs)/index.tsx`: home mission feed, urgent missions, ops task strip, report CTA, refresh state.
- `(tabs)/action.tsx`: redirects to quick action modal.
- `(tabs)/stories.tsx`: story/impact content surface.
- `(tabs)/league.tsx`: leaderboard/gamification surface.
- `(tabs)/you.tsx`: profile, streak, points, badges, settings links.
- `profile/index.tsx`: profile/impact details.
- `settings/index.tsx`: settings and reset-style controls.
- `badges/index.tsx`: badge inventory.
- `celebrate/index.tsx`: success/celebration moment.

### Onboarding And Identity
- `onboarding/location.tsx`: location permission request, fallback to manual area.
- `onboarding/manual-area.tsx`: manual neighborhood selection.
- `register/index.tsx`, `register/phone.tsx`, `register/otp.tsx`, `register/privacy.tsx`, `register/avatar.tsx`: registration, phone, OTP, privacy mode, avatar setup.
- Current identity model: local Zustand state plus optional Supabase anonymous auth via `ensureAuthed()`.

### Report / Rescue Flow
- `report/new.tsx`: report category, severity, description, default location text, submit.
- `report/submitted.tsx`: commits report locally, syncs to Supabase `cases`, subscribes to case status updates, updates local timeline.
- Report categories: injured, sick, feeding, water, rescue, aggressive, abandoned, adoption, other.
- Current report fields: type, severity, description, location text, optional `photoUri` in store but no report photo UI yet.

### Mission / Volunteer Flow
- `mission/detail.tsx`: mission details, urgency, impact points, safety note, accept mission.
- `mission/accept-confirm.tsx`: acceptance confirmation.
- `mission/task.tsx`: active mission/task instruction surface.
- `mission/proof.tsx`: photo upload from library, proof submit.
- `mission/verify.tsx`: verification result flow.
- `mission/success.tsx`: completion and reward moment.
- Mission types: feeding, water, rescue, medical, urgent.
- Mission states: available, accepted, in-progress, proof-pending, verifying, completed, rejected, review.

### Buttons / User Actions
- Home: refresh, open mission, file report.
- Quick action: submit feed proof, file report, cancel.
- Report: choose category, choose severity, enter note, submit.
- Mission: accept, start task, upload proof, submit proof, verify/success path.
- Profile: open settings, badges, stories, impact report.
- Onboarding: use location, pick manual area.

### Maps / Location
- Mobile currently uses location permission and neighborhood selection.
- No live map component is implemented in the mobile app.
- Report location is text-based, defaulting to `12th Main, Indiranagar`.
- Mission locations are text/distance estimates from seeded mission data.

### Uploads
- Mission proof supports image picker upload as local URI.
- Report store supports `photoUri`, but report creation screen does not currently capture/upload a report photo.

### Donations / Adoption / Foster / NGO
- Adoption appears as a report category.
- Dedicated adoption, foster, donation, NGO onboarding flows are not implemented in current app code.

### Notifications
- No push notification provider is implemented.
- Mobile uses realtime Supabase subscriptions for case status updates and task feed updates when configured.

### Empty / Loading / Error States
- Location denied routes to manual area.
- Proof required uses native alert.
- Mission not found has fallback.
- Supabase sync failures are swallowed to avoid blocking prototype flows.

## Operations Hub Inventory

### Navigation / Work Surfaces
- `/action-queue`: primary work-mode queue combining reports, field work, and evidence.
- `/overview`: command dashboard and ops posture.
- `/cases`: report triage queue and detail actions.
- `/tasks`: field work backlog, assignment, task creation.
- `/proofs`: evidence review queue and proof decisions.
- `/shelters`: partner/shelter list.
- `/citizens`: community device list.
- `/blocks`: block-level coverage counts.
- `/mel`: impact/funding metrics.
- `/login`: Supabase email/password login.

### Admin Actions
- Accept report and insert `case_reviews`.
- Reject report with reason/note.
- Assign task to default shelter.
- Create task manually.
- Verify/reject/needs-review proof.
- Action Queue combines one-click accept, assign, verify, reject in demo and live modes.

### Maps / Dispatch
- Current hub has a `Map` navigation label and block counts, plus map-context card in Action Queue.
- No real GIS/map component exists yet.
- Migration `004_audit_location_metadata.sql` adds nullable lat/lng, accuracy, captured-at, and privacy metadata, but mobile/hub UI do not capture or render those fields yet.

### Analytics / Reporting
- `/overview`: counts and workflow posture.
- `/mel`: total cases, backlog, resolved, rates, tasks, completed tasks.
- Metrics are derived from cases/tasks, not a dedicated analytics table.

### Permissions
- `AuthGate` requires authenticated user and `user_profiles.role = 'ops'` when Supabase is configured.
- `003_security_and_rls.sql` defines RLS for ops and citizen-scoped access.
- Fine-grained roles are documented but not implemented yet.

### Empty / Loading / Error States
- Auth loading state exists.
- Missing ops role state exists.
- Demo mode indicator is compact in right rail.
- Page-level empty states exist for lists but need stronger recovery CTAs.

## Supabase Spine Inventory
- `blocks`, `shelters`, `citizens`, `cases`, `case_reviews`, `task_templates`, `tasks`, `proofs`, `user_profiles`, `operational_events`.
- Trigger: accepting a case via `case_reviews` auto-creates a task.
- Trigger: core mutations on cases, reviews, tasks, and proofs append `operational_events` after migration 004 is applied.
- Mobile uses optional Supabase with anonymous auth and continues local-first if unavailable.

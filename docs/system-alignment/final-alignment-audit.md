# STRAYTOPIA Final System Alignment Audit

Audit date: 2026-05-23  
Scope: `straytopia-app`, `straytopia-hub`, Supabase migrations, dashboard analytics, block-level map intelligence, realtime subscriptions, operational queues, role visibility.

## Executive Finding

STRAYTOPIA is partially aligned as one operational spine for reports, tasks, proofs, and hub decisions. The strongest connected loop is:

Mobile report -> Supabase `cases` -> hub reports/action queue -> `case_reviews` -> task auto-create -> dashboard counters/queues -> mobile report realtime timeline.

The weakest areas are true GIS, push notifications, volunteer availability, shelter capacity, adoption/foster/donation/NGO workflows, and role-specific dashboards. These are represented as roadmap or block-level/status-derived intelligence only. They must not be treated as live production systems until the underlying data loops exist.

## Systems That Are Aligned

- Mobile report submission creates or upserts `cases` by `external_id` when Supabase is configured.
- Mobile anonymous auth and `citizens.user_id` provide a route for strict citizen-scoped RLS after migration 003 is applied.
- Hub Reports and Action Queue read from the same `cases`, `tasks`, `proofs`, `blocks`, `shelters`, and `task_templates` tables.
- Hub accept/reject actions insert `case_reviews`; accepted reviews trigger task creation in the database.
- Hub proof review updates `proofs`, linked `tasks`, and linked `cases` in live mode.
- Mobile report submitted screen subscribes to `cases` by `external_id` and maps hub status changes back to mobile timeline states.
- Mobile mission accept/start/proof flows upsert `tasks` by `external_ref = mission:<deviceId>:<missionId>` and insert `proofs`.
- Dashboard analytics now derive from the same operational dataset used by queues: cases, tasks, proofs, blocks, shelters, templates.
- Block-level map intelligence derives from real case/task block relationships and no longer claims precise pins when coordinates are not captured.
- Migration 004 adds an operational event ledger and triggers for core case/task/proof/review mutations.

## Disconnected Or Incomplete Systems

- Precise map pins are not live. Current map intelligence is block-level only.
- Push notifications are not implemented. Dashboard alerts are derived operational alerts, not delivered notifications.
- Volunteer availability is not implemented. Dashboard now shows citizen-assigned task count instead of estimated availability.
- Shelter capacity is not live. Dashboard now shows shelter readiness from `shelters.status`; capacity columns exist in migration 004 but are not wired into UI or queries.
- Adoption/foster is not a pipeline. Dashboard now shows adoption-category reports only.
- Donations are not implemented.
- NGO onboarding and approvals are not implemented.
- Fine-grained dispatcher, rescuer, city lead, super admin, donor, vet, and NGO admin access is not implemented in RLS or route-level UI.
- Mobile mission proof approval is still partly local. Ops proof decisions do not yet subscribe back into local mission state by `external_ref`.
- Report and proof media storage is incomplete. Proof stores `photo_uri`; report store supports `photoUri` but report UI does not capture/upload media.
- Location metadata exists in migration 004 but mobile/hub do not capture lat/lng/accuracy yet.
- Duplicate report prevention is manual only.
- State transitions are not DB-enforced; ops can still skip states through direct table updates.

## Fake Analytics Found And Fixed

- Synthetic rescue trend fallback was removed. Rescue trend now only counts real `cases.created_at` rows matching rescue/emergency criteria.
- Synthetic completion trend values were removed. Completion trend now derives per-day completion rate from real `tasks.created_at` and `tasks.status`.
- Estimated volunteer availability was removed. The dashboard now displays active citizen field tasks from `tasks.assigned_to_type = 'citizen'`.
- Estimated shelter capacity pressure was removed. The dashboard now displays shelter readiness from `shelters.status` only.
- “AI Operational Recommendations” wording was replaced with rule-based recommendations derived from urgent cases, blocked/high-priority tasks, and shelter status.
- “Live map pins/hotspots/clusters” wording was replaced with block-level signals until real coordinates are captured.
- “Real-Time Notifications” wording was replaced with operational alerts because push/deep-link notifications are not wired.
- “Daily impact” was corrected to “Today's resolved impact” and now uses rows updated today.

## KPI And Graph Validation

| Widget | Source | Realtime | Operational Use | Status |
|---|---|---:|---|---|
| Operational posture | Derived from emergency cases, pending escalations, failed missions, completion rate | Yes, via cases/tasks/proofs | Fast risk posture | Aligned as computed index |
| Pending escalations | `tasks.priority`, `tasks.status`, `tasks.due_at` | Yes | Shows blocked/high-risk work | Aligned |
| Average response age | Open `cases.created_at` | Yes | Indicates stale open reports | Aligned |
| Active alerts | Derived urgent cases, blocked/high-priority tasks, pending proofs | Yes | Dispatch attention feed | Aligned, not push notifications |
| Active rescue cases | Open `cases.category in rescue/aggressive/abandoned` | Yes | Rescue queue size | Aligned |
| Emergency cases | Open urgent `cases` | Yes | Emergency lane | Aligned |
| Open feeding missions | Open `tasks` with feed template | Yes | Feeding workload | Aligned |
| Citizen field tasks | Open `tasks.assigned_to_type='citizen'` | Yes | Citizen workload | Aligned |
| Shelter readiness | `shelters.status` | Yes | Partner readiness proxy | Partially aligned, not real capacity |
| Medical cases | Open injured/sick `cases` | Yes | Medical queue pressure | Aligned |
| Adoption reports | Open adoption-category `cases` | Yes | Adoption interest visibility | Partially aligned, no adoption pipeline |
| Today's resolved impact | `tasks.updated_at` completed today + `cases.updated_at` resolved/closed today | Yes | Daily ops outcome | Aligned |
| Rescue trend line | Seven-day `cases.created_at` by rescue/urgent criteria | Yes on reload/subscription | Volume trend | Aligned |
| Completion radial | Completed `tasks` / all `tasks` | Yes | Mission closure rate | Aligned |
| Completion bar chart | Per-day task completion rate from `tasks.created_at/status` | Yes | Completion trend | Aligned |
| Block risk heatmap | Cases/tasks grouped by `block_id` | Yes | Prioritize blocks | Aligned as block-level, not GIS heatmap |
| Active NGOs | `shelters.status in active/limited` | Yes | Partner coverage | Partially aligned, no NGO entity |
| Failed missions | `tasks.status in blocked/cancelled` + rejected proofs | Yes | QA and recovery | Aligned |
| Pending evidence | `proofs.verification_status` pending/needs_review | Yes | Evidence review pressure | Aligned |

## Map Alignment

Current map intelligence is not a true GIS system. It is a block-level operational density view.

Aligned:
- Open case signals come from `cases` grouped by `block_id`.
- Urgent case signals come from urgent open `cases` grouped by `block_id`.
- Feeding signals come from open feed-template `tasks` grouped by `block_id`.
- Risk score is computed from open cases, emergency cases, active missions, and resolved cases.

Not aligned yet:
- No real pins because mobile does not write `latitude`, `longitude`, or accuracy.
- No routes because no volunteer/shelter coordinates or routing API exist.
- No volunteer locations.
- No shelter coordinate layer in UI.
- No completed mission archive layer.
- No map filter-to-chart coordination beyond shared dataset derivation.

Required before calling this a map system:
- Capture report/proof/task/shelter coordinates.
- Store privacy tier and accuracy.
- Add derived map layer model or view.
- Add stale-pin cleanup and completed/archive behavior.

## Action Loop Consistency

### Report Rescue Animal

Mobile report -> `syncReportToSpine()` -> `citizens` upsert -> `cases` upsert -> hub Reports/Action Queue -> dashboard KPIs/alerts/block signals -> hub accept/reject -> `case_reviews` -> trigger task creation -> mobile case subscription updates timeline.

Status: mostly aligned. Missing report media, precise location, duplicate detection, push notification, and guaranteed audit in cloud until migration 004 is applied.

### Accept Case

Hub accept -> optional `cases.status=under_review` -> insert `case_reviews(decision='accepted')` -> DB trigger sets case accepted/task_created and inserts task -> queues/dashboard update through realtime.

Status: aligned. Risk: no transition guard and possible duplicate accepted reviews if operators double-act.

### Reject Case

Hub reject -> update `cases.status='rejected'` with reason -> insert `case_reviews(decision='rejected')` -> dashboard and mobile status update.

Status: aligned. Risk: mobile only sees failed/rejected state, not full reason UX.

### Accept Mobile Mission

Mobile mission accept -> `upsertMissionTask()` -> `tasks.external_ref` -> hub Field Work/Action Queue/dashboard.

Status: partially aligned. Risk: seeded missions are local and not server-claimed; concurrent acceptance is not protected.

### Submit Mission Proof

Mobile proof -> `insertMissionProof()` -> `proofs` -> hub Evidence/Action Queue/dashboard pending evidence.

Status: partially aligned. Risk: media URI can be local-only; no storage upload; proof decision does not fully drive mobile mission state.

### Verify Proof

Hub proof decision -> update `proofs`; verified can complete task and resolve case in Action Queue.

Status: aligned in hub. Missing mobile subscription from proof/task decision back to mission state.

## Operational Queue Validation

Aligned:
- Action Queue prioritizes cases, tasks, and proofs from the same ledger.
- Reports queue supports status filtering and reject reasons.
- Tasks page supports task assignment and creation.
- Proofs page supports verify/reject/needs-review.

Risks:
- Priority scoring is client-side and not shared as a DB field.
- Escalate urgent case button is disabled unless Supabase exists but has no live escalation action.
- Stale queue cleanup is not automated.
- No duplicate prevention beyond manual rejection.
- Assignment uses default/first shelter in some paths, not capacity/proximity.
- No atomic task claim for public volunteer missions.

## Role Visibility Audit

Implemented:
- Hub requires an authenticated user with `user_profiles.role='ops'` when Supabase is configured.
- Citizen RLS can scope mobile users to their own cases/tasks/proofs after migration 003 and anonymous auth are enabled.

Missing:
- Volunteer/rescuer role model.
- NGO admin/shelter manager route scoping.
- Dispatcher/city lead/super admin role hierarchy.
- Donor role and anonymized impact scope.
- Vet/medical partner role.
- Role-specific dashboard/navigation filtering beyond UI metadata.

Operational risk: live deployment must not invite non-ops partner users into the hub until RLS and route gating are expanded.

## Realtime Audit

Aligned:
- Hub overview subscribes to `cases`, `tasks`, `proofs`, `shelters`.
- Hub map intelligence subscribes to `blocks`, `cases`, `tasks`, `shelters`.
- Hub action queue subscribes to `cases`, `tasks`, `proofs`.
- Mobile report status subscribes to matching `cases.external_id`.
- Mobile task feed subscribes to `tasks` and filters by current device assignment.

Risks:
- Several existing pages use effect dependencies that lint flags as incomplete. Build passes, but stale closure risk exists.
- Realtime callback reloads whole page datasets, not incremental row merges.
- No websocket failure indicator or polling fallback.
- No deduplication of repeated realtime events.
- No mobile mission proof/task subscription by `external_ref`.

## UI/UX Consistency Audit

Aligned:
- Hub terminology is now more explicit about current system truth: block signals, operational alerts, rule-based recommendations.
- Dashboard and map no longer imply precise live GIS or push notification systems.
- Color system remains consistent: coral urgent/failure, gold watch/review, jungle resolved/stable, sky active, plum evidence/review.
- Mobile report status terms map cleanly to hub case states at a high level.

Risks:
- Mobile mission statuses use hyphenated states, while DB uses snake_case. Mapping exists in write functions, but terminology differs in UI.
- Hub sidebar contains future/soon items for features not implemented. These are disabled but still may imply product scope.
- Proof screen says “Location confirmed” even though GPS coordinates are not captured. This is a mobile UI inconsistency and should be corrected next.

## Failure Simulation Matrix

| Failure | Current Behavior | Risk | Required Fix |
|---|---|---|---|
| Weak internet | Mobile local flow continues, backend errors swallowed | User/operator unaware of sync failure | Add sync outbox and visible sync status |
| Offline report | Local report persists, Supabase skipped | Hub never receives report unless replay exists | Add retry queue |
| Duplicate rescue | Manual rejection only | Duplicate workload | Similar-case query by block/category/time |
| Failed upload | Proof URI remains local | Hub cannot verify media | Supabase Storage upload with retry |
| GPS denied | Manual area fallback | No exact dispatch location | Keep fallback but mark low confidence |
| GPS inaccurate | Not captured | False precision risk | Capture accuracy and display confidence |
| Volunteer no-show | Not modeled | Stale assigned tasks | Add no-show/cancel reason flow |
| Emergency escalation | Queue priority only | No responder/SLA flow | Add escalation state/action/notification |
| Notification delay | No push system | Users miss status updates | Add notification table and push provider |
| Realtime disconnect | No visible stale state | Operators trust stale dashboard | Add last-updated/stale indicator and polling fallback |
| API timeout | Errors swallowed in mobile sync | Silent data loss | Return sync result and surface retry |
| Shelter full | Status only | Bad routing | Wire capacity fields and assignment rules |
| Admin conflict | No lock | Double review/assignment possible | Add DB functions/transition guards |

## Required Fixes Implemented In This Pass

- Removed synthetic rescue trend fallback.
- Replaced synthetic completion chart with task-derived completion trend.
- Removed estimated volunteer availability metric.
- Replaced estimated shelter capacity with status-derived shelter readiness.
- Replaced adoption pipeline label with adoption reports.
- Replaced daily impact with today's resolved impact based on update timestamps.
- Replaced AI/notification/map language that implied unimplemented systems.
- Fixed bar chart zero values so zero days do not render as fake nonzero bars.
- Sorted operational alerts by real row timestamps instead of human-readable age strings.

## Remaining P0/P1 Alignment Work

- Apply migrations 001-004 to live Supabase and enable anonymous auth.
- Add mobile sync outbox and visible sync state.
- Upload report/proof media to Supabase Storage with policies.
- Capture lat/lng/accuracy/privacy for reports, tasks, proofs, shelters.
- Replace block-level map with true map layers only after location capture exists.
- Add mobile mission subscription to task/proof changes by `external_ref`.
- Add DB transition guard functions for case/task/proof state changes.
- Add duplicate report detection.
- Add no-show/cancel/blocked reason flows.
- Add notification table plus push/deep-link implementation.
- Add role matrix and scoped dashboards for shelter/NGO/dispatcher/city lead.

## Final Assessment

STRAYTOPIA now presents its current operating truth more honestly. The core spine is real for reports, tasks, proofs, reviews, dashboards, queues, and block-level intelligence. The system is not yet a complete city-scale operating system because true GIS, notifications, storage-backed media, role hierarchy, transition enforcement, and retry/recovery infrastructure remain incomplete.

The product should continue as one unified humane operations platform, but the next phase must prioritize closing data loops over adding new surfaces.

# STRAYTOPIA Master Alignment Audit

Audit date: 2026-05-23  
Scope: mobile citizen app, operations hub, Supabase spine, dashboard analytics, block-level map intelligence, realtime updates, operational queues, roles, and failure paths.

## Current System Status

STRAYTOPIA has one real operational spine for reports, cases, tasks, proofs, and ops review. It is not yet a complete unified city-scale operating system because several citizen-facing surfaces remain prototype/local-first and do not have backend ownership.

The strongest aligned loop is:

Mobile report -> `cases` -> hub Reports/Action Queue -> `case_reviews` -> task trigger -> dashboard/queue/block metrics -> mobile case realtime timeline.

The strongest partially aligned loop is:

Mobile mission -> `tasks.external_ref` -> hub Field Work/Action Queue -> mobile proof -> `proofs` -> hub Evidence. Ops proof decisions do not yet sync back into mobile mission state.

## Mobile Feature Alignment Matrix

| Mobile Feature | Backend System | Dashboard Module | Analytics | Realtime | Map | Queue | Missing? |
|---|---|---|---|---|---|---|---|
| Report animal | `cases`, `citizens` | Reports, Action Queue | Case counts, rescue trend, response age | Mobile subscribes by `external_id`; hub subscribes to `cases` | Block only | Case queue | Photo upload, lat/lng, dedupe, push |
| Urgent/SOS-style report | `cases.severity='urgent'` | Reports, Action Queue, Dashboard alerts | Emergency cases, escalations | Yes for case rows | Block only | Emergency implied through priority | No dedicated SOS/escalation workflow |
| Mission accept | `tasks.external_ref` | Field Work, Action Queue | Open missions, citizen field tasks | Hub subscribes to tasks | Block only | Task queue | No atomic server claim |
| Mission proof | `proofs` | Evidence, Action Queue | Pending evidence, failed missions | Hub subscribes to proofs | No proof coordinates | Verification queue | Storage upload, GPS proof, mobile proof decision sync |
| Case tracking | `cases.status` | Reports/Action Queue | Case lifecycle metrics | Mobile case subscription | Block only | Case queue | Push notification and reason display |
| Points | Local Zustand | None | None | No | No | No | Ops-verified scoring absent |
| Badges | Local Zustand | None | None | No | No | No | Badge rules and moderation absent |
| Streak | Local/display-only | None | None | No | No | No | Streak engine absent |
| Leaderboard | Local seeded store | None | None | No | No | No | Trust scoring, moderation, anti-abuse absent |
| Stories/Impact feed | Local seed array | None | None | No | No | No | Story moderation/publishing absent |
| Profile preferences | Local Zustand | None | None | No | No | No | Backend profile sync absent |
| Notification settings | UI copy only | None | None | No push | No | No | Push orchestration absent |
| Buddy mode/invite | Not implemented in current code path | None | None | No | No | No | Entity/model/workflow absent |
| Reset demo | Local storage reset | None | None | No | No | No | Does not clean synced backend rows |

## Home Screen Alignment

Aligned:
- Ops-assigned citizen tasks appear through `useOpsTasks()`.
- Local mission accept/start/proof flows can create task/proof rows.
- Report CTA leads to the real report sync path.

Disconnected or corrected:
- Seeded missions are local care options, not backend-controlled nearby missions.
- Streak, report/heart counts, and local points are not ops-verified.
- Home copy was corrected so reports create ops review, not guaranteed volunteer response.

Required fixes:
- Mission feed should be server-owned once public missions are real.
- Streak and points should be derived from verified proofs/tasks, not local completion.
- Badges need backend rules and moderation.

## Impact / Stories Alignment

Current status: disconnected prototype content.

Missing:
- Story moderation table.
- Published rescue updates table.
- Regional aggregation model.
- Verified outcome pipeline.
- Geo-tagged story visibility rules.

Fix applied:
- Stories screen now states demo stories are not ops-published yet.

## Ranks And Trust Alignment

Current status: local seeded leaderboard.

Missing:
- Trust score model.
- Ops-verified scoring from completed tasks/proofs.
- Regional leaderboards.
- Anti-abuse/fake-proof detection.
- Score moderation dashboard.
- Privacy-aware visibility.

Fixes applied:
- Ranking copy now says prototype/local preview.
- Scope pills now actually update local scope state.
- Removed claims about verified scoring/reset schedule.

## Profile Alignment

Current status: mostly local profile and local contribution state.

Aligned:
- Local report count can derive from local report store.
- Local mission completion can derive from mission store.

Disconnected:
- Points, badges, streak, privacy, notifications, and stories are not backend-owned.
- Reset only clears local state and can leave already-synced backend records intact.

Fixes applied:
- Removed hardcoded reports/resolved/response/streak metrics.
- Copy now states local points are not ops-verified.
- Settings copy now states notifications and privacy sync are not connected.
- Reset copy now states only local prototype state is cleared.

## Rescue Flow Alignment

Aligned:
- Category, severity, notes, location text create `cases`.
- Hub can accept/reject and create tasks.
- Mobile tracks case status through realtime when Supabase is configured.

Missing:
- Report media upload.
- Precise location capture.
- Dispatch ETA.
- Responder routing.
- Shelter matching by capacity/proximity.
- Full medical/treatment/healing/rehab states.
- Notification orchestration.
- Duplicate report detection.

Fix applied:
- Report form no longer shows fake average response time.

## Map Alignment

Current map system is block-level intelligence, not precise GIS.

Aligned:
- Cases/tasks/shelters can be grouped by block.
- Dashboard map intelligence uses real block-linked rows.

Missing:
- Mobile does not write lat/lng/accuracy.
- Proof screen does not capture GPS proof.
- Volunteer/shelter coordinates are not active in UI.
- No routes, clustering, stale-pin cleanup, or public-safe location display.

Fix applied:
- Proof screen now states area context only and does not claim GPS proof capture.

## Operational Queue Alignment

Aligned:
- Reports queue owns case review.
- Action Queue combines cases, tasks, proofs.
- Evidence queue owns proof decisions.
- Field Work owns task assignment and creation.

Missing queues:
- Story approval.
- Leaderboard moderation.
- Volunteer approval.
- NGO approval.
- Emergency escalation ownership beyond case severity/priority.
- Adoption/foster pipeline.

## Realtime Alignment

Working:
- Mobile case status subscription by `external_id`.
- Mobile task feed subscription for citizen-assigned tasks.
- Hub subscriptions for cases/tasks/proofs on operational pages.

Missing:
- Mobile mission state subscription to proof/task decisions.
- Push/deep-link notifications.
- Websocket failure indicator.
- Polling fallback.
- Incremental row merges and duplicate event handling.

## Analytics Truth Audit

Real row-derived metrics:
- Active rescue cases.
- Emergency cases.
- Open feeding missions.
- Citizen field tasks.
- Shelter readiness from status.
- Medical cases.
- Adoption-category reports.
- Today's resolved impact.
- Rescue trend.
- Mission completion rate.
- Pending evidence.
- Failed missions.
- Block activity signals.

Prototype/local metrics:
- Mobile points.
- Mobile badges.
- Mobile streak.
- Mobile leaderboard.
- Mobile stories/impact feed.

Removed or relabeled fake claims:
- Mobile average response time.
- AI proof verification.
- GPS proof confirmation.
- Hardcoded profile stats.
- Hardcoded home streak/report count.
- Leaderboard verified scoring/reset claims.

## Role And Permissions

Implemented:
- Hub ops gate through `user_profiles.role='ops'` when Supabase is configured.
- Citizen RLS model exists after migration 003.

Missing:
- Volunteer/rescuer role.
- NGO/shelter manager scope.
- Dispatcher/city lead/super admin hierarchy.
- Donor visibility rules.
- Vet/medical partner role.

## Failure Checklist

| Scenario | Current Behavior | Required Fix |
|---|---|---|
| Offline report | Local report persists, backend skipped | Sync outbox and replay |
| Failed upload | Proof stores local URI | Supabase Storage with retry |
| Duplicate rescue | Manual rejection | Similar-case detection |
| No responders | No escalation model | SLA escalation queue |
| Shelter full | Status only | Capacity fields wired to assignment |
| GPS denied | Manual area fallback | Low-confidence location flag |
| Realtime disconnect | No stale indicator | Stale state and polling fallback |
| Notification failure | No push system | Notification table/provider |
| Admin conflict | No lock | DB transition functions |
| Fake proof | Manual review only | Media metadata/moderation |
| Leaderboard abuse | Local seed data | Verified scoring and moderation |
| Reset demo | Local reset only | Explain synced data remains |

## Required Next Fixes

- Add mobile sync outbox and visible sync status.
- Upload report/proof media to controlled storage.
- Capture location metadata for reports/proofs/tasks.
- Subscribe mobile mission state to task/proof updates by `external_ref`.
- Add DB transition guard functions.
- Add duplicate report detection.
- Add notification table and push provider.
- Add verified points/badges/leaderboard backend.
- Add story moderation and published impact updates.
- Add role-specific hub scopes for shelter/NGO/dispatcher/city lead.

## Final Assessment

The core rescue/report/task/proof spine is real and increasingly aligned. The mobile app still contains several prototype participation systems that must stay labeled as local/demo until backend ownership exists. The highest-leverage next step is not another dashboard surface; it is closing mobile data loops for sync status, media, location, proof decisions, and verified scoring.

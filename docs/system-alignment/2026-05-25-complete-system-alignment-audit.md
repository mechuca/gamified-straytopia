# STRAYTOPIA Complete System Alignment Audit

Audit date: 2026-05-25
Scope: mobile citizen app, operations hub, Supabase spine, evidence, map intelligence, dispatch, trust, volunteer, NGO, and longitudinal care systems.

## 1. Ecosystem Audit

Core finding: STRAYTOPIA is partially aligned around a real reports -> cases -> tasks -> proofs spine. It is not yet one coherent humane infrastructure system because several mobile experiences are local/demo systems, and the hub orchestrates work items without a durable animal lifecycle, trust layer, assignment history, or predictive event layer.

| Feature | Current status | Main gap |
|---|---|---|
| Home missions | Partially aligned, duplicate logic | App mixes local seed missions with live ops-assigned tasks. Mission source should become server-owned. |
| Daily care paths | Partially aligned in app, decorative in web | No backend recurrence, care plan, route, expiry, or longitudinal animal link. |
| Rescue reporting | Partially aligned | Creates `cases`, but lacks media upload, exact location, duplicate linking, push notification, and animal identity. |
| SOS escalation | Missing infrastructure | No dedicated native SOS state, responder workflow, escalation policy, or alert delivery. |
| Evidence upload | Partially aligned, missing infrastructure | Proof rows exist, but media storage, GPS metadata, quality scoring, reviewer accountability, and rejection reasons are incomplete. |
| Impact feed | Decorative | Stories and impact are local/static, not tied to verified outcomes. |
| Rankings | Decorative, missing infrastructure | Points and leaderboards are local, not proof-verified or trust moderated. |
| Profile progression | Disconnected from backend | Local points, badges, streaks, and preferences do not sync with verified operations. |
| Volunteer systems | Partially aligned for device assignment | Citizen device assignment exists, but volunteer identity, availability, skills, trust, and burnout do not. |
| NGO/Shelter systems | Disconnected, decorative | Shelters are lookup rows, not capacity-aware partner operations. |
| Operational queue | Partially aligned, duplicate logic | Queue now simpler, but still uses client-side transitions and heuristics. |
| Rescue cases | Partially aligned | Review exists, but case view does not own full task, proof, duplicate, escalation, and animal lifecycle. |
| Evidence review | Partially aligned, duplicate logic | Proof page and action queue update different parts of the lifecycle. |
| Map intelligence | Partially aligned, block-level only | Block risk exists. No precise GIS, route, stale pin, or privacy-masked public layer. |
| Dispatch logic | Partially aligned, missing infrastructure | Assignment is heuristic and client-side. No durable assignment history or acceptance lifecycle. |

## 2. Mobile To Hub Relationship Matrix

| Mobile action | Dashboard event | Operational effect | Trust effect | Map effect | Impact effect | Longitudinal effect |
|---|---|---|---|---|---|---|
| Submit rescue report | Case appears in queue/cases | Starts review lifecycle | Reporter/device history should update | Block risk increases, exact GIS pending | Open case count increases | Should create/link animal sighting |
| Submit urgent report | Urgent case priority | Requires SLA/escalation | Abuse risk and reporter reliability should be tracked | Emergency pressure by block | Emergency KPI increases | Should start rescue-requested animal state |
| Accept local mission | Task row via `external_ref` | Mobile mission becomes hub-visible | Volunteer reliability should record acceptance | Block workload increases | Active mission count increases | Should link to care plan or animal when known |
| Start mission | Task moves in progress | Field work begins | Response-time signal | Active field signal | Mission activity increases | Care event should be pending evidence |
| Submit proof | Proof queue item | Reviewer verification needed | Evidence quality and fraud risk should update | Proof location confidence should update | Pending evidence increases | Animal/task event should be evidence-backed |
| Proof verified | Queue/proofs decision | Task complete, case may resolve | Points/trust credited | Completed work layer updates | Verified impact increments | Animal status can progress |
| Proof rejected | Queue/proofs decision | Rework/escalation needed | Trust watch signal | Location/evidence confidence decreases | Impact not credited | Lifecycle remains unresolved |
| View report status | Case subscription | Citizen sees state | Transparency improves | None | None | Case timeline visible |
| Join leaderboard | No live hub event yet | None | Requires consent and moderation | Locality rank should update | Contribution score should update | Volunteer history should persist |
| Update profile | No live hub event yet | None | Consent/preferences should update | None | Public story visibility should update | Volunteer identity should persist |

## 3. Low Value UI To Convert

- Local mobile stories should become ops-published case/animal updates with privacy checks.
- Local leaderboard should become proof-verified contribution, moderated by trust events.
- Dashboard MEL should link every KPI to cases, tasks, proofs, animals, and evidence quality.
- Block heatmaps should stay block-level until lat/lng capture and privacy masking exist.
- Shelter cards should become capacity, capability, intake, and reliability cards.
- Volunteer device list should become volunteer intelligence with availability, skills, safety, and burnout status.

## 4. Missing Infrastructure Report

- Trust: volunteer score, shelter reliability, reviewer accountability, fraud events, consent, moderation, device risk.
- Animal lifecycle: reported, rescued, stabilized, treated, rehabilitated, fostered, adopted, released, monitored.
- Volunteer intelligence: skill, availability, response reliability, mission consistency, locality participation, burnout.
- NGO intelligence: capacity, medical capability, emergency readiness, adoption throughput, reliability.
- Predictive intelligence: rescue surge, shelter overload, volunteer shortage, feeding gap, proof fraud risk.
- Orchestration: assignment history, SLA policy, escalation policy, notification delivery, state transition enforcement.

## 5. Trust Architecture Plan

Trust should be evidence-based, reversible, explainable, and non-surveillance oriented.

Minimum model:
- `trust_scores`: current explainable score snapshot per volunteer, shelter, reviewer, device, or organization.
- `trust_events`: immutable reasons for score changes.
- `proof_quality_scores`: evidence quality and fraud risk per proof.
- `task_assignments`: response, acceptance, decline, no-show, and completion history.
- Moderation actions and consent records should be added before public leaderboards become live.

## 6. Longitudinal Care Architecture

Cases are not enough. The system needs animals as the durable record.

Minimum model:
- `animals`: current known animal identity and status.
- `animal_events`: timeline of sightings, reports, rescues, treatment, foster, adoption, release, and monitoring.
- `cases.animal_id`, `tasks.animal_id`, and `proofs.animal_id`: nullable links from operational work to the care record.

## 7. Volunteer Intelligence Plan

Volunteer intelligence should optimize safety and continuity, not competition.

Signals:
- Response reliability.
- Proof approval rate.
- Locality participation.
- Mission consistency.
- Declines/no-shows.
- Overload and burnout risk.
- Skills and transport capability.

## 8. NGO Coordination Architecture

NGO and shelter logic must become capacity-aware.

Signals:
- Current intake status.
- Species-specific capacity.
- Emergency slots.
- Medical and surgery capability.
- Handoff reliability.
- Adoption/foster throughput.
- SLA and response history.

## 9. Predictive Intelligence Architecture

Prediction should be stored as explicit outputs, not implied by decorative charts.

Minimum model:
- `area_forecasts` for rescue surge, feeding gap, water gap, shelter overload, and volunteer shortage.
- `assignment_recommendations` for transparent dispatch suggestions.
- `proof_quality_scores` for reviewer-facing evidence intelligence.

## 10. Recommended Database Changes

Implemented in `supabase/migrations/006_system_alignment_foundations.sql`:

- `domain_events`
- `animals`
- `animal_events`
- `task_assignments`
- `trust_scores`
- `trust_events`
- `volunteer_profiles`
- `organization_profiles`
- `organization_capabilities`
- `organization_capacity_snapshots`
- `area_forecasts`
- `assignment_recommendations`
- `proof_quality_scores`
- nullable `animal_id` links on `cases`, `tasks`, and `proofs`

## 11. Recommended Event System

Use two ledgers:

- `operational_events`: audit trail for who changed which row and when.
- `domain_events`: product workflow events used by mobile, hub, impact, maps, notifications, and longitudinal care.

Initial event taxonomy:
- `case.submitted`, `case.review_started`, `case.accepted`, `case.rejected`, `case.duplicate_linked`
- `task.assigned`, `task.accepted`, `task.started`, `task.blocked`, `task.escalated`, `task.completed`
- `proof.submitted`, `proof.verified`, `proof.rejected`
- `animal.sighted`, `animal.rescue_requested`, `animal.intake_started`, `animal.treatment_started`, `animal.released`, `animal.adopted`
- `notification.queued`, `notification.sent`, `notification.failed`
- `assignment.recommended`, `assignment.overridden`

## 12. Recommended Operational Workflows

1. Report intake: mobile report -> case -> duplicate check -> animal candidate -> queue.
2. Review: ops accepts/rejects with reason -> domain event -> outbox notification.
3. Dispatch: task created -> assignment recommendation -> task assignment row -> volunteer/shelter accepts.
4. Field work: task starts -> proof submitted -> evidence queue.
5. Verification: reviewer records proof quality -> proof decision -> trust event -> task/case/animal state update.
6. Longitudinal care: animal event progresses status -> impact ledger updates only after verification.
7. Prediction: daily forecasts write to `area_forecasts` and appear as operational suggestions, not claims.

## 13. Implementation Roadmap

P0:
- Apply migrations 001 through 006.
- Move hub writes to guarded RPCs and domain event writes.
- Add mobile sync outbox and visible sync status.
- Add Supabase Storage upload for report/proof media.

P1:
- Capture lat/lng/accuracy/privacy for reports and proofs.
- Subscribe mobile missions to task/proof decisions by `external_ref`.
- Add assignment history writes from hub dispatch actions.
- Convert proof review into a single consistent workflow across queue and proof page.

P2:
- Add animal identity UI and longitudinal care timelines.
- Replace local leaderboard with verified contribution scoring.
- Add volunteer profile/availability and NGO capacity screens.

P3:
- Generate area forecasts and assignment recommendations from historical operations.
- Add privacy-safe public impact feed from verified animal/case outcomes.

# Straytopia Complete Ecosystem Alignment Audit

Date: 2026-05-26

Goal: move Straytopia from connected screens into one operationally coherent humane infrastructure system.

## Executive Summary

Straytopia now has the foundation of a real civic operations spine: mobile reports sync to cases, accepted cases create tasks, citizen-assigned tasks appear on mobile, proofs enter hub review, ops decisions can resolve work, animals can be linked to longitudinal care, and trust/partner/forecast tables exist.

The remaining coherence gap is not visual design. It is lifecycle automation. Several surfaces already look operational, but some data loops still require manual activation or display static/local values. The highest-risk gaps are volunteer availability, proof-quality automation, forecast consumption, map intelligence, notification delivery, and public-facing impact/ranking claims.

## Feature Audit

| Feature | Status | Alignment Finding | Required Correction |
| --- | --- | --- | --- |
| Home missions | partially aligned | Local missions can write tasks and receive hub proof decisions, but mission supply is not fully hub-driven. | Make hub tasks/templates the mission source by block. |
| Daily care paths | missing infrastructure | Feeding/water mission types exist, but no recurring care route, schedule, or continuity model exists. | Add care routes and recurring task generation. |
| Rescue reporting | partially aligned | Reports sync to `cases` with block, severity, media, and GPS metadata. | Add report detail tracking and automatic animal/case lifecycle creation. |
| SOS escalation | partially aligned | Urgent severity exists; no dedicated responder escalation, SLA worker, or notification channel. | Route urgent reports into queue escalation, outbox notification, and forecast pressure. |
| Evidence upload | aligned with gaps | Proof upload enters `proofs`; ops verifies/rejects; mobile reacts. | Add automated proof quality, trust events, animal events. Implemented in migration 010. |
| Impact feed | decorative | Mobile stories are hardcoded and not connected to verified outcomes. | Replace with verified `domain_events`, resolved cases, and animal lifecycle milestones. |
| Rankings | decorative | Leaderboard is seed data; score scope does not query live verified work. | Hide as preview or back with verified trust/impact ledger. |
| Profile progression | partially aligned | Points are protected behind proof verification, but badges/streaks remain local/static. | Compute badges from verified mission and trust events. |
| Volunteer systems | partially aligned | Device profiles and pending volunteer onboarding exist; no accept/decline/availability/burnout loop. | Add volunteer availability, assignment response, and decline reasons. |
| NGO/Shelter systems | partially aligned | Partner profiles and capacity snapshots exist; ranking still underuses capacity/trust. | Use latest capacity and trust in dispatch scoring. |
| Operational queue | aligned with gaps | Queue unifies cases/tasks/proofs and now forecast signals. | Add duplicate-link writes and notification outbox worker. |
| Rescue cases | partially aligned | Accept/reject works and creates tasks. | Add duplicate handling, animal lifecycle auto-start, SOS policy. |
| Evidence review | aligned with gaps | Verify/reject/needs review works. | Migration 010 closes quality/trust/lifecycle side effects. |
| Map intelligence | partially aligned | Block-level density exists; exact coordinates captured but no live geospatial map. | Keep block-level claims until privacy-safe map layer exists. |
| Dispatch logic | partially aligned | Rule-based shelter/citizen ranking exists. | Add trust, capacity, skills, distance, and overload forecasts. |

## Mobile To Hub Relationship Matrix

| Mobile Action | Dashboard Event | Operational Effect | Trust Effect | Map Effect | Impact Effect | Longitudinal Effect |
| --- | --- | --- | --- | --- | --- | --- |
| Select area | local profile state | Sets local context only | none | block preference only | none | none |
| Submit rescue report | `cases.insert` | Case appears in queue | none initially | block and optional GPS pressure | intake count increases | can create animal record |
| Submit urgent report | `cases.insert` with urgent severity | Emergency queue priority | none initially | block risk increases | emergency metric increases | can start rescue lifecycle |
| Accept mission | `tasks.upsert` with device assignment | Mobile-visible work begins | pending future reliability | block task load increases | active work count increases | task can link to animal |
| Start mission | `tasks.status = in_progress` | Field work active | reliability evidence begins | block active work increases | active mission state | care event possible later |
| Submit proof | `proofs.insert`, task proof pending | Evidence review item appears | pending decision | proof GPS available | proof count increases | proof can attach to animal |
| Ops verifies proof | `proofs.verified`, task complete, case resolved | Work closes | device/shelter/reviewer trust increases via migration 010 | open risk decreases | verified impact increases | animal event recorded if linked |
| Ops rejects proof | `proofs.rejected` | Exception remains | device/shelter trust decreases via migration 010 | unresolved pressure remains | failed mission increases | no positive lifecycle event |
| Ops creates animal from case | `animals`, `animal_events`, `domain_events` | Longitudinal care starts | none | animal block context exists | care record exists | animal lifecycle begins |
| Forecast generated | `area_forecasts.insert` | Queue forecast signal appears | none | block forecast risk visible | planning trigger | no animal effect until ops acts |

## Missing Infrastructure Report

Trust infrastructure:
- Present: `trust_scores`, `trust_events`, recalculation RPC, migration 010 proof-triggered events.
- Missing: reviewer disagreement handling, shelter reliability from capacity/refusals, volunteer accept/decline reliability, public-safe explanation layer.

Animal lifecycle:
- Present: animal records, events, manual create/link/event RPCs, verified-proof monitoring event automation.
- Missing: automatic case accepted -> reported/rescue_requested event, treatment/foster/adoption workflows, release monitoring schedule.

Volunteer intelligence:
- Present: pending volunteer profiles from citizen devices, assignment history, device trust.
- Missing: availability, radius, skills editing, decline/accept, burnout, cooldown, locality participation history.

NGO coordination:
- Present: organization profiles, capacity snapshots, capabilities table.
- Missing: capability editing UI, rescue quality, intake refusal events, adoption throughput, reliability score automation.

Predictive intelligence:
- Present: rule-based area forecasts and queue surfacing.
- Missing: forecast acknowledgements as first-class state, forecast-to-task generation, volunteer shortage notifications, shelter overload routing.

Operational orchestration:
- Present: queue ranking, manual assignment, guarded RPCs, domain events.
- Missing: notification worker, duplicate resolution writes, trust/capacity-weighted optimizer, replayable workflow state machine.

## Low Value UI And Corrections

| Surface | Classification | Correction |
| --- | --- | --- |
| Mobile stories | decorative | Replace with verified impact events. |
| Mobile leaderboard | fake/static metric | Back with verified points/trust or label preview. |
| Mobile streak | static/local | Compute from verified task completion days. |
| Mobile manual area helper counts | decorative | Pull active volunteers/tasks by block. |
| Overview operational posture | derived heuristic | Keep as rule-based posture, expose drivers, avoid claiming model intelligence. |
| Avg response age | mislabeled metric | Rename to open case age unless accepted/assigned timestamps exist. |
| Forecast page | partial operational trigger | Now forecast signals surface in Action Queue. |
| Citizens/shelters block names | stale demo mapping | Fixed to query live blocks. |

## Recommended Database Changes

Already added:
- `010_system_coherence_automation.sql` for proof quality, trust events, reviewer/shelter/device scoring, and animal monitoring events.

Next migrations:
- `care_routes`: recurring feeding/water routes, block coverage, cadence, owner.
- `volunteer_availability`: active windows, radius, transport, cooldown.
- `assignment_responses`: accept/decline/timeout reasons from mobile.
- `notification_deliveries`: provider attempts, status, retry time, privacy-safe payloads.
- `forecast_reviews`: acknowledged/dismissed/escalated forecast state.
- `animal_care_plans`: treatment, foster, adoption, release, monitoring milestones.

## Recommended Event System

Use `domain_events` as the product workflow stream and `operational_events` as the audit ledger.

Required event families:
- `case.submitted`, `case.accepted`, `case.rejected`, `case.assigned`, `case.resolved`
- `task.assigned`, `task.accepted`, `task.declined`, `task.started`, `task.proof-pending`, `task.completed`, `task.escalated`
- `proof.submitted`, `proof.verified`, `proof.rejected`, `proof.needs-review`
- `trust.changed`, generated from proof and assignment outcomes
- `animal.reported`, `animal.rescued`, `animal.treatment-started`, `animal.released`, `animal.monitoring-started`
- `forecast.generated`, `forecast.reviewed`, `forecast.escalated`
- `notification.queued`, `notification.sent`, `notification.failed`

## Operational Workflows

Report to rescue:
1. Citizen submits report.
2. Hub queue reviews urgency/duplicate risk.
3. Ops accepts case, task is created.
4. Ops creates/links animal record.
5. Task assigned to shelter or citizen device.
6. Mobile proof returns to evidence queue.
7. Verified proof closes task/case, updates trust, proof quality, impact, and animal lifecycle.

Daily care:
1. Care route generates block tasks.
2. Citizen accepts task or ops assigns device.
3. Proof enters queue.
4. Verification updates points, trust, locality participation, and route coverage.

Forecast response:
1. Forecast generator writes block risk.
2. Queue surfaces forecast signal.
3. Ops acknowledges or escalates.
4. If escalated, tasks/notifications are created by block need.
5. Later proof/case outcomes validate whether forecast pressure was real.

## Roadmap

Immediate:
- Apply migrations 006-010 in production.
- Keep Action Queue as the primary ops surface.
- Replace static mobile leaderboard/stories labels with “verified impact coming from ops decisions” or connect them to real events.

Near term:
- Add mobile report detail tracking.
- Add volunteer availability and accept/decline workflow.
- Add capability and capacity editing for partners.
- Add notification worker for `notification_outbox`.

Next:
- Add care routes and recurring task generation.
- Add forecast review state and forecast-to-task generation.
- Add animal care plans and release monitoring.

Later:
- Add privacy-safe map layer with exact ops-only coordinates.
- Add trust-weighted dispatch optimizer using capacity, skills, distance, reliability, and burnout.

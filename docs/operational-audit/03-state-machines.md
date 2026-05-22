# 03 State Machines

## Rescue Case
- Initial: `submitted`.
- Allowed states: submitted, under_review, accepted, rejected, task_created, assigned, in_progress, resolved, closed.
- Allowed transitions: submitted -> under_review -> accepted/rejected -> task_created -> assigned -> in_progress -> resolved -> closed.
- Who triggers: citizen submits; ops reviews; trigger creates task; shelter/ops assigns; ops/proof closes.
- Validation: category, severity, location text; future requires lat/lng and media quality.
- Proof: required before resolved for rescue/medical in production.
- Notification: citizen timeline update implemented through realtime; push not implemented.
- Hub visibility: Action Queue, Reports, Command, Map, Impact.
- Failure: rejected, blocked/escalated via task.
- Admin override: ops can update under RLS but audit should be required.
- Closed condition: resolved/closed with proof or admin override reason.
- Gaps: no transition guard or proof-required enforcement. Migration 004 adds an audit ledger, but it does not enforce state transitions.

## Feeding Mission
- Initial: available.
- States: available, accepted, in-progress, proof-pending, verifying, completed, review, rejected.
- Transitions: available -> accepted -> in-progress -> proof-pending/verifying -> completed/review/rejected.
- Trigger: citizen accepts/submits proof; ops verifies proof.
- Required proof: photo.
- Hub visibility: Field Work, Evidence, Action Queue.
- Gap: mobile verification is local and not fully driven by ops proof decision.

## Volunteer Task
- Initial: queued/assigned.
- States: queued, assigned, in_progress, proof_pending, completed, blocked, escalated, cancelled.
- Trigger: ops/shelter/citizen depending assigned type.
- Validation: assignee ownership, status transition, proof if required.
- Gap: no atomic claim; two users could conflict if shared mission tasks become public.

## Adoption Request
- Current state machine: not implemented.
- Proposed: submitted -> screened -> home_check -> approved -> matched -> trial -> adopted -> closed; rejected/cancelled.

## Foster Request
- Current: not implemented.
- Proposed: submitted -> verified -> available -> matched -> active -> completed; paused/rejected.

## Donation
- Current: not implemented.
- Proposed: initiated -> pending_payment -> paid -> receipted -> attributed/refunded/failed.

## NGO Onboarding
- Current: not implemented.
- Proposed: invited -> submitted -> document_review -> approved -> active -> suspended.

## Shelter Capacity
- Current: `status` only.
- Proposed: unknown -> reported -> verified -> full/limited/available -> stale.

## Medical Case
- Current: case category `injured/sick`, task template `medical_check`.
- Proposed: reported -> triaged -> assigned_vet -> assessed -> admitted -> treated -> released/fostered/closed.

## Emergency Escalation
- Current: template exists, no flow.
- Proposed: detected -> escalated -> responder_assigned -> en_route -> stabilized -> transferred/closed.

## User Verification
- Current: phone/OTP local flow, leaderboard verification.
- Proposed: anonymous -> phone_verified -> volunteer_verified -> role_approved -> suspended.

## Transition Risks
- States can skip because DB policies do not enforce transitions.
- A case can resolve without proof if ops updates directly.
- Offline/local mobile state can diverge from hub state.
- Admin override is audit-logged by triggers after migration 004 is applied, but override reasons are still not required for every transition.

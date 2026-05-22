# 10 Priority Fix Plan

## P0 Critical
- Prevent spam/abuse reports before public launch.
- Surface safe operational audit logging in hub and require override reasons for risky actions.
- Ensure strict RLS migration is run before connecting live production data.
- Avoid precise public location leaks for sensitive rescue cases by enforcing capture/display privacy rules.

## P1 High
- Wire map/location capture and display for reports, tasks, proofs, shelters.
- Upload proof/report images to controlled storage instead of local URI.
- Add duplicate report detection by category/location/time.
- Add cancel/no-show/blocked reasons for field tasks.
- Add proof decision subscription back into mobile mission state.
- Add shelter capacity fields and assignment logic.
- Add atomic task claim for shared volunteer missions.

## P2 Medium
- Improve mobile proof note/report photo UX.
- Add direct recovery CTAs to empty states.
- Add staleness indicators to hub dashboards.
- Add role-specific hub home screens after RBAC is expanded.
- Add push notification infrastructure.

## P3 Low / Future
- Heatmaps and predictive rescue density.
- Donor-facing impact dashboards.
- Adoption/foster pipelines.
- NGO onboarding and document workflows.
- Command palette and keyboard shortcuts.

## Fixes Implemented In This Audit Session
- Added shared hub demo dataset across all pages.
- Wired Action Queue, Reports, Field Work, Evidence, Partners, Community, Map, and Impact to the same demo ledger.
- Enabled demo-mode local state transitions for accept report, assign task, verify/reject proof.
- Added migration 004 with nullable location/privacy/media/capacity metadata fields.
- Added migration 004 operational event ledger with automatic triggers for `cases`, `case_reviews`, `tasks`, and `proofs`.

# 04 Data Loop Audit

## Cases
- Source: mobile report form or hub admin.
- Payload: category, severity, text location, description, citizen ID.
- Validation: Postgres checks for category/severity; weak client validation.
- Storage: `cases`.
- Realtime sync: mobile report submitted screen subscribes by `external_id`; hub subscribes per table.
- Hub display: Reports, Action Queue, Command, Map summary, Impact.
- Analytics: case counts, backlog, accept/reject/resolution rates.
- Security: RLS in migration 003 scopes citizen to own cases and ops to all.
- Gaps: migration 004 adds nullable lat/lng and media fields, but mobile capture is not wired; no dedupe logic.

## Citizens
- Source: mobile `ensureAuthed()` + `upsert citizens`.
- Payload: device ID, user ID, optional block ID.
- Storage: `citizens`.
- Hub display: Community.
- Gaps: no public profile sync, no volunteer capability model.

## Tasks
- Source: DB trigger on accepted case, hub manual create, mobile mission upsert.
- Payload: case/template/block/shelter/status/priority/assignee/external_ref.
- Hub display: Field Work, Action Queue.
- Mobile display: `useOpsTasks()` filters tasks assigned to current device.
- Gaps: no transition lock or route/ETA. Migration 004 adds outcome reason fields, but mobile/hub cancel/no-show flows are not wired.

## Proofs
- Source: mobile proof submission.
- Payload: task ID, local/photo URI, note, captured/submitted timestamps, verification status.
- Hub display: Evidence, Action Queue.
- Analytics: proof queue and task completion.
- Gaps: local image URI may not render in hub; migration 004 adds storage and GPS metadata fields, but upload/capture/moderation are not wired.

## Blocks / Shelters
- Source: seed/migration/admin.
- Hub display: Map, Partners.
- Gaps: migration 004 adds nullable capacity and coordinate fields for shelters, but UI/admin update flow is not wired.

## User Profiles / Roles
- Source: manual ops profile insert.
- Storage: `user_profiles`.
- Gaps: only `ops/shelter/citizen`; required role matrix is broader.

## Dead Ends / Orphans
- Adoption, foster, donation, NGO, medical escalation do not have dedicated tables.
- Report `photoUri` exists in mobile store but is not captured/synced.
- Mission proof verification can be local-only and disconnected from hub proof review.

## Operational Event Ledger
- Source: automatic database triggers after migration 004.
- Tables covered: `cases`, `case_reviews`, `tasks`, `proofs`.
- Payload: actor user, actor role, action, entity IDs, linked case/task/proof IDs, before/after state, reason, status metadata.
- Hub display: not implemented yet.
- Security: readable by ops only through RLS; no citizen read policy.

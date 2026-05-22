# 02 Action Loop Map

Legend: Current = implemented today. Gap = incomplete or prototype-only. Fix = recommended or implemented in this audit.

## 1. Report Stray Animal
- Action: report stray animal.
- User role: public user / volunteer.
- Screen: mobile `report/new.tsx` -> `report/submitted.tsx`.
- Trigger: `Send for help`.
- Frontend component: report category/severity form.
- API/function: `syncReportToSpine(report)`.
- Database: `citizens`, `cases`.
- Fields: `cases.external_id`, `citizen_id`, `block_id`, `category`, `severity`, `description`, `location_text`, `status=submitted`.
- Status change: local `submitted`; hub `submitted`.
- Map impact: no lat/lng pin today, only text location and block mapping.
- Notification impact: no push notification today.
- Hub location: Action Queue, Reports, Command, Map, Impact.
- Admin action: accept/create task or reject.
- User feedback: submitted screen + realtime timeline updates.
- Analytics: total cases, backlog, accept/reject rates.
- Audit log: migration 004 adds automatic `operational_events` for report creation/updates and admin decisions once applied.
- Failure cases: Supabase unavailable, block name not matched, duplicate external ID, anonymous auth disabled.
- Missing gaps: report photo capture, UI-captured lat/lng, notification, duplicate detection.
- Fix required: wire report media/location capture into the new metadata fields and add duplicate detection.

## 2. Report Injured Animal
- Same as report stray animal with `category=injured`, `severity=urgent/today`.
- Hub recommendation: medical check/high priority.
- Gap: no automatic medical escalation beyond template mapping.
- Fix required: add severity/category recommendation metadata and medical partner assignment path.

## 3. Start Feeding Mission
- Screen: mobile home -> `mission/detail.tsx`.
- Trigger: `Accept Mission`.
- Function: `useMissions.acceptMission()` -> `upsertMissionTask()`.
- Database: `tasks` with `external_ref=mission:<deviceId>:<missionId>`.
- Fields: `template_id`, `status=assigned`, `priority`, `assigned_to_type=citizen`, `assigned_to_id=deviceId`.
- Hub location: Action Queue, Field Work.
- User feedback: accept confirmation.
- Gap: concurrent acceptance is local-only for seeded missions; no server reservation lock for shared missions.
- Fix required: use DB-side task claiming for real public missions.

## 4. Complete Feeding Mission
- Screen: `mission/proof.tsx` -> `mission/verify.tsx` -> `mission/success.tsx`.
- Function: `insertMissionProof()`, `submitProof()`, `verifyMission()`.
- Database: `tasks`, `proofs`.
- Status: assigned -> in_progress -> proof_pending -> completed/blocked.
- Hub location: Action Queue, Evidence, Field Work, Impact.
- User feedback: points/badges/success.
- Gap: verification is simulated locally after proof submission; actual ops proof decision does not yet push back to mobile verification state.
- Fix required: subscribe mobile mission state to proof/task changes by `external_ref`.

## 5. Upload Proof
- Screen: `mission/proof.tsx`.
- Trigger: `Upload Photo`, `Submit Proof`.
- API/function: image picker, `insertMissionProof()`.
- Database: `proofs.photo_uri`, `note`, `captured_at`, `verification_status=pending`.
- Map impact: migration 004 adds proof geo metadata fields, but mobile does not capture them yet.
- Hub: Evidence, Action Queue.
- Failure: local URI may not be accessible to hub when not uploaded to storage.
- Gap: no Supabase Storage upload, no image validation, note input currently minimal.
- Fix required: upload proof media to storage and store public/signed path.

## 6. Accept Mission
- Covered by start feeding mission.
- Gap: no cancel or no-show backend state today.

## 7. Cancel Mission
- Current: no explicit cancel flow in mobile store.
- Required DB: `tasks.status=cancelled` or `blocked` with reason.
- Hub: Field Work and Action Queue.
- Fix required: add `cancelMission(id, reason)` and task update.

## 8. Emergency Rescue Request
- Current: mobile report category `rescue`/mission type `urgent`.
- DB: case severity urgent, template rescue assessment/emergency escalation.
- Hub: Action Queue sorts urgency high; Reports detail.
- Gaps: no emergency responder role, no SLA notification, no dispatch route.
- Fix required: add emergency escalation state and notification channel.

## 9. Adoption Interest
- Current: report category `adoption`; no dedicated adoption request table/flow.
- Hub: appears as report, mapped to follow-up task.
- Gap: no adopter/foster lifecycle.
- Fix required: add adoption/foster request entity and hub pipeline when product scope starts.

## 10. Foster Interest
- Current: not implemented.
- Fix required: add foster form, verification, capacity, approval, task linkage.

## 11. Donation Action
- Current: not implemented.
- Fix required: add donation provider, payment status, receipt, donor privacy, impact attribution.

## 12. Volunteer Signup
- Current: registration/profile/leaderboard only; no operational volunteer role verification.
- Gap: citizen can do missions but lacks capability/verification model.
- Fix required: add volunteer profile capabilities and approval state.

## 13. NGO Onboarding
- Current: not implemented.
- Fix required: `ngos`, `ngo_members`, verification documents, admin approval.

## 14. Shelter Capacity Update
- Current: shelters table has `status` only; no capacity fields.
- Hub: Partners list.
- Gap: no intake capacity, medical capacity, foster slots.
- Fix required: add capacity object and manager role.

## 15. Location Update
- Current: user neighborhood only; report/mission locations text only.
- Gap: schema metadata exists after migration 004, but capture, privacy display, and validation UI are not wired.
- Fix required: wire location capture to cases/tasks/proofs and expose confidence in hub.

## 16. Map Pin Creation
- Current: not real map-backed.
- Gap: no `map_points` or geospatial indexing.
- Fix required: create map layer model derived from cases/tasks/shelters.

## 17. Notification Click
- Current: no push notification implementation.
- Fix required: notification table + push token + deep link routing.

## 18. Profile Update
- Current: local Zustand only.
- Gap: no profile sync to Supabase except citizen identity.
- Fix required: sync non-sensitive public profile fields and privacy mode.

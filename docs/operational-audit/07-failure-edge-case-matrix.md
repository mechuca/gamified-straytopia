# 07 Failure And Edge Case Matrix

| Case | Expected Behavior | Current Behavior | Gap | Severity | Fix Required | Test Case |
|---|---|---|---|---|---|---|
| Weak internet | Local action queues and retries | Local mobile continues, Supabase errors swallowed | No retry queue | P1 | Add sync queue/outbox | Disable network during report submit |
| Offline mode | Save locally and sync later | Local state saved, backend skipped | No later replay | P1 | Outbox with retry | Submit report offline, reconnect |
| GPS denied | Manual area fallback | Implemented | No exact location | P2 | Keep manual fallback | Deny permission |
| GPS inaccurate | Show accuracy warning | Schema fields added in migration 004 | Capture/UI not wired | P1 | Store accuracy from device and show confidence | Simulate low accuracy |
| Image upload failure | Retry and keep proof draft | Local image only | No storage upload | P1 | Storage upload + retry | Fail upload |
| API timeout | Recoverable non-blocking UI | Errors swallowed | User unaware | P2 | Sync status indicator | Timeout Supabase |
| Duplicate rescue report | Detect nearby duplicate | Manual/reject only | No duplicate detection | P1 | Similar cases query | Submit same location/category |
| Duplicate feeding mission | Prevent double claim | Local only | No atomic claim | P1 | Server claim function | Two devices accept same mission |
| Volunteer no-show | Reassign/escalate | Not implemented | No no-show state | P1 | Add no-show/cancel reasons | Accepted task stale |
| Rescuer cancels | Return task to queue | Not implemented | No cancel flow | P1 | Add cancelMission | Cancel active mission |
| Shelter full | Route elsewhere | Schema fields added in migration 004 | Capacity UI/logic not wired | P1 | Capacity admin flow and assignment logic | Mark shelter full |
| Animal not found | Close with reason/proof | Not modeled | No outcome reason | P2 | Task outcome reasons | Complete with not_found |
| Wrong location | Request correction | Not modeled | No correction workflow | P2 | Location correction state | Dispatcher flags location |
| Fake proof upload | Needs review/reject | Proof statuses exist | No media checks | P1 | Review queue + storage metadata | Upload irrelevant image |
| Spam reports | Rate limit and moderation | RLS only | No rate limit | P0/P1 | Rate limiting/moderation | Rapid reports |
| Admin deletes active case | Block or archive safely | No delete UI; DB may allow ops; migration 004 logs core deletes | No archive model | P1 | Soft delete/archive | Delete active case |
| Two volunteers accept same task | One succeeds | Not enforced for seeded missions | Race risk | P1 | Atomic claim | Parallel accept |
| Push delay | Realtime fallback | Realtime only | No push | P2 | Notification table/push | Delay notification |
| Map fails | List fallback | Lists exist | No map yet | P2 | Preserve queue fallback | Disable map API |
| App closes mid-flow | Draft saved | Reports draft persisted | Proof draft not persisted | P2 | Proof draft persistence | Close during proof |
| Donation fails | Retry/payment status | Not implemented | Missing flow | P2 | Payment state machine | Payment failure |
| Role mismatch | Access denied | Ops role required | Fine roles missing | P1 | Role matrix policies | Login shelter user |
| Unauthorized admin access | Denied | AuthGate + RLS for ops | Needs route claims by role | P1 | fine-grained RBAC | Non-ops hub login |
| Stale dashboard data | Realtime refresh | Subscriptions exist | No stale indicator | P2 | Last updated/staleness | Stop realtime |

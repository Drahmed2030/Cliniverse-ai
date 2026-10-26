# Build 69 — Remediation R4: auth queue safety (Issue #36) — for Work 1 re-review

**Baseline (exact source SHA):** `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` (off-main; nothing merged).
**Patch:** `docs/patches/build69-r4-auth-queue-safety.patch` — one commit, **complete replacement** (R4 includes everything in R3; do not stack on R1–R3). `git am` verified on a clean detached checkout of the baseline.
**SHA-256:** `80d3fdac33011265720e1963c704721070fc6eeb256f97e3fb5d45d5eaff93f9`
**Scope:** 23 files = 7 source + 16 tests, +930 / −100 (same file set as R3; the R3→R4 delta is `authMutationCoordinator.ts`, `identity.ts` and the coordinator/identity tests).
No iOS build, deployment, production/Supabase change, secret, paid resource or App Store action. **BUILD / APP REVIEW / RELEASE = HOLD.**

## The defect (Work 1 observation) — confirmed
R3's queue released serialization after 20 s even if the earlier mutation was still unresolved. Reproduced with a behavioral test against the R3 code (it failed there): signOut(A) pending past the timeout → sign-in(B) was allowed to start → A's late completion removed B's session.

## The fix (smallest safe correction)
`createAuthMutationQueue` no longer *releases* on timeout; it *refuses*:
- The timeout applies only to a mutation that is **still waiting**. When it elapses that waiter is rejected with `AuthMutationBusyError` and **never runs**.
- A mutation that has **started** is never abandoned: the queue stays closed until it truly settles (a started Supabase request cannot be cancelled).
- A refused waiter keeps its place in line (its slot is released only after everything ahead has settled), so later waiters can neither jump ahead nor overlap.
- `identity.ts` converts a refusal into the ordinary result callers already handle: `{ data: { user: null, session: null }, error }` for sign-in/up/OTP, `{ data:{provider,url:null}, error }` for OAuth, `{ error }` for sign-out, `{ skipped: true, error }` for the session-scoped sign-out. Nothing throws into the UI and **no Supabase request is started**. (Callers: AuthScreen shows the error, Me shows "Unable to sign out. Please try again.", the controller already swallows sign-out errors.)
- The session-scoped sign-out queues itself exactly once (a source test pins this; double-queuing would deadlock).

**Trade-off, stated plainly:** if a Supabase auth request hangs forever, later sign-in/sign-out attempts are refused with a "try again" error until the app restarts, instead of risking an overlap. Availability is traded for the no-overlap guarantee; the user is not silently signed into or out of the wrong account.

## Evidence (behavioral, real source transpiled and run against fakes)
- Regression: signOut(A) hung beyond the wait limit → B refused, `signIn:b:start` never logged, A completes → stored session `null` (B never signed in) → retry after A really finished works and B keeps its session.
- Three waiters behind a hung task are all refused; a *new* waiter still queues behind the unresolved task (does not run) and runs only after real settlement; order preserved.
- Scoped sign-out refused while busy → `skipped`, not thrown, no request.
- Real `identity.ts` (with the real coordinator and a fake Supabase): sign-in refused as an auth error (`session`/`user` null), `signOutSession` returns `skipped`, no Supabase call made.
- Mutation checks (each makes tests fail): R3 behaviour restored (waiter runs after timeout) → 7 failures; refused slot released immediately → 2 failures; identity not mapping refusals → failure; previous controller/coordinator mutations still caught.
| Check | Result |
|---|---|
| Coordinator suite | 12/12 PASS (controller suite 16/16) |
| `npm test` | **917/917 PASS** — 3 runs in the working tree + 1 in a clean checkout after `git am` (no `account-codelab` flake occurred in these runs; it remains unresolved, see below) |
| `npx tsc --noEmit` | PASS |
| `next build` (dummy public Supabase env, local) | PASS |

## Unchanged from R3 (carried forward, not re-argued)
Stale-task guards and session-scoped sign-out; email verification as defense in depth only (Confirm email must be verified ON server-side); Paywall aligned to real gates (EN/AR). **Open business finding:** ECG, Echo, Resuscitation, Pathway Replay and Clinical Reference have no access gate. MASTER recommends keeping current behavior for this security fix and deciding the subscription model separately; making them PRO needs designed and tested entitlement, not a hidden page.
**`account-codelab` intermittent failure:** root cause identified (fixed 10 ms `tick()` waits; 0/25 idle, 6/20 under CPU load); test-only, not fixed in this patch; keep the note open.

## Remaining blockers / not proven
1. Supabase Confirm email ON, providers, reviewer account pre-confirmed (Work 1).
2. Server-side enforcement beyond RLS for unconfirmed accounts (Work 1 advice).
3. Guarantee boundary: covers mutations issued by this app instance; not a session changed by an external context or by supabase-js internals (token refresh). The supabase-js behaviour is modelled from the installed auth-js 2.109 source, not run against a live project.
4. No simulator/TestFlight/device evidence; the 20 s wait limit and refusal UX were not observed on a device.
5. Password recovery; account-deletion retention/CASCADE; subscription-model decision; Codemagic Build 69 identity — separately gated.

**Recommendation:** READY FOR WORK 1 RE-REVIEW (patch only). Build/App Review/Release remain HOLD.

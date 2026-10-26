# Build 69 — Remediation R3 (Issue #36) — for Work 1 re-review

**Baseline (exact source SHA):** `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` (off-main; nothing merged).
**Patch:** `docs/patches/build69-r3-auth-coordination-and-paywall.patch` — ONE commit, a **complete replacement** (not applied over R1/R2); `git am` verified on a clean detached checkout of the baseline.
**SHA-256:** `3916e76c9c5aa9f1b7119e7d478633dcdae3a88bf0ff07acdcd9edd29cfc82c4`
**Scope:** 23 files = **7 source + 16 tests**, +803 / −100. (Correction recorded: R2 was 21 files = 6 source + 15 tests, as Work 1 found.)
No iOS build, deployment, production/Supabase change, secret, paid resource or App Store action. Password recovery and account deletion untouched. **BUILD / APP REVIEW / RELEASE = HOLD.**

## Changed files
Source: `app/components/AuthScreen.tsx`, `app/components/PaywallSheet.tsx`, `app/components/auth/AuthGate.tsx`, `app/lib/identity.ts`, **new** `app/lib/authSessionController.ts`, `app/lib/authMutationCoordinator.ts`, `app/lib/emailVerification.ts`.
Tests (new): `tests/auth-session-controller.test.mjs`, `tests/auth-mutation-coordinator.test.mjs`. Tests (updated): auth-identity-session-contract, ecg-learner-workspace, echo-intelligence-atlas-live-route, echo-learner-workspace, explore-curated-discovery, learn-practice-tracks, me-account-v2, me-hub-actions, paywall-release-contracts, progress-trajectory, release-interactions-contract, release-security-contracts, release-unified-product-ux, today-golden-surface.

## Finding 1 — stale scheduled task starting `ensureProfile` — FIXED
`resolve()` now returns at entry unless its generation is still current, and re-checks before every side effect (`ensureProfile`, `signOut`, state transitions). An invalidated task performs **no** call and no state change. Behavioral tests (real controller source, fakes): zero `ensureProfile` / `signOut` calls when invalidated by logout, account switch, dispose, a newer event, or a restore result arriving after a newer event; a stale task does not even evaluate the verification rule; only the newest task acts; positive path unchanged.
Limit (stated plainly): once `ensureProfile` HAS started it cannot be cancelled; its result is only prevented from granting access. Its effect is limited to reading/creating the profile row of the user it started for (RLS blocks writing another user's row).

## Finding 2 — in-flight `signOut` vs newer sign-in — RESOLVED within the bounded scope
**Race is real (reproduced in a model of supabase-js behaviour, test 1):** `signOut()` removes whatever session is stored when it finishes (auth-js 2.109 `_signOut` → `_removeSession`), and `signInWithPassword()` does its token request outside the lock then saves the session. A signOut started for A can therefore delete B's just-saved session. A generation counter cannot cancel it.
**Fix = central coordination (`authMutationCoordinator.ts`, used only through `identity.ts`):**
1. All app auth mutations (`signInWithPassword`, `signUp`, `signInWithOtp`, `signInWithOAuth`, `signOut`) run through one serial queue — a sign-out and a sign-in can never be in flight together. A source-guard test fails if any `supabase.auth.signIn*/signUp/signOut/…` call exists outside `identity.ts` or outside the queue.
2. Automated clean-ups (controller for an unverified/stale session, AuthScreen after sign-up/sign-in) use `signOutSession(expectedUserId)`: inside the queue it re-reads the stored session and **does nothing unless it is still that user's** (and does nothing if the session cannot be read). Explicit user sign-out (`signOut()`) stays unconditional by design.
3. A hung task releases the queue after 20 s so sign-out cannot be blocked forever; a failing task does not wedge it.
Evidence (behavioral): pending A signOut → B sign-in is serialized and B keeps its session; B sign-in in flight → queued scoped signOut(A) is skipped and **no signOut request is ever started**; integration with the real controller: unverified A cleanup while B signs in ⇒ final state `signed_in` B, stored session B, no signOut; user signOut(A) then B signs in before it finishes ⇒ B final. Mutation checks: removing serialization, the scope check, the queue wrapper, or the controller guards each makes tests fail.
**Guarantee boundary:** covers every auth mutation issued by this app instance (the native iOS app is one web view). It does not cover a session changed by an external context (another browser tab on web) or by supabase-js internals such as token refresh; a getSession→signOut gap inside the queue is only exposed to such external changes. The supabase-js behaviour is modelled from reading the installed source, not exercised against a live project.

## Finding 3 — Paywall audit — corrected (copy only; no entitlement/StoreKit/gate change)
Source-level evidence of actual gates:
| Feature | Gate found | Paywall now |
|---|---|---|
| Ward cases | `WardHome`: `caseUnlocked = isPro \|\| patient.id === 'w1'` | PRO: every case (first free) |
| Ward evidence (PubMed/Guidelines) | `RelatedEvidencePanel`: `if (isPro)` else upgrade | PRO |
| Code Lab | `CodeLabHub`: `isPro ? all : lessonOrder <= 2` | PRO: all lessons (1–2 free). **R2's "Code Lab is free" was incomplete — corrected** |
| Cardiology Operations, Nexus Learning | `premium: true` + paywall in workspace switcher | PRO |
| ECG, Echo, Resuscitation, Pathway Replay, Clinical Reference, Handover Practice | **no entitlement reference anywhere** in their routes/components (tested) | declared "Included free" (EN+AR) |
| "Progress and review" | saved progress is not gated | removed from PRO list |
A test now ties every advertised PRO benefit to its gate and fails if a gate-less feature is listed as PRO.
**⚠ Business finding for MASTER:** the paywall previously marketed ECG, Echo, Resuscitation, Pathway Replay and Clinical Reference as PRO, but nothing in the code restricts them. If they are *intended* to be PRO, gating is missing (a product/entitlement change, not made here). Also, all PRO gates are client-side (the only server entitlement route is Apple verification); a modified client could bypass them.

## Test reliability — `account-codelab` intermittent failure: ROOT-CAUSED, not fixed
`tests/account-codelab.test.mjs` "account UI saves only after acknowledgement…" waits for async mocks with a fixed `setTimeout(10 ms)` (`tick()`). Evidence: 0/25 failures idle, **6/20 failures under CPU load**, ~1 in 3 full-suite runs here. Test-timing issue; app code in that path is untouched by this patch. Suggested separate fix: wait on a condition instead of a fixed delay. Left as is to keep this patch bounded; keep the note open until fixed.

## Results (local Linux/Node; also re-run in a clean checkout after `git am`)
| Check | Result |
|---|---|
| New behavioral suites (controller 16 + coordinator 8) | 24/24 PASS |
| `npm test` full | **913/913 PASS** (clean checkout, and 4 further runs; one earlier run had the `account-codelab` flake above) |
| `npx tsc --noEmit` | PASS (clean checkout too) |
| `next build` (dummy public Supabase env, local) | PASS |
| Previous security coverage | retained (login, reviewer route, StoreKit/Apple verification, account deletion, magic-link-off, entitlement-authority tests all pass) |

## Remaining blockers / not proven
1. Supabase **Confirm email = ON**, auth providers, reviewer account pre-confirmed — UNVERIFIED (Work 1). Client `email_confirmed_at` is defense in depth, not proof of inbox ownership.
2. Server-side enforcement beyond RLS `auth.uid()` for unconfirmed accounts — Work 1 advice.
3. No simulator/TestFlight/device evidence; real Supabase event ordering untested on a live project.
4. Paywall: decide whether ECG/Echo/Resuscitation/Pathway Replay/Clinical Reference should be PRO (then gating is a separate change); confirm screenshots/review notes match the final copy.
5. Password recovery; account-deletion retention/CASCADE — separately gated.
6. Codemagic Build 69 identity; a new IPA is required for any of this to ship.

**Recommendation:** READY FOR WORK 1 RE-REVIEW (patch only). Build/App Review/Release remain HOLD.

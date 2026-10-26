# Build 69 — Self-Service Sign-Up Verification & Test Reconciliation (for Work 1)

MASTER decision: self-service sign-up is APPROVED 1.1 behaviour. No iOS rebuild, no submission, no deployment, no secrets, no entitlement change was performed. Build 69 as uploaded to Apple is **unchanged**.

Base: `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` (not on `main`; see RELEASE_READINESS_PACKET). The delta is delivered as a patch, because the session branch does not contain that SHA:

- `docs/patches/build69-signup-email-verification.patch` — `git am`-able on top of the Build 69 SHA (17 files, +134/−52; 4 source files, 13 test files).
- Any of it only reaches users in a **new build**.

## Result on the patched SHA (local, Linux, Node)
| Check | Result |
|---|---|
| `npm test` | **888 / 888 PASS** (was 864/886) |
| `npx tsc --noEmit` | PASS |
| `next build` (dummy public Supabase env, local only) | PASS |
| Mutation check: remove verified-email guard in sign-up / in AuthGate | new tests FAIL as intended |

## Requested proofs
| Function | Finding | Evidence class |
|---|---|---|
| Sign Up | `signUpWithPassword` → `supabase.auth.signUp`, min 8-char password, errors surfaced, no auto-login without a verified user | source + tests |
| Email verification | **Patched.** Build 69 relied only on the Supabase "Confirm email" setting (if off, signUp returns a session and the user is in). Patch adds `isVerifiedUser()` (email provider requires `email_confirmed_at`), enforced in sign-up, password sign-in and `AuthGate` (restore + auth listener; profile is created only after the check). | source + tests. **Supabase project "Confirm email" setting: UNVERIFIED** — Work 1/MASTER must confirm it is ON in the dashboard. |
| Login / sessions | Fails closed on error, missing session or user; generic error on exception. Existing tests kept and strengthened. | source + tests; no device run |
| Password recovery | **None exists in Build 69** (no `resetPasswordForEmail` / recovery UI anywhere in `app/`). Nothing changed, as instructed. Email/password users have no self-service reset. | **GAP — MASTER decision** (adding it is a feature) |
| Account deletion | In-app flow (type DELETE) → Edge Function `delete-account`: verifies bearer token, cleans 10 user tables, then deletes the Auth user. UI states deletion does not cancel the App Store subscription and links to Apple's page. `subscriptions` / `apple_subscription_events` rows are **not** deleted by the function (no FK to auth.users visible in repo migrations) → possible orphan rows. Function deployment in production: UNVERIFIED. | source + tests; **Work 1/MASTER**: confirm function deployed, decide retention of subscription evidence |
| Reviewer access | Server-side: `/api/reviewer-feature-access` validates bearer token, only on Vercel preview/production, email `reviewer@cliniverseai.com` + confirmed; client denies by default on failure. Reviewer account must therefore be **pre-confirmed** (the new verification gate would lock out an unconfirmed reviewer). | source + tests; live reviewer login UNVERIFIED |

## Test reconciliation (22 → 0 failures), nothing weakened
- **Auth (4 tests):** rewritten to the real handler layout and *strengthened* (verification guard ordering, sign-up discards unconfirmed sessions, gate checks before profile creation, reviewer route checks). `release-security-contracts` no longer demands "Account creation is not enabled"; it now asserts sign-up goes through Supabase only, magic link still off and `shouldCreateUser:false`.
- **UI-structure contracts (18 tests):** stale against the post-RC1 "unified product experience" refactor (Learn expanded from 3 tracks to 10 in Core/Advanced/Systems groups; Today simplified; Explore no longer passed `caseLibraryPreview`; Me gained account deletion). Newer tests in the same SHA (`release-unified-product-ux`) already asserted the new shape. Expectations were updated to the current structure; premium gating (Cardiology Operations, Nexus → paywall) assertions retained.
- **One real defect found by the test, fixed:** the Paywall omitted *Handover Practice* (EN+AR) although Learn lists it. Copy added.

## Things Work 1 / MASTER should know
1. Paywall lists Code Lab and Handover Practice under PRO, but both workspaces are `premium: false` in code (pre-existing for Code Lab). Not a rejection risk by itself; review copy accuracy.
2. The shell no longer passes the reviewer `caseLibraryPreview` flag to Explore (more restrictive); confirm the reviewer does not need that surface.
3. Evidence classes unchanged: **no simulator, TestFlight or device evidence for Build 69** is available to me. Source/test success does not prove purchase/restore or sign-up/verification emails on device.

## Release state
| Item | State |
|---|---|
| Sign-up scope | APPROVED (MASTER) |
| Patch ready for review | YES (this file + patch), source-level only |
| iOS rebuild / Build 69 submission | HOLD (MASTER) |
| TestFlight device test | REQUIRED: sign-up → email link → login; reviewer login; purchase; restore; delete account |
| Open owner items | Confirm Supabase "Confirm email" ON (Work 1); password-recovery decision (MASTER); delete-account function deployed + subscription-row retention (Work 1/MASTER); confirm Codemagic Build 69 ↔ SHA (Work 1) |

Decision: **HOLD for build decision** — patch is READY FOR WORK 1 REVIEW; whether Build 69 ships as-is (relying on the Supabase setting) or a new build carries the patch is MASTER's call.

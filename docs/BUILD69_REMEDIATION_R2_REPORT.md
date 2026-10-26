# Build 69 — Targeted Security Remediation R2 (Issue #36) — for Work 1 re-review

**Baseline (exact source SHA):** `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` (off-main; no branch merged).
**Patch:** `docs/patches/build69-auth-race-and-paywall-r2.patch` — single commit, `git am` verified on a fresh detached checkout of the baseline.
**SHA-256:** `39171bdac8e6987a8a909a91c70530bcfc7aaafa0d3013b11be8c502ea2db078`
**Supersedes** `build69-signup-email-verification.patch` (r1); r2 is a full replacement against the baseline, not an increment on r1.
No iOS build, deployment, production/Supabase change, secret, paid resource or App Store action. Password recovery and account deletion are untouched. Release remains HOLD.

## Changes (21 files, +454 / −81; 7 source, 14 test)
| Area | Files | What |
|---|---|---|
| Auth race | `app/lib/authSessionController.ts` (new), `app/components/auth/AuthGate.tsx` | Session resolution moved into a framework-free controller: monotonic generation; every async result (restore, `ensureOwnProfile`, `signOut`) is applied only if still the newest; dispose bumps the generation. A different user passes through `loading` and is never shown as the previous one. Same-user token refreshes do not re-bootstrap the profile. |
| Auth callback | same | The `onAuthStateChange` callback is synchronous: it bumps the generation, applies sign-out/loading immediately and **schedules** (`setTimeout 0`) all Supabase work (`ensureProfile`, `signOut`) outside the callback. No `await` in it. |
| Email verification claim | `app/lib/emailVerification.ts` (new, re-exported by `identity.ts`), `AuthScreen.tsx` | Comment/test corrected: `email_confirmed_at` is **defense in depth only** and does NOT prove inbox ownership if Supabase Confirm email is OFF (Supabase confirms implicitly). OAuth identities (Apple/Google) are not held to the email check. Unverified email sessions are signed out in sign-up, sign-in and the gate. Reviewer preconfirmation requirement unchanged. |
| Paywall | `PaywallSheet.tsx` | Code Lab and Handover Practice removed from the PRO benefit groups (EN+AR); a separate line states they are included free. Uses the existing `cv-paywall-status` style, no entitlement/billing/gate change (`premium:false` asserted by test). |
| Tests | see below | 14 test files (13 from r1 reconciliation, strengthened; 1 new behavioral file). |

## Results (local, Linux, Node, on the patched baseline)
| Check | Result |
|---|---|
| New behavioral suite `tests/auth-session-controller.test.mjs` | 12/12 PASS |
| `npm test` (full) | **900 / 900 PASS** (3 consecutive runs). One earlier run showed 1 failure in `account-codelab` ("account UI saves only after acknowledgement…", file untouched by this patch); 0/25 failures in isolation, passed in all 3 later full runs → apparent timing flake under load, **not root-caused**. |
| `npx tsc --noEmit` | PASS |
| `next build` (dummy public Supabase env, local) | PASS (compiled) |
| Mutation checks on the controller | (a) generation check removed → 7 tests fail; (b) Supabase work run inside the callback → 2 fail; (c) no dispose guard → 1 fails |

## Behavioral coverage (real controller source transpiled and run against deferred fakes)
logout during profile load · A→B switch with A resolving last (A never signed in; gap shows `loading`) · delayed restore vs newer event (success and error) · unmount during restore/profile · unverified email (no profile call, one signOut, never `signed_in`) · stale unverified decision cannot sign out a newer login · callback is sync, returns nothing, calls no API before scheduling · event storm (50 refreshes → one bootstrap; last event wins incl. logout with pending profiles) · profile error and stale error after logout · `isVerifiedUser` table (email/OAuth).
Previous source-regex tests retained and updated (not removed); login, reviewer-route, StoreKit and account-deletion tests unchanged and passing.

## Not proven / remaining blockers
| # | Item | Owner |
|---|---|---|
| 1 | Supabase Auth **Confirm email = ON** in the real project — UNVERIFIED; the client check cannot substitute | Work 1 / authorized operator |
| 2 | Server-side authorization does not itself require confirmed email for ordinary data APIs (RLS is per-`auth.uid()`); Work 1 to advise whether enforcement is needed beyond Confirm email | Work 1 |
| 3 | No simulator/TestFlight/device evidence; tests are source + mocked-controller only. Real Supabase event ordering (e.g. `INITIAL_SESSION`) is not exercised | MASTER device QA on new build |
| 4 | Codemagic actual source commit/IPA for 1.1 (69) | Work 1 |
| 5 | Resuscitation / Pathway Replay / Clinical Reference are still listed as PRO; their actual gating was not audited in this patch | Work 1 (copy accuracy) |
| 6 | Password recovery; account-deletion retention and CASCADE on `subscriptions` / `apple_subscription_events` | separately gated, MASTER |

Recommendation: **READY FOR WORK 1 RE-REVIEW (patch only); BUILD / APP REVIEW / RELEASE = HOLD.**

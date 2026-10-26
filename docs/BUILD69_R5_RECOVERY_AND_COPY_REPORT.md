# Build 69 — R5: Password Recovery (Draft) and Honest Release Copy — for Work 1 review

**Lineage:** Build 69 baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` → **R4** (Work 1-approved, SHA-256 `80d3fdac…93f9`, unchanged and re-verified by digest) → **R5**.
**Patch (incremental, applies AFTER R4):** `docs/patches/build69-r5-password-recovery-and-copy.patch`
**SHA-256:** `020c09184a148f649537c4ce9910df63127d410e80620a5d5a46e62c239cd5fb`
**Apply order:** `git am build69-r4-auth-queue-safety.patch` then `git am build69-r5-password-recovery-and-copy.patch` on a clean checkout of the baseline. Verified exactly this way in a fresh detached checkout.
**Status:** DRAFT / portable patch. Not merged, not deployed (see `docs/VERCEL_PRODUCTION_RELEASE_CONTROL.md`: a deploy of this code is an app release event). No production Auth setting, subscription, entitlement, iOS build, App Review submission or paid resource was touched. **BUILD / APPLE / RELEASE = HOLD.**

## File scope — 17 files (11 source/script, 6 tests), +655 / −15
Source: `app/lib/passwordRecovery.ts` (new), `app/lib/supabaseConfig.ts` (new), `app/reset-password/page.tsx` (new), `app/reset-password/ResetPasswordClient.tsx` (new), `app/components/AuthScreen.tsx`, `app/lib/identity.ts`, `app/supabase.ts`, `app/components/PaywallSheet.tsx`, `app/components/release/LearnTracks.tsx`, `next.config.js`, `scripts/verify-password-recovery-browser.cjs` (new, evidence script, not part of `npm test`).
Tests: new `tests/password-recovery.test.mjs`, `tests/release-copy-honesty.test.mjs`; updated `tests/auth-mutation-coordinator.test.mjs`, `tests/learn-practice-tracks.test.mjs`, `tests/release-security-contracts.test.mjs`, `tests/release-unified-product-ux.test.mjs`.
Unchanged: R4's controller, queue, entitlements, StoreKit, subscriptions, `delete-account`, every gate.

## Track A — Password recovery
**Guidance used.** supabase.com is not reachable from this environment (network policy), so the official guidance was taken from the documentation shipped inside the installed `@supabase/auth-js` 2.109.0 (`resetPasswordForEmail`, `updateUser`, `_getSessionFromURL`): a two-step flow (the link signs the user in, then `updateUser({password})`); `PASSWORD_RECOVERY` event; `redirectTo` must be in the project's redirect-URL allow-list; with "Secure password change" a nonce is needed only if the session is older than 24 h (a recovery session is fresh). Re-check against the live docs when network is available.

**Design.**
1. **Request.** `AuthScreen`: "Forgot password?" appears only in password sign-in (not sign-up, not magic-link). `requestPasswordReset()` calls `resetPasswordForEmail(email, { redirectTo: RESET_REDIRECT_URL })`, a **constant** `https://www.cliniverseai.com/reset-password` (never `window.location.origin`). One neutral message for every address (Supabase also answers success for unknown emails, so no enumeration); 429 → "wait a minute"; other errors → "could not send"; a 60 s client cooldown.
2. **Landing page** `/reset-password`, outside `ReleaseApp`/`AuthGate`. It reads the URL hash once, **removes it from the address bar before any network call**, accepts only `type=recovery` with both tokens, and handles `error_code=otp_expired` and other error hashes.
3. **Isolation / account switching.** The page never imports the shared client (it would auto-consume the hash and replace a stored session). It uses `createRecoveryClient()`: in-memory, `detectSessionInUrl:false`, `autoRefreshToken:false`, own storage key. `app/supabase.ts` now re-exports its coordinates from a client-free `supabaseConfig.ts` so this is possible. The form shows the **masked account email** and "if this is not your account, close this page" (guards against a crafted link that would make the user set a password on someone else's account).
4. **Completion.** Client-side 8-character + confirmation rule, then `updateUser({password})`, then `signOut({scope:'global'})`. Success is never shown if the update failed; if only the global sign-out fails the page says so honestly.
5. **Headers.** `/reset-password`: `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, `X-Robots-Tag: noindex`; page metadata `robots noindex`.

**Evidence.**
| Check | Result |
|---|---|
| `tests/password-recovery.test.mjs` (real source + fakes): hash shapes, password rules, call order, failure paths, honest sign-out reporting, isolation options, neutral request outcomes, fixed redirect, import-graph guard (page and layout never reach `app/supabase.ts`, `identity.ts`, `AuthGate`, `profile.ts`), hash stripped before client creation, headers | 12/12 PASS; 5 deliberate mutations each fail a test (no global scope, accept any link type, URL detection on, shared-client import, success on failed update) |
| Real browser (Chromium via Playwright, **production build** served locally, Supabase traffic intercepted, real auth-js in the page): masked email; tokens removed from URL; only the validation GET before submit; short/mismatch rejected locally with no request; PUT carries only the password; global logout after the update; done message; **another signed-in account in storage byte-for-byte unchanged and nothing written to storage**; expired / no-hash / wrong-type / server-rejected-session links; server-rejected weak password never shown as success | 15/15, repeated 4× |
| Response headers on the built page | verified with `curl -I` |

**Not proven / limits.**
- **No live Supabase round-trip.** Server responses were simulated; the real library and browser were used. A real test (see operator list) is required.
- **If the redirect URL is not in the allow-list, Supabase sends the link to the Site URL instead** (the app root). The app's shared client would then consume the recovery tokens and sign the user in without a password prompt. So the allow-list entry is a hard precondition and must be tested with a real email before release.
- **Email link scanners** that open the link can consume the one-time token (user sees "expired"); the page says so. The robust fix (custom email template with `token_hash` + `verifyOtp` on the page) needs a production template change and is not part of this patch.
- **Revocation limit:** global sign-out revokes refresh tokens; an already-issued access token stays valid until it expires (default ~1 h). Whether our server routes reject a revoked session before expiry (they call `getUser(token)`) was not verified `[INFER]`.
- Server-side password minimum (Supabase default is 6) must be raised to 8 by an operator; the 8-character rule here is client-side.
- Arabic strings were added to `AuthScreen` for parity but the release displays English only.

**Operator-only steps (Work 1 / authorised operator; nothing was changed by Claude):** add `https://www.cliniverseai.com/reset-password` to Auth → URL Configuration → Redirect URLs (Site URL unchanged); confirm the "Reset password" email template uses `{{ .ConfirmationURL }}`; set minimum password length 8; confirm custom SMTP and rate limits; then run one real reset with a test account on a preview deployment, check the link lands on `/reset-password`, the password changes, other sessions end, and an old session no longer works.

## Track B — Honest release copy (copy only; no gate, entitlement or route change)
| Where | New English text |
|---|---|
| Paywall free note | "Included free: Echo (one introductory study), Resuscitation, Pathway Replay, Clinical Reference and Handover Practice, plus the first Ward case and the first two lessons of each Code Lab track. **ECG practice is being prepared.**" |
| Paywall PRO line | "Code Lab — all BLS and ACLS lessons (the first two lessons of each track are free)" |
| Learn → ECG | "ECG practice is being prepared." |
| Learn → Echo | "One introductory study: start with the cine, organize findings, then assign meaning." |
Arabic strings updated for parity (not displayed by the release). `tests/release-copy-honesty.test.mjs` ties the copy to reality: it **fails if `evaluateEcgLearnerAvailability()` stops returning `held`** (forcing a copy review), requires exactly one Echo clip, derives the Code Lab free allowance (2) from the real gate and lesson counts (6 + 6), and asserts Resuscitation / Pathway Replay / Clinical Reference / Handover remain without any entitlement reference and Ward case 1 / Cardiology Ops / Nexus gates are unchanged (D2: nothing new gated, nothing newly opened).
**Still contains ECG wording not changed here (outside the requested minimum):** `OnboardingScreens.tsx` ("ECG, Echo and clinical reasoning — brought into one focused workflow…", "Learn holds your ECG, Echo and Ward practice"), Learn track verb `INTERPRET`, App Store metadata/screenshots (Work 1). Recommend a follow-up copy pass.

## Results
| Check | Result |
|---|---|
| Full suite, clean checkout after baseline + R4 + R5 | **933 / 933 PASS** (3 further runs in the working tree also 933/933) |
| Focused: password-recovery 12, copy-honesty 4, coordinator 12, controller 16 | 44 / 44 PASS |
| `npx tsc --noEmit` | PASS (clean checkout too) |
| `next build` (dummy public Supabase env) | PASS; `/reset-password` listed as a static route |
| Real-browser recovery script | 15 / 15 PASS (4 runs) |
| `account-codelab` fixed-delay flake | OPEN, did not occur in these runs |

## Remaining blockers for Work 1 (unchanged unless noted)
1. Supabase **Confirm email** (still unverified), providers, reviewer account, SMTP, redirect allow-list, password minimum — operator evidence.
2. Real end-to-end recovery test on a preview deployment (above).
3. Account deletion: facts now verified by MASTER (FKs cascade; function ACTIVE v1) but **HOLD** until a privacy/legal retention decision; no deletion code touched.
4. Release identity: production currently serves the baseline SHA (see the Vercel control document); any deploy of R4/R5 is a release event.
5. Device/TestFlight QA, StoreKit purchase/restore, Codemagic provenance.
6. Onboarding/App Store ECG wording (above).

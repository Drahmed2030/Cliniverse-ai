# Release-Readiness Packet — Cliniverse 1.1 / Build 69 (current as of 2026-10-26, after R6.3 approval)

Prepared by Claude Code (engineering & QA). Earlier versions of this packet are in git history. **Decision: HOLD — BUILD / APPLE SUBMISSION / RELEASE.** Nothing here authorises a build, deployment or submission.

## 1. Identity
| Item | Value | Evidence |
|---|---|---|
| Build 69 baseline source | `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` (branch `qa/case-batch20-cloud`; not on `main`) | repo; Vercel production metadata |
| **Production web app today** | Vercel project `cliniverse-ai-u7gi`, deployment `dpl_CJC9unCgx4Xd7FeHNZkU8wER14Ya` = the baseline SHA, created 2026-09-22 | VERIFIED read-only (Vercel) |
| Native shell | loads `https://www.cliniverseai.com` live; production deploys are app releases | `capacitor.config.json`; `docs/VERCEL_PRODUCTION_RELEASE_CONTROL.md` |
| **Security baseline (patch level)** | **R6.3**, SHA-256 `6aa429dc0483da030ab3979df65a137d7549e8d640cfbcdeb8114399937ec5d6` — **Work 1 APPROVED** (Issue #36 comment 6419612362); MASTER: accept R6.3 as patch-level security baseline, **no further security patch work without new reproducible evidence**. **Not deployed.** Apply on the clean baseline with `git am`, order R4 → R5 → R6 → R6.1 → R6.2 → R6.3 | Issue #36 |
| R4 (first approved link) | SHA-256 `80d3fdac33011265720e1963c704721070fc6eeb256f97e3fb5d45d5eaff93f9`, Work 1 APPROVED | Issue #36 |
| Draft on top of R4 | **R5** patch (password recovery + honest copy), SHA-256 `020c09184a148f649537c4ce9910df63127d410e80620a5d5a46e62c239cd5fb` — superseded by later links (R6.3 approved) | `docs/BUILD69_R5_RECOVERY_AND_COPY_REPORT.md` |
| Draft on top of R4 … R6.2 | **R6.3** (worker identities captured; re-enumeration before use; unverifiable enumeration blocks), SHA-256 `6aa429dc0483da030ab3979df65a137d7549e8d640cfbcdeb8114399937ec5d6` — approved as the final link | `docs/BUILD69_R6_3_WORKER_IDENTITY_REPORT.md` |
| Draft on top of R4 + R5 + R6 + R6.1 | **R6.2** (worker-check stability, recovery-page cancellation, verified cache cleanup, copy), SHA-256 `c83c3a7e8f73d124c0f67d49ecea50570bb7b6325e670b5edf666a568b4278f2` — superseded by R6.3 | `docs/BUILD69_R6_2_GUARD_LIFECYCLE_REPORT.md` |
| Draft on top of R4 + R5 + R6 | **R6.1** small fix (Cache-Control precedence, case-insensitive query names, first direct visit under an old controlling worker, account-isolation evidence), SHA-256 `00a37464a802642ccbd6710ff250ac9418ce70bd97a0b1018a3b258d2f4ce11d` — superseded by R6.2/R6.3 | `docs/BUILD69_R6_1_SMALL_FIX_REPORT.md` |
| Draft on top of R4 + R5 | **R6** patch (fail-closed service worker, legacy-cache cleanup, session-wording and evidence corrections), SHA-256 `4f7dba1d16eff6f5441cbb70bb80eb8d30eebe90aa7a6d48c1eab1f6b9d793ae`, superseded by R6.1–R6.3 | `docs/BUILD69_R6_SERVICE_WORKER_REPORT.md` |
| **Release candidate (source only)** | RC1 = baseline + R4…R6.3 + copy-only onboarding commit; local commit `9bf17282630cb525916cb412601478574aa5419c`, **tree `14888df202bb3bda6e2988452a52bd67cc1926d0`**; copy patch SHA-256 `723cc600b88d8bd01f8410e491af9e4aa97181e8ce7f31aa0d6aa1b3ebe99586`; 990/990 tests, `tsc`, build PASS; not published, not deployed | `docs/RC1_SOURCE_TO_BUILD_MANIFEST_1.1_BUILD_69.md` |
| Codemagic run → SHA → IPA → ASC "1.1 (69)" | UNVERIFIED | Work 1 |

## 2. Verified database / backend findings (read-only, MASTER, Issue #36; not re-run by Claude)
`subscriptions.user_id → auth.users` is **ON DELETE CASCADE**; `apple_subscription_events.subscription_id → subscriptions` is **ON DELETE CASCADE**; `persist_verified_apple_subscription` **exists** in production; Edge Function `delete-account` is **ACTIVE, version 1**. Consequence: deleting a user deletes their subscription and Apple event records. This closes the FK question but does **not** approve deletion or prove retention compliance → account-deletion changes and live deletion tests are **HOLD** pending a privacy/legal retention decision. The existence of the persistence function does not prove that every purchase/restore scenario works.

## 3. Source findings that shape the release (Claude, from source)
- Learner **ECG is HELD** (governed artifact missing; the page shows "This tracing isn't shown yet"). **Echo** is one introductory study. Ward: 1 free case + 6 client-gated; Code Lab: first two lessons of each BLS and ACLS track free (4 free / 8 gated). Resuscitation, Pathway Replay, Clinical Reference, Handover Practice are open and **stay free in 1.1** (MASTER D2). Cardiology Operations and Nexus are client-gated PRO. All PRO gates are client-side; most premium content is bundled in the client.
- Apple subscription authority is server-written (verified transactions, replay-safe RPC); no App Store Server Notifications endpoint yet; the verify route accepts a yearly product although only monthly is approved. These are future-monetization items (Issue #37), not 1.1 changes.

## 4. Tests (source level only — not iOS/device acceptance)
| Lineage | Result |
|---|---|
| baseline + R4 | 917/917 tests, `tsc`, local build — Work 1 independently checked digest and five source behaviours |
| baseline + R4 … R6.3 (clean checkout, `git am` in order) | **989/989** tests (2 runs; the open `account-codelab` flake appeared once in the working tree), `tsc` and `next build` PASS; Chromium controlling-worker script 41/41 incl. enumeration-unavailable blocked + previous-build control; recovery script 24/24. Previous (to R6.2): 979/979, `tsc` and `next build` PASS; Chromium controlling-worker script 38/38 (incl. failed cache deletion blocked, previous-build negative control); recovery script 24/24. Previous (to R6.1): 958/958, `tsc` and `next build` PASS; Chromium controlling-worker script 29/29 (incl. first visit under an old worker + previous-build negative control); recovery script 24/24 incl. account A recovery with account B stored. Previous (R6 only): 944/944, `tsc` PASS, local `next build` PASS from empty `.next`; real-Chromium recovery script 16/16 (server responses simulated); real-Chromium **controlling service-worker** script 20/20 incl. upgrade from a legacy worker and offline |
| Known open test reliability item | `account-codelab` fixed 10 ms wait — flaky under CPU load (6/20), 0/25 idle; not fixed |
No simulator, TestFlight or physical-device evidence exists for Build 69 in this repository.

## 5. Gates and owners
| # | Gate | State | Owner |
|---|---|---|---|
| 1 | Supabase **Confirm email = ON**, providers, reviewer pre-confirmed, SMTP, password minimum 8, redirect allow-list incl. `/reset-password` | UNVERIFIED | Work 1 / operator |
| 2 | Password recovery | R5+R6 drafts under review; **real end-to-end test on a protected preview/TEST project is UNVERIFIED** (plan: `docs/PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md`, not authorised) | Work 1 / MASTER |
| 2b | Service worker: baseline cached auth/recovery/API responses (and falls back to cached `/`); baseline as shipped does not install, so exposure is limited to browsers that kept an earlier installable version | R6 fix + browser evidence; Safari/WKWebView behaviour UNVERIFIED | Work 1 |
| 3 | Honest copy (ECG prepared, Echo one study, Code Lab 2 free per track) | R5 applied to Learn/Paywall; Onboarding lines 22/94/115 corrected in RC1 (`build69-rc1-onboarding-copy.patch`), pending review; App Store/reviewer text stale — see `docs/RELEASE_COPY_AND_EVIDENCE_AUDIT_2026-10-26.md`; copy-only fix proposed, not authorized | MASTER / Claude |
| 4 | Account deletion retention policy (cascade deletes purchase records) | HOLD; draft for legal in `docs/ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md` | MASTER + legal |
| 5 | Controlled Vercel releases (exact SHA, review, authorization, rollback) | procedure drafted; Production Branch setting unverified | MASTER / Work 1 |
| 6 | Codemagic provenance and a new RC after explicit build GO | not started | Work 1 |
| 7 | TestFlight device QA: sign-up → email confirmation → login, logout/restore (incl. 20 s busy UX), reviewer, StoreKit purchase/restore, Ward/Echo, recovery, deletion (after policy) | not started | MASTER / tester |
| 8 | Privacy labels and screenshots vs the final IPA/web state | pending | Work 1 |
| 10 | Operational readiness (Supabase, Codemagic, Safari, StoreKit, reviewer, retention) | **HOLD** — item-by-item list in `docs/RELEASE_GATE_CHECKLIST_1.1_BUILD_69.md` | Work 1 (one combined review) / MASTER |
| 11 | P1 subscription ownership/entitlement audit | separate HOLD track, not a 1.1 patch | MASTER |
| 12 | `account-codelab` 10 ms tick flake | OPEN | MASTER |
| 9 | Free Core + PRO Advanced (Issue #37) | design/doc only; no gating in 1.1 | MASTER |

## 6. App Review Notes (draft, English; update credentials in the protected field)
Cliniverse AI is a clinical education and workflow-simulation app for healthcare professionals; it does not diagnose or give patient-specific advice. Sign in with the reviewer account in App Review Information (pre-confirmed email). New users can create an account (email confirmation) and reset a forgotten password from the sign-in screen. PRO (`com.cliniverse.ai.pro.monthly`, auto-renewing monthly) unlocks additional Ward cases, further Code Lab lessons, Cardiology Operations and Nexus Learning; Restore Purchases is in Me → Plan. Echo (one introductory study), Resuscitation, Pathway Replay, Clinical Reference and Handover Practice are free; ECG practice is being prepared. Account deletion is in Me. Third-party AI features are disabled in this release. The app loads its content from www.cliniverseai.com. Support, Privacy and Terms are linked in the app.

## 7. Recommendation
R6.3 is the approved patch-level security baseline (not deployed). Next independent steps: Work 1 performs the operator checks (gates 1, 2, 5, 6); MASTER decides deletion retention (with legal) and authorizes the copy-only onboarding fix and App Store text refresh; then a single controlled production web deployment of the exact approved SHA, followed by a new Codemagic RC and TestFlight QA. **HOLD** until then.

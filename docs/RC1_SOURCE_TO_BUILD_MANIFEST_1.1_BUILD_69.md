# Release-candidate source package and source-to-build manifest — Cliniverse 1.1 (Issue #36)

Prepared by Claude Code, 2026-10-26, under "MASTER GO — RELEASE CANDIDATE PREPARATION" (SOURCE PREPARATION ONLY; production / build / Apple / Supabase / DNS = HOLD). Nothing was pushed to a production branch, deployed, built for iOS, or submitted.

## 0. Status (updated after Work 1 review)
**RC1 SOURCE APPROVED** — Work 1 independently VERIFIED the candidate identity and tree, the R4–R6.3 chain and the onboarding copy change; MASTER decision: APPROVE RC1 SOURCE. **Published** (with MASTER permission) at branch `candidate/cliniverse-1.1-build69-rc`, head `9bf17282630cb525916cb412601478574aa5419c` (confirmed with `git ls-remote`). Vercel Preview reported READY (Work 1); **GitHub Actions: none ran on the candidate**; Vercel Production Branch **UNVERIFIED**. BUILD / APPLE / RELEASE remain **HOLD**. Reference for later phases: **CLINIVERSE 1.1 — APPROVED SOURCE CANDIDATE** = commit `9bf1728…`, tree `14888df…`.

| Evidence | Provenance |
|---|---|
| Candidate identity, tree, patch chain, copy change | independently verified (Work 1) |
| 990/990 tests, `tsc`, `next build`, Chromium 40/40 and 24/24 | **Claude-reported, not independently re-run**; logs in `docs/evidence/rc1-9bf1728/` |
| Vercel Preview READY | reported by Work 1/MASTER; not re-checked by Claude |
| `account-codelab` intermittent failure (10 ms tick) | **OPEN** — not fixed; did not appear in the logged run |

## 1. Candidate identity
| Item | Value |
|---|---|
| Baseline | `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` |
| **Candidate commit** (published on `candidate/cliniverse-1.1-build69-rc`) | `9bf17282630cb525916cb412601478574aa5419c` on local branch `candidate/cliniverse-1.1-build69-rc` |
| **Candidate tree (reproducible identity)** | `14888df202bb3bda6e2988452a52bd67cc1926d0` |
| Tree before the copy commit (baseline + R4…R6.3) | `428fc23b992e06490414012b8e3a1a8a76c4aa5d` (commit `565441a`) |
| Diff vs baseline | 42 files, +3161 / −157 |

Commit SHAs of `git am` results change with committer date; the **tree hash is the reproducible identity**. Work 1 recomputed it by applying the patches below to the baseline and comparing `git rev-parse HEAD^{tree}`. The commit is now published, as Codemagic and Vercel identify builds by a pushed commit SHA.

## 2. Patch sequence (all in `docs/patches/` on `claude/cliniverse-1-1-build-69-tpzp5p`)
`git am --3way` in this order on the baseline; each SHA-256 matched its approved digest when applied:
| # | File | SHA-256 |
|---|---|---|
| 1 | `build69-r4-auth-queue-safety.patch` | `80d3fdac33011265720e1963c704721070fc6eeb256f97e3fb5d45d5eaff93f9` (Work 1 approved) |
| 2 | `build69-r5-password-recovery-and-copy.patch` | `020c09184a148f649537c4ce9910df63127d410e80620a5d5a46e62c239cd5fb` |
| 3 | `build69-r6-service-worker-and-recovery-evidence.patch` | `4f7dba1d16eff6f5441cbb70bb80eb8d30eebe90aa7a6d48c1eab1f6b9d793ae` |
| 4 | `build69-r6-1-sw-first-visit-and-cache-fixes.patch` | `00a37464a802642ccbd6710ff250ac9418ce70bd97a0b1018a3b258d2f4ce11d` |
| 5 | `build69-r6-2-guard-lifecycle-and-cache-verification.patch` | `c83c3a7e8f73d124c0f67d49ecea50570bb7b6325e670b5edf666a568b4278f2` |
| 6 | `build69-r6-3-worker-identity.patch` | `6aa429dc0483da030ab3979df65a137d7549e8d640cfbcdeb8114399937ec5d6` (Work 1 approved, patch level) |
| 7 | **`build69-rc1-onboarding-copy.patch`** (new, copy only) | `723cc600b88d8bd01f8410e491af9e4aa97181e8ce7f31aa0d6aa1b3ebe99586` |

## 3. What the new RC1 commit changes (2 files, +15/−7)
- `app/components/release/OnboardingScreens.tsx`: three strings — "Echo, Ward cases and clinical reasoning — …"; "Learn holds your Echo and Ward practice (ECG practice is being prepared), and Progress shows what to revisit."; "Start with the cine or case — before the label." No logic, layout, storage, route or native change.
- `tests/onboarding-v4.test.mjs`: pinned strings updated; new test ties onboarding copy to `evaluateEcgLearnerAvailability()` (must be `held`) and forbids `ECG`/`tracing` elsewhere in the screen. **Negative control:** reintroducing "tracing" makes 2 tests fail; restoring passes.

Changed files vs baseline (R4…R6.3 content): auth queue/coordinator/gate and tests, `/reset-password` page and recovery modules, `public/sw.js` and its guard modules, `next.config` headers, Paywall/Learn copy, evidence scripts and tests — see `git diff --stat e4dab59..9bf1728` (42 files).

## 4. Source QA (clean checkout of the candidate, `npm ci`; Claude-reported; logs: `docs/evidence/rc1-9bf1728/`)
| Check | Result |
|---|---|
| Focused: `onboarding-v4` + `release-copy-honesty` | 15/15 |
| Full `npm test` | **990/990** (single run; the known `account-codelab` 10 ms flake did not occur this time but is still OPEN) |
| `tsc --noEmit` | PASS |
| `next build` | PASS |
| Chromium controlling-worker script (`verify-service-worker-browser.cjs`, legacy worker = baseline `sw.js`) | 40 PASS / 0 FAIL — previous-build negative control (`BASE_R6`) was **not** re-run for this RC |
| Chromium recovery script (`verify-password-recovery-browser.cjs`) | 24/24 PASS (server behaviour simulated) |
Limits: Chromium only; Supabase traffic intercepted; no Safari/WKWebView, no real recovery email, no production-origin upgrade, no simulator/TestFlight/device evidence. (Test run used a project-pinned Playwright with the sandbox's Chromium build via a browsers-path symlink — environment detail only.)

## 5. Route contracts (local `next start` of the candidate; not production)
| Route | Result |
|---|---|
| `/api/release-contract` | 200, JSON `{product:"Cliniverse AI", channel:"apple-v1", commit:<VERCEL_GIT_COMMIT_SHA>, environment:<VERCEL_ENV>}`, `Cache-Control: no-store, max-age=0` (returned the candidate SHA when that env var was set) |
| `/reset-password` | 200, `Referrer-Policy: no-referrer`, `Cache-Control: no-store, max-age=0`, `X-Robots-Tag: noindex, nofollow` |
| `/sw.js` | 200, `Cache-Control: no-cache, no-store, must-revalidate` |
| `/learn/ecg` | 200, `no-store`; page shows held state |
| `/manifest.json`, `/` | 200 (`/` is statically prerendered with `s-maxage=31536000` — existing behaviour; client code, not server HTML, differs per user) |
Production equivalents (UNVERIFIED until a deployment exists): same checks against the deployed origin, with `commit` equal to the deployed SHA.

## 6. Deployment, rollback and operational dependencies
1. **Publish the candidate** to a reviewable (non-production) branch; Work 1 reviews tree `14888df…` against the patch digests.
2. **Vercel**: confirm the Production Branch setting (UNVERIFIED) so that publishing the branch cannot auto-promote; deploy as **Preview** first (Preview protection exists). Production promotion only by MASTER-authorized step in `VERCEL_PRODUCTION_RELEASE_CONTROL.md`. Rollback target: `dpl_CJC9unCgx4Xd7FeHNZkU8wER14Ya` (baseline) — **caution**: it restores the pre-R4 behaviour (auth race, SW caching of auth/recovery responses), so use it only as an emergency step, and prefer a forward fix. Do not use localhost as a fallback.
3. **Supabase (no change made)**, per MASTER's approved plan: Site URL `https://www.cliniverseai.com`; allow-list origin and `/reset-password`; Confirm Email ON; Anonymous OFF; SMTP provider decision (Resend first, Brevo alternative; sender domain, expected volume, SPF/DKIM needs) — none applied. Order matters: the recovery page must be live **before** the allow-list entry/redirect change is relied on; the preview must use an isolated TEST project, never the production one by default.
4. **Provider callbacks (Apple/Google)**: independent verification of their redirect/callback settings — UNVERIFIED.
5. **Operational tests (need separate authorization)**: real recovery email on TEST project, Safari/WKWebView, production-origin worker upgrade, StoreKit sandbox, reviewer clean-device test, deletion (after retention decision) — see `RELEASE_GATE_CHECKLIST_1.1_BUILD_69.md`.
6. **Codemagic**: new RC only after build GO; check `CM_COMMIT` == `/api/release-contract` commit on the deployed origin (already enforced by `codemagic.yaml`); IPA build number and ASC record must be tied back to the candidate SHA.

## 7. Remaining blockers
| # | Blocker | Owner |
|---|---|---|
| 1 | ~~Candidate unpublished~~ — closed: published and Work 1-approved | — |
| 2 | Optional independent re-run of the 990 tests / Chromium scripts (not required by MASTER) | Work 1 |
| 3 | Deletion retention policy (draft ready for legal) | MASTER + legal |
| 4 | Supabase/SMTP/provider/Vercel setting verification (all unverified) and real recovery + Safari tests | Work 1 + test team |
| 5 | App Store text/screenshot refresh and stale native screenshot contract (separate authorization) | MASTER / Claude |
| 6 | `account-codelab` flake OPEN; P1 entitlement audit separate HOLD | MASTER |

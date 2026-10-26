# Release-Readiness Packet — Cliniverse 1.1 / Build 69 (Engineering → Work 1)

Prepared by: Claude Code (Engineering & QA). Scope: source audit + source tests only. No build, deployment, submission, secret, entitlement or feature change was made.

## Decision: **HOLD** (not "READY FOR WORK 1 REVIEW" yet)

Reasons, in priority order:

1. **SHA/branch mismatch.** `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` ("feat(account): add protected in-app account deletion", 2026-09-22) exists on `origin/agent/today-collection-v1`, `origin/feature/work-review-controller-20261004`, `origin/qa/case-batch20-cloud`. It is **not on `main`** and **not an ancestor** of the session branch `claude/cliniverse-1-1-build-69-tpzp5p` (which equals `main` @ `4ee8850`). It is 311 commits ahead of that base. Audit below was done on a detached worktree of the exact SHA.
2. **22 of 886 source tests FAIL on the Build 69 SHA** (864 pass). `tsc --noEmit` is clean.
3. **Scope drift in login:** the SHA allows self-service account creation (`signUpWithPassword` in `AuthScreen.tsx`), while the accepted RC contract test requires the text "Account creation is not enabled in this release".

## Verified identity

| Item | Value | Status |
|---|---|---|
| Source SHA | e4dab595d96c1d7e2583a28b15f2bb2497b4e65b | VERIFIED exists (repo) |
| Marketing version | 1.1 (`CFBundleShortVersionString`, set in codemagic.yaml) | VERIFIED in source |
| Build number 69 | injected from Codemagic `BUILD_NUMBER`; not stored in repo | **UNVERIFIED** — Work 1 must confirm Codemagic run → SHA → ASC build |
| codemagic.yaml | on the SHA it differs from `main` (e.g. `xcode: 26.6` vs `latest`) | noted |
| `ios/` Info.plist | not committed (generated at CI) → native packaging not locally verifiable | UNVERIFIED |

## Tests run (source level, Node 22 on Linux, SHA worktree)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS (0 errors) |
| `npm test` | **864 pass / 22 FAIL** of 886 |
| StoreKit contract, Apple verification client/boundary/persistence/verifier-runtime | PASS |
| account-deletion-release, reviewer-feature-access | PASS |
| native-release-gates, ios-screenshot-evidence-contract | PASS |
| Ward (v2 journey, checkpoint), ECG (answer, account attempt), Echo (attempt, history) | PASS |
| `next build` | NOT RUN here |

### The 22 failures (14 files)
- `auth-identity-session-contract` (3): handler order check `authError || !data.session || !data.user` before `onComplete`; error text `authError?.message || t.genericError`; missing "No administrator privileges" in SubscriptionPurchaseProvider.
- `release-security-contracts` (1): "Account creation is not enabled in this release" absent from AuthScreen.
- `paywall-release-contracts`, `explore-curated-discovery` (2), `learn-practice-tracks` (4), `me-account-v2` (2), `me-hub-actions`, `today-golden-surface` (2), `progress-trajectory`, `ecg-learner-workspace`, `echo-learner-workspace`, `echo-intelligence-atlas-live-route`, `release-interactions-contract`, `release-unified-product-ux`: UI-structure contracts (Explore/Learn/Me/Today/Progress shell wiring, e.g. `<AtlasReleaseCatalog onNavigate=… caseLibraryPreview=`).

**Diagnosis (smallest cause):** these are source-pattern assertions. Most look like tests lagging the post-RC1 UI/auth refactors (sign-up + magic-link flow added in `AuthScreen.tsx`, Learn/Explore/Me restructuring), not runtime crashes — but that is an inference, not proven. Not fixed: modifying tests or code would change the accepted baseline. Needs MASTER decision: update contracts to the intended 1.1 scope, or revert the drifted code.

## Evidence by area

- **Login/onboarding:** email+password sign-in fails closed on error/no session (code reads correctly); sign-up and magic-link branches exist (magic-link default off per `enableMagicLink = false`, `shouldCreateUser:false`). Reviewer access is server-gated via `/api/reviewer-feature-access` with bearer token and email-confirmed check. Runtime login: **UNVERIFIED** (no device/simulator).
- **StoreKit:** product `com.cliniverse.ai.pro.monthly` consistent across `CliniverseStoreKitPlugin.swift`, `storekit-purchase-contract.ts`, `entitlements.ts`, server verification. Restore Purchases implemented (`SubscriptionPurchaseProvider.restorePurchases`, handles none/failed/restored). Sandbox purchase and restore on Build 69: **UNVERIFIED** (no TestFlight evidence available to me).
- **Account deletion:** implemented in the SHA (in-app, protected route); contract tests PASS. Not exercised live.
- **Ward / ECG / Echo:** contract tests PASS; offline/error-state behaviour not runtime-tested. **UNVERIFIED on device.**
- **Privacy:** `native/privacy/PrivacyInfo.xcprivacy` declares Email, Name, UserID, PurchaseHistory, OtherDiagnosticData; tracking false. Must be reconciled with App Store privacy answers (Work 1). Analytics-related code present in several components (`engagement/provider.ts`, `operationalPulse.ts`) — confirm nothing is third-party/tracking.
- **Permissions:** no UsageDescription keys found in repo (Info.plist generated at CI) — verify in the built IPA.
- **Medical wording:** release-security test for "Clinical Intelligence is not enabled in this release build" / third-party AI disclaimer passes.

## Evidence classes (do not conflate)

| Class | Build 69 status |
|---|---|
| Source tests | 864/886 pass, 22 fail (above) |
| Simulator tests | NONE seen |
| Codemagic / TestFlight | NONE accessible from this sandbox (no network/credentials). Only prior record: `APPLE_BUILD_67_OUTCOME` (Build 67, externally reported) |
| Physical device | NONE for Build 69 |

## Draft App Review Notes

> Cliniverse AI is a clinical education and workflow-simulation app for healthcare professionals; it does not diagnose or provide patient-specific medical advice. Sign in with the reviewer account supplied in App Review Information. PRO (`com.cliniverse.ai.pro.monthly`, auto-renewable monthly) unlocks the full Ward, ECG and Echo workspaces; Restore Purchases is in Me → Plan. Account deletion is in Me. Third-party AI features are disabled in this release. Support/Privacy/Terms: cliniverseai.com. [credentials: to be entered by Work 1 in protected fields]

## Blockers and owners

| # | Blocker | Owner |
|---|---|---|
| 1 | Confirm which branch/commit Codemagic actually built as Build 69 (SHA is off-main, not on the assigned branch) | Work 1 |
| 2 | Decide on 22 failing contracts: update tests vs revert drift (incl. sign-up/account-creation scope) | MASTER |
| 3 | Sandbox purchase + restore on Build 69 TestFlight | Work 1 / MASTER (device) |
| 4 | Login, Ward, ECG, Echo, offline states on physical device | MASTER / tester |
| 5 | Privacy answers vs PrivacyInfo.xcprivacy; screenshots vs final UI; product attached to version | Work 1 |
| 6 | Support mailbox, Support/Privacy/Terms HTTP 200 | Work 1 |

No new build is requested. Final submission and manual release remain MASTER-controlled.

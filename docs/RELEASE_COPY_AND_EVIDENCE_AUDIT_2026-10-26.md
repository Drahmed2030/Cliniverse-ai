# Release-copy and evidence audit — Cliniverse 1.1 / Build 69 (2026-10-26, Issue #36)

Prepared by Claude Code. **Documentation and proposal only. No runtime, native, test-contract, deployment, build or submission change was made.**
Source SHA under assessment: baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` + R4…R6.3 applied with `git am` in order (final digest `6aa429dc0483da030ab3979df65a137d7549e8d640cfbcdeb8114399937ec5d6`, Work 1 APPROVED as patch-level security baseline). Line numbers below are from that tree (baseline + R6.3 worktree), not from this docs branch (`main@4ee8850` + docs).

## 1. Method
Import-graph reachability from every `page.tsx` / `layout.tsx` (29 route entries, 270 reachable files) to find strings a production learner can actually see, then compared each ECG statement with `lib/competency/ecgLearnerAvailability.ts` (`ECG_LEARNER_ARTIFACT_SOURCE = null` → state `held`, page text "This tracing isn't shown yet"). Reachability is static analysis, not a device walk-through.

## 2. Reality (VERIFIED from source)
ECG learner practice is **held**: no governed tracing is shipped. `ReleaseApp` shows the "ECG · REVIEW PREVIEW" card only when preview/dev environment + confirmed reviewer email + `?reviewTools=1` — **not in production**. Echo is one introductory study. Already honest after R5 (pinned by `tests/release-copy-honesty.test.mjs`, which fails if ECG availability leaves `held`): Learn card, Paywall.

## 3. Claim audit
| # | Location | Claim | Matches reality? | User-visible in production? |
|---|---|---|---|---|
| 1 | `app/components/release/OnboardingScreens.tsx:94` | "ECG, Echo and clinical reasoning — brought into one focused workflow…" | **No** — offers ECG | **Yes** (first-launch onboarding) |
| 2 | same file `:115` | "Learn holds your ECG, Echo and Ward practice…" | **No** — ECG not in Learn | **Yes** |
| 3 | same file `:22` | "Start with the tracing, cine or case — before the label." | Partly — "tracing" implies ECG | **Yes** |
| 4 | `OnboardingScreens` headline "Read the signal." | generic | Ambiguous, not a claim | Yes (left unchanged) |
| 5 | `tests/onboarding-v4.test.mjs:76-77,158-159` | pins the strings above | Pins the inaccurate copy | test only |
| 6 | `LearnTracks.tsx`, `PaywallSheet.tsx` | ECG "being prepared" | Yes (R5) | Yes |
| 7 | `ReleaseApp.tsx` ~169-172 ECG REVIEW PREVIEW | ECG tracing | Gated by `internalReviewTools` | **No** |
| 8 | `docs/APPLE_RC1_REVIEWER_PACKAGE.md` metadata (subtitle "Clinical Learning & Workflow", promo text, keywords) | no ECG claim | Yes | n/a (App Store Connect) |
| 9 | same doc, description draft/review notes | tour of "QAPAS / Intelligence / Atlas"; nav "Home/Care/Intelligence/Atlas"; "Account creation is intentionally disabled" | **Stale** vs shipped UI (Today / Learn / Progress / Explore / Me; sign-up and recovery exist; deletion exists) | **Would be read by App Review** |
| 10 | `docs/CLINIVERSE_PLATFORM_STATE_V1_2.md:32` (baseline only) | "ECG governed content … ACTIVE in production" | **No** — held | internal doc |
| 11 | `native/screenshot/CliniverseScreenshotTests.swift` step `04-intelligence` (`openTab("Intelligence", waitingFor: "Clinical Intelligence is not enabled in this release build.")`) and `05-atlas` | tab "Intelligence" does not exist in the release nav | **Stale** — step would fail | no; pinned by `tests/ios-screenshot-evidence-contract.test.mjs` and Codemagic `ios-screenshot-evidence` |

No ECG claim was found in `manifest.json`, privacy/terms/support pages or the metadata fields listed in the reviewer package.

## 4. Smallest copy-only correction (PROPOSED — needs separate authorization)
Three string edits in `OnboardingScreens.tsx` plus the two pinned test assertions:

| Line | Before | After |
|---|---|---|
| 94 | ECG, Echo and clinical reasoning — brought into one focused workflow built for deliberate practice. | Echo, Ward cases and clinical reasoning — brought into one focused workflow built for deliberate practice. |
| 115 | …Learn holds your ECG, Echo and Ward practice, and Progress shows what to revisit. | …Learn holds your Echo and Ward practice (ECG practice is being prepared), and Progress shows what to revisit. |
| 22 | Start with the tracing, cine or case — before the label. | Start with the cine or case — before the label. |

Test change: update `tests/onboarding-v4.test.mjs` strings and add an assertion that onboarding copy contains no `\bECG\b` outside "being prepared" while `evaluateEcgLearnerAvailability().state === 'held'` (same pattern as `release-copy-honesty.test.mjs`). Risk: copy only; no logic, no storage, no native change. Approx. diff: 3 lines + ~6 test lines.

Not in this correction (each needs its own authorization): rewriting the reviewer package/App Store text (§5, docs only), the native screenshot test and its contract test (native test change), the baseline platform-state doc line (docs only, baseline branch).

## 5. Proposed App Store / review text (docs-only draft, not submitted)
Navigation: Today, Learn, Progress, Explore, Me. Replace "account creation intentionally disabled" with: *New users can create an account with email and password (email confirmation required) and reset a forgotten password from the sign-in screen; the reviewer account is pre-confirmed. Account deletion is in Me.* Feature list: Echo — one introductory study; Ward — one free case, more with PRO; Code Lab — first two lessons of each BLS/ACLS track free; Resuscitation, Pathway Replay, Clinical Reference, Handover Practice free; **ECG practice is being prepared** (do not show or describe ECG in screenshots). PRO product `com.cliniverse.ai.pro.monthly` (name to read "Cliniverse PRO Monthly"; the review package still has "CLiniverse"). Screenshot sequence to be re-derived from the five tabs; the current twelve-shot contract is stale (row 11).

## 6. Verified vs unverified
VERIFIED (source or read-only evidence): ECG held; onboarding lines 22/94/115 inaccurate and reachable; reviewer package nav/account text stale; screenshot step 04 targets a nonexistent tab; production Vercel deployment = baseline SHA; DB cascade facts and `persist_verified_apple_subscription` (MASTER read-only, Issue #36); per reviewer package: reviewer account provisioned, leaked-password protection enabled 2026-08-27, subscription-authority migration applied 2026-09-02.
UNVERIFIED (operational — see `RELEASE_GATE_CHECKLIST_1.1_BUILD_69.md`): Confirm Email, SMTP, redirect allow-list, real recovery link flow, Safari/WKWebView behaviour, Codemagic run → SHA → IPA → ASC "1.1 (69)", StoreKit purchase/restore on device, Vercel Production Branch, privacy labels vs final binary, support mailbox, current ASC metadata contents.

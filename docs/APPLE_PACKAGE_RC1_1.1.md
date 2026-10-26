# Apple package — Cliniverse 1.1 / RC1 (documentation only; v3 — awaiting Work 1 final limited confirmation)

Approved RC1 (frozen): commit `9bf17282630cb525916cb412601478574aa5419c`, tree `14888df202bb3bda6e2988452a52bd67cc1926d0`. This document changes no source, creates no resource, and submits nothing. Budget: 0 SAR. Deletion policy and device/auth test plan are **not** repeated here (see `ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md` and Work 1's plan).
Document version: git commit of this file on `claude/cliniverse-1-1-build-69-tpzp5p`. v3 applies Work 1's three corrections to v2 (`618d709`): Confirm Email evidence wording, archived withdrawn retention text, P1 launch-blocker status. Approved descriptions, the manual screenshot plan and RC1 source are unchanged. Everything below is proposed text; live App Store Connect contents were **not** inspected (UNVERIFIED).
**Alignment note:** Work 1's pre-release policy and acceptance documents are not in the repository or the branches visible to Claude; the corrections below follow MASTER's written summary of Work 1's positions. Work 1's limited confirmation should check that wording against its own files.

## 1. Completeness
| Part | State |
|---|---|
| Metadata/screenshot mismatch inventory | complete — `APPSTORE_METADATA_MISMATCH_REGISTER_RC1.md` (13 items) |
| Proposed metadata + description | **this file §3** (new) |
| Proposed reviewer notes | **this file §4** (new) |
| Subscription documentation | **this file §5** (new; facts from repo only) |
| Screenshot plan | **this file §6** (plan only; native test untouched) |
| Verification against live ASC, signed IPA, device | NOT DONE — needs Work 1 / separate authorization |

## 2. Newly found mismatch (beyond the register)
The existing review notes state: *"sign-in-only … Account creation is intentionally disabled"* **and** *"There is no digital Upgrade call to action and no in-app purchase flow in this release."* RC1 has self-service sign-up, password recovery, account deletion and a PRO subscription with StoreKit purchase/Restore. These sentences would be false in review; they must be replaced (§4). Apple guideline exposure: misleading review notes, IAP not disclosed.

## 3. Proposed metadata (unchanged fields keep their current value)
Unchanged: Subtitle "Clinical Learning & Workflow"; Keywords; Support/Privacy/Marketing URLs (still HOLD until production promotion and contact-route test). Promotional text: keep; optionally drop "no-real-patient-data boundary" wording only if legal prefers. **Description (replacement):**

> Cliniverse AI is a clinical learning, simulation and workflow app for healthcare professionals, developed by NeuraOps.
>
> • Today — what to do next, and your recent practice.
> • Learn — Echo (one introductory study), Ward simulated cases, Code Lab BLS/ACLS lessons, Resuscitation, Pathway Replay, Clinical Reference and Handover Practice. ECG practice is being prepared.
> • Progress — what to revisit.
> • Explore — reference and learning tools.
> • Me — account, plan, privacy and sign-out.
>
> Create an account with email, or sign in. All patient and ward content is fictional simulation data. Optional Cliniverse PRO (auto-renewing monthly subscription) unlocks additional Ward cases, further Code Lab lessons, Cardiology Operations and Nexus Learning.
>
> Cliniverse AI does not diagnose, replace clinical judgment, local policy, supervision or emergency services, and is not for real patient-identifiable information.

The vague phrase "advanced tools" was removed; only features present in source are named (§5). (Subscription terms line required by Apple — price, period, renewal, cancellation, Terms/Privacy links — to be added from the real StoreKit price at submission; not invented here.)

## 4. Proposed App Review notes (replace build-57 text; credentials only in the protected field)
**Email confirmation evidence (corrected):**
| Item | State |
|---|---|
| Supabase "Confirm email" setting | **reported ENABLED** (Work 1 review, Issue #36; Claude did not inspect the dashboard) |
| Confirmation email delivery (SMTP/sender, spam, link target) | **UNVERIFIED** |
| Real sign-up → confirm → login (incl. unconfirmed user denied a session) | **UNVERIFIED** |
| Reviewer account pre-confirmed / clean-device login | **UNVERIFIED** (provisioned 2026-08 per reviewer package) |
The notes therefore make no claim that email confirmation has been tested; an "enabled setting" is not proof of working delivery or login.

**Status of every statement: SOURCE-DERIVED — the features exist in the RC1 source; none has been verified on a signed IPA or device. Do not submit these notes as tested behaviour until Work 1 / the test team confirms each step on the signed build.**
> Cliniverse AI is a clinical education and workflow-simulation app for healthcare professionals; it does not diagnose or give patient-specific advice. Sign in with the reviewer account supplied in App Review Information (pre-confirmed). The app includes account creation with email, password reset from the sign-in screen, and Restore Purchases. Navigation: Today, Learn, Progress, Explore, Me. All patient content is fictional.
> Subscription: Cliniverse PRO Monthly (`com.cliniverse.ai.pro.monthly`, auto-renewing). PRO unlocks additional Ward cases, further Code Lab lessons, Cardiology Operations and Nexus Learning. Echo (one introductory study), Resuscitation, Pathway Replay, Clinical Reference and Handover Practice are free; ECG practice is being prepared. Purchase and Restore Purchases are in Me → Plan. Account deletion is in Me. Third-party AI features are disabled in this release. The app loads its content from www.cliniverseai.com. Support, Privacy and Terms are linked in the app.

Walkthrough steps (sign-in, tabs, Plan/Restore, deletion) are **awaiting signed-device verification**; the final note text must be re-issued after that run, stating only what was observed.

## 5. Subscription documentation (repo facts only)
| Item | Value / state |
|---|---|
| Product | `com.cliniverse.ai.pro.monthly`, auto-renewing monthly; display name must read "Cliniverse PRO Monthly" (review package has "CLiniverse") |
| Yearly | the verify route accepts a yearly id although only monthly is approved — future item (Issue #37), not 1.1 |
| Entitlement authority | Verified transactions are written by a server function (`persist_verified_apple_subscription`; migration applied 2026-09-02 per reviewer package). **This is a design fact from source, not an accepted guarantee.** PRO gates in RC1 are client-side (UI) and most premium content is bundled in the client, so PRO is not server-enforced. **P1 — cross-account Apple purchase ownership — is a BLOCKER for the current paid-subscription launch** (see P1 box below). Do not describe ownership or enforcement as complete in any App Store text. |
| Not built | App Store Server Notifications endpoint (renewals/refunds/expiry are not pushed to the server) |
| PRO content in 1.1 | Ward 1 free + 6 gated; Code Lab first two lessons/track free (4 free / 8 gated); Cardiology Operations and Nexus gated; Resuscitation, Pathway Replay, Clinical Reference, Handover, Echo study free (MASTER D2) |
| P1 status | **BLOCKING THE CURRENT PAID SUBSCRIPTION LAUNCH** until the four scenarios below are verified |
| Deletion interaction | deleting the account currently cascades subscription records; an active Apple subscription is not cancelled by deletion; any retained minimum transaction record depends on the legal review (`ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md`) |
| UNVERIFIED | product attached to the 1.1 version, price/territories, subscription-group and localization metadata, review screenshot, sandbox purchase/restore, intro offer (none designed), Terms/EULA link |

### P1 — cross-account Apple purchase ownership: BLOCKING THE CURRENT PAID SUBSCRIPTION LAUNCH
Decision (Work 1, adopted by MASTER): paid-subscription launch is blocked until safe linking and restore behaviour is demonstrated. This is **not** evidence of an exploitable takeover; it means the subscription cannot be treated as launch-ready without the evidence. No development is opened in this batch; a separate test assessment follows. **All four scenarios are UNVERIFIED (no results exist):**
| Scenario | Question to verify (TEST project/sandbox only) |
|---|---|
| Existing ownership | A's verified transaction is linked to A. Can B, using the same Apple ID/transaction, restore or purchase and obtain PRO, or be refused? Does A keep PRO? |
| Missing ownership | A transaction with no ownership record: how is it first linked, to whom, and can it be linked to the wrong account? |
| Conflicting ownership | Two accounts claim one original transaction: which wins, what is stored, what does each user see? |
| Post-deletion ownership | After A is deleted (cascade removes A's records), can B claim A's still-active Apple subscription, and is that intended? |
Related: no App Store Server Notifications endpoint (renewal/refund/expiry not pushed). Alternative path (not decided, not adopted): a temporary free educational release separable from purchase, subject to Apple requirements and its own product change and tests.

## 6. Screenshot plan
**Preferred initial plan (MASTER): manual screenshots captured from the future signed IPA**, only after a build is separately authorized and approved, matching the real release UI and Apple's size/device requirements. Candidate set: Today, Learn, a Ward simulated case, Progress, Explore, Me → Plan. Exclude ECG tracing, any "Intelligence" tab and reviewer-only tools; do not capture before the signed build.
**Unresolved engineering dependency (not changed):** `native/screenshot/CliniverseScreenshotTests.swift` step `04-intelligence` targets a tab that no longer exists and `tests/ios-screenshot-evidence-contract.test.mjs` pins the stale names (`04-intelligence`, `05-atlas`, twelve shots). If the Codemagic `ios-screenshot-evidence` workflow is needed in the build or verification path, this needs a separate native/test authorization; otherwise it can remain unresolved without blocking manual capture.

## 7. Outstanding decisions
1. Approve §3/§4 text (docs-only) so Work 1 can enter it in ASC when authorized.
2. Manual screenshots from the signed IPA adopted as the initial plan (§6); the stale native screenshot contract stays an open engineering dependency, decided separately.
3. Final subscription presentation: price, territories and subscription terms from the real StoreKit/ASC configuration — **UNVERIFIED** until checked, as are reviewer access and all live App Store Connect settings. P1 ownership/enforcement decision is separate and HOLD.
4. Legal wording for privacy answers and deletion/retention (conditional minimum-retention proposal, below) before ASC privacy labels are set.
5. Reviewer account re-test on a clean device (credentials stay out of the repo).
6. Subscription path after P1 evidence: prove P1 safe before paid launch, or assess a temporary free educational release (separate decision, no assumption made here).

## 8. Deletion and retention wording (aligned; legally conditional)
No retention period, anonymous/de-identified record, hashed identifier or new table is promised or designed here. Provisional position: **delete account data**; keep only the **minimum transaction records** and only where a **specific legal basis** is identified by the legal review. Transaction identifiers and hashes can remain personal data linkable to a person, so user-facing text must not call them anonymous. Public/privacy text and ASC privacy answers stay UNVERIFIED until legal approves. Active questions: `ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md`; withdrawn proposals: `docs/archive/ARCHIVED_WITHDRAWN_deletion_retention_options_2026-10-26.md` (ARCHIVED — WITHDRAWN — DO NOT PUBLISH).

# Apple package — Cliniverse 1.1 / RC1 (documentation only, DRAFT for Work 1 + MASTER review)

Approved RC1 (frozen): commit `9bf17282630cb525916cb412601478574aa5419c`, tree `14888df202bb3bda6e2988452a52bd67cc1926d0`. This document changes no source, creates no resource, and submits nothing. Budget: 0 SAR. Deletion policy and device/auth test plan are **not** repeated here (see `ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md` and Work 1's plan).
Document version: git commit of this file on `claude/cliniverse-1-1-build-69-tpzp5p`. Everything below is proposed text; live App Store Connect contents were **not** inspected (UNVERIFIED).

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
> Create an account with email, or sign in. All patient and ward content is fictional simulation data. Optional Cliniverse PRO (auto-renewing monthly subscription) unlocks additional Ward cases, further Code Lab lessons and advanced tools.
>
> Cliniverse AI does not diagnose, replace clinical judgment, local policy, supervision or emergency services, and is not for real patient-identifiable information.

(Subscription terms line required by Apple — price, period, renewal, cancellation, Terms/Privacy links — to be added from the real StoreKit price at submission; not invented here.)

## 4. Proposed App Review notes (replace build-57 text; credentials only in the protected field)
> Cliniverse AI is a clinical education and workflow-simulation app for healthcare professionals; it does not diagnose or give patient-specific advice. Sign in with the reviewer account supplied in App Review Information (pre-confirmed). New users can create an account with email (email confirmation required) and reset a forgotten password from the sign-in screen. Navigation: Today, Learn, Progress, Explore, Me. All patient content is fictional.
> Subscription: Cliniverse PRO Monthly (`com.cliniverse.ai.pro.monthly`, auto-renewing). PRO unlocks additional Ward cases, further Code Lab lessons, Cardiology Operations and Nexus Learning. Echo (one introductory study), Resuscitation, Pathway Replay, Clinical Reference and Handover Practice are free; ECG practice is being prepared. Purchase and Restore Purchases are in Me → Plan. Account deletion is in Me. Third-party AI features are disabled in this release. The app loads its content from www.cliniverseai.com. Support, Privacy and Terms are linked in the app.

Walkthrough steps must be re-verified on the signed build by Work 1 (current text is from source reading, not a device run).

## 5. Subscription documentation (repo facts only)
| Item | Value / state |
|---|---|
| Product | `com.cliniverse.ai.pro.monthly`, auto-renewing monthly; display name must read "Cliniverse PRO Monthly" (review package has "CLiniverse") |
| Yearly | the verify route accepts a yearly id although only monthly is approved — future item (Issue #37), not 1.1 |
| Entitlement authority | server-written from verified Apple transactions (`persist_verified_apple_subscription`, replay-safe, sticky original-transaction ownership); client PRO gates are UI only; migration applied 2026-09-02 per reviewer package |
| Not built | App Store Server Notifications endpoint (renewals/refunds/expiry are not pushed to the server) |
| PRO content in 1.1 | Ward 1 free + 6 gated; Code Lab first two lessons/track free (4 free / 8 gated); Cardiology Operations and Nexus gated; Resuscitation, Pathway Replay, Clinical Reference, Handover, Echo study free (MASTER D2) |
| Deletion interaction | deleting the account cascades subscription records; active Apple subscription is not cancelled — retention decision pending legal |
| UNVERIFIED | product attached to the 1.1 version, price/territories, subscription-group and localization metadata, review screenshot, sandbox purchase/restore, intro offer (none designed), Terms/EULA link |

## 6. Screenshot plan (no file touched)
Derive from the five tabs on the final signed build: Today, Learn (no ECG card behaviour implied), a Ward simulated case, Progress, Explore, Me → Plan (PRO). Exclude ECG tracing, any "Intelligence" tab and reviewer-only tools. Existing native sequence (`04-intelligence`, `05-atlas`, twelve shots) and its contract test are stale and need a separate authorization before any native change.

## 7. Outstanding decisions
1. Approve §3/§4 text (docs-only) so Work 1 can enter it in ASC when authorized.
2. Authorize the native screenshot test/contract refresh, or choose manual screenshots from the signed build.
3. Final subscription presentation: price/territory/subscription terms text from the real StoreKit configuration.
4. Legal wording for privacy answers and deletion/retention before ASC privacy labels are set.
5. Reviewer account re-test on a clean device (credentials stay out of the repo).

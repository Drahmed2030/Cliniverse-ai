# Apple Wave 1 Response and Evidence Plan

Status: **PREPARED / HOLD — verify against the live App Store Connect message before sending**

This document converts the Apple requirements recovered from the prior Wave 1 conversation into an RC1 evidence checklist. It does not claim that a device test, App Store Connect field, credential or upload is complete until the final signed build proves it.

## Recovered Apple requirements

| Apple item | Required RC1 evidence | Current state |
| --- | --- | --- |
| Guideline 2.1(b) — App Completeness | Version 1.0 build 57 referenced Plan, but `com.cliniverse.ai.pro.monthly` was not submitted for review. Apple requires the subscription and a new app binary in the same submission. | Product and review screenshot exist in App Store Connect; HOLD until the new signed binary passes and the product is added to that submission |
| Guideline 2.1 — App Completeness | A physical-device screen recording beginning at launch and showing the core flow. Include registration/login/deletion where applicable, paid content/subscriptions, UGC controls and sensitive-data permission prompts. | HOLD — final signed IPA and physical-device recording required |
| Tested configuration | Exact device models and OS versions used for testing. | HOLD — complete after iPhone/iPad matrix |
| Product explanation | Functions, target audience, problem and user value. | Prepared below |
| Review access | Setup instructions, current demo credentials and any sample files required. | HOLD — credentials only in protected App Store Connect fields; no sample file required for Apple v1 |
| External dependencies | External services, tools and platforms used by the reviewed flow. | Prepared below; recheck final network trace |
| Regional behavior | Explain regional differences or confirm the same reviewed experience. | Prepared as no intentional regional feature difference; verify final build |
| Regulated industry/materials | Supply authorization documentation if the app claims regulated authorization or protected-material rights. | No authorization claim; legal/content-rights confirmation still required |
| Guideline 2.3.3 — Screenshots | Screenshots must show actual app use and its core concept. Apple reported three identical 6.7-inch iPhone screenshots; title art, login and splash screens are not sufficient. | HOLD — capture six distinct screens from final signed build |
| Guideline 3.1.2 — Subscriptions | If auto-renewing subscriptions are offered, show title, duration and price and provide Terms of Use and Privacy links. | Implemented in the resubmission candidate through StoreKit. HOLD until signed-device purchase, restore and server-entitlement evidence pass. |
| Guideline 5.1.1 — Purpose strings | Every requested sensitive capability must have a complete purpose string explaining the data/capability and a concrete use example. | Candidate IPA declares no HealthKit, camera, microphone, location or photo permission; verify final Info.plist |
| Account deletion | If users can create accounts, deletion must be available and shown. | Account creation is disabled in Apple v1; reviewer uses a pre-provisioned account |
| Launch/icon findings | Eliminate the default/placeholder icon and the observed white/black blank launch state. | Pipeline hardened; physical iPhone/iPad evidence remains required |

## Product statement for App Review

Cliniverse AI is a focused clinical learning, simulation and workflow-support product for healthcare professionals, developed by NeuraOps. Apple v1 contains Home, Care, Intelligence, Atlas and Me. Care includes a free fictional Ward case and paid Cardiology Operations, QAPAS and Nexus systems-learning simulations. Human clinical judgment remains explicit. Intelligence is visibly disabled pending a separate AI-consent and clinical-safety review. The release is not a diagnostic or prescribing system, is not a medical-device authorization claim, and is not approved for real patient-identifiable information or PHI.

The release helps clinicians and trainees practise structured review, follow-up, documentation and escalation in a clearly labelled simulated environment. It does not replace supervision, local policy, source verification, emergency services or independent professional judgment.

## External services disclosure

- Vercel provides the production web runtime loaded by the native container.
- Supabase provides authentication and the release-scoped profile, progress and entitlement database.
- NCBI/PubMed may provide public evidence links used by the Care evidence route.
- Public FDA, WHO, RxNorm and ClinicalTrials.gov reference routes remain non-diagnostic utilities; confirm whether each is reachable from the final reviewed UI before listing it as a reviewer flow.
- Third-party generative AI is not enabled in the Apple v1 user flow. Deferred AI, document, storage, ingestion, mood and legacy APIs are blocked at the Next.js release boundary before their handlers execute.
- Apple Health/HealthKit, wearable connections, advertising and tracking are not enabled.

No intentional feature difference by country or region is planned for Apple v1. External public-reference availability may vary with the upstream provider or network; verify this statement on the final production build.

## Physical-device recording script

Record one continuous video on the final signed build, without exposing the reviewer password or personal notifications:

1. Show the physical device model, OS version and installed Cliniverse AI icon.
2. Cold-launch the app from a clean installation and prove there is no blank white/black state.
3. Sign in with the protected reviewer account.
4. Show Home and its no-real-patient-data/human-review boundary.
5. Open Care and show the free fictional Ward case, PRO entry points, simulation labels and human-review language.
6. Open Me and show the StoreKit-supplied monthly product name, duration and localized price. Demonstrate purchase and Restore purchases with Apple sandbox credentials without recording credentials.
7. After server verification activates PRO, open Cardiology Operations, QAPAS Direct, Nexus Learning, an expanded Ward case and Related Evidence.
8. Open Intelligence and show the truthful disabled state.
9. Open Atlas and show the working Care, Me and View plan actions plus the excluded-capability boundary.
10. Return to Me and show the plan state, Apple subscription-management link, privacy boundary and sign-out.
11. Show Terms, Privacy and Support.
12. Demonstrate offline/reconnect and background/foreground recovery if the final recording length permits; retain the full matrix as separate internal evidence.

Record the same cold-launch proof on an iPad. Supply Apple with the clearest requested recording and list both tested device/OS combinations in Review Notes.

## Draft reply to Apple

Dear App Review Team,

Thank you for the detailed guidance. We prepared a narrowed Cliniverse AI release and addressed the review-readiness items as follows:

- We provide a physical-device recording beginning at cold launch and showing the complete reviewed flow.
- Review Notes list the exact iPhone/iPad models and OS versions tested, setup steps and a current non-expiring review account.
- The app is a clinical learning, fictional simulation and workflow-support product for healthcare professionals. It does not autonomously diagnose or prescribe, does not replace professional judgment, and does not permit real patient-identifiable data in this release.
- Account creation remains disabled and the reviewer account is pre-provisioned. The Me screen now includes Upgrade to Cliniverse PRO, the StoreKit-supplied monthly price and duration, Terms, Privacy and Restore purchases.
- The only submitted auto-renewable product is `com.cliniverse.ai.pro.monthly`. PRO activates only after Apple JWS verification and trusted server persistence.
- The screenshots were replaced with distinct images of actual Home, Care, Care detail, Intelligence, Atlas and Me screens captured from the submitted build.
- The submitted native target does not request HealthKit, camera, microphone, location or photo-library permission. Its Info.plist and privacy manifest were rechecked against the final archive.
- The default icon and blank launch findings were addressed and verified on clean-installed iPhone and iPad builds.
- Support, Privacy and Terms URLs point to the canonical production domain and match the submitted binary.

The protected recording link, demo account and reviewer contact details are supplied only through App Store Connect.

Sincerely,
NeuraOps / Cliniverse AI

## Final protected fields

Complete these only in App Store Connect or the private release record:

- final build/version;
- recording link;
- reviewer username/password;
- tested iPhone model and iOS version;
- tested iPad model and iPadOS version;
- reviewer contact name, email and international phone;
- content-rights/legal entity confirmation;
- any final regional limitation.

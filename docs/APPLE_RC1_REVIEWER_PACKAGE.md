# Apple RC1 Reviewer Package

Status: **PREPARED / HOLD — do not submit**

This package is the release-scoped source for App Store Connect metadata and reviewer instructions. Every item must be checked against the final signed IPA and production backend immediately before submission.

## Product metadata draft

| Field | Release value | Gate |
| --- | --- | --- |
| App name | Cliniverse AI | Prepared |
| Subtitle | Clinical Learning & Workflow | Prepared — 28 characters |
| Primary category | Medical | Confirm in App Store Connect |
| Secondary category | Education | Confirm in App Store Connect |
| Promotional text | Clinical learning, simulation and workflow tools for healthcare professionals, with explicit human review and no real-patient-data boundary. | Prepared — 140 characters |
| Keywords | `clinical,simulation,workflow,medical,education,healthcare,ward,reference,clinician` | Prepared — 82 characters |
| Support URL | `https://cliniverse-ai-u7gi.vercel.app/support` | HOLD until RC production promotion and contact-route test |
| Privacy URL | `https://cliniverse-ai-u7gi.vercel.app/privacy` | HOLD until RC production promotion |
| Marketing URL | `https://cliniverse-ai-u7gi.vercel.app` | Optional; HOLD until RC production promotion |
| Copyright | Must match the verified legal rights-holder name in App Store Connect | Founder/legal confirmation required |
| Version / build | Copy from the final verified IPA only | Final IPA required |

## Description draft

Cliniverse AI is a clinical learning, simulation and workflow application for healthcare professionals, developed by NeuraOps.

The focused first release provides:

- a Home surface explaining the current safety boundary;
- a Care workspace using simulated virtual-ward information for follow-up, prioritization, documentation practice and human escalation;
- a clearly gated Intelligence surface that does not transmit content to third-party AI providers in this release;
- an Atlas catalog that classifies clinical reference, educational and future capabilities by release status;
- authenticated profile, plan, privacy and session controls under Me.

Cliniverse AI does not replace independent clinical judgment, local policy, supervision or emergency services. The submitted release is not cleared for real patient-identifiable information or protected health information. Users are instructed not to enter real patient data.

## App Review notes draft

Cliniverse AI is a sign-in-only release for healthcare professionals. Account creation is intentionally disabled. Please use the non-expiring review account supplied in App Store Connect's sign-in fields; credentials must never be committed to the repository or copied into public metadata.

Reviewer walkthrough:

1. Launch the app and sign in with the supplied email and password.
2. Home explains the release boundary and human-in-the-loop rule.
3. Open Care. All ward/patient content is fictional simulation data for workflow practice; no real patient data is permitted.
4. Open Intelligence. This surface is intentionally disabled in the submitted binary pending a separate AI disclosure, consent and clinical-safety review. It is not a loading failure.
5. Open Atlas to view release classifications for reference, educational and gated capabilities.
6. Open Me to review the authenticated profile, read-only plan state, privacy boundary and sign-out control.
7. Terms, Privacy and Support are available from the public release routes.

There is no digital Upgrade call to action and no in-app purchase flow in this release. The displayed plan is read-only and cannot activate itself. Apple Health/HealthKit, wearable permissions, advertising, tracking and real-patient-data workflows are not enabled.

## Reviewer access gate

- [ ] Provision one non-expiring reviewer account only after the production RLS migration passes its approved migration window and two-user isolation tests.
- [ ] Give the account only the entitlement needed to inspect the submitted surface; do not create a client-writable subscription path.
- [ ] Store username and password only in App Store Connect's protected sign-in fields.
- [ ] Test the account on a clean iPhone and iPad install immediately before submission.
- [ ] Confirm magic-link delivery is not required for the reviewer path.
- [ ] Confirm sign out and subsequent password sign in both work.

## Screenshot contract

Capture screenshots only from the final signed RC build after the production origin matches that build. Use the exact device slots required by App Store Connect at upload time.

Approved screenshot sequence:

1. Home — focused clinical learning/workflow purpose and real-patient-data boundary.
2. Care — visibly labelled simulation with human review/escalation language.
3. Care detail — simulated workflow/documentation state without fabricated LIVE claims.
4. Intelligence — truthful release-gated state.
5. Atlas — capability classification matching the binary.
6. Me — profile and read-only plan authority.

Screenshot rules:

- no production or real patient information;
- no demo credentials, email address, device notification, debug overlay or personal account data;
- no feature absent from the submitted binary;
- no fake metrics, testimonials, institutions, awards, accreditation or LIVE state;
- the installed icon and App Store icon must match the frozen Cliniverse mark;
- iPhone and iPad screenshots must show the actual layouts on those device classes, not resized composites.

## Final external checks

- [ ] Support mailbox receives and replies to a test message without exposing patient data or credentials.
- [ ] Support, Privacy and Terms return HTTP 200 on the production origin used by the native shell.
- [ ] App Store privacy answers match `native/privacy/PrivacyInfo.xcprivacy` and the final IPA scan.
- [ ] Content-rights, age-rating, encryption/export-compliance and category answers are confirmed in App Store Connect.
- [ ] Support contact name, email and international-format phone number are entered in protected App Review Information.
- [ ] Metadata and screenshots are rechecked after the final build number is selected.

## Submission decision

This document prepares the package; it does not authorize submission. Current decision remains **HOLD** until Runtime, Security, Native and reviewer-access gates all pass.

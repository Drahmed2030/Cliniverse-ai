# Apple RC1 Reviewer Package

Status: **PREPARED / HOLD — do not submit**

This package is the release-scoped source for App Store Connect metadata and reviewer instructions. Every item must be checked against the final signed IPA and production backend immediately before submission.

The recovered Wave 1 review findings, response draft and physical-device recording script are tracked in `docs/APPLE_WAVE1_RESPONSE_AND_EVIDENCE.md`.

## Product metadata draft

| Field | Release value | Gate |
| --- | --- | --- |
| App name | Cliniverse AI | Prepared |
| Subtitle | Clinical Learning & Workflow | Prepared — 28 characters |
| Primary category | Medical | Confirm in App Store Connect |
| Secondary category | Education | Confirm in App Store Connect |
| Promotional text | Clinical learning, simulation and workflow tools for healthcare professionals, with explicit human review and no real-patient-data boundary. | Prepared — 140 characters |
| Keywords | `clinical,simulation,workflow,medical,education,healthcare,ward,reference,clinician` | Prepared — 82 characters |
| Support URL | `https://www.cliniverseai.com/support` | Route is live; HOLD until the branded mailbox passes send/receive/reply testing |
| Privacy URL | `https://www.cliniverseai.com/privacy` | Canonical route is live; legacy alternate URLs must redirect here in the final production release |
| Marketing URL | `https://www.cliniverseai.com` | Optional; canonical production route is live |
| Copyright | Must match the verified legal rights-holder name in App Store Connect | Founder/legal confirmation required |
| Version / build | Version 1.0; use only the next signed candidate after privacy alignment | Build 55 is superseded; final IPA required |

## Identity and contact contract

Keep authentication, customer support and Apple account security as separate identities:

| Purpose | Release identity | Rule / gate |
| --- | --- | --- |
| App Review sign-in | The pre-provisioned `reviewer@cliniverseai.com` Supabase Auth user | Authentication identifier only. It is not a public mailbox and must appear only in protected App Store Connect sign-in fields. |
| Company operations mailbox | `operations@cliniverseai.com` | One real send/receive mailbox; HOLD until provisioned, 2FA-enabled and recovery details are founder-controlled. |
| Product support | `support@cliniverseai.com` | Alias of the operations mailbox; publish only after external send/receive/reply test passes. |
| Privacy requests | `privacy@cliniverseai.com` | Alias of the operations mailbox; use for privacy and account-data requests after the same mail test. |
| Apple review contact | `apple@cliniverseai.com` | Alias of the operations mailbox; enter in protected App Review Contact Information and monitor during review. |
| General enquiries | `hello@cliniverseai.com` | Alias of the operations mailbox; optional public company/product contact. |
| Apple Account primary email | Existing founder-controlled, 2FA-protected Apple Account address | Do not convert the Apple Account login into a shared support mailbox during RC1. A primary-email change is a separate security migration. |
| Seller / copyright | Exact verified legal rights holder in the enrolled Apple Developer team | `NeuraOps` may remain a product/operating brand, but must not replace the verified legal seller or copyright owner without legal-entity and rights confirmation. |

Mailbox provider decision for RC1: Namecheap Private Email Launch is the lowest-complexity fit for the existing domain. One mailbox and its aliases are sufficient for the addresses above. Do not rely on Namecheap's current forwarding-only MX setup as the final support channel because forwarding cannot send replies from the branded address.

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
5. Open Atlas to view release classifications for reference, educational and gated capabilities. Atlas is intentionally a release-status catalog in Apple v1, not an internal tool launcher. Tapping a capability updates the status message below the cards. Items labelled “Release candidate,” “Educational mode,” or “Not exposed in release” do not open a second screen in this build; this is the designed, fail-closed behavior and not a broken link or loading error.
6. Open Me to review the authenticated profile, read-only plan state, privacy boundary and sign-out control.
7. Terms, Privacy and Support are available from the public release routes.

There is no digital Upgrade call to action and no in-app purchase flow in this release. The displayed plan is read-only and cannot activate itself. The existing PRO Monthly product remains in Prepare for Submission and is not attached to this app version. It will be submitted only in a future version after StoreKit, Restore Purchases, server-authoritative entitlements and Sandbox testing are complete. Apple Health/HealthKit, wearable permissions, advertising, tracking and real-patient-data workflows are not enabled.

## Reviewer access gate

- [x] Production RLS migration passed its approved window; isolated two-user, rollback and recovery tests passed before production apply.
- [x] Confirmed at 2026-08-27 09:07 UTC that no dedicated production reviewer account currently exists and no reviewer session is active.
- [x] Enabled Supabase leaked-password protection and verified at 2026-08-27 09:07 UTC that the advisor warning is cleared.
- [x] Provisioned one new non-expiring reviewer account through the protected Supabase admin surface without reusing the stale secret visible in the rejected App Store Connect record.
- [x] Kept the reviewer account at the free/read-only entitlement state required by the current submitted surface; no subscription or client-writable entitlement path was created.
- [ ] Store username and password only in App Store Connect's protected sign-in fields.
- [ ] Test the account on a clean iPhone and iPad install immediately before submission.
- [x] Confirmed on the authoritative iPhone Safari preview that magic-link delivery is not required for the reviewer path; RC1 keeps the unavailable magic-link control hidden by default.
- [x] Confirmed password sign-in, reload restore, sign out and subsequent password sign in against production Auth. This web-preview evidence does not replace the native clean-install gate.

## Screenshot contract

Capture screenshots only from the final signed RC build after the production origin matches that build. Use the exact device slots required by App Store Connect at upload time.

Do not use `IMG_9446.png` through `IMG_9454.png`: those files show the internal executive-gate document rather than the app experience and contain obsolete Build 54-era wording.

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
- [ ] App Store privacy answers match the next candidate's `native/privacy/PrivacyInfo.xcprivacy` exactly: linked Name, Email Address and User ID; unlinked Other Diagnostic Data; App Functionality; no tracking.
- [ ] Content-rights, age-rating, encryption/export-compliance and category answers are confirmed in App Store Connect.
- [ ] Support contact name, email and international-format phone number are entered in protected App Review Information.
- [ ] Metadata and screenshots are rechecked after the final build number is selected.

## Submission decision

This document prepares the package; it does not authorize submission. Current decision remains **HOLD** until Runtime, Security, Native and reviewer-access gates all pass.

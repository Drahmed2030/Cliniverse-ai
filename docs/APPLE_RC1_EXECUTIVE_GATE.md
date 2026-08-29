# Apple RC1 Executive Gate

> **Status:** BUILD 56 READY / SUBMISSION HOLD  
> **Last verified:** 2026-08-29  
> **Submission authority:** This record does not authorize App Store submission.

This is the mobile-friendly executive release record for Cliniverse AI Apple v1.
It separates completed release evidence from physical-device and operational
evidence that still must be collected before submission.

## Executive summary

### Ready

- Product: **Cliniverse AI**
- Public version: **1.0**
- Candidate: **Build 56**
- Bundle ID: `com.cliniverse.ai`
- Release branch: `integration/auth-release-shell-v1`
- Release commit: `b8049a43bd0a12a044a878d0c6e9104efecd788d`
- Production domain: `https://www.cliniverseai.com`
- App Store Connect processing: **Complete / Ready to Submit**
- Internal TestFlight group: **CLiniverse Internal RC**
- Store version build: **Build 56 attached**
- Release mode: **Manual release**

### Submission hold

- Clean-install device matrix is not complete for both iPhone and iPad.
- Final App Store screenshots must be captured from Build 56.
- The branded support mailbox must pass send, receive, and reply testing.
- The live Apple rejection response must be answered with attached evidence.
- The founder must give a separate, immediate approval before submission.

## Release evidence completed

### Signed build and packaging

- [x] Codemagic produced version 1.0, Build 56.
- [x] Codemagic build ID: `6a92e3b811353846de027ce2`.
- [x] App Store upload delivery UUID:
  `5f659ea8-c6dd-4444-b9a4-f9b1e2b19f5f`.
- [x] IPA identity and packaging checks passed.
- [x] `PrivacyInfo.xcprivacy` was packaged in the application target.
- [x] Native cold-launch and icon-source contracts were packaged.
- [x] App Store Connect reports the binary as Validated.
- [x] Supported device family is iPhone and iPad.
- [x] Supported architecture is arm64.
- [x] Non-exempt encryption is declared as **No**.
- [x] No HealthKit or deferred application entitlement appears in the validated
  App Store metadata.

### Production alignment

- [x] Production release contract reports `apple-v1`.
- [x] Production release contract reports commit
  `b8049a43bd0a12a044a878d0c6e9104efecd788d`.
- [x] `/`, `/support`, `/privacy`, and `/terms` respond on the canonical domain.
- [x] No recent Vercel runtime error was observed during the release check.
- [x] Cardio and Nexus remain outside Apple v1.
- [x] Advanced clinical AI remains release-gated.

### App Store Connect alignment

- [x] Build 56 is attached to app version 1.0.
- [x] Build 56 is available to **CLiniverse Internal RC**.
- [x] TestFlight instructions identify Build 56 as Apple RC1.
- [x] Review Notes explain the educational boundary and the intentional Atlas
  release-gated states.
- [x] Reviewer credentials are stored only in protected App Store Connect
  fields.
- [x] Review contact information is saved.
- [x] Apple and Google sign-in are described as not configured in v1.
- [x] Cardio, Nexus, subscriptions, and paid paths are described as deferred.
- [x] Manual release remains selected.
- [x] No subscription or in-app purchase is attached to version 1.0.

### Privacy alignment

- [x] Privacy Policy URL is `https://www.cliniverseai.com/privacy`.
- [x] Name: linked to identity, App Functionality, no tracking.
- [x] Email Address: linked to identity, App Functionality, no tracking.
- [x] User ID: linked to identity, App Functionality, no tracking.
- [x] Other Diagnostic Data: not linked to identity, App Functionality, no
  tracking.
- [x] The published App Store privacy label matches the Build 56 privacy
  manifest.

## Apple concern controls

### Guideline 1.5 — Developer information

**Implemented**

- Canonical Support, Privacy, and Terms destinations are present.
- The rejected Vercel support URL was replaced by the company domain.

**Still required**

- [ ] Send a message to the branded support mailbox.
- [ ] Confirm receipt.
- [ ] Reply from the branded mailbox.
- [ ] Record the successful round trip.

**Gate:** HOLD

### Guideline 2.1 — App completeness

**Implemented**

- Focused sign-in-only RC shell.
- Branded native launch guard and bounded connection recovery.
- Truthful disabled and release-gated states.
- Fictional simulation boundary and no real-patient-data instruction.

**Still required**

- [ ] Clean install Build 56 on iPhone.
- [ ] Clean install Build 56 on iPad.
- [ ] Record normal, slow, offline, reconnect, and resume flows.
- [ ] Verify reviewer sign-in and restored session on both device classes.

**Gate:** HOLD

### Guideline 2.3.8 — Accurate metadata

**Implemented**

- Build 56 and the canonical production release are aligned.
- Review Notes disclose the actual v1 scope.
- Atlas release-gated cards are explained as intentional, not broken links.
- Cardio and Nexus are explicitly excluded from v1.

**Still required**

- [ ] Replace all legacy Build 6 screenshots with Build 56 captures.
- [ ] Confirm every screenshot shows only available v1 behavior.
- [ ] Ensure the installed icon and Store icon are recognizably consistent.

**Gate:** HOLD

## Physical-device verification

Record the device model, OS version, evidence reference, and result for every
item below. Never expose the reviewer password in recordings.

### iPhone

- [ ] Clean install and installed icon
- [ ] Cold launch on a normal network
- [ ] Slow-network launch
- [ ] Offline launch, then reconnect
- [ ] Background and foreground recovery
- [ ] Reviewer sign-in and authentication restore
- [ ] Home → Care → Intelligence → Atlas → Me
- [ ] Terms, Privacy, and Support links
- [ ] Sign out and sign in again

### iPad

- [ ] Clean install and installed icon
- [ ] Cold launch on a normal network
- [ ] Slow-network launch
- [ ] Offline launch, then reconnect
- [ ] Background and foreground recovery
- [ ] Reviewer sign-in and authentication restore
- [ ] Home → Care → Intelligence → Atlas → Me
- [ ] Terms, Privacy, and Support links
- [ ] Sign out and sign in again

## App Store screenshot contract

Capture distinct screenshots directly from signed Build 56. Do not use this
executive-gate document as product-page media.

Required sequence:

1. Home
2. Care
3. Care detail
4. Intelligence
5. Atlas
6. Me

Each capture must:

- show the same Build 56 experience Apple will review;
- avoid passwords, email addresses, patient data, and internal identifiers;
- avoid claims of autonomous diagnosis, prescribing, or authorization;
- avoid Cardio, Nexus, subscriptions, and other deferred features;
- use fictional simulation content only;
- be captured for each device class required by App Store Connect.

The images `IMG_9446.png` through `IMG_9454.png` are internal captures of an
older executive-gate document. They are not App Store screenshots.

## App Store completion checklist

- [x] Attach Build 56 to version 1.0.
- [x] Store the review account in protected fields.
- [x] Save reviewer contact information.
- [x] Save truthful Review Notes.
- [x] Publish the matching App Privacy answers.
- [x] Verify Support, Privacy, and Terms URLs.
- [ ] Record exact tested device and OS combinations.
- [ ] Upload six distinct Build 56 screenshots for required device classes.
- [ ] Add a protected continuous review recording link if used.
- [ ] Verify age rating, category, content rights, copyright, and regulated
  medical-device status.
- [ ] Keep PRO Monthly in Prepare for Submission and detached from Apple v1.
- [ ] Match the final response to Apple’s live rejection message.
- [ ] Verify every past-tense response claim has evidence.

## Platform advisory

Build 56 declares minimum iOS 13.0. Apple accepted and validated this build.
Apple’s upload warning states that submissions in Spring 2027 will require a
minimum deployment target of iOS 15.0. This is not a current Build 56 blocker,
but the next development baseline should move to iOS 15 or later.

## Decision rule

Change this record to **GO** only when:

1. the iPhone and iPad matrices pass;
2. the branded support mailbox passes send, receive, and reply;
3. Build 56 screenshots and any review recording are complete;
4. Apple metadata and regulated-product declarations are verified;
5. the response is matched to the live Apple message; and
6. the founder gives explicit, immediate approval to submit.

Until then: **HOLD / NO APP STORE SUBMISSION**.

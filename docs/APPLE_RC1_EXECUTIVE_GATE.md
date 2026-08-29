# Apple RC1 Executive Gate

Status: **CODE PASS / SUBMISSION HOLD**

Last verified: **2026-08-29**

This is the executive release record for Cliniverse AI Apple v1. It separates evidence already proved by the repository and production release from evidence that can only be collected from the final signed IPA, physical devices and App Store Connect. It does not authorize submission.

## Release identity

| Item | Approved value | Evidence state |
| --- | --- | --- |
| Product | Cliniverse AI | Verified |
| Public version | 1.0 | Verify again from final IPA |
| Candidate build | 55 | Superseded for submission planning after signed-IPA privacy inspection; do not attach to the app version |
| Release branch | `integration/auth-release-shell-v1` | Verified |
| Production source | Remote commit `2ad7dba` | Verified deployment record |
| Local evidence tree | `99de6242f61b2ff763040e564c99c6495aff594a` | Identical to remote release tree |
| Deferred product work | Cardio/Nexus PR #16 | Must remain outside Apple v1 |

Live App Store Connect verification on 2026-08-29 showed that the rejected version still references version 1.0, Build 6. Build 55 is the latest validated upload, has bundle ID `com.cliniverse.ai`, supports iPhone and iPad, declares no non-exempt encryption, and exposes only the application/team and TestFlight entitlements shown by Apple. Build 55 is not yet attached to the rejected app version.

Codemagic's authenticated success notification proves that Build 55 was produced from branch `integration/auth-release-shell-v1` by workflow `ios-workflow` at 2026-08-28 19:26 UTC. The notification links to Codemagic build ID `6a91e02c5f6df79570c4de2c`. Build 54 immediately before it failed in the same workflow at the canonical-origin verification step; it was never an App Store candidate.

The signed Build 55 IPA was downloaded from that authenticated Codemagic artifact and inspected on 2026-08-29. SHA-256: `f3d4909d975c71ee812386acfb2a035b10c1645b5c88d7e11d2a037542578eda`. It proves version 1.0 (55), bundle ID `com.cliniverse.ai`, HTTPS origin `https://www.cliniverseai.com`, cleartext disabled, no sensitive-permission purpose strings and a bundled privacy manifest identical to the release source. The manifest, however, declares Purchase History, Coarse Location, Other Data, Product Interaction and Other Diagnostic Data while the current App Store privacy label declares only Name and Email Address. Because RC1 has no StoreKit path and does not use several of those declared categories, Build 55 is superseded rather than submitted with an inaccurate or internally inconsistent label.

Draft PR #18 (`fix/apple-rc1-privacy-alignment`) narrows the release profile to Name/Email, aligns the privacy notice, declares linked Name, Email and User ID plus unlinked Other Diagnostic Data, removes unused categories and fixes the pre-existing Next.js route-export build failure. Its release tests pass 48/48, targeted lint passes and the production Next.js build completes. A new signed build is required after controlled merge and production deployment; provisional target: Build 56 or the next unused App Store build number.

Production route check on 2026-08-29: `/`, `/support`, `/privacy` and `/terms` returned HTTP 200 from `https://www.cliniverseai.com`. The branded support mailbox send/receive/reply gate remains open.

## Executive evidence matrix

| Apple concern | Implemented control | Evidence already available | Required before submission | Gate |
| --- | --- | --- | --- | --- |
| Guideline 2.1 — information needed | Focused sign-in-only shell; truthful disabled states; fictional simulation boundary | Release contract tests pass; production candidate is live | Supply Apple's seven requested items in Review Notes and a continuous physical-device recording | HOLD |
| Guideline 2.1(a) — blank launch | Branded native launch guard, 15-second bounded recovery and packaged offline page | Pipeline contract and source tests pass | Reproduce Apple's device class: iPad Air 11-inch (M3), iPadOS 26.6, active network; also test iPhone, slow and offline/reconnect | HOLD |
| Guideline 2.3.8 — placeholder icon | Frozen `assets/logo.svg`, deterministic native asset generation and archive markers | Source hash and generation contract pass | Inspect Build 55 IPA asset catalog and installed icon on iPhone/iPad; ensure Store and installed icons are recognizably consistent | HOLD |
| Guideline 2.3.3 — screenshots | Apple supplied this as preventive guidance, not an active rejection reason; six-screen contract: Home, Care, Care detail, Intelligence, Atlas, Me | Screen sequence and content rules documented | Replace the ten legacy Build 6 screenshots with distinct final-build captures for required device classes | HOLD |
| Review access | Pre-provisioned, non-expiring, sign-in-only reviewer account | Production web auth, restore and sign-out previously verified | Clean-install sign-in on iPhone and iPad; store credentials only in protected App Store Connect fields | HOLD |
| Account deletion | No account creation in Apple v1 | UI and auth contract prevent implicit account creation | Reconfirm no sign-up path in final IPA and explain this in Review Notes | HOLD |
| Subscriptions / IAP | No Upgrade action or purchase flow; plan is read-only | Release tests and reviewer package pass | Remove stale subscription metadata in App Store Connect; visually verify final IPA | HOLD |
| Sensitive permissions | No HealthKit, camera, microphone, location or photo-library feature in Apple v1 | Privacy/configuration source contract passes | Inspect generated `Info.plist`, entitlements and privacy manifest inside final IPA | HOLD |
| Clinical/AI claims | Educational/workflow support only; human review explicit; third-party AI blocked | Release boundary and API fail-closed tests pass | Confirm metadata, screenshots and Review Notes make no autonomous diagnosis, prescription or authorization claim | HOLD |
| Guideline 1.5 — Support URL | App Store Connect now contains `https://www.cliniverseai.com/support`, replacing the rejected Vercel URL | Canonical Support, Privacy and Terms route contracts pass; all four canonical routes returned HTTP 200 on 2026-08-29 | External send/receive/reply test for the branded support mailbox; legal owner confirmation | HOLD |
| Publishing safety | Codemagic has no automatic TestFlight/App Store submission | Automated publishing contract passes | Preserve settings until explicit founder approval after every gate passes | PASS |

## Automated verification recorded

Command:

```text
node --test tests/*.test.mjs
```

Result on 2026-08-29: **48 tests passed, 0 failed**.

The suite covers deterministic native packaging contracts, launch recovery, icon authority, HTTPS transport, release-origin pinning, reviewer-package credential hygiene, functional release interactions, authentication/profile ownership, RLS boundaries, subscription authority, privacy/terms routes, deferred AI/API blocking and prevention of automatic Apple publishing.

## Manual evidence run

Complete this matrix using the next signed candidate produced after PR #18 is approved, merged and deployed. Build 55 must not be used for submission. Repeat the entire matrix whenever the candidate build number changes.

The nine uploaded images `IMG_9446.png` through `IMG_9454.png` were inspected on 2026-08-29. They are captures of an earlier executive-gate document, display Build 54-era text, and do not show the submitted app UI. They are internal working evidence only and must not be uploaded as App Store product screenshots or used as the requested physical-device core-flow recording.

| Check | iPhone model / OS | iPad model / OS | Evidence | Result |
| --- | --- | --- | --- | --- |
| Clean install and installed icon | _Required_ | _Required_ | Screenshot/video | PENDING |
| Cold launch on normal network | _Required_ | _Required_ | Video | PENDING |
| Slow network launch | _Required_ | _Required_ | Video or internal QA record | PENDING |
| Offline launch then reconnect | _Required_ | _Required_ | Video | PENDING |
| Background/foreground recovery | _Required_ | _Required_ | Video or internal QA record | PENDING |
| Reviewer sign-in and auth restore | _Required_ | _Required_ | Video, no visible password | PENDING |
| Home → Care → Intelligence → Atlas → Me | _Required_ | _Required_ | Continuous review video | PENDING |
| Terms, Privacy and Support | _Required_ | _Required_ | Video/screenshots | PENDING |
| Sign out and sign in again | _Required_ | _Required_ | Internal QA record | PENDING |

## Final IPA inspection

- [x] App Store Connect reports version 1.0, Build 55 as Validated; it is retained only as superseded evidence.
- [ ] The next signed candidate is matched to the approved Apple RC source and production origin.
- [ ] Bundle identifier and signing team match the App Store Connect record.
- [ ] Installed and App Store icons match the frozen Cliniverse mark.
- [ ] `PrivacyInfo.xcprivacy` is bundled in the final application target.
- [ ] `Info.plist` contains no unapproved sensitive-permission purpose strings.
- [ ] Entitlements contain no HealthKit or other deferred capability.
- [ ] Encryption/export-compliance answer matches the binary.
- [ ] Release origin is `https://www.cliniverseai.com` and cleartext transport is disabled.

## App Store Connect completion

- [ ] Compare the live App Review message with `APPLE_WAVE1_RESPONSE_AND_EVIDENCE.md`; do not rely on recalled wording.
- [ ] Enter the reviewer account only in protected sign-in fields.
- [ ] Enter tested device/OS combinations and exact setup steps.
- [ ] Upload six distinct screenshots from the final signed build for the required device classes.
- [ ] Add the protected continuous recording link.
- [ ] Verify Support, Privacy and Terms URLs.
- [ ] Confirm App Privacy answers match the next signed IPA exactly: linked Name, Email Address and User ID; unlinked Other Diagnostic Data; App Functionality; no tracking. Also confirm age rating, category, content rights, seller/copyright and regulated-medical-device status.
- [ ] For Medical/Health distribution in the EU/EEA, UK or U.S., complete Apple's 2026 regulated-medical-device declaration accurately; the current product position is not a medical-device authorization claim.
- [ ] Keep the existing PRO Monthly product in Prepare for Submission and do not attach it to Apple v1.
- [ ] State explicitly that Apple v1 contains no subscription purchase or paid-feature path; PRO Monthly is deferred to a future version after StoreKit, Restore Purchases, server-authoritative entitlements and Sandbox testing are complete.
- [ ] Re-read the complete response and verify every past-tense claim has attached evidence.

## Decision rule

Change this record to **GO** only when:

1. the final IPA inspection is complete;
2. both iPhone and iPad matrices pass;
3. the branded support mailbox passes send/receive/reply;
4. App Store Connect metadata and protected reviewer access are complete;
5. the response is matched to the live Apple message; and
6. the founder gives explicit approval to submit.

Until then: **HOLD / NO APP STORE SUBMISSION**.

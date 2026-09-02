# Native privacy manifest authority

This directory is the source-of-truth location for the Cliniverse iOS privacy manifest used by release-candidate builds.

## Release rule

Do **not** create or ship `PrivacyInfo.xcprivacy` from assumptions.

Before RC1, the manifest must be produced from an evidence review of:
- the final generated iOS app target;
- Capacitor and bundled native SDKs/frameworks;
- required-reason API usage;
- actual data collected by the submitted release;
- App Store Connect privacy answers.

The evidence-reviewed RC1 candidate now lives at:

`native/privacy/PrivacyInfo.xcprivacy`

Codemagic copies that file into the generated Capacitor iOS app after `npx cap add ios`, adds it explicitly to the App target's Copy Bundle Resources phase, and validates it before archiving. Every iOS package build fails closed if the authoritative manifest is missing.

The checked-in/generated `ios/` directory is not authoritative because the current Codemagic workflow recreates it on every build.

## Current release boundary
- No real patient-identifiable information is permitted in Apple v1.
- Third-party clinical AI is gated off by default.
- HealthKit/wearable integrations are not part of the accepted RC surface until separately reviewed.
- Tracking/advertising must not be declared or enabled unless independently verified in the final binary.

## Evidence used for the RC1 candidate

- Active release code collects an authenticated email address and account user ID through Supabase Auth.
- The submitted RC1 profile surface stores only a linked profile name. Specialty and country editing are excluded from the RC1 UI.
- The StoreKit release path sends verified Apple transaction evidence to the Cliniverse server and stores derived subscription lineage linked to the authenticated account. Purchase history is therefore declared for app functionality.
- The app-level manifest includes linked name, email address, account user ID and purchase history plus unlinked technical diagnostic data for app functionality. Provider-side request/security processing must be kept consistent with the published privacy notice and provider configuration.
- No advertising or tracking SDK is present in the submitted dependency set.
- Native-source inspection found no app or bundled Capacitor/Cordova use of Apple's required-reason API categories. The app manifest therefore has an empty `NSPrivacyAccessedAPITypes` candidate, while dependency manifests remain independently packaged.
- HealthKit, wearable, camera, microphone, location and photo-library capabilities are outside Apple v1. The IPA gate fails if corresponding usage-description keys appear.

## Verification
The final IPA must still be inspected after archive creation. Presence of a manifest alone is not a PASS; its declarations must match the final binary and App Store Connect metadata.

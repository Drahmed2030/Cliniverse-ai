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

When approved, the authoritative file must live at:

`native/privacy/PrivacyInfo.xcprivacy`

Codemagic copies that file into the generated Capacitor iOS app after `npx cap add ios` and before archiving. RC builds fail closed if the authoritative manifest is missing.

The checked-in/generated `ios/` directory is not authoritative because the current Codemagic workflow recreates it on every build.

## Current release boundary
- No real patient-identifiable information is permitted in Apple v1.
- Third-party clinical AI is gated off by default.
- HealthKit/wearable integrations are not part of the accepted RC surface until separately reviewed.
- Tracking/advertising must not be declared or enabled unless independently verified in the final binary.

## Verification
The final IPA must be inspected after archive creation. Presence of a manifest alone is not a PASS; its declarations must match the binary and App Store Connect metadata.

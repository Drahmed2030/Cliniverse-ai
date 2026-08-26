# Native Privacy & Required-Reason API Audit v1

Status: **HOLD for RC1**

This document records the current evidence boundary for Cliniverse AI iOS privacy packaging. It does not declare Apple privacy answers from assumptions.

## Verified current architecture

- Capacitor app identifier: `com.cliniverse.ai`.
- App name: `Cliniverse AI`.
- The native shell loads the authoritative HTTPS web surface at `https://cliniverse-ai-u7gi.vercel.app` with cleartext disabled.
- Codemagic deletes and regenerates the iOS project on each build (`rm -rf ios` followed by `npx cap add ios`).
- Therefore checked-in files under `ios/` are not the release authority.
- The release-authoritative privacy manifest location is `native/privacy/PrivacyInfo.xcprivacy`.
- That authoritative file is currently **absent**.
- Codemagic fails closed for `RELEASE_CANDIDATE=true` when the authoritative privacy manifest is absent.
- Final IPA verification requires a bundled `PrivacyInfo.xcprivacy`, valid identity/version/encryption metadata and compiled assets.

## Important finding

The checked-in generated `ios/App/App/PrivacyInfo.xcprivacy` currently contains empty accessed-API and collected-data declarations. It must **not** be treated as evidence for App Store submission because the iOS project is recreated during the real build and because final declarations must match the generated binary and App Store Connect privacy answers.

## RC1 evidence required before freezing the manifest

1. Build the final iOS archive from the release-candidate dependency set.
2. Inspect the generated app/IPA for Apple required-reason API usage from Capacitor and every bundled native SDK/framework.
3. Inspect actual runtime data flows in the submitted release, including authentication/profile/subscription/progress and any analytics or diagnostics that are truly enabled.
4. Confirm that release-gated AI, HealthKit/wearables, tracking and advertising are not accidentally bundled or enabled as active submitted behavior.
5. Produce `native/privacy/PrivacyInfo.xcprivacy` from verified evidence only.
6. Verify the final IPA contains the approved manifest after archive creation.
7. Make App Store Connect privacy answers match the binary and the approved manifest.

## Product boundary for Apple v1

- No real patient-identifiable information is permitted.
- Human review remains required.
- Third-party clinical AI is disabled by default in the release lane.
- Connected health / wearable claims are outside the accepted Apple v1 surface until separately validated.
- No tracking or advertising should be declared or enabled unless independently verified.

## Release decision

**Current decision: HOLD.**

Do not promote PR #13 to `release/cliniverse-rc1` on privacy-manifest evidence alone. Promotion still requires runtime trust/RLS evidence and native cold-launch/device testing in addition to this gate.

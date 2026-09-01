# Native Privacy & Required-Reason API Audit v1

Status: **HOLD for RC1**

This document records the current evidence boundary for Cliniverse AI iOS privacy packaging. It does not declare Apple privacy answers from assumptions.

## Verified current architecture

- Capacitor app identifier: `com.cliniverse.ai`.
- App name: `Cliniverse AI`.
- The native shell loads the authoritative HTTPS web surface at `https://www.cliniverseai.com` with cleartext disabled.
- Codemagic deletes and regenerates the iOS project on each build (`rm -rf ios` followed by `npx cap add ios`).
- Therefore checked-in files under `ios/` are not the release authority.
- The release-authoritative privacy manifest location is `native/privacy/PrivacyInfo.xcprivacy`.
- The evidence-reviewed RC1 candidate is present at that authoritative path.
- Codemagic now fails closed on every iOS package build when the authoritative privacy manifest is absent.
- A dedicated Xcode-project injection script adds the manifest to the App target's Copy Bundle Resources phase; a filesystem copy alone is not accepted as proof of packaging.
- Final IPA verification requires a bundled `PrivacyInfo.xcprivacy`, valid identity/version/encryption metadata and compiled assets.

## Evidence-reviewed RC1 candidate

The checked-in generated `ios/App/App/PrivacyInfo.xcprivacy` is still non-authoritative because CI recreates `ios/`. The authoritative RC1 candidate declares linked name, email and user ID plus unlinked technical diagnostic data for app functionality. Specialty/country editing, StoreKit purchase history, app analytics and tracking are outside the submitted RC1 surface. Tracking is false and no tracking domains are declared.

Repository and dependency-source inspection found no use of the required-reason API categories in the app, Capacitor iOS 6.2.1, or the bundled Cordova compatibility source. Their packaged SDK privacy manifests also declare no accessed API categories. The app-level candidate therefore keeps `NSPrivacyAccessedAPITypes` empty. This remains subject to a final archive/binary scan.

## RC1 evidence required before freezing the manifest

1. Build the final iOS archive from the frozen release-candidate dependency set.
2. Scan the generated app/IPA for required-reason API use and compare all bundled SDK manifests with the app manifest.
3. Confirm that gated AI, HealthKit/wearables, tracking and advertising are absent from the submitted binary and active behavior.
4. Verify the final IPA contains the app-level manifest at the app-bundle root.
5. Make App Store Connect privacy answers match the binary and the approved manifest exactly.

## Product boundary for Apple v1

- No real patient-identifiable information is permitted.
- Human review remains required.
- Third-party clinical AI is disabled by default in the release lane.
- Connected health / wearable claims are outside the accepted Apple v1 surface until separately validated.
- No tracking or advertising should be declared or enabled unless independently verified.

## Release decision

**Current decision: HOLD.**

Do not promote PR #13 to `release/cliniverse-rc1` on source-level privacy-manifest evidence alone. Promotion still requires the final signed IPA scan, runtime trust/RLS evidence and native cold-launch/device testing.

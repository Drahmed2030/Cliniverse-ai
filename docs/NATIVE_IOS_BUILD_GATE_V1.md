# Native iOS Build Gate v1

Status: **HOLD before RC1 / App Store resubmission**

This gate exists because an iOS build can compile successfully while still failing Apple review through placeholder assets, launch-state failures, or packaging drift.

## Verified repository/build facts

1. `capacitor.config.json` points the native container at the remote production web URL `https://cliniverse-ai-u7gi.vercel.app`.
2. The current Codemagic workflow runs `rm -rf ios` and then `npx cap add ios` for every iOS build.
3. Therefore the generated native Xcode project is recreated during CI and cannot be assumed to preserve files committed under `ios/` unless the workflow explicitly injects them after regeneration.
4. The current workflow does not contain a deterministic step that installs the final approved AppIcon asset catalog after `npx cap add ios`.
5. Apple has reported placeholder app icons and a blank launch on an iPad review device. These findings remain open until verified on the generated native artifact.
6. Automatic App Store submission is disabled on the active integration lane. Release publishing must be explicitly enabled only from an approved release-candidate workflow.

## Executive release rule

A green Next.js/Vercel build is not evidence that the generated iOS archive has the correct icons, privacy manifest, Info.plist configuration, launch behavior, signing configuration, or device compatibility.

No `release/cliniverse-rc1` promotion and no App Store submission until all native checks below have evidence.

## Gate A — deterministic native assets

- [ ] Final Cliniverse/NeuraOps-approved AppIcon source is frozen.
- [ ] A complete iOS AppIcon asset catalog is generated from that source.
- [ ] Codemagic explicitly copies the final AppIcon assets **after** `npx cap add ios` and before the archive is built.
- [ ] The archived app is inspected to confirm the expected icon set is present.
- [ ] No default Capacitor/placeholder icon remains in the distributable artifact.

## Gate B — native privacy/configuration packaging

- [ ] The privacy manifest required by the current native dependencies is injected or generated after native-project regeneration.
- [ ] The generated `Info.plist` is inspected from the build artifact, not assumed from repository files.
- [ ] Any required usage-description keys are present only for capabilities that are actually enabled.
- [ ] HealthKit / wearable permissions are absent until the real integration and permission UX are approved.
- [ ] Encryption/export-compliance values are reviewed for the actual release configuration.

## Gate C — launch reliability

Because the native shell currently loads a remote URL, cold launch depends on remote availability and WebView/network readiness. The release must prove a recoverable experience rather than a blank WebView.

Required tests:

- [ ] Clean install → cold launch on supported iPhone.
- [ ] Clean install → cold launch on supported iPad, including an 11-inch class device.
- [ ] Launch on normal connection.
- [ ] Launch on slow connection.
- [ ] Launch with connection temporarily unavailable, then restored.
- [ ] Background → foreground recovery.
- [ ] Authentication restore after app termination.
- [ ] No white/black blank state without a visible loading or recoverable error state.

If the remote-container architecture cannot provide a reliable failure state when the remote origin is unavailable, a native/local fallback strategy must be implemented before RC1 rather than relying on web-level error UI alone.

## Gate D — App Review package

- [ ] App Store icon matches the installed-device icon family.
- [ ] Support URL points to the final `/support` page and its contact route is verified functional.
- [ ] Privacy URL points to the canonical `/privacy` page.
- [ ] Terms and Privacy links are functional from the sign-in surface.
- [ ] App metadata uses factual release-scoped language only.
- [ ] Reviewer notes explain the product structure and the no-real-patient-data release boundary.
- [ ] Reviewer account/instructions are prepared if login is required.

## Publishing safety

The integration workflow must keep:

- `submit_to_testflight: false`
- `submit_to_app_store: false`

Publishing is a separate explicit release action after RC1 passes all gates.

## RC1 promotion condition

**GO only when:** web CI/build PASS + runtime Auth/Profile/RLS evidence PASS + subscription boundary resolved + deterministic native packaging PASS + iPhone/iPad launch QA PASS + App Review support/privacy/icon package PASS.

Until then: **HOLD / NO APP STORE SUBMISSION.**

# Native iOS Build Gate v1

Status: **HOLD before RC1 / App Store resubmission**

This gate exists because an iOS build can compile successfully while still failing Apple review through placeholder assets, launch-state failures, or packaging drift.

## Verified repository/build facts

1. `capacitor.config.json` points the native container at the canonical production web URL `https://www.cliniverseai.com`.
2. Codemagic verifies `/api/release-contract` on that origin reports the exact `CM_COMMIT` and the production environment before generating the native project.
3. The Codemagic workflow runs `rm -rf ios` and then `npx cap add ios` for every iOS build.
4. Therefore the generated native Xcode project is recreated during CI and cannot be assumed to preserve files committed under `ios/` unless the workflow explicitly injects them after regeneration.
5. The integration lane now has a deterministic product-icon source at `assets/logo.svg` and runs pinned `@capacitor/assets@3.0.5` **after** `npx cap add ios` to generate the iOS asset catalog.
6. Apple has reported placeholder app icons and a blank launch on an iPad review device. The placeholder-icon root cause is now addressed at pipeline-contract level, but the Apple finding remains open until the generated archive is inspected and the icon is visually verified on an installed build.
7. Automatic TestFlight and App Store submission are disabled on the active integration lane. Release publishing must be explicitly enabled only from an approved release-candidate workflow.
8. The tracked legacy `ios/App/App/PrivacyInfo.xcprivacy` is not authoritative for CI because `ios/` is deleted before native generation. The evidence-reviewed source now lives at `native/privacy/PrivacyInfo.xcprivacy` and is explicitly injected into the generated App target.
9. The native shell now packages `native-offline.html` through Capacitor `server.errorPath` and uses a dark native background, providing a local, retryable state when the remote origin cannot load.
10. The build lane pins patched `tar`, `uuid` and `sharp` transitive versions. A version-locked postinstall compatibility patch adapts Capacitor CLI 6.2.1 to the secure `tar` 7 export shape and fails closed if the expected source changes.
11. The generated Capacitor bridge now receives an authoritative native launch guard from `native/ios/AppDelegate.swift`. The generated storyboard is bound to that controller after every `npx cap add ios`; the branded native surface remains visible until the remote page or packaged recovery page finishes loading.
12. The prior `--logoSplashScale 0.65` value scaled from the 512px source rather than the 2732px launch canvas, producing only a 332px mark. RC1 now uses a deterministic 960px launch-art target width suitable for iPhone and iPad review evidence.
13. `assets/logo.svg` is the frozen icon authority. Codemagic verifies its SHA-256 contract, all public icon variants must derive from it, and the final IPA carries both the icon-source and native-launch contract markers for archive verification.

## Executive release rule

A green Next.js/Vercel build is not evidence that the generated iOS archive has the correct icons, privacy manifest, Info.plist configuration, launch behavior, signing configuration, or device compatibility.

No `release/cliniverse-rc1` promotion and no App Store submission until all native checks below have evidence.

## Gate A — deterministic native assets

- [x] A versioned Cliniverse product-icon source exists outside the regenerated `ios/` directory (`assets/logo.svg`).
- [x] Codemagic generates the iOS AppIcon catalog after `npx cap add ios` using pinned `@capacitor/assets@3.0.5`.
- [x] CI contains a file-existence assertion for `AppIcon.appiconset/Contents.json`.
- [x] Generated 1024×1024 AppIcon and dark launch artwork were visually inspected: the Cliniverse mark is present, opaque and not a Capacitor placeholder; NeuraOps remains the parent identity.
- [x] Web/PWA icon variants are deterministic derivatives of the same frozen `assets/logo.svg` source used by native asset generation.
- [ ] The generated/archive artifact is inspected to confirm the expected icon set is present.
- [ ] A clean-installed iPhone/iPad build shows the expected icon and no default Capacitor/placeholder icon.

## Gate B — native privacy/configuration packaging

- [x] Create an authoritative privacy-manifest source outside the regenerated `ios/` directory from the active data-flow and dependency-source audit.
- [x] Inject that manifest into the generated App target's Copy Bundle Resources phase after native-project regeneration.
- [ ] Inspect the generated `Info.plist` from the build artifact, not from deleted/recreated repository paths.
- [ ] Any required usage-description keys are present only for capabilities that are actually enabled.
- [ ] HealthKit / wearable permissions are absent until the real integration and permission UX are approved.
- [ ] Encryption/export-compliance values are reviewed for the actual release configuration.

The existing legacy privacy manifest declares no collected data and must not be promoted blindly while the product has authenticated account/profile/progress data. Its accuracy is a separate release check.

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

The repository now includes a local branded failure page wired through Capacitor `server.errorPath`, with manual and online-event retry. A native launch guard preserves the same branded launch artwork while the initial remote navigation is pending and forces the local recovery page after a bounded 15-second wait. Its actual behavior must still pass the clean-install/offline/reconnect device matrix before this gate changes to PASS.

## Gate D — App Review package

- [ ] App Store icon matches the installed-device icon family.
- [ ] Support URL points to the final `/support` page and its contact route is verified functional.
- [x] Privacy route exists at `/privacy` with release-scoped, non-overclaiming language.
- [x] Terms route exists at `/terms`.
- [x] Terms and Privacy links are functional from the sign-in surface.
- [x] Public web metadata/manifest use factual release-scoped language and remove stale social-proof/seniority claims.
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

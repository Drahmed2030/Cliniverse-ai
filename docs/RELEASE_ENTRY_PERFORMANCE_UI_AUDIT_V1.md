# Cliniverse Release Entry Performance & UI Audit v1

Status: **CONTROLLED / PRE-RC1**

## Executive objective
Keep Apple-facing startup fast, deterministic and easy to understand while aligning the first-run experience with the NeuraOps / Cliniverse release identity.

## Verified legacy risks
- The previous web splash imposed a 2200 ms decorative delay before continuing.
- The previous splash used a pulse/ECG-style mark that conflicted with the selected geometric Cliniverse C identity and could imply monitoring/measurement.
- The previous onboarding depended on multiple full-screen remote Unsplash images, increasing network dependence and first-run variability.
- The previous onboarding advertised product surfaces or claims that are not approved for RC1, including Clinical OS / virtual hospital language, exam acronyms, multi-AI support, global learning-network language, Afia patient mode and PRO/advanced AI consensus.

## Implemented corrections
### Splash
- Default web splash duration reduced to 700 ms.
- No remote image or animation dependency.
- Uses navy / blue / violet / teal family aligned with the NeuraOps brand system.
- Copy now uses:
  - `Cliniverse AI`
  - `Clinical learning and workflow support`
  - `A NeuraOps product`
  - `Human review · No real patient data in this release`
- Adds status semantics and safe-area handling.

### Onboarding
- Reduced to three release-safe clinician-oriented screens.
- Removed all remote image dependencies.
- Removed patient/Afia branch from RC1 onboarding.
- Removed PRO/IAP language, exam claims, global-network claims, virtual-hospital/Clinical-OS claims and enabled-AI language.
- States the release boundary explicitly: simulated/release-scoped use, no real patient-identifiable information, human judgment, higher-risk AI/connected-health features gated.

## Approved initial vocabulary
Prefer:
- Clinical learning and workflow support
- Care workflows
- Curated clinical tools
- Human review
- No real patient data in this release
- Simulated cases
- Controlled release
- Privacy first
- A NeuraOps product

Avoid in RC1 unless separately validated and enabled:
- Clinical OS / virtual hospital OS
- Second opinion
- AI consensus / confidence accuracy
- Unlimited / PRO upgrade
- MRCP / USMLE / FRCP claims as product positioning
- Global learning network / doctors worldwide
- Live / real-time unless the source is truly connected and current
- Patient/Afia positioning in the clinician App Store release

## Startup activation rule
The redesigned `SplashScreen` and `OnboardingFunnel` are **not currently inserted into the active `ReleaseApp` startup path**.

This is intentional. The current Apple rejection includes native blank/launch evidence, so optional first-run layers must not be added until the generated native archive passes clean-install and cold-launch testing. The active release startup remains AuthGate → authenticated release shell.

Activation can be considered only after:
1. native cold-launch reliability passes on iPhone and iPad;
2. the remote WebView/startup path is stable under slow/offline/reconnect conditions;
3. first-run timing is measured on the generated archive;
4. the onboarding state is persisted without interfering with auth/session restoration;
5. App Review notes and screenshots match the chosen first-run path.

## Performance interpretation
This audit reduces known entry-path risks, but does **not** constitute a full performance PASS.

Still required before RC1:
- generated IPA/native startup measurement;
- iPhone/iPad clean-install launch testing;
- slow-network/offline/reconnect testing;
- release-page runtime profiling (LCP/INP/long tasks where applicable);
- bundle/runtime review of release-relevant components;
- verification that no optional legacy module is pulled into the initial route unnecessarily.

## Release rule
**Do not trade launch reliability for decorative onboarding.** A fast, trustworthy sign-in and release shell are more important than a cinematic first-run experience for RC1.

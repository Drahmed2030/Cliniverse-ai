# Apple Build 62 — EULA Resolution Runbook

Status: **metadata correction prepared; external App Store Connect save/reply/resubmit not performed by this document**  
Observed: 2026-09-03  
Submission: `26a2b053-6b5d-4b46-8bc9-4f79199bb5c5`  
Version / build: `1.0 (62)`

## Verified issue

Apple's automated review message states that the submission offers auto-renewable subscriptions but the App Store product-page metadata does not contain a functional Terms of Use (EULA) link.

This is a metadata-only issue. The separate **Test on the latest betas** paragraph is general developer guidance; it is not the reported blocking defect and does not request an iOS 27 build.

## Required metadata correction

Cliniverse AI currently uses Apple's Standard EULA. Append the following line to the end of every active App Description localization, preserving the URL exactly:

```text
Terms of Use (Standard Apple EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

For an active Arabic App Description localization, append:

```text
شروط الاستخدام (اتفاقية ترخيص المستخدم النهائي القياسية من Apple): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
```

Do not create or select a custom EULA merely to resolve this message. Do not change the binary, subscription product, price, screenshots, privacy answers, or reviewer credentials as part of this correction.

## App Store Connect sequence

1. Open **Cliniverse AI → Distribution → iOS 1.0 → App Information**.
2. In each active App Description localization, append the applicable Terms line above.
3. Save the metadata.
4. Open the displayed link from the product metadata and confirm it reaches Apple's Licensed Application End User License Agreement.
5. Return to the unresolved submission and send the reply below.
6. Resubmit the same version and build, `1.0 (62)`, after confirming the app, Cliniverse PRO group, and PRO Monthly item remain attached.

## Reply to App Review

```text
Dear App Review Team,

Thank you for identifying the missing Terms of Use link.

We have updated the App Store description metadata for Cliniverse AI to include a functional link to Apple's Standard End User License Agreement:
https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

This is a metadata-only correction. The submitted app remains version 1.0, build 62, and no binary change was required. The existing Privacy Policy URL remains available in the submission metadata.

Please continue the review of submission 26a2b053-6b5d-4b46-8bc9-4f79199bb5c5.

Kind regards,
Cliniverse AI
```

## Platform boundary

Do **not** use **Add Platform** for NeuraOps. In App Store Connect, Add Platform creates a macOS, tvOS, or visionOS version under universal purchase and requires a corresponding Apple-platform target and build.

NeuraOps is the governed server-side operating and intelligence layer behind Cliniverse AI. It is part of the product architecture, not an additional Apple distribution platform. It may be described to reviewers only when the functionality is present, testable, disclosed, and included in the submitted binary and production backend.

## Scope freeze for build 62

- Keep the existing signed binary.
- Keep the existing iOS/iPadOS device support and screenshots.
- Do not introduce Gemini, Clinical Studio, Pathway Replay, or new NeuraOps capabilities into this submission.
- Do not upload a new IPA for the EULA correction.
- Do not press Add Platform.
- Do not change Production or the database.

The two-spark and Gemini work continues on the isolated Preview branch for a later version, after product, privacy, clinical-safety, native-device, and App Review disclosure gates pass.


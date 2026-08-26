# Apple Reviewer Experience v1

Status: ACTIVE — release preparation only

## Objective
Make Cliniverse AI easy to understand, easy to review, and easy to trust without hiding functionality or creating a special review-only product.

## Reviewer principle
The reviewer should understand the app within the first minute:
1. what Cliniverse AI is;
2. who it is for;
3. what the submitted release actually does;
4. what is intentionally disabled or gated;
5. how human review and privacy boundaries work;
6. how to access every submitted feature with the provided demo account.

## App Review Information package
Before submission prepare:
- non-expiring reviewer/demo account with full access to the submitted release surface;
- exact login steps;
- support contact name, email and international-format phone number;
- concise release-boundary explanation;
- note that account creation is intentionally disabled in this release;
- note that third-party Clinical Intelligence / Oracle transmission is disabled in this release until the AI consent/safety gate passes;
- note that no real patient-identifiable data is accepted in this release;
- explanation of any unavailable IAP or enterprise-only commercial path;
- launch-to-core-flow screen recording if requested by App Review.

## Reviewer walkthrough
Target path:
Launch → Sign in → Home → Care → Atlas → Me → Privacy/Support → Sign out.

The submitted build must not depend on hidden gestures, undocumented settings or reviewer-only flags.

## Trust signals that must be visible and truthful
- Cliniverse AI · A NeuraOps product
- clear human-in-the-loop language where appropriate;
- explicit release boundary for real patient data;
- working Privacy, Terms and Support routes;
- no placeholder metrics, fake live indicators, fake institutions, fake patient records or unvalidated confidence claims;
- consistent AppIcon/wordmark across binary, screenshots and App Store metadata.

## Accessibility preflight
Before claiming any Accessibility Nutrition Label, verify common tasks on the final iPhone and iPad build. Prioritize:
- VoiceOver navigability;
- sufficient contrast;
- differentiate status without color alone;
- reduced-motion compatibility where animations exist;
- larger-text behavior where technically supported;
- dark-interface consistency.

Do not claim an accessibility feature in App Store Connect unless all common tasks meet Apple’s evaluation criteria on the relevant device class.

## Submission rule
No App Review notes may claim a feature, security control, compliance status, clinical accuracy, institutional integration or accessibility capability that has not been verified in the submitted binary or operational backend.

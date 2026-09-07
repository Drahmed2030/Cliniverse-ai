# Apple Release Decisions v1

Status: ACTIVE on `integration/auth-release-shell-v1`

## Decision 1 — Account lifecycle

This App Store release is **sign-in only**. It does not intentionally create new Cliniverse accounts inside the app.

Implementation:
- password flow is sign-in only;
- magic-link flow uses `shouldCreateUser: false`;
- Apple/Google OAuth remain unavailable unless explicitly configured and approved;
- reviewer/demo accounts must be provisioned outside the app before review.

Why: this keeps the first App Store release scope narrow while the complete account-creation/deletion lifecycle is designed and runtime-tested. If in-app account creation is enabled later, in-app account deletion becomes a mandatory release requirement.

## Decision 2 — Third-party AI

Clinical Intelligence / Oracle is **not enabled in the App Store release lane** until the following are complete:
- explicit third-party AI disclosure and consent before transmission;
- verified provider/data-use inventory;
- patient-identifiable input prohibition and enforcement appropriate to the release;
- clinical-claims review;
- removal or validation of quantitative confidence/accuracy representations;
- runtime tests for consent and failure behavior.

Implementation:
- the release shell does not import or render Oracle;
- `/api/oracle` fails closed unless `RELEASE_ENABLE_ORACLE=true`;
- the environment switch must not be enabled for an Apple release until the AI gate passes.

## Decision 3 — Monetization

The iOS purchase architecture is resolved for the monthly Cliniverse PRO release product. Upgrade, View plan and Restore purchases are authorized only through the shared StoreKit 2 surface.

Implementation:
- StoreKit supplies the product title, localized price and renewal period;
- the submitted product is `com.cliniverse.ai.pro.monthly`;
- the app sends Apple's signed transaction to an authenticated server route;
- the server verifies the signature with Apple's official library and persists through the service-role-only subscription authority;
- the client never writes entitlement state or grants PRO optimistically;
- no external digital checkout is exposed in the iOS release.

Yearly, clinic, hospital and enterprise offers remain outside this App Store submission until their products, terms and purchase paths are reviewed separately.

## Decision 4 — Healthcare scope

The first release remains educational/workflow support with human review. It is not positioned as autonomous diagnosis, treatment, measurement or a regulated medical device unless separately validated and approved.

No real patient-identifiable data is accepted in this release.

## Decision 5 — Promotion to RC1

These decisions reduce immediate Apple scope but do not by themselves authorize RC1. RC1 still requires runtime Auth/Profile/RLS evidence, native archive inspection, iPhone/iPad launch QA, App Store Connect metadata/privacy completion, reviewer access and the complete Apple gate #14.

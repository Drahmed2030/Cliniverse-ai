# Subscription Authority Audit v1

Status: RELEASE HOLD

## Executive decision
Cliniverse must not grant Pro access from a client-side action, placeholder checkout URL, or UI callback. Entitlement is a read result derived from a verified server-controlled subscription record or an approved App Store purchase path.

## Verified repository findings
- `app/components/PaymentModal.tsx` opens Lemon Squeezy checkout URLs directly from the browser and still contains placeholder checkout identifiers and unverified commercial claims.
- `app/components/PaywallScreen.tsx` opens Lemon Squeezy checkout URLs directly and closes optimistically after opening the external page; it does not prove payment or create a trusted entitlement.
- No verified Lemon Squeezy webhook or equivalent server-side subscription creation route was identified in the reviewed API surface.
- The release integration branch now disables direct client-side `activatePro` behavior and reads entitlement through the authenticated current-user path only.

## Release rule
The current legacy paywall/payment components are GATED and must not be used as the authoritative iOS release purchase path.

A production subscription path must provide all of the following:
1. verified purchase/payment event;
2. server-side signature/receipt validation;
3. server/service-role write to the subscription authority;
4. idempotent event handling;
5. mapping to the authenticated user/account;
6. entitlement read derived from the trusted subscription state;
7. cancellation/expiry/refund handling;
8. auditability and failure recovery.

## iOS gate
Before enabling digital Pro upgrade CTAs in the iOS app, resolve the App Store purchase model and confirm whether the relevant digital features require Apple In-App Purchase. Until then:
- no external digital checkout CTA in the iOS release surface;
- no claim that Apple Pay is the App Store subscription mechanism;
- no client-side Pro grant;
- no unverified free-trial, user-count, country-count, certification, or accreditation claim.

## Web platform
A web checkout can be evaluated separately after the server-side entitlement synchronization path is implemented and verified. Web purchase state must reconcile into the same entitlement authority used by the app.

## GO criteria
- Approved purchase architecture selected.
- Verified server-side entitlement synchronization implemented.
- RLS/service-role behavior runtime-tested.
- Refund/cancel/expiry states covered.
- App Store policy path confirmed before iOS activation.

Until those criteria pass: SUBSCRIPTION ACTIVATION = HOLD.

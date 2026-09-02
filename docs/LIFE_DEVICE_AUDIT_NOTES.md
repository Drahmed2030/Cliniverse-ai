# Life device audit notes

This note records the release-facing technical boundary while the legacy Life/Me implementations are audited.

## Verified release concerns
- Legacy wellness UI contains Apple-style/device-oriented presentation that must not be interpreted as an active HealthKit integration without native permission and source validation.
- Release surfaces must never use `LIVE` for hard-coded, sample or manually entered values.
- Manual wellness state, sample training vitals and connected wearable data are three different provenance classes and must remain separate.

## Required implementation checks before enabling connected wearables
1. Inspect native iOS entitlements/capabilities and Info.plist usage descriptions.
2. Confirm a maintained Capacitor/native HealthKit bridge exists before surfacing Apple Health/Watch connection UI.
3. Confirm Android Health Connect implementation before surfacing Android/Google connection UI.
4. Normalize permission states and last-sync/source metadata.
5. Test denied, revoked, unavailable and offline states on physical devices.

## Current release stance
Wearable/device integrations are `NOT CONNECTED` until the native implementation and physical-device QA are verified.

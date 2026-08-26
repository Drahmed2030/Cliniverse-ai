# Life & Device Boundary v1

## Objective
Separate manual wellness context from real wearable/device integrations so Cliniverse never presents sample or manually entered data as live connected health data.

## Product boundary
- **Life** = personal wellness context and trends.
- **Manual data** = user-entered or locally generated values; must be labelled as manual.
- **Connected data** = values obtained through a verified device/health platform integration with explicit permission and source attribution.
- **Clinical workflows** = separate from Life; wellness data must not silently become patient-care data.

## Supported integration direction
### Apple
Use native HealthKit / Apple Health integration through an approved Capacitor/native bridge. Required before any Apple Health or Apple Watch value is shown as connected:
1. iOS Health capability configured.
2. Required usage descriptions in Info.plist.
3. Explicit user authorization.
4. Read scopes limited to the data actually used.
5. Source attribution and last-sync timestamp.
6. Permission denied / revoked / unavailable states.

### Android
Use Health Connect for modern Android health-data access. Do not represent Google Fit as connected unless an actual maintained integration exists.

## Release rules
1. No hard-coded or demo value may carry a LIVE badge.
2. No Apple/Google/device logo or connected label unless the adapter reports a verified connection.
3. Manual values must say `Manual`.
4. Sample/demo values must say `Sample` and remain educational/demo-only.
5. Device data must show source and last sync.
6. Permission denial is a normal state, not an error.
7. Life is not a diagnostic surface and should not generate autonomous clinical conclusions.
8. No background upload of health data without explicit data policy and consent.

## Adapter contract
A future device adapter must return a normalized status:
- `unavailable`
- `not_connected`
- `permission_required`
- `connected`
- `error`

Each metric must carry:
- value
- unit
- timestamp
- source
- provenance (`manual` | `device` | `sample`)

## Migration
Legacy Life/Me components remain extraction sources. New release surfaces must consume normalized wellness state rather than scattered localStorage keys or hard-coded vitals.

## App Store safety
Until native permission flows are implemented and tested on physical devices, the App Store release must not imply that Apple Watch, Apple Health, Google Fit or Health Connect are active integrations.

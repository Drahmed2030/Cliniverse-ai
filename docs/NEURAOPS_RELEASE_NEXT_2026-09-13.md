# Release continuation and NeuraOps boundary

## Research decision
Use an event boundary for future NeuraOps operations assistance, reusing Cliniverse operational telemetry. CloudEvents source + id identifies an event and supports duplicate detection; the consumer must implement deduplication. This is an architectural recommendation, not a newly implemented service.
Sources: https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md and https://learn.microsoft.com/en-us/azure/event-grid/cloud-event-schema

First proposed use: an operational failure generates a sanitized event; NeuraOps prepares a support task or suggested retry for a human operator. Keep patient data, ECG/Echo media, access tokens and clinical decisions out of this event. No new service, subscription, external transmission or autonomous clinical action introduced.

Future acceptance: stable event identifiers on retries, authenticated delivery, consumer deduplication, bounded retries, failure queue, trace correlation and tests proving sensitive fields cannot leave the boundary. Implement against an agreed NeuraOps endpoint in its own project; do not build a parallel engine here.

## iOS release preparation
Current capacitor.config.json loads https://www.cliniverseai.com. Codemagic verifies that canonical web origin against CM_COMMIT. A successful Vercel Preview does not satisfy this gate.
Current submit_to_testflight and submit_to_app_store are false. No signed build or submission is claimed.
Before selecting an RC: close the Preview review, confirm public feature scope (reviewer features remain reviewer-only), establish canonical-origin commit alignment, verify signing/build number and run the existing native workflow. Verify the binary on TestFlight before App Store submission.

## Current scoped checks
45 targeted tests passed after institution-neutral branding. Existing TypeScript and targeted lint passed; no database migration, entitlement or clinical authority change.

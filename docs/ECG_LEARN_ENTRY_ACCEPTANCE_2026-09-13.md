# ECG Learn entry and received xAPI acceptance

2026-09-13. Based on commercial dd3de5f6b71aa07728ea294545b6a17586defc1d.

The user supplied the actual downloaded cliniverse-assessments-xapi.json: 3006 bytes, SHA256 7f00d4a5f6f070fcde3ce9a4382a54814be377a09086df6b5bcb81cda24f66dd. Twelve content checks passed: three statements (two Echo and one ECG), unique UUIDv5 identities, correct review-account binding, score scaling, Echo confidence, accepted ECG decision and evidence digest, deterministic identity matching the saved ECG event, chronological timestamps, and absence of certification result fields. This closes actual file receipt and content acceptance for this sample. It does not establish full xAPI/LRS conformance. No account data or JSON payload is committed here.

Learn now links to the existing ECG review route only when the server enables preview/development and the confirmed review account is active. The existing route/API remain the authorization boundary. Production eligibility and scoring engines are unchanged. Back to Learn and View saved progress use allowlisted initial-view values. The shell remounts on account change.

Local verification: 15 tests pass (ECG review API and xAPI export), TypeScript noEmit and targeted lint pass. Live navigation verification is recorded separately after deployment. No new assessment attempt is required.

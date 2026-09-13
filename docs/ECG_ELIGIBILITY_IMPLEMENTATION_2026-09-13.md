# ECG evidence policy implementation — 2026-09-13

Implemented locally against commercial HEAD 8e039b9e779c19f855f0a9dc3132d63145a1456f, reusing engine fa820b345e85bb8e541d5400e36c48516abba62e.

## Implemented
- Replaced fixed record-10 HOLD evaluator with evidence-based eligibility evaluation.
- Bound evaluation to case/source SHA, renderer/output/calibration fingerprint, ledger integrity, current policy and explicitly trusted human promotion authority.
- Required promotion to reference the current clinical, privacy and device evidence; newer negative decisions and recalls block eligibility.
- Added deterministic decision ID and evidence digest for later persistence verification.
- Added governed attempt preparation that derives gate and clinical attestation from the trusted snapshot and invokes the existing ECG scorer. Caller-supplied overrides cannot elevate a HOLD case.
- Preserved the historical clinical/privacy evidence events. Eligible fixtures are synthetic tests only.

## Verification
68 tests passed, zero failures and zero skipped: ECG policy/preparation, existing ledger, Echo preparation/history/persistence, lesson completion and local PGlite schema checks. These do not constitute live ECG persistence verification.

## Actual record-10 result
HOLD. The accepted historical clinical/privacy events remain valid under ledger integrity checks. Missing: current authorized promotion, device ledger binding and exact renderer evidence. See ECG_RECORD10_CURRENT_ELIGIBILITY.json. Prior user-confirmed device tests have not been relabelled as evidence for an unverified artifact.

## Remaining integration
The new preparation function is a server-side boundary module, not yet an HTTP endpoint or a database transaction. No ECG score was written, no live ECG schema was applied, and Progress was not changed to display nonexistent ECG records.

Next: locate the exact reviewed renderer/output artifacts; bind the accepted evidence to their hashes and record the authorized promotion. Then implement a database transaction that reads the trusted current registry snapshot and persists the score plus decision ID/digest atomically with account ownership and idempotency enforcement. Verify account save/reload and concurrent replay before enabling ECG history. A precomputed browser receipt alone must never authorize insertion.

## Research applied
- OPA decision logs: https://www.openpolicyagent.org/docs/management-decision-logs
- SLSA verification summary: https://slsa.dev/spec/v1.2/verification_summary
No new OPA service or dependency introduced. Atomic database persistence remains a separate unfinished part of the recommendation.

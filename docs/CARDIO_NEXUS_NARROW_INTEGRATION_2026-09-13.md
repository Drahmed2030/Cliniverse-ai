# Cardio Nexus / ECG narrow integration — 2026-09-13

## Verified branch decision
Use strategy/commercial-activation-v1 at 8e039b9e779c19f855f0a9dc3132d63145a1456f as the base. It already has authenticated Echo persistence and Progress history. Pathway Replay at 18ea7f7154c1d6266d6ff1a3db02b9fd7d51a7da diverges from this base (27 unique Replay commits, 54 unique commercial commits). Engine fa820b345e85bb8e541d5400e36c48516abba62e is 208 commits ahead of Replay; none of that ancestry is merged here.

## Comparison with PR #16
PR #16 is open/draft; head epic/cardiology-operations-v1 at 65a545415b2ba9d8703b2531ee715aac70cc9a51; base integration/auth-release-shell-v1; 48 changed files; last updated 2026-08-31. It covers fictional QAPAS/Cardio Nexus operational journeys, role ownership and KPI contracts. This PR covers ECG evidence eligibility and preparation of account attempts using the existing scorer. It neither replaces nor merges PR #16, and introduces no QAPAS roles or institutional outcome claims.

## Exact artifact reconciliation
- Recovered original PDF: PTBXL-record10-review-only.pdf; SHA-256 20dd81f5a9b8a1abaff1e1c2278fafb0bdf4668ef0766cfad96a2954e037ee85.
- Recovered original build_review.py: SHA-256 66b9cf66c88c7dfaedb86bc065ce1ad489d6f818f6fa613ead24e2e4517520dd.
- Regenerated PDF recovered by founder re-upload on 2026-09-13: SHA-256 237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5. Four pages, 557798 bytes. Pages 1–3 have identical decompressed drawing streams and page bounds to the original. Page 4 is identical after replacing only the Prepared date (2026-09-09 → 2026-09-12). All four pages rendered and visually inspected. See ECG_RECORD10_RECOVERED_PDF_EVIDENCE.json.
- Founder-confirmed iPhone XS Max / iOS 18.7.10 and iPad viewing, zoom and rotation remain accepted as historical observations. They are not discarded or converted to full calibration/print measurements.
- Exact canonical waveform, output recipe and current adaptive renderer fingerprint coverage is still missing. No DEVICE_BASELINE_BOUND or PROMOTE event is invented.
- Independent publisher checksum remains unverified; local SHA proves local byte identity only.

## Scope and gates
This is a draft policy/preparation checkpoint, not the complete ECG vertical slice. Actual record-10 remains HOLD. New functions have no HTTP or learner UI entry point. No score is persisted by this package. No existing file is deleted, no SQL migration or media binary is introduced, and no native/Apple/StoreKit file changes.

The dedicated CI runs the 68-test ECG/Echo/account/local database suite, TypeScript and targeted lint on the PR. CI results must be read from the current commit; adding the workflow does not constitute a pass.

## Next dependencies
1. PDF recovery and byte comparison are complete. Finish binding the renderer recipe/canonical waveform to the intended presentation platform; preserve the accepted historical device-viewing scope without inferring measurements.
2. Complete binding for the intended presentation platform and obtain an explicit promotion linked to the current clinical/privacy/device evidence.
3. Add a separate reviewed database change with trusted registry validation and atomic idempotent score persistence. Expose account history only after save/reload verification.

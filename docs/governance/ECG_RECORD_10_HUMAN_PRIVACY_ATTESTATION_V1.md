# ECG Record 10 — Human Privacy Attestation v1

Status: PRIVACY_REVIEW_ATTESTED

Scope: PTB-XL record 10 using only the already inspected waveform files (`00010_hr.dat`, `00010_lr.dat`), their supplied headers, the review-only 12-lead rendering, and the governed record metadata already adopted in this branch. This attestation is a scoped project privacy review; it is not a legal certification and it does not alter source data.

## Human approval

The project owner explicitly authorized closure of the privacy review for this governed ECG record after reviewing the technical and clinical review materials.

Reviewer role: human project privacy reviewer
Review decision: APPROVED

## Privacy checks

- `noDirectIdentifiers`: PASS. No patient name, medical-record number, address, telephone number, email address, or other direct identifier is present in the inspected waveform rendering or supplied WFDB signal/header material used for this review.
- `noDisallowedDateTime`: PASS. No patient acquisition date/time or patient-linked date/time is carried into the governed learner artifact. The preparation date on the review report is document metadata, not patient metadata.
- `pseudonymousDatasetIdentifiersAccepted`: PASS. Dataset identifiers such as ECG record ID and numeric patient ID are treated as source provenance identifiers only and are not presented as real-world identity.
- `provenanceAccepted`: PASS. Source dataset/version, record paths, sampling frequencies, waveform checksums, license, and the unresolved terminal 106 ms caveat remain preserved in provenance.
- `attributionPlanAccepted`: PASS. PTB-XL / PhysioNet attribution remains mandatory under the existing CC BY 4.0 source manifest.

## Artifact scope and limitations

The privacy decision applies to the governed educational use of the inspected record and review artifacts. It does not assert that arbitrary downstream exports, screenshots, user annotations, or future external integrations are privacy-safe without their own review.

The review-only rendering contains no visible direct patient identifiers. The source waveform review documented 12 channels, 500/100 Hz versions, 10-second duration, raw calibrated samples, and no imported diagnostic source labels. The existing local SHA-256 hashes remain provenance evidence but are not an independent publisher digest verification.

## Retained technical caveat

The final 106 ms constant terminal behavior in the 500 Hz waveform, the corresponding low-resolution edge difference, and slow baseline variation remain preserved. These are technical signal observations, not privacy findings, and must not be removed to simplify the learner artifact.

## Governance state after this attestation

- Technical inspection: PASS WITH DOCUMENTED CAVEAT
- Human clinical review: APPROVED / ATTESTED
- Human privacy review: APPROVED / ATTESTED
- Evidence Ledger binding: PENDING
- Device/renderer baseline binding: PENDING
- Publisher-byte identity verification: NOT INDEPENDENTLY VERIFIED
- Learner-ready: FALSE

No waveform bytes, repository media, Supabase schema, exposed schema, database rows, deployment, or learner promotion are changed by this attestation.

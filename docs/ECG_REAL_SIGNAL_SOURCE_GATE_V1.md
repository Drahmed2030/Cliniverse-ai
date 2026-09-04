# ECG Real Signal Source Gate v1

Status: authoritative open sources approved for file-level curation; no ECG signal files ingested in this change

Date reviewed: 2026-09-04

Language decision: English only for core ECG learning media and clinical explanations

## Executive decision

The ECHO rights method can be reused for ECG provenance, licensing, privacy and clinical review, but the scientific ingestion path must be different. ECHO consumes ordered cine frames. Real ECG must consume calibrated multi-lead time-series samples, lead metadata, sampling rate and expert annotations. A screenshot or video of a tracing is not the primary signal.

The first real-ECG tranche will use PhysioNet records and render the original WFDB samples deterministically. Dataset labels may be imported with their source identity; no language model may invent or silently rewrite a diagnosis. Every teaching explanation and answer key remains cardiology-review gated.

## Approved sources for curation

| Source | Verified utility | File license | Product decision |
|---|---|---|---|
| [PTB-XL 1.0.3](https://physionet.org/content/ptb-xl/1.0.3/) | 21,799 ten-second clinical 12-lead ECGs from 18,869 patients; 100 Hz and 500 Hz WFDB signals; 71 SCP-ECG diagnostic, form and rhythm statements annotated by up to two cardiologists | CC BY 4.0 | primary broad case library; curate Normal, MI, ST/T change, conduction disturbance and hypertrophy cohorts |
| [MIT-BIH Arrhythmia Database 1.0.0](https://physionet.org/content/mitdb/1.0.0/) | 48 half-hour two-channel ambulatory ECG records with reference annotations | ODC Attribution 1.0 | beat-level rhythm and arrhythmia teaching |
| [LUDB 1.0.1](https://physionet.org/content/ludb/1.0.1/) | 200 ten-second 12-lead ECGs at 500 Hz with cardiologist-marked P, QRS and T peaks/boundaries plus record diagnoses | ODC Attribution 1.0 | morphology, intervals and wave-delineation teaching |

These licenses permit reuse with attribution, but the ODC license governs the database and requires a careful per-content review. Open access alone is never treated as sufficient approval.

## First curated tranche

The implementation target is 30 real, English-only teaching cases:

1. PTB-XL: 15 cases, three each from Normal, myocardial infarction, ST/T change, conduction disturbance and hypertrophy.
2. LUDB: eight cases chosen for clear P/QRS/T boundaries, axis, conduction and pacing morphology.
3. MIT-BIH: seven annotated rhythm segments chosen for beat-level recognition.

This is a quality-controlled target, not a bulk import promise. Each selected record must include its frozen database version, record ID, original header and signal checksum, calibration, lead map, dataset label, attribution, reviewer-authored explanation, answer key and session-only receipt identity.

## Engineering contract

The renderer will:

- parse WFDB headers and signal files without converting the source into a screenshot;
- preserve sampling rate, units, lead names, gain and timing;
- render calibrated grid and lead traces from original samples;
- expose the dataset label and its provenance separately from the teaching explanation;
- store only selected de-identified educational records in the repository or approved media store;
- keep English as the only ECG/ECHO clinical-content language while leaving the rest of Cliniverse localization unchanged; and
- fail closed when calibration, license, record identity, checksum, reviewer or answer key is missing.

## Prohibited shortcuts

- Web images, social videos or PDF screenshots as the primary ECG source.
- A language-model-generated tracing, diagnosis or “expert” explanation presented as clinical truth.
- Diagnosis inferred from a dataset signal when the selected source label does not support it.
- Bulk ingestion before file-level privacy, rights and label review.
- Real-patient upload or automated clinical interpretation.

## Next implementation slice

Start with five PTB-XL records, one from each broad cohort. Build the WFDB-to-canonical-signal adapter, calibrated 12-lead renderer, source panel, English explanation schema, assessment and receipt. Expand to 30 only after the five-record slice passes cardiology review, responsive rendering, reduced-motion/accessibility, checksum and build gates.

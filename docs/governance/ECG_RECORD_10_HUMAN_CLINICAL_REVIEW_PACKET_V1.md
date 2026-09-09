# ECG Record 10 — Human Clinical Review Packet v1

Status: PENDING HUMAN CLINICAL REVIEW

Repository branch: feature/echo-competency-engine-v1
Source dataset: PTB-XL v1.0.3
Record: ecg_id 10

## 1. Purpose

This packet moves ECG record 10 from technical inspection into governed human clinical review. It does not approve a diagnosis, does not make the case learner-ready, and does not replace privacy or Evidence Ledger gates.

## 2. Current governed state

- Record status: CANDIDATE / HOLD
- Learner-ready: false
- Diagnosis authority: PENDING HUMAN CLINICAL REVIEW
- Privacy review: PENDING
- Evidence Ledger binding: PENDING
- Publisher-byte identity: NOT INDEPENDENTLY VERIFIED

## 3. Source and provenance

- Dataset: PTB-XL
- Dataset version: 1.0.3
- ECG record id: 10
- Patient id: 9456
- Stratification fold: 9
- 500 Hz path: records500/00000/00010_hr
- 100 Hz path: records100/00000/00010_lr
- Source annotations previously captured: NORM: 100; SR: 0
- Dataset labels are source metadata only and are not Cliniverse diagnosis authority.

## 4. Technical inspection evidence

The uploaded waveform files were inspected before this packet was created.

Verified observations:

- file sizes and sample counts matched their headers;
- 12 of 12 leads were present in both versions;
- header checksum and initial values matched for all 24 lead/version checks;
- calibration and duration were consistent with a 10-second recording;
- zero encoded missing samples were observed;
- zero digital storage-limit saturation events were observed;
- after resampling for comparison, corresponding 100 Hz and 500 Hz leads correlated from 0.9935 to 0.9983;
- no waveform trimming, repair, or normalization was performed.

Documented caveat:

- the final 106 ms of the 500 Hz waveform are constant across all leads;
- the 100 Hz version shows a different terminal behavior in V2 and a slow baseline change;
- the cause is unresolved;
- this caveat must be considered by the clinical reviewer when deciding whether the record is educationally suitable.

Integrity boundary:

- SHA-256 fingerprints of the uploaded files were documented during inspection;
- those fingerprints were not independently matched against publisher-provided checksums;
- therefore local artifact integrity was inspected, but publisher-byte identity remains unverified.

## 5. Human clinical review fields

The reviewer should assess the waveform itself rather than relying on dataset annotations.

### Rhythm

- Reviewer finding: PENDING
- Confidence: PENDING

### Rate

- Reviewer finding: PENDING
- Confidence: PENDING

### Axis

- Reviewer finding: PENDING
- Confidence: PENDING

### Intervals

- PR: PENDING
- QRS: PENDING
- QT / QTc: PENDING
- Confidence: PENDING

### QRS morphology / conduction

- Reviewer finding: PENDING
- Confidence: PENDING

### ST-T pattern

- Reviewer finding: PENDING
- Confidence: PENDING

### Other clinically relevant morphology

- Reviewer finding: PENDING
- Confidence: PENDING

### Technical caveat relevance

Reviewer must explicitly answer:

1. Does the terminal 106 ms plateau materially alter clinical interpretation? PENDING
2. Does the V2 terminal discrepancy between 500 Hz and 100 Hz materially alter interpretation? PENDING
3. Is the slow baseline change clinically consequential for the intended educational use? PENDING

## 6. Educational suitability review

Proposed educational objective from the candidate record:

- recognize-normal-sinus-rhythm-and-normal-ecg-pattern

This objective is provisional and must not be accepted merely because PTB-XL contains NORM/SR source annotations.

Reviewer must decide:

- Educational objective accepted: PENDING
- Final diagnosis / interpretation label: PENDING
- Suitable for governed learner use after remaining gates: PENDING
- Suitable as assessment material: PENDING
- Technical caveat acceptable for educational use: PENDING

## 7. Proposed competency skill bindings

No skill binding becomes authoritative until the reviewer accepts it.

Candidate skills for review:

- rhythm-recognition
- rate-assessment
- axis-assessment
- interval-assessment
- qrs-morphology-assessment
- st-t-pattern-assessment
- normal-ecg-pattern-recognition

Reviewer may accept, remove, or refine these skills.

## 8. Required reviewer attestation

Clinical review may be recorded only when all of the following are explicitly supplied:

- reviewer identity;
- review date/time;
- waveform reviewed directly;
- rhythm finding;
- rate finding;
- axis finding;
- interval assessment;
- QRS/conduction finding;
- ST-T finding;
- terminal 106 ms caveat disposition;
- final clinical interpretation;
- educational suitability decision;
- accepted skill bindings.

## 9. Decision model

Allowed outcomes:

- PASS_FOR_GOVERNED_CASE_REVIEW — clinically acceptable for the next governance stage, but still not learner-ready;
- HOLD — additional waveform review, clarification, provenance work, or privacy work required;
- REJECT — unsuitable for governed educational use.

Regardless of clinical decision:

- learnerReady remains false;
- privacy review remains separate;
- Evidence Ledger binding remains separate;
- no automatic promotion is allowed.

## 10. Current conclusion

Technical inspection supports submitting record 10 for human clinical review with a documented terminal-waveform caveat. No diagnosis is approved in this packet. No learner promotion is authorized.

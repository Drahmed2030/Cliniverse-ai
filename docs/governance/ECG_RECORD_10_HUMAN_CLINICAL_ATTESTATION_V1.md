# ECG Record 10 — Human Clinical Attestation v1

Status: CLINICAL_REVIEW_ATTESTED

Scope: PTB-XL record 10, review-only 12-lead ECG rendering derived from the already inspected source waveform. This attestation does not alter the waveform, does not make the case learner-ready, and does not close privacy or Evidence Ledger gates.

## Human reviewer approval

The project owner explicitly approved the clinical interpretation in this review thread and requested formal adoption as a cardiologist-reviewed interpretation.

Reviewer role: human cardiology reviewer (user-declared in the review thread)
Review decision: APPROVED

## Clinical interpretation

- Rhythm: sinus rhythm.
- Ventricular rate: approximately 64 bpm (waveform-derived 63.9 bpm).
- Rhythm regularity: mildly variable RR intervals over this short 10-second record; no rhythm diagnosis beyond sinus rhythm is inferred from short-record variability metrics.
- Frontal QRS axis: normal, approximately +53 degrees (area-based waveform estimate).
- PR interval: approximately 166–170 ms.
- QRS duration: approximately 80–82 ms; narrow QRS.
- QT: approximately 323–325 ms by V5 tangent-method estimate.
- QTc: approximately 323–325 ms by both Fridericia and Bazett on the selected beats.
- Conduction/morphology: no clear major intraventricular conduction abnormality or pre-excitation identified on the reviewed tracing.
- ST-T pattern: no clear acute ischemic ST-T pattern identified on this review-only tracing. Mild anterior ST/T contour in V2–V3 is accepted as non-diagnostic within this review and is not promoted as a separate diagnosis.
- Pathologic Q waves: no clear pathologic Q-wave pattern identified on this review.

Final approved clinical interpretation:

> Sinus rhythm at approximately 64 bpm, normal frontal axis, normal AV and intraventricular conduction intervals, normal QTc, without a clear acute ischemic or major conduction abnormality on this review-only tracing.

## Accepted measurement sheet values

The following waveform-derived measurements were accepted for the governed review packet, with the existing measurement limitations retained:

- Ventricular rate: 63.9 bpm.
- RR mean / range: 938.8 ms / 808–1008 ms.
- RR sample SD / RMSSD: 74.6 ms / 47.7 ms.
- PR provisional median: about 170 ms.
- QRS provisional median: about 80 ms.
- QT, V5 tangent method: about 325 ms.
- QTc Fridericia / Bazett: about 325 / about 325 ms.
- Frontal QRS axis, area-based: about +53 degrees.

These values remain caliper estimates from the raw 500 Hz waveform and are not source labels or validated automated delineation outputs.

## Retained technical caveat

The final 106 ms of the 500 Hz recording remains constant across all leads. The 100 Hz version differs at the edge, most visibly in V2, and shows slow baseline variation. Cause remains unresolved.

Clinical relevance decision: ACCEPTED AS NON-MATERIAL TO THE APPROVED INTERPRETATION.

Rationale:
- The terminal behavior is preserved exactly.
- No crop, repair, interpolation, filtering, normalization, or terminal replacement was applied.
- Measurement beats were deliberately selected away from the terminal boundary.
- The caveat must remain visible in provenance and must not be removed from future review artifacts.

## Educational suitability

Decision: SUITABLE FOR GOVERNED BASELINE ECG EDUCATIONAL REVIEW, subject to remaining non-clinical gates.

Approved skill bindings:
- sinus-rhythm-recognition
- rate-assessment
- pr-interval-assessment
- qrs-duration-assessment
- qt-qtc-assessment
- frontal-axis-assessment
- normal-ecg-pattern-recognition

The terminal 106 ms behavior must not be used as a target morphology feature for learners.

## Governance state after this attestation

- Technical inspection: PASS WITH DOCUMENTED CAVEAT
- Human clinical review: APPROVED / ATTESTED
- Privacy review: PENDING
- Evidence Ledger binding: PENDING
- Publisher-byte identity verification: NOT INDEPENDENTLY VERIFIED
- Learner-ready: FALSE

No diagnosis source label was used as final clinical truth. No repository media, waveform bytes, Supabase schema, exposed schema, Evidence Ledger state, deployment, or learner promotion is changed by this attestation.

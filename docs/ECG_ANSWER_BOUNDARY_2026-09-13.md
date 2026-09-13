# ECG raw-answer integration checkpoint

Base: commercial merge c79e73e9f9dc49f0c6d6676feaa6f31d30911cfa.
Branch: integration/ecg-answer-boundary-v1. Local implementation; not deployed.

## Implemented

ecgAnswerSubmission.ts accepts raw option selections, verifies the account, rejects caller-supplied scores/identity/gate/timestamps, validates a server-owned versioned rubric and its approval digest, and derives skill dimensions. It invokes the existing governed scorer and atomic-save adapter. The saved evidence includes the selected options and grading-reference digest. Account identity is checked again at the write boundary. HOLD does not reach grading or storage.

Seven new tests use explicit fixtures, not fabricated record-10 approvals. With the twelve existing eligibility tests: 19 PASS, 0 FAIL, 0 SKIP. TypeScript passes. This verifies orchestration with a writer double; it is not a live save/reload test.

## Findings that constrain completion

- The original human clinical attestation explicitly approves sinus-rhythm interpretation and seven skill bindings. Those approvals are retained and do not need repeating.
- That document is scoped to educational review. It does not specify a versioned question set, selectable answers, weighting or critical-miss rules. No production answer rubric was manufactured from the synthetic old EcgChallenge component.
- The reviewed regenerated PDF is recovered and its prior drawing comparison preserved. The exact regenerated renderer source revision is still missing; the original renderer source is not a substitute. Device confirmations remain accepted for their observed PDF scope.
- The commercial checkout contains no governed record-10 assessment workspace wired to this function. The old EcgChallenge uses synthetic waveforms and unrelated cases; it was not reused as evidence for record 10.

## Ordered remaining integration

1. Recover the exact reviewed renderer revision, or prepare a reproducible new output and compare only the changed rendering path. Do not silently relabel previous device evidence.
2. Prepare the smallest question set grounded in the accepted clinical interpretation, with explicit reference version, options, weights and reviewer approval of that definition.
3. Bind actual renderer evidence and authorized current promotion, then publish the eligible registry snapshot through its existing authority path.
4. Wire the real assessment UI and authenticated endpoint to submitEcgAnswers, supplying only server-owned registry/rubric. Ensure the server preserves the original attempt observation time across retries; do not recreate it on every retry, because the atomic writer rejects conflicting evidence for the same event ID.
5. Verify live account submission, reload, duplicate retry, account isolation, and ECG inclusion in Progress/xAPI. No live score or end-to-end completion is claimed at this checkpoint.

Echo and assessment export remain independent and can continue while these record-10-specific gaps are closed. No schema, permissions, subscription, Apple baseline, learner-ready flag, or production deployment changed.

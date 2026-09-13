# ECG preparation and Progress assessment history

Base: cfe928c630e1b1dcdd853d33dc300dadb4a2b82e. Work continues on strategy/commercial-activation-v1.

## Implemented
- Progress now loads actual account-owned Echo assessment history separately from Code Lab completion. Named tasks, score, confidence, content version and observation time are displayed.
- Keyset pagination uses server-created timestamp plus event ID, preserves microseconds, quotes PostgREST cursor values and checks authenticated ownership before/after each request. Partial pages are not mastery projections. Refresh and retry keep errors distinct from empty history.
- Account-scoped component remount prevents old-account UI state crossing sign-in changes.
- Imported existing ECG scorer and telemetry contract byte-for-byte from fa820b3.
- prepareEcgAccountAttempt binds authenticated identity, validates provenance/version/time and calls the original scorer. HOLD/REJECT produces no saveable score. Eligible fixture scores remain 0..1 (not Echo's 0..100 scale). No second scoring implementation.

## Verification
51 PASS / 0 FAIL / 0 SKIP (42 existing targeted tests + 5 ECG preparation tests + 4 history tests). TypeScript and targeted lint PASS. Browser verification pending at this checkpoint.

## ECG limitation — not a completed integration
No ECG database table or ECG live save/reload has been implemented in this checkpoint. The imported scorer only permits LEARNER_ELIGIBLE cases. Existing record-10 evidence includes clinical and privacy attestations; do not redo or erase them. Existing accepted device tests remain valid. The current engine's promotion result is still HOLD, with no learner-promotion event. Do not fabricate promotion, map HOLD to SCORED, save synthetic results for the reviewer, or overwrite source-review evidence.
Next required work is reconciling the accepted renderer/device evidence with the current governance binding and obtaining any required explicit learner-promotion decision. Then define/apply the reviewed ECG event schema, wire the actual governed workspace and test real account persistence. This preparation alone cannot be reported as ECG connected.

General Progress now supports the existing Echo evidence only; it must not invent ECG rows or claim mastery. The previously verified A4C save/reload remains unchanged.

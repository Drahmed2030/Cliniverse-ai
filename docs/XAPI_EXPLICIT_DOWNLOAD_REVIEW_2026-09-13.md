# ECG save and xAPI export verification — 2026-09-13

## Verified state
- Commercial code: ba7de3111b1a0a3ec106eed1e11c44ee5acfe468.
- Preview: https://cliniverse-ai-u7gi-jpm2oukzt-cliniverse-ai.vercel.app (READY).
- Prior preview 0b60a637e2e59a1659a703c6613b374c41253af5 successfully saved one authorized technical test answer for ECG record 10.
- Saved answer survived reload, was confirmed in the database, and appeared in Progress beside two Echo attempts. This was a review-account technical test, not a new learner competence or clinical certification assessment.
- Current preview still displays one ECG answer and two Echo attempts.

## Change
AssessmentHistory now prepares the authenticated export first and presents a native Download JSON link. No asynchronous synthetic click or one-second URL expiry remains. Object URLs are released on replacement, component unmount, or a different signed-in account. A synchronous pending guard prevents duplicate preparation. Status text reports preparation, not a completed download.

## Verification
- tests/xapi-export.test.mjs: 12 PASS, 0 FAIL, 0 SKIP.
- TypeScript noEmit: PASS.
- Targeted ESLint: PASS.
- git diff --check: PASS.
- Browser: preparation completes and a persistent Download JSON link appears.
- Browser download event: timed out after 10 seconds. The documented downloadMedia action returned without a file path. No received JSON file was available for inspection.
- Direct navigation to the prepared blob URL was explicitly blocked by Cloud browser URL policy. No bypass attempted.
- Therefore actual file receipt and live exported-content inspection remain UNVERIFIED. Do not mark end-to-end download acceptance complete.
- No new database writes, schema changes, Production or Apple changes in this export-only update.

## Focused research and application
1. MDN blob URL lifecycle: release when no longer needed; avoid early revocation while a resource remains available for user interaction.
   https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob
   Applied: a visible, retryable link with lifecycle cleanup.
2. IEEE 9274.1.1 describes the learning-experience JSON model and REST communication with an LRS.
   https://standards.ieee.org/ieee/9274.1.1/7321/
   Decision: preserve the existing export mapping and deterministic identifiers. This JSON export does not establish full xAPI 2.0 or LRS conformance. No subscription or new vendor adopted.

## Remaining acceptance
In the user's browser: Progress → Prepare assessments (xAPI) → Download JSON. Inspect the actual file for exactly three statements (two ECHO, one ECG), unique IDs, correct account binding, normalized scores and the ECG decision/evidence binding. Record the result only after inspecting the received file.

Next roadmap item: connect the already-governed review journey into Learn without expanding case eligibility or replacing existing engines.

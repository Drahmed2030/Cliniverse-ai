# Isolated account progress visual matrix

Base: d79880fd40c95ed8efbd90c26a70b76389ae1c88, qa/case-batch20-cloud.

12 browser scenarios: widths 375, 768, 1280 in light and dark; two flows per combination.
Flows cover a held response, rejection, explicit retry with the same UUID, saved acknowledgement,
reload without extra writes, and navigation to another case while a save is pending.
Checks include save-button dimensions, overflow, retry target size, keyboard activation,
WCAG A/AA Axe checks and screenshots. Failure traces retained.

Isolation: dedicated local dev server on 3101, account preview flag, empty browser context,
synthetic user and nonfunctional tokens. All non-local HTTP requests intercepted;
only expected Auth and case_completions responses mocked. Unexpected requests aborted.
No real reviewer session, Supabase credential, account write or RLS modification required.
This is UI verification, not proof of live RLS enforcement.

Two source-level issues corrected: saving label now scoped to its case, and save button
reserves space for its longest label using an aria-hidden sizing span.

Validation before cloud submission: 12 scenarios discovered; strict test typecheck,
targeted application typecheck and ESLint passed. Existing completion suite: 30/30 PASS.
Browser execution status must be obtained from the corresponding workflow run, not inferred
from discovery or unit tests. Existing six-viewport preview suite remains in the workflow.

## Verified cloud result

Run https://github.com/Drahmed2030/Cliniverse-ai/actions/runs/34834112588
on commit 84846acebd8a9c060521f7a5ded3d993085edf64 completed successfully.
Account matrix: 12 PASS, 0 FAIL, 0 SKIP (two tests at each of six width/theme combinations).
Existing preview matrix: 6 PASS, 0 FAIL, 0 SKIP.
Cloud content/boundary suite: 15 PASS, 0 FAIL, 0 SKIP; preview typecheck passed.
Account matrix asserts zero Axe WCAG A/AA violations and zero tested horizontal overflow.
Saved, pending and rejected states have screenshots; no failures required traces.
Artifact 10343667368 contains reports and screenshots (9,515,005 bytes), retained until
2026-09-17. SHA256 fb5dfb1c4980052f5806dae8e36d6eb7be1d266e93d45841e4d559655d5f20a2.
This evidence update is local only to avoid triggering a redundant build for documentation.

Limits: Chromium viewport/touch emulation is not a physical iPhone, safe-area/notch validation,
or Safari validation. A held API response is deterministic latency simulation, not full 3G
network emulation. Entire-page CLS, screen-reader speech and native Dynamic Type are not
asserted by this matrix. No merge or production release is part of this work.

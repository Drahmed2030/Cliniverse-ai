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

Limits: Chromium viewport/touch emulation is not a physical iPhone, safe-area/notch validation,
or Safari validation. A held API response is deterministic latency simulation, not full 3G
network emulation. Entire-page CLS, screen-reader speech and native Dynamic Type are not
asserted by this matrix. No merge or production release is part of this work.

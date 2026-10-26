# RC1 source QA logs — candidate `9bf17282630cb525916cb412601478574aa5419c` (tree `14888df202bb3bda6e2988452a52bd67cc1926d0`)

**Provenance: Claude-reported results**, produced 2026-10-26 in a clean `git worktree` + `npm ci` of the candidate (checkout path scrubbed to `<checkout>`). Work 1 reviewed source identity (tree, patch sequence, copy change) independently, and **has not re-run** these tests (per MASTER: "990/990 PASS — not independently repeated"). Chromium scripts intercept Supabase; recovery server behaviour is SIMULATED.

| Log | Result |
|---|---|
| `npm-test.log` | 990 tests, 990 pass, 0 fail, exit 0 |
| `tsc.log` | `tsc --noEmit`, exit 0 |
| `next-build.log` | `next build`, exit 0 |
| `sw-chromium.log` | 40 PASS / 0 FAIL, exit 0 (legacy worker = baseline `public/sw.js`; previous-build negative control not run) |
| `recovery-chromium.log` | 24 PASS / 0 FAIL, exit 0 |

Notes: a first attempt of the service-worker script in this evidence run stalled after 4 checks (sandbox, concurrent with build/test load) and was killed; the logs here come from a clean re-run with nothing else running. The `account-codelab` intermittent failure did not occur in this run and stays OPEN.

SHA-256 of the logs (after path scrubbing):

| File | SHA-256 |
|---|---|
| `next-build.log` | `7b72ee04c992903afeb7074ecda4f89aa7bc0273817b6e192edf5cc90bd6a9be` |
| `npm-test.log` | `61ee98e53dce17ed57349c98dcb42dc702353ae03a8f5f54e06bc8fe5f0ab93c` |
| `recovery-chromium.log` | `19b428b80e30d9c285efbee7170d1311beffc8749b3c250556052f0aa9e06133` |
| `sw-chromium.log` | `d15ddc12754b8bb45da606436c1908156e71afe86b419ceddf45e24dcc22c09b` |
| `tsc.log` | `19eaf43821a7660ec323a87c8457bf74823beb296c39f5e01aa8a683aa50f061` |

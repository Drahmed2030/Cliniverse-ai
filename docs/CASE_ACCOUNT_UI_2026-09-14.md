# Case account UI — opt-in development integration

Branch: qa/case-batch20-cloud. Base HEAD: 3108e7c22ed68b0ad5761438f3a0bce8aa70e3c8.
All pre-existing Ward/Atlas and completion-adapter changes preserved.

## Implemented

- Existing CaseBatchPreview now accepts account progress without introducing a second case player.
- Explicit explanation-review/save button appears only on the explanation stage. Saved badges appear only after confirmed persistence or account-history restoration.
- AccountCaseBatchPreview restores current-content completions, handles loading/error/retry states, keeps a pending completion UUID in owner-scoped sessionStorage, and reuses it on retries. No automatic write on load or on opening a case.
- Rapid saves are blocked before asynchronous hashing. Account changes remount the player to clear the previous account's answers. Disposed views ignore late acknowledgements.
- Guest mode remains readable without saving. Unfinished answers/steps are session-only; this is not full mid-case checkpoint restoration.
- Existing route remains development-only. Account mode requires CASE_ACCOUNT_PREVIEW_ENABLED=true when starting the development server. Default preview remains session-only; production/hosted production-mode builds remain blocked.
- Existing responsive CSS provides wrapping buttons, 48px targets, semantic states and live status feedback. UI/UX guidance informed recoverable errors and explicit saved status; React review covered effect cleanup, account-keyed remounting, concurrent hashing and avoiding writes during render/effects.

## Read-only live schema check

Project verified via configured Supabase integration: Cliniverse-ai (zbiujqxinvcxvuviuenx).
Only database metadata was queried; no learner rows were read and no records were written.

case_completions has UUID id/user_id, TEXT case_id, INTEGER xp_earned/errors and TIMESTAMPTZ completed_at. Its only reported constraint is PRIMARY KEY(id), so there is no case_id foreign key preventing the new namespaced IDs.
RLS is enabled. SELECT and INSERT policies are restricted to authenticated and auth.uid() = user_id. Authenticated grants are SELECT and INSERT; no anon table grants were reported.
This validates schema compatibility, not a live end-to-end user session or tested RLS enforcement.

## Verification

- Combined focused suite: 72 PASS / 0 FAIL / 0 SKIP, including eight new account-case UI tests.
- Strict targeted TypeScript for the changed page and its imports: PASS.
- Targeted ESLint and git diff --check: PASS.
- Browser screenshots/Axe for the new account UI: NOT RUN.
- Real-account save/reload: BLOCKED — the standard authorized visual/test credential environment variables and storage-state path are not configured; no storage-state file was found by the scoped filename search.
- Full application typecheck/build/StoreKit/native release validation: NOT RUN in this batch.

The UI tests use a simulated React-hook harness and mocked account repository, not Chromium or a live Supabase user session. Earlier six-viewport case-preview passes must not be attributed to this new account UI.

## Next gate

Provide an authorized reviewer/test browser session or securely configured test credentials, then run the same development route with account mode enabled. Verify one explicit text completion, refresh restoration, offline retry, account switch and visual layout at the agreed screen sizes. Do not use the administrative SQL integration to impersonate a learner or create test progress in place of this check.

No migration, grant, entitlement, source clinical text, media linkage, deployment, push or merge change was made. DeepSeek remains deferred. Remaining media and full release gates are unchanged.

Official auth-event API reference checked: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
Changelog index fetch returned unsupported content type; only established repository API patterns were reused.

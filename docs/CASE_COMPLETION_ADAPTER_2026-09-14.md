# Case completion adapter — local implementation

Repository: Drahmed2030/Cliniverse-ai. Branch: qa/case-batch20-cloud.
Base HEAD: 3108e7c22ed68b0ad5761438f3a0bce8aa70e3c8.
Existing Ward/Atlas changes and reports preserved. No commit, push, build or deployment performed.

## Delivered

- `app/lib/caseCompletion.ts`: SHA-256 identities for the 20 reviewed text exercises. Identity includes scenario, question, option order, answer, explanation, communication and cited reference metadata.
- Completion preparation requires a valid answer and explicit explanation-review acknowledgement. Records only completion and a 0/1 answer-error count; no XP, mastery claim or media competency.
- Current-content allowlist and `microcase:` namespace keep these records separate from `codelab:` records. Content/source changes do not inherit old completion.
- Reuses the existing INSERT/acknowledgement/retry/account-verification mechanism in lessonCompletion.ts. Code Lab public API and validator are unchanged.
- No patient text or learner free-text is included in the completion row.

## Verification

64 PASS / 0 FAIL / 0 SKIP in the combined case, Code Lab account/completion, Ward, Atlas entry and learning-journey suites. Ten new case-completion tests cover content identities, review requirements, scope separation, save/load, lost acknowledgements, concurrent retries, wrong owner, sign-out, connection failure, account switch, stale content and timeout.

Targeted strict TypeScript: PASS. Targeted ESLint: PASS. git diff --check: PASS.
Full project typecheck, browser QA and a live database query were NOT run in this batch. The previously documented local Remotion dependency issue is not claimed resolved.

## Integration boundary and next work

This is a tested adapter, NOT active account persistence for the case-preview UI. The preview remains development-only and memory-only. No live Supabase query, write, schema, grant or migration change occurred.

Before enabling: verify the live case_completions schema accepts these namespaced text IDs and existing owner RLS; wire explicit review/save/retry and account-scoped pending identity into the existing UI; test reload, sign-out, account switch and late responses against an authorized test account. Do not report a failed save as completion. Pending answer/step checkpointing is not implemented by this completion-only table.

Text completion does not approve a case for release, bind media or prove clinical competence. Media remains one supplementary A4C link plus deferred/unmatched cases. Ward case-level content revision, Atlas/Ward browser validation, and full release gates remain open.

## Documentation checked

Supabase INSERT reference: https://supabase.com/docs/reference/javascript/insert
Changelog index retrieval was attempted but returned an unsupported-content-type error. No new Supabase API feature was adopted; this batch reuses the repository's existing client operations.

## Resume

Run `node --test tests/case-completion.test.mjs tests/lesson-completion.test.mjs tests/account-codelab.test.mjs tests/ward-*.test.mjs tests/atlas-codelab-entry.test.mjs tests/learning-journey.test.mjs tests/case-batch20.test.mjs` only when relevant new changes require it. Preserve all local uncommitted changes. DeepSeek remains deferred.

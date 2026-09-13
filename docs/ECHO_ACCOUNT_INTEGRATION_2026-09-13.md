# Echo account integration — implementation checkpoint

Status: local preparation, NOT deployed or wired to the commercial player.
Base: commercial c14d3c6ea5a989c621258aab793875f11e6ac76d.
Engine source: fa820b345e85bb8e541d5400e36c48516abba62e.

## Implemented
- Imported echoSkillGraph, echoAssessmentContract, echoMasteryEngine and echoPersistenceContract byte-for-byte from the existing engine. No scoring rewrite.
- Added echoAccountEventRepository: authenticated owner checks before and after requests, immutable insert, exact payload acknowledgement, stable event identity on retries, duplicate conflict detection, input snapshot, finite integer validation and bounded timeout.
- Load retrieves a specific attempt after reload. It is NOT a complete history query or a mastery projection.
- Missing tables throw EchoStorageUnavailable. An absent table must never be displayed as an empty learner history or successful save.
- Enabled allowImportingTsExtensions with existing noEmit compiler mode to preserve the engine's original import paths.
- Preserved the engine SQL draft for review, not automatic execution.

## Verification
2026-09-13: 21 tests passed, 0 failed, 0 skipped: 9 new Echo adapter tests and 12 existing lesson completion tests. TypeScript noEmit and targeted adapter ESLint passed.
Adapter tests use a controlled database double. They do NOT prove deployed RLS, native playback or real account persistence.
Read-only query on Cliniverse Supabase returned NULL for public.echo_competency_events and public.echo_skill_mastery. No schema/data mutation was performed.

## Schema review and next implementation gate
The imported draft is not ready to apply unchanged. It permits client-side mastery upserts. Keep authoritative mastery writes on a validated server path; client-submitted scores are assessment evidence, not certified competence, XP or eligibility.
Prepare an events-only migration with own-user SELECT/INSERT RLS, no UPDATE/DELETE grants, primary-key retry identity and integer constraints. Validate account isolation with two test users and verify schema/permissions in a test environment before live application.
Before wiring the player, bind allowed case/task/version/skill combinations to the actual engine catalog and eligibility boundary. Preserve the selected attempt ID across retry. Add a paginated account history contract before deriving mastery from stored evidence; do not project from one latest row or a silently limited query.
Then connect Echo assessment completion to save acknowledgement, reload the reviewer account and independently confirm the exact stored event. Next adapt ECG's existing scoring contract; this checkpoint does not implement ECG persistence.

Prior accepted device tests remain valid. No clinical content approval, purchase change, learner eligibility change, Production deployment or merge occurred.

References consulted: https://supabase.com/docs/reference/javascript/insert ; existing engine SQL and contracts. The markdown changelog endpoint failed to load in the web reader; no SDK upgrade was made.

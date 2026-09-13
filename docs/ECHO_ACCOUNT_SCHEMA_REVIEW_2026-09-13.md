# Echo account persistence — database candidate and task binding

Status: reviewable local candidate. Not applied to live Supabase, deployed, or connected to the commercial player.
Commercial base: c14d3c6ea5a989c621258aab793875f11e6ac76d.
Existing engine: fa820b345e85bb8e541d5400e36c48516abba62e.

## What changed
The existing SQL draft was revised in place to provision only public.echo_competency_events. It no longer creates a client-writable echo_skill_mastery table. No second schema or scoring implementation was created.

- Account-scoped primary key (user_id, event_id): another account cannot reserve an event ID globally.
- Additional uniqueness for user/case/task/version/observed_at prevents alternate-ID duplicates.
- Authenticated own-user SELECT/INSERT policies; RLS enabled and forced.
- Revoke PUBLIC, anon and authenticated inherited table grants before granting specific access.
- INSERT column grants exclude server-owned created_at. No client UPDATE or DELETE.
- Required bounded text, integer score/confidence/timing checks, and finite observation timestamps.
- No grants of XP, eligibility or certified competence. Scores remain learner-submitted assessment evidence.

Imported the two existing A4C tasks and their licensed asset manifest unchanged from fa820b3. Their existing preview-only status is retained; imports do not grant learner access or supersede accepted device evidence.
prepareEchoAccountAttempt resolves task/case/version from that catalog, accepts one real option, invokes the existing scoreEchoAssessment and toEchoCompetencyEvent, validates the result and freezes it for retries. It is an application boundary, not server authorization. The commercial player is not yet wired to it.

## Verification
40 PASS / 0 FAIL / 0 SKIP:
- 14 SQL tests run on PGlite 0.5.8 (PostgreSQL compiled to WASM) with synthetic auth.users/auth.uid and two isolated identities.
- 5 actual-catalog preparation tests.
- 9 account repository tests.
- 12 existing lesson completion tests.
TypeScript noEmit PASS; targeted lint for both adapter modules PASS.
SQL assertions cover owner read/write, other-account isolation, duplicate retries, cross-account identity collision, immutable evidence, server timestamp protection, anonymous access, missing user identity, constraints and RLS flags.
These are genuine SQL role/grant/RLS checks, not regex checks. They do not establish deployed Supabase Auth, PostgREST grants, or a live browser-to-database result.

The harness has its own pinned package/lock in tools/echo-db-tests; application dependencies were not changed. Reproduce with npm ci --ignore-scripts and npm test in that directory; run the other three test files with node --test from repository root.

## Requested live change — exact scope
Target: Cliniverse-ai / zbiujqxinvcxvuviuenx.
Candidate: supabase/drafts/echo_competency_persistence_v1.sql.
Create one new events table, two indexes, two own-user RLS policies and explicit column grants. No existing learner rows, lesson tables, subscriptions, media or mastery tables are modified.
The candidate intentionally fails if the target table already exists rather than silently accepting schema drift. Recheck immediately before application. Convert the approved candidate to a migration using the Supabase CLI migration workflow and record the reviewed hash; do not manually invent a migration ID.

Before applying, obtain the independent schema approval required by EXECUTION_RELEASE_ROADMAP_2026-09-13.md. Generic roadmap approval is not a production change authorization there. No automatic schema mutation has been performed.

After application: inspect columns/grants/policies, run database advisors and confirm authenticated Data API access. Wire the existing governed review player to prepared-event save/retry/reload. Perform a real reviewer attempt and verify its exact stored payload. Keep public learner exposure disabled until its existing eligibility rules permit it.

## Rollback and limits
Schema application is transactional; a failed transaction leaves no partial table. If application integration fails after commit, disable the caller and preserve collected evidence. Do not automatically DROP the table or delete learner events. Any data-removing rollback requires its own review.

Full learner history pagination and server-validated mastery remain future work. Do not compute mastery from only the most recent loaded event. ECG account integration remains open and will reuse its own existing scoring contract after this Echo path.

## Sources
Supabase RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
Supabase changelog fetched successfully on 2026-09-13: https://supabase.com/changelog.md
No SDK upgrade performed. Schema behavior was verified directly with the isolated SQL harness.

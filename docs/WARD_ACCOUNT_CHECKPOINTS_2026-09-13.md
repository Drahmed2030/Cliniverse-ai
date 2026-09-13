# Ward account checkpoints

Research: INACSL simulation standards emphasize preparation, facilitation and debriefing. https://www.inacsl.org/healthcare-simulation-standards-of-best-practice-
Supabase documents ownership RLS and minimal grants: https://supabase.com/docs/guides/database/postgres/row-level-security . Changelog markdown fetch was unsupported by the research tool; current RLS documentation was read.

Applied: explicit account save and restoration of event-derived practice state; frozen fictional w1 content v1; no random new medical facts. No changes to subscriptions or clinical scoring. New checkpoints are append-only by owner/session/event count, duplicate saves require identical persisted events, foreign identity or unsupported content versions fail closed. Last successful checkpoint resumes in Ward. The client cannot set server creation timestamps. These records are unscored user practice, never eligibility or competence evidence.

Remote migration ward_practice_checkpoints_v1 applied via Supabase. Exact DDL in docs/sql/ward_practice_checkpoints_v1.sql. Authenticated reviewer-only SELECT/INSERT; no anon, UPDATE or DELETE grants. Isolation probe inserted an owner row, hid it from a different account and rejected foreign insertion inside a rolled-back transaction. Security advisor returned no reference to the new table.

11 targeted tests PASS, 0 FAIL, 0 SKIP; TypeScript and targeted lint PASS. Live browser save/reload acceptance pending preview verification. Previous Atlas copy-test failure remains outside this scope.

Next: verify checkpoint save/reload, then add reviewed alternative event branches and library rotation. No daily unlimited case promise, autonomous patient generation, Progress score or xAPI Ward mapping in this change.

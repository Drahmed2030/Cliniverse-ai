# Account deletion data inventory

Source review for PR #38 at d8ba53d, updated by Task 1b. Evidence comes from
app/supabase.ts, app/lib/profile.ts, app/lib/progress.ts,
app/lib/entitlements.ts, the component/API paths below, proxy.ts and the
existing SQL files. Hosted catalogs, row content, storage and schema were not
queried. An omitted owner field in an insert establishes a source gap. Defaults,
triggers, actual foreign keys and historical data still require verification.

The proposed cascade covers four release tables. Completeness of account-linked
data deletion is an open release gate until the inventory and hosted preflight
are reviewed. The candidate remains outside supabase/migrations. The API returns
503 while its readiness RPC is missing or its cleanup constraints are incomplete.

| Table or object | Owner column evidenced by source | Covered by proposed cascade | Reason | Proposed decision for Dr. Ahmed |
| --- | --- | --- | --- | --- |
| profiles | id | Yes | Verified-user profile helper | Review existing FK and retention, then approve candidate |
| case_completions | user_id | Yes | Own-progress helper | Review FK and orphan counts |
| mcq_answers | user_id | Yes | Own-progress helper | Review FK and orphan counts |
| subscriptions | user_id | Yes | Own entitlement record | Approve deletion/retention policy. Store billing cancellation is separate |
| user_activity | user_id supplied by legacy caller | No | app/api/intelligence/route.ts accepts userId. API deferred by proxy | Confirm historical ownership and add verified-user cleanup in a separate approved packet |
| user_progress | Unknown | No | Existing migration names table; Leaderboard subscribes to it. Column schema absent | Inspect catalog and any derivation/trigger before deciding cleanup |
| leaderboard | Unknown | No | Existing migration names it, with release access revoked | Determine whether stored user data or derived data, then choose cleanup |
| cm_patients | None in insert | No | ClinicalMemory inserts name and MRN without an account owner | Keep release exclusion. Decide between verified ownership for future records, continued exclusion, or separately authorized disposal of proven synthetic data |
| cm_interpretations | None for account; patient_id only | No | ClinicalMemory links interpretations to the unowned patient | Resolve patient ownership and inheritance first. Never infer account identity from patient name/MRN |
| generated_cases | None in insert | No | AICaseGenerator saves generated content without creator | Decide whether content is shared or privately owned and review provenance before enabling |
| pulse_answers | None in insert | No | PulseRoom inserts question/option/country | Decide aggregation/retention and verified attribution before linking deletion |
| lecture_votes | None in insert | No | PulseAcademy inserts lecture_id only | Decide anonymous aggregate vs attributable history |
| mood_logs | device_id | No | Mood API writes by device, not account; API deferred | Decide device-data retention and verified account binding. Clearing local device id does not delete server rows |
| logbook_entries | None in insert | No | ClinicalLogbook saves reflection/supervisor text without owner | Keep deferred and define verified ownership before future activation |
| clinical_posts | None in insert | No | ClinicalNet uses display name/anonymous fields | Decide attribution and shared-content retention |
| nexus_messages | None for account | No | ClinicalNexus uses case_id and display-name fields | Review human/AI content ownership and retention separately |
| nexus_votes | None in insert | No | ClinicalNexus uses case_id, option, country | Decide aggregation/attribution policy |
| lecture_questions | None in insert | No | PulseAcademy stores user question and generated answer | Review free-text provenance and retention before activation |
| clinical_documents | None in symptom-report insert | No | Symptom API saves anonymous symptom text; deferred | Review historical free text and owner provenance |
| clinical_case_embeddings | No account linkage established | No | Reference/knowledge matching source | Inspect provenance and whether documents contain personal content |
| api_cache | No account linkage established | No | Deferred API cache | Review cache keys/content and retention |
| case_cache | No account linkage established | No | Generated-case cache | Review provenance and retention |
| daily_cases | None in generation path | No | Shared generated learning content | Confirm shared-content classification |
| evaluation_cases | No account linkage established | No | Question ingestion source | Confirm shared-content classification |
| guidelines | No account linkage established | No | Reference content | Verify classification in schema audit |
| lab_reference | No account linkage established | No | Reference content | Verify classification in schema audit |
| lectures | None in source attribution | No | Shared lecture/content API | Review content provenance and ownership |
| live_cases | No account linkage established | No | Deferred case source | Verify actual contents and classification |
| medications | No account linkage established | No | Reference content | Verify classification in schema audit |
| nexus_cases | No account linkage established | No | Shared case source | Review source provenance |
| pubmed_articles | No account linkage established | No | Public literature ingestion | Confirm reference-only content |
| pulse_questions | No account linkage established | No | Shared generated questions | Review source provenance |
| question_bank | No account linkage established | No | Learning question source | Review provenance and classification |
| cases | Unknown | No | Existing SQL restricts this legacy table | Inspect schema and content classification |
| Supabase storage buckets / storage.objects | Unknown | No | No verified bucket inventory or account-owner mapping in source | Approve a metadata-only inventory separately, then define per-owner deletion before activation |
| AWS S3 objects | None in key generation | No | Deferred app/api/storage/route.ts uses folder/timestamp/name with no account binding | Verify whether objects exist and decide ownership/retention separately |
| Local/session storage and cliniverse-* browser caches | Device origin | Client cleanup only | Successful deletion clears them and reloads the app | Device test required. IndexedDB inventory remains separate if introduced |

## Critical ownership gap

Both cm_patients and cm_interpretations are inserted without an account owner.
Per-user deletion cannot be determined from these source records today. A patient
reference is not an account identity. ClinicalMemory is outside the active
ReleaseApp surface. Its source presence does not establish whether historical
hosted rows exist.

Options requiring an owner decision are verified ownership for future records
with a separately reviewed historical-data policy, continued module exclusion,
or separately authorized deletion of data demonstrated to be synthetic. This PR
does not choose a historical owner or alter those tables.

## Proposed rollout order

Review the SELECT-only preflight file and inventory, authorize the hosted read
separately, resolve ownership/retention gaps and existing constraint conflicts,
approve manual application of the candidate, then perform synthetic end-to-end
and device acceptance before release. Any unsupported UUID type, orphan row,
unknown storage owner or unresolved legacy personal data remains a decision gate.

Preflight file is supabase/proposed/20261109090000_preflight_readonly.sql.
Rollback is supabase/rollback/20261109090000_cliniverse_account_deletion_candidate_rollback.sql.
Rollback removes only this candidate's named constraints and readiness function,
preserving unrelated constraints and all account rows.

## Reproducible SQL test

Use a fresh empty disposable local PostgreSQL database as its owner. The fixture
refuses an existing auth schema. It bootstraps minimal synthetic tables/roles,
includes the candidate through psql, and rolls back test DML. Destroy that
disposable database after running. It does not model the complete Supabase Auth
service or the unknown hosted schema.

```sh
psql "$LOCAL_ACCOUNT_DELETE_TEST_DSN" --no-psqlrc --set=ON_ERROR_STOP=1 \
  --file=supabase/tests/20261109090000_account_deletion_cascade.sql
```

Before inclusion, the readiness RPC is absent, which the API adapter treats as
unavailable/false. After inclusion it returns true for service_role, refuses
anon/authenticated, and returns false after a cleanup constraint is removed.
The fixture also checks account isolation, orphan rejection and rollback after
a deferred constraint fails.

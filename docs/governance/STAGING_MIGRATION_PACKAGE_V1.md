# Shared Governance Ledger — Staging Migration Package v1

Status: REVIEW-ONLY. No migration, exposed-schema change, or production action is authorized by this document.

## Objective

Validate the Shared Cliniverse / NeuraOps Core Evidence & Provenance Ledger against a staging Supabase environment without weakening the private-governance boundary.

## Package

- `EVIDENCE_LEDGER_STAGING_MIGRATION_CANDIDATE.sql` — candidate SQL only.
- `EVIDENCE_LEDGER_STAGING_ROLLBACK.sql` — guarded rollback that refuses destructive removal when rows exist.
- Existing runtime contracts under `app/lib/governance/` remain the application source of truth.

## Required preflight before any staging apply

1. Current repository HEAD and verification suite are green.
2. Explicit staging-only authorization is obtained.
3. Confirm target Supabase project is not Production.
4. Capture current exposed schemas, grants, and existing `api` / `governance` objects before changes.
5. Confirm `api` is not already used in a way that would conflict with the three governance RPCs.
6. Confirm `governance.evidence_ledger_events` does not already exist with a divergent contract.
7. Confirm no patient identifiers or PHI are included in pilot ledger events.
8. Confirm `SUPABASE_SERVICE_ROLE_KEY` remains backend-only and is never emitted to client bundles, logs, screenshots, or documentation.

## Intended staging sequence

1. Apply the candidate SQL in staging only.
2. Verify `governance` remains absent from Supabase Exposed Schemas.
3. Add only `api` to Exposed Schemas if not already exposed and if separately authorized.
4. Use a trusted server-side service-role client to call only the three governance RPCs.
5. Run smoke tests with synthetic / non-PHI events.
6. Verify idempotent replay and append-only behavior.
7. Verify client roles cannot access storage or RPC execution.
8. Verify no Realtime publication exists for the ledger table.
9. If any invariant fails, STOP and use the guarded rollback only after verifying the ledger table has zero rows.

## Security verification queries / checks

Expected properties:

- `governance.evidence_ledger_events` exists with RLS enabled.
- `anon` and `authenticated` have no privileges on `governance` or the ledger table.
- `service_role` has `SELECT, INSERT` only on the ledger table.
- RPC functions are `SECURITY INVOKER`.
- RPC functions have fixed `search_path = pg_catalog, governance, pg_temp`.
- `anon` and `authenticated` have no EXECUTE privilege on governance RPCs.
- `service_role` has EXECUTE on exactly the three intended RPCs.
- UPDATE and DELETE attempts are rejected even if a privileged role later receives those privileges accidentally.
- `governance.evidence_ledger_events` is not in `supabase_realtime` publication.

## Smoke-test contract

Use synthetic identifiers only. Minimum staging smoke test:

1. Append one valid `CLINIVERSE` event -> one persisted row.
2. Find by event ID -> exact canonical row returned.
3. Replay the exact same event through the application persistence boundary -> `NOOP`, not duplicate insert.
4. Reuse the same event ID with mutated canonical payload -> `HOLD`, no insert.
5. List by product + subject -> only matching subject rows, deterministic order.
6. Attempt wrong product scope -> rejected by runtime boundary.
7. Attempt direct table read as `anon` / `authenticated` -> denied.
8. Attempt governance RPC as `anon` / `authenticated` -> denied.
9. Attempt UPDATE / DELETE -> denied.

## Rollback rule

Rollback is allowed only when staging validation has produced no retained evidence rows. The rollback SQL refuses to drop the ledger table if any row exists. If rows exist, export/reconcile them first and make a separate explicit decision; never silently destroy audit evidence.

## GO criteria for staging apply

All of the following must be true:

- Full targeted governance/media/privacy/renderer/ledger/persistence suite PASS.
- Typecheck PASS.
- Targeted lint PASS.
- Candidate and rollback SQL invariant tests PASS.
- Target is confirmed staging/non-production.
- No PHI in test payloads.
- `governance` remains private.
- Only `api` is considered for exposure.
- Service-role secret remains backend-only.
- Explicit user authorization to apply staging migration is provided.

## NO-GO criteria

Any of the following stops the apply:

- Production project ambiguity.
- Existing schema/object collision.
- Client-role privilege drift.
- Need to expose `governance` directly.
- Requirement for UPDATE/DELETE.
- Missing rollback path.
- Any failing test/typecheck/lint.
- PHI or patient identifiers in pilot payloads.
- Unreviewed change to Supabase Exposed Schemas.

## Current decision

`REVIEW-READY / NOT AUTHORIZED TO APPLY`.

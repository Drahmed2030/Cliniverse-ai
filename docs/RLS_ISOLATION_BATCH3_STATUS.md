# RLS Isolation — Batch 3 Status

**BATCH 3 STATUS: BLOCKED-STAGING**

Source branch: `security/rls-user-data-isolation` @ `72cb123`. This batch performed a full static reconciliation of that branch against the already-applied Apple RC1 RLS migration (`supabase/migrations/20260827044500_apple_rc1_runtime_trust.sql`, live in production since 2026-08-27) and produced corrected, staging-only draft artifacts. **Nothing from this batch has been applied to any Supabase project — production or staging.**

## Reasons blocked

1. **Migration `003_release_surface_rls_completion.sql`, as written on the source branch, requires a GRANT fix before it can work.** RC1 already ran `revoke all privileges on table public.cases/public.user_progress from anon, authenticated`. An RLS policy only filters rows a role already has the underlying table-level privilege to see — it does not restore a revoked GRANT. Applying `003` as-is would create policies for `cases` and `user_progress` that exist in `pg_policies` but are permanently unreachable, silently failing to deliver the intended authenticated read access. The corrected version — `supabase/drafts/rls_isolation_reconciled_v1.sql` — adds the missing `GRANT SELECT` / `GRANT SELECT, INSERT, UPDATE` statements alongside the policies, plus self-verifying assertions that abort the transaction if the fix doesn't actually take effect.

2. **The source branch's own rollback files must not be used against current production.** `001_user_data_rls_hardening.rollback.sql`, `002_entitlement_rpc_hardening.rollback.sql`, and `003_release_surface_rls_completion.rollback.sql` all roll back to the **pre-RC1** legacy state — restoring public profile read/insert/update, restoring `is_user_pro` execute to anon/authenticated/PUBLIC, and fully disabling RLS on `cases`/`user_progress`/`leaderboard`. Running any of them today would not just undo this batch's work, it would reopen every hole RC1 already closed. `supabase/drafts/rls_isolation_reconciled_v1.rollback.sql` is the corrected replacement — it rolls back only to the RC1-hardened state, never further.

3. **Live schema inspection and two-user isolation testing require a staging Supabase environment this sandbox does not have.** No `.env`, no Supabase CLI, and no network credentials exist here (confirmed directly, repeatedly, across this whole v1.2 execution). Section 2 (live schema read-only check), Section 5 (staging apply), and Section 6 (positive/negative security tests, two-user isolation) of the Batch 3 plan could not be executed and are marked UNVERIFIED / NOT RUN / STAGING REQUIRED accordingly — not assumed passing.

## What's safe to build on

- `supabase/drafts/rls_isolation_reconciled_v1.sql` — the reconciled migration, draft form, with inline rationale for every deviation from the source branch and a self-verifying assertion block.
- `supabase/drafts/rls_isolation_reconciled_v1.rollback.sql` — the corrected rollback, scoped to undo only what the reconciled migration adds.
- `supabase/drafts/rls_isolation_reconciled_v1_catalog_check.sql` — read-only post-apply verification queries (no writes), adapted from the source branch's own catalog-check test to also cover the GRANT-level fix.

## Next steps (not part of this batch)

1. Obtain a staging Supabase project.
2. Apply `rls_isolation_reconciled_v1.sql` there only.
3. Run `rls_isolation_reconciled_v1_catalog_check.sql` and the full positive/negative/two-user isolation test matrix from `CLINIVERSE_V1_2_EXECUTION_PLAN.md`'s Batch 3 section.
4. Only after all of that passes, seek explicit production migration-window approval.

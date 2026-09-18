# RLS Isolation — Batch 3 Status

**BATCH 3 STATUS: STAGING VERIFIED — PRODUCTION NOT APPLIED**

Source branch: `security/rls-user-data-isolation` @ `72cb123`.

The source branch was first statically reconciled against the already-applied Apple RC1 RLS migration. On 2026-09-18, the reconciled migration was then applied to the existing Supabase **staging** branch only (project ref `xhwotblarwsxoanpiloe`). Production project `zbiujqxinvcxvuviuenx` was inspected read-only and was **not changed**.

## What was verified on staging

- RLS remains enabled on `profiles`, `subscriptions`, `case_completions`, `mcq_answers`, `cases`, `user_progress`, and `leaderboard`.
- `cases` is authenticated read-only.
- `user_progress` is authenticated own-row SELECT/INSERT/UPDATE.
- `leaderboard` remains deny-by-default for anon/authenticated.
- `is_user_pro(uuid)` is not executable by anon/authenticated and remains executable by `service_role`.
- Current real-auth/profile code needs authenticated `profiles` SELECT/INSERT/UPDATE privileges and entitlement code needs authenticated `subscriptions` SELECT; those grants were included in the reconciled staging migration because the live/staging catalog showed they were otherwise missing.
- Two-user isolation was exercised inside a transaction using synthetic user UUIDs and a simulated authenticated JWT claim. User A could read/update/insert only A-owned rows; attempts to read/update/insert User B-owned rows were blocked by RLS. The transaction was rolled back, so no test rows persisted.

## Why the source-branch migration was not applied as-is

1. `003_release_surface_rls_completion.sql` created policies for `cases`/`user_progress` but did not restore the table-level GRANTs that RC1 had revoked, leaving the policies unreachable.
2. The source rollback files restore the pre-RC1 legacy state and must not be used against current production.
3. Current app code also requires authenticated INSERT/UPDATE on `profiles` and authenticated SELECT on `subscriptions`; the staging catalog confirmed those grants were missing before reconciliation.

## Production state

**No Batch 3 migration has been applied to production.**

Production remains on its existing applied migration set. The next production step requires an explicit migration-window decision after reviewing this staging evidence and the reconciled rollback.

## Security-advisor follow-up

Supabase Security Advisor on staging still reports multiple RLS-enabled tables with no policies. Some are intentionally deny-by-default or deferred surfaces; they remain a security backlog item before institutional mode. The advisor also reports the `vector` extension installed in the `public` schema. Neither finding was changed by this batch.

## Canonical artifacts

- `supabase/drafts/rls_isolation_reconciled_v1.sql` — reconciled SQL, updated to match the staging-validated shape.
- `supabase/drafts/rls_isolation_reconciled_v1.rollback.sql` — rollback to the pre-Batch-3 staging/RC1 state.
- `supabase/drafts/rls_isolation_reconciled_v1_catalog_check.sql` — read-only verification queries for the staged shape.

## Next step

Production promotion is **not automatic**. If approved later, promote only the reconciled migration that matches this evidence, then immediately re-run catalog checks and production read-only verification.

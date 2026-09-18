-- Rollback for supabase/drafts/rls_isolation_reconciled_v1.sql
--
-- STAGING-VALIDATED BATCH 3 ROLLBACK.
-- Returns the database to the pre-Batch-3 RC1-hardened privilege shape.
-- It does NOT restore the older pre-RC1 public policies.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Restore profile/subscription grants to the catalog state observed before Batch 3.
revoke insert, update on table public.profiles from authenticated;
-- SELECT on profiles pre-existed and is intentionally preserved.

revoke select on table public.subscriptions from authenticated;

-- CASES: return to RC1 deny-by-default state.
drop policy if exists "cases_select_authenticated" on public.cases;
revoke select on table public.cases from authenticated;
-- Keep RLS enabled.

-- USER_PROGRESS: return to RC1 deny-by-default state.
drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;
revoke select, insert, update on table public.user_progress from authenticated;
-- Keep RLS enabled.

-- LEADERBOARD was already deny-by-default before Batch 3; leave unchanged.

-- Leave service_role execute on is_user_pro in place. Removing it could break a
-- legitimate server-side caller and is not required to restore a safe RC1 state.

commit;

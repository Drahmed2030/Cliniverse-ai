-- Rollback for supabase/drafts/rls_isolation_reconciled_v1.sql
--
-- DRAFT / STAGING ONLY. NOT APPLIED.
--
-- IMPORTANT — this is deliberately NOT the same as the source branch's
-- 001/002/003 .rollback.sql files. Those restore the PRE-RC1 legacy state
-- (public profile read/insert/update, is_user_pro executable by anon/
-- authenticated/PUBLIC, RLS fully disabled on cases/user_progress/
-- leaderboard). Running them today, after RC1 is already live in production,
-- would REOPEN every hole RC1 already closed — not just undo this
-- reconciled migration. This file only undoes what
-- rls_isolation_reconciled_v1.sql itself added, returning the database to
-- exactly the RC1-hardened state, not further back than that.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- CASES: return to RC1's deny-all state.
drop policy if exists "cases_select_authenticated" on public.cases;
revoke select on table public.cases from authenticated;
-- RLS stays enabled — RC1 already enabled it and this rollback must not
-- weaken that regardless of this migration's own outcome.

-- USER_PROGRESS: return to RC1's deny-all state.
drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;
revoke select, insert, update on table public.user_progress from authenticated;

-- ENTITLEMENT RPC: leave the service_role grant in place. Removing it would
-- not restore any prior production state (RC1 never explicitly granted or
-- revoked it for service_role) and could break a legitimate server-side
-- caller if one exists. Not part of this rollback's scope.

commit;

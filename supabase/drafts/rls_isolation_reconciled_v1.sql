-- Cliniverse RLS isolation — RECONCILED against the already-applied RC1 migration
-- Source: reconciliation of security/rls-user-data-isolation @ 72cb123's
-- 001/002/003 migrations against supabase/migrations/20260827044500_apple_rc1_runtime_trust.sql,
-- which is already live in production as of 2026-08-27.
--
-- DRAFT / STAGING ONLY. NOT APPLIED. Do not run against production without an
-- explicit migration-window approval and a prior staging execution.
--
-- What changed from the source branch, and why:
--
-- 1. Migration 001 (profiles/subscriptions/case_completions/mcq_answers own-row
--    policies) is DROPPED from this reconciled file entirely. RC1 already
--    implements the same own-row ownership model for all four tables, plus
--    stricter column-level GRANTs 001 did not have. Re-running 001 would be a
--    harmless no-op at best (DROP POLICY IF EXISTS / CREATE POLICY with the
--    same auth.uid() predicate) but adds nothing RC1 doesn't already do more
--    precisely — so it is left out rather than carried forward as dead weight.
--
-- 2. Migration 002's core revoke (is_user_pro from PUBLIC/anon/authenticated)
--    is also already done by RC1. The ONE genuine gap RC1 left is the
--    explicit `grant execute ... to service_role` — RC1's migration revokes
--    from PUBLIC (which is inherited by every role, including service_role,
--    unless service_role has its own independent grant) but never re-grants
--    to service_role. Depending on how service_role's prior access was
--    sourced, RC1 may have *inadvertently* removed service_role's own
--    execute privilege on is_user_pro. That grant is carried forward below,
--    idempotently, as the only real addition from 002.
--
-- 3. Migration 003 as originally written is INCOMPATIBLE with RC1's current
--    state and would silently do nothing useful for `cases` and
--    `user_progress`: RC1 already ran
--    `revoke all privileges on table public.cases from anon, authenticated`
--    (and the same for user_progress). A Postgres RLS policy only filters
--    rows a role is otherwise privileged to see — it does not substitute for
--    the underlying table-level GRANT. Adding 003's policies alone, without
--    re-granting the baseline privilege RC1 revoked, would create policies
--    that exist but are permanently unreachable. This reconciled file adds
--    the missing GRANT statements alongside the policies so the intended
--    behavior (authenticated can read `cases`; authenticated can read/
--    insert/update only their own `user_progress` row) actually takes
--    effect.
--
-- 4. Migration 003's `leaderboard` section is DROPPED — RC1 already put
--    `leaderboard` in the exact deny-by-default state 003 wanted
--    (RLS enabled, all privileges revoked from anon/authenticated, no client
--    policy). Nothing to add.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- ── Entitlement RPC: restore service_role's own execute grant ─────────────
-- Idempotent. anon/authenticated/PUBLIC already have no access after RC1;
-- this only ensures service_role has an explicit grant that does not depend
-- on the PUBLIC grant RC1 revoked.
grant execute on function public.is_user_pro(uuid) to service_role;

-- ── CASES: educational/reference content, authenticated read-only ─────────
alter table public.cases enable row level security;

drop policy if exists "Authenticated users can read cases" on public.cases;
create policy "cases_select_authenticated"
  on public.cases
  for select
  to authenticated
  using (true);

-- Required alongside the policy above — RC1 revoked all table privileges on
-- `cases` from authenticated; without this grant the policy is unreachable.
grant select on table public.cases to authenticated;

-- ── USER_PROGRESS: legacy user-owned progression, own-row only ────────────
alter table public.user_progress enable row level security;

drop policy if exists "Users can read own user progress" on public.user_progress;
drop policy if exists "Users can insert own user progress" on public.user_progress;
drop policy if exists "Users can update own user progress" on public.user_progress;
drop policy if exists "user_progress_select_own" on public.user_progress;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "user_progress_update_own" on public.user_progress;

create policy "user_progress_select_own"
  on public.user_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_progress_insert_own"
  on public.user_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_progress_update_own"
  on public.user_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Required alongside the policies above, for the same reason as `cases`.
grant select, insert, update on table public.user_progress to authenticated;

-- leaderboard: intentionally untouched. RC1 already left it RLS-enabled with
-- zero client privileges/policies — the exact state 003 wanted.

-- Fail the migration if the intended boundaries are not actually present.
do $reconciliation_assertions$
begin
  if not (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'cases') then
    raise exception 'cases is missing RLS after reconciliation';
  end if;

  if not has_table_privilege('authenticated', 'public.cases', 'SELECT') then
    raise exception 'authenticated cannot SELECT cases after reconciliation — policy would be unreachable';
  end if;

  if has_table_privilege('authenticated', 'public.cases', 'INSERT')
     or has_table_privilege('authenticated', 'public.cases', 'UPDATE')
     or has_table_privilege('authenticated', 'public.cases', 'DELETE') then
    raise exception 'authenticated has an unexpected write privilege on cases';
  end if;

  if not has_table_privilege('authenticated', 'public.user_progress', 'SELECT') then
    raise exception 'authenticated cannot SELECT user_progress after reconciliation — policy would be unreachable';
  end if;

  if not has_function_privilege('service_role', 'public.is_user_pro(uuid)', 'EXECUTE') then
    raise exception 'service_role lost execute on is_user_pro after reconciliation';
  end if;

  if has_function_privilege('anon', 'public.is_user_pro(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.is_user_pro(uuid)', 'EXECUTE') then
    raise exception 'is_user_pro remains client-executable after reconciliation';
  end if;
end
$reconciliation_assertions$;

commit;

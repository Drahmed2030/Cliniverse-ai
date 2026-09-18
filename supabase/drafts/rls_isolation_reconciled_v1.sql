-- Cliniverse RLS isolation — RECONCILED against the already-applied RC1 migration
-- Source: reconciliation of security/rls-user-data-isolation @ 72cb123.
--
-- STAGING VALIDATED 2026-09-18 on Supabase branch xhwotblarwsxoanpiloe.
-- NOT APPLIED TO PRODUCTION.
--
-- The original branch migrations were not used as-is because RC1 had already
-- changed both RLS policies and table-level privileges. This reconciled shape
-- matches the current app contracts and the staging catalog.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Current app/lib/profile.ts calls SELECT/INSERT/UPDATE on own profile rows.
-- RLS remains the row boundary; these grants only make the own-row policies reachable.
grant select, insert, update on table public.profiles to authenticated;

-- Current app/lib/entitlements.ts reads the authenticated user's own subscription.
-- No client write privilege is granted.
grant select on table public.subscriptions to authenticated;

-- Legacy entitlement RPC is service-side only.
revoke execute on function public.is_user_pro(uuid) from public;
revoke execute on function public.is_user_pro(uuid) from anon;
revoke execute on function public.is_user_pro(uuid) from authenticated;
grant execute on function public.is_user_pro(uuid) to service_role;

-- CASES: educational/reference content, authenticated read-only.
alter table public.cases enable row level security;
drop policy if exists "Authenticated users can read cases" on public.cases;
drop policy if exists "cases_select_authenticated" on public.cases;
create policy "cases_select_authenticated"
  on public.cases
  for select
  to authenticated
  using (true);

grant select on table public.cases to authenticated;
revoke insert, update, delete on table public.cases from authenticated;

-- USER_PROGRESS: user-owned progression, own-row only.
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

grant select, insert, update on table public.user_progress to authenticated;
revoke delete on table public.user_progress from authenticated;

-- LEADERBOARD: remain deny-by-default for clients.
alter table public.leaderboard enable row level security;
revoke all privileges on table public.leaderboard from anon, authenticated;

-- Self-verifying assertions.
do $reconciliation_assertions$
begin
  if not has_table_privilege('authenticated', 'public.profiles', 'SELECT')
     or not has_table_privilege('authenticated', 'public.profiles', 'INSERT')
     or not has_table_privilege('authenticated', 'public.profiles', 'UPDATE') then
    raise exception 'authenticated profile privileges do not match the real-auth profile contract';
  end if;

  if not has_table_privilege('authenticated', 'public.subscriptions', 'SELECT') then
    raise exception 'authenticated cannot read own subscription entitlement';
  end if;

  if not has_table_privilege('authenticated', 'public.cases', 'SELECT')
     or has_table_privilege('authenticated', 'public.cases', 'INSERT')
     or has_table_privilege('authenticated', 'public.cases', 'UPDATE')
     or has_table_privilege('authenticated', 'public.cases', 'DELETE') then
    raise exception 'cases privilege boundary is incorrect';
  end if;

  if not has_table_privilege('authenticated', 'public.user_progress', 'SELECT')
     or not has_table_privilege('authenticated', 'public.user_progress', 'INSERT')
     or not has_table_privilege('authenticated', 'public.user_progress', 'UPDATE')
     or has_table_privilege('authenticated', 'public.user_progress', 'DELETE') then
    raise exception 'user_progress privilege boundary is incorrect';
  end if;

  if has_table_privilege('authenticated', 'public.leaderboard', 'SELECT') then
    raise exception 'leaderboard is no longer deny-by-default';
  end if;

  if has_function_privilege('anon', 'public.is_user_pro(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.is_user_pro(uuid)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.is_user_pro(uuid)', 'EXECUTE') then
    raise exception 'is_user_pro execution boundary is incorrect';
  end if;
end
$reconciliation_assertions$;

commit;

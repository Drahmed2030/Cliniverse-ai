-- Cliniverse AI Apple RC1 runtime-trust hardening.
--
-- PRODUCTION HOLD: this migration is intentionally committed but must not be
-- applied until an explicit production migration-window GO is recorded.
-- Apply through the Supabase migration mechanism only, after a current backup,
-- staging execution and the companion runtime tests.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Active RC identity: authenticated users may see and edit only their row.
alter table public.profiles enable row level security;

drop policy if exists "Public insert" on public.profiles;
drop policy if exists "Public read" on public.profiles;
drop policy if exists "Public update" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

revoke all privileges on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, name, specialty, country, level, institution, target_board, study_hours, preferred_tools, rank)
  on table public.profiles to authenticated;
grant update (name, specialty, country)
  on table public.profiles to authenticated;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Active RC entitlement: clients may read their authority but never create,
-- mutate or delete subscription records.
alter table public.subscriptions enable row level security;

drop policy if exists "Service role can insert subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscription" on public.subscriptions;
drop policy if exists "subscriptions_select_own" on public.subscriptions;

revoke all privileges on table public.subscriptions from anon, authenticated;
grant select (user_id, plan, status, expires_at, created_at)
  on table public.subscriptions to authenticated;

create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Auth-scoped progress helpers are present in the release code. These policies
-- allow only own-row inserts and reads; mutation and deletion remain closed.
alter table public.case_completions enable row level security;
alter table public.mcq_answers enable row level security;

drop policy if exists "case_completions_select_own" on public.case_completions;
drop policy if exists "case_completions_insert_own" on public.case_completions;
drop policy if exists "mcq_answers_select_own" on public.mcq_answers;
drop policy if exists "mcq_answers_insert_own" on public.mcq_answers;

revoke all privileges on table public.case_completions from anon, authenticated;
revoke all privileges on table public.mcq_answers from anon, authenticated;
grant select, insert on table public.case_completions to authenticated;
grant select, insert on table public.mcq_answers to authenticated;

create policy "case_completions_select_own"
  on public.case_completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "case_completions_insert_own"
  on public.case_completions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "mcq_answers_select_own"
  on public.mcq_answers
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "mcq_answers_insert_own"
  on public.mcq_answers
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Critical deferred tables are not part of Apple v1. Deny them safely instead
-- of inventing release behavior or leaving the Data API open.
alter table public.cases enable row level security;
alter table public.user_progress enable row level security;
alter table public.leaderboard enable row level security;

revoke all privileges on table public.cases from anon, authenticated;
revoke all privileges on table public.user_progress from anon, authenticated;
revoke all privileges on table public.leaderboard from anon, authenticated;

-- Remove legacy public write paths from deferred live-content tables. Existing
-- read policies remain unchanged; trusted server jobs continue via service role.
drop policy if exists "public insert cases" on public.daily_cases;
drop policy if exists "Admin can manage cases" on public.live_cases;

revoke insert, update, delete, truncate, references, trigger
  on table public.daily_cases from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.live_cases from anon, authenticated;

-- The legacy arbitrary-user entitlement RPC is excluded from Apple RC1.
revoke execute on function public.is_user_pro(uuid) from PUBLIC, anon, authenticated;
alter function public.is_user_pro(uuid) set search_path = '';

-- Dormant legacy functions must not remain client-callable through the Data
-- API. The trigger helper has no attached trigger in the verified production
-- schema, and knowledge matching is disabled in Apple v1. Trusted server work
-- may continue through service_role after a separate feature review.
revoke execute on function public.handle_new_user() from PUBLIC, anon, authenticated;
alter function public.handle_new_user() set search_path = 'public';

revoke execute on function public.match_clinical_cases(vector, real, integer)
  from PUBLIC, anon, authenticated;
grant execute on function public.match_clinical_cases(vector, real, integer)
  to service_role;
alter function public.match_clinical_cases(vector, real, integer)
  set search_path = 'public';

-- Fail the migration if its essential authority boundaries are not present.
do $migration_assertions$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('profiles', 'subscriptions', 'case_completions', 'mcq_answers', 'cases', 'user_progress', 'leaderboard')
      and not c.relrowsecurity
  ) then
    raise exception 'RC1 runtime-trust migration left a required table without RLS';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT') then
    raise exception 'anon still has profile SELECT';
  end if;

  if has_table_privilege('anon', 'public.subscriptions', 'INSERT')
     or has_table_privilege('authenticated', 'public.subscriptions', 'INSERT') then
    raise exception 'client subscription INSERT remains available';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'is_pro', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'subscription_status', 'UPDATE') then
    raise exception 'authenticated users can still update entitlement-like profile columns';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'name', 'UPDATE') then
    raise exception 'authenticated profile editing grant is missing';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'subscriptions'
      and policyname = 'subscriptions_select_own'
      and cmd = 'SELECT'
  ) then
    raise exception 'own-subscription SELECT policy is missing';
  end if;

  if has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE') then
    raise exception 'legacy signup trigger helper remains client-executable';
  end if;

  if has_function_privilege('anon', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE') then
    raise exception 'deferred knowledge matching remains client-executable';
  end if;
end
$migration_assertions$;

commit;

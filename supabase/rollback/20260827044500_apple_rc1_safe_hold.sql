-- Emergency post-apply rollback for the Apple RC1 runtime-trust migration.
--
-- This deliberately restores a deny-all safe state instead of recreating the
-- insecure public policies. The release shell will fail closed until the
-- forward migration is corrected and re-applied.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.case_completions enable row level security;
alter table public.mcq_answers enable row level security;
alter table public.cases enable row level security;
alter table public.user_progress enable row level security;
alter table public.leaderboard enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "case_completions_select_own" on public.case_completions;
drop policy if exists "case_completions_insert_own" on public.case_completions;
drop policy if exists "mcq_answers_select_own" on public.mcq_answers;
drop policy if exists "mcq_answers_insert_own" on public.mcq_answers;

revoke all privileges on table public.profiles from anon, authenticated;
revoke all privileges on table public.subscriptions from anon, authenticated;
revoke all privileges on table public.case_completions from anon, authenticated;
revoke all privileges on table public.mcq_answers from anon, authenticated;
revoke all privileges on table public.cases from anon, authenticated;
revoke all privileges on table public.user_progress from anon, authenticated;
revoke all privileges on table public.leaderboard from anon, authenticated;

-- Table-level REVOKE does not remove column-level grants created by the
-- forward migration, so remove those explicitly as well.
revoke insert (id, name, specialty, country, level, institution, target_board, study_hours, preferred_tools, rank)
  on table public.profiles from authenticated;
revoke update (name, specialty, country)
  on table public.profiles from authenticated;
revoke select (user_id, plan, status, expires_at, created_at)
  on table public.subscriptions from authenticated;

revoke execute on function public.is_user_pro(uuid) from PUBLIC, anon, authenticated;
revoke execute on function public.handle_new_user() from PUBLIC, anon, authenticated;
revoke execute on function public.match_clinical_cases(vector, real, integer)
  from PUBLIC, anon, authenticated;

commit;

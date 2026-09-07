-- Rollback for 003_release_surface_rls_completion.sql
-- Emergency rollback only. This intentionally restores the prior table-level RLS state.

-- Remove policies introduced by 003.
drop policy if exists "Authenticated users can read cases" on public.cases;

drop policy if exists "Users can read own user progress" on public.user_progress;
drop policy if exists "Users can insert own user progress" on public.user_progress;
drop policy if exists "Users can update own user progress" on public.user_progress;

-- Restore the verified pre-003 RLS state for these three legacy tables.
alter table public.cases disable row level security;
alter table public.user_progress disable row level security;
alter table public.leaderboard disable row level security;

-- WARNING: rollback reduces isolation and is not an acceptable steady-state security posture.

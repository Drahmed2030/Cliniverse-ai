-- Cliniverse release-surface RLS completion
-- Prepared for review only. Do not apply to production until the controlled migration window is approved.

-- CASES
-- Educational/reference content. Authenticated users may read; client writes remain blocked.
alter table public.cases enable row level security;

drop policy if exists "Authenticated users can read cases" on public.cases;
create policy "Authenticated users can read cases"
on public.cases
for select
to authenticated
using (true);

-- USER_PROGRESS
-- Legacy/user-owned progression table. Preserve future compatibility with strict ownership.
alter table public.user_progress enable row level security;

drop policy if exists "Users can read own user progress" on public.user_progress;
drop policy if exists "Users can insert own user progress" on public.user_progress;
drop policy if exists "Users can update own user progress" on public.user_progress;

create policy "Users can read own user progress"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own user progress"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own user progress"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- LEADERBOARD
-- The current App Store release does not require a public leaderboard.
-- Enable RLS with no client policy so rows are denied by default until a separate
-- privacy/minimization design is approved. Server/service-role access remains possible.
alter table public.leaderboard enable row level security;

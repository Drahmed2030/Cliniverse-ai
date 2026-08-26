-- Cliniverse user-data isolation hardening
-- Prepared for review only. Do not apply to production until auth flow and migration validation pass.

-- PROFILES
alter table public.profiles enable row level security;

drop policy if exists "Public insert" on public.profiles;
drop policy if exists "Public read" on public.profiles;
drop policy if exists "Public update" on public.profiles;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- SUBSCRIPTIONS
alter table public.subscriptions enable row level security;

drop policy if exists "Service role can insert subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscription" on public.subscriptions;

create policy "Service role can insert subscriptions"
on public.subscriptions
for insert
to service_role
with check (true);

create policy "Users can view own subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

-- CASE COMPLETIONS
alter table public.case_completions enable row level security;

create policy "Users can insert own case completions"
on public.case_completions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read own case completions"
on public.case_completions
for select
to authenticated
using (auth.uid() = user_id);

-- MCQ ANSWERS
alter table public.mcq_answers enable row level security;

create policy "Users can insert own mcq answers"
on public.mcq_answers
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read own mcq answers"
on public.mcq_answers
for select
to authenticated
using (auth.uid() = user_id);

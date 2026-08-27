-- Cliniverse user-data isolation rollback
-- Use only if the corresponding hardening migration must be reversed during a controlled rollback window.

-- Remove hardened policies.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Service role can insert subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscription" on public.subscriptions;

drop policy if exists "Users can insert own case completions" on public.case_completions;
drop policy if exists "Users can read own case completions" on public.case_completions;

drop policy if exists "Users can insert own mcq answers" on public.mcq_answers;
drop policy if exists "Users can read own mcq answers" on public.mcq_answers;

-- Restore the legacy policies that were present before the hardening migration.
-- IMPORTANT: these policies are intentionally permissive because this file is a rollback to the known prior state,
-- not the desired production security posture.
create policy "Public insert"
on public.profiles
for insert
to public
with check (true);

create policy "Public read"
on public.profiles
for select
to public
using (true);

create policy "Public update"
on public.profiles
for update
to public
using (true)
with check (true);

create policy "Service role can insert subscriptions"
on public.subscriptions
for insert
to public
with check (true);

create policy "Users can view own subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

-- RLS remains enabled on all tables.
-- case_completions and mcq_answers intentionally return to their prior state with no own-row policies.

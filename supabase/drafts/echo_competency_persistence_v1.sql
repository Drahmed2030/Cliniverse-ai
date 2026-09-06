-- DRAFT ONLY — not applied to production.
-- Echo Competency Persistence v1
-- Design goals: immutable evidence, user-owned projections, explicit RLS, no duplication of legacy case_attempts.

create table if not exists public.echo_competency_events (
  event_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null,
  task_id text not null,
  task_version text not null,
  skill_id text not null,
  selected_answer text not null,
  normalized_score integer not null check (normalized_score between 0 and 100),
  confidence integer not null check (confidence between 1 and 5),
  response_time_ms integer not null check (response_time_ms >= 0),
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, case_id, task_id, task_version, observed_at)
);

create index if not exists echo_competency_events_user_skill_time_idx
  on public.echo_competency_events (user_id, skill_id, observed_at desc);

alter table public.echo_competency_events enable row level security;

revoke all on table public.echo_competency_events from anon, authenticated;
grant select, insert on table public.echo_competency_events to authenticated;

create policy "echo competency events select own"
  on public.echo_competency_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "echo competency events insert own"
  on public.echo_competency_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create table if not exists public.echo_skill_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null,
  evidence_count integer not null check (evidence_count >= 0),
  score integer not null check (score between 0 and 100),
  confidence_calibration integer not null check (confidence_calibration between 0 and 100),
  band text not null check (band in ('novice','developing','proficient','mastered')),
  last_observed_at timestamptz,
  projected_at timestamptz not null,
  primary key (user_id, skill_id)
);

alter table public.echo_skill_mastery enable row level security;

revoke all on table public.echo_skill_mastery from anon, authenticated;
grant select, insert, update on table public.echo_skill_mastery to authenticated;

create policy "echo mastery select own"
  on public.echo_skill_mastery
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "echo mastery insert own"
  on public.echo_skill_mastery
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "echo mastery update own"
  on public.echo_skill_mastery
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Deliberately no DELETE policy for either table in v1.
-- Evidence events are append-only from the learner client.
-- Projection rows may be recomputed/upserted but remain user-owned.

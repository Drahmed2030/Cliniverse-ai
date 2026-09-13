-- REVIEW CANDIDATE ONLY — not a migration and not applied to live Supabase.
-- Supersedes the fa820b3 draft: events only; no client-writable mastery table.
-- Apply to an empty target only, inside a transaction. Existing tables require reconciliation.
begin;

create table public.echo_competency_events (
  event_id text not null check (length(btrim(event_id)) between 1 and 1024),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id text not null check (length(btrim(case_id)) between 1 and 256),
  task_id text not null check (length(btrim(task_id)) between 1 and 256),
  task_version text not null check (length(btrim(task_version)) between 1 and 128),
  skill_id text not null check (length(btrim(skill_id)) between 1 and 256),
  selected_answer text not null check (length(btrim(selected_answer)) between 1 and 4096),
  normalized_score integer not null check (normalized_score between 0 and 100),
  confidence integer not null check (confidence between 1 and 5),
  response_time_ms integer not null check (response_time_ms >= 0),
  observed_at timestamptz not null check (isfinite(observed_at)),
  created_at timestamptz not null default now(),
  primary key (user_id, event_id),
  unique (user_id, case_id, task_id, task_version, observed_at)
);

comment on table public.echo_competency_events is
  'Learner-submitted educational assessment evidence. Not authoritative mastery, clinical competence, XP or entitlement.';

create index echo_competency_events_user_skill_time_idx
  on public.echo_competency_events (user_id, skill_id, observed_at desc);
create index echo_competency_events_user_created_idx
  on public.echo_competency_events (user_id, created_at desc, event_id);

alter table public.echo_competency_events enable row level security;
alter table public.echo_competency_events force row level security;
revoke all on table public.echo_competency_events from public, anon, authenticated;
grant select on table public.echo_competency_events to authenticated;
-- created_at is server-owned; no blanket INSERT grant or UPDATE/DELETE grant.
grant insert (event_id, user_id, case_id, task_id, task_version, skill_id,
  selected_answer, normalized_score, confidence, response_time_ms, observed_at)
  on public.echo_competency_events to authenticated;

create policy "echo competency events select own"
  on public.echo_competency_events for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "echo competency events insert own"
  on public.echo_competency_events for insert to authenticated
  with check ((select auth.uid()) = user_id);

commit;

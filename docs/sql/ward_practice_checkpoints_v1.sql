create table public.ward_practice_checkpoints (
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null,
 checkpoint integer not null check (checkpoint between 0 and 64),
 content_version text not null check (content_version = 'w1-handover-1.0.0'),
 actions jsonb not null check (jsonb_typeof(actions)='array' and jsonb_array_length(actions)=checkpoint and octet_length(actions::text)<20000),
 created_at timestamptz not null default clock_timestamp(),
 primary key (user_id,session_id,checkpoint)
);
alter table public.ward_practice_checkpoints enable row level security;
alter table public.ward_practice_checkpoints force row level security;
revoke all on public.ward_practice_checkpoints from public,anon,authenticated;
grant select on public.ward_practice_checkpoints to authenticated;
grant insert(user_id,session_id,checkpoint,content_version,actions) on public.ward_practice_checkpoints to authenticated;
create policy ward_checkpoint_own_select on public.ward_practice_checkpoints for select to authenticated using ((select auth.uid())=user_id and (select auth.jwt()->>'email')='reviewer@cliniverseai.com');
create policy ward_checkpoint_own_insert on public.ward_practice_checkpoints for insert to authenticated with check ((select auth.uid())=user_id and (select auth.jwt()->>'email')='reviewer@cliniverseai.com');
create index ward_checkpoint_recent on public.ward_practice_checkpoints(user_id,created_at desc);
comment on table public.ward_practice_checkpoints is 'Reviewer-owned unscored practice checkpoints. Never use as competency or entitlement evidence.';

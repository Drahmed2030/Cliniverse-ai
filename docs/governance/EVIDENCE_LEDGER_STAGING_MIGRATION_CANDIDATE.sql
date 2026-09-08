-- STAGING MIGRATION CANDIDATE ONLY — DO NOT APPLY WITHOUT EXPLICIT AUTHORIZATION.
-- Shared Cliniverse / NeuraOps Core Evidence & Provenance Ledger v1.
-- Storage stays private in governance. Only narrow service-role RPCs live in api.
-- No PHI payloads, no client table access, no UPDATE/DELETE path, no Realtime publication.

begin;

create schema if not exists governance;
create schema if not exists api;

create table if not exists governance.evidence_ledger_events (
  event_id text primary key,
  product text not null check (product in ('CLINIVERSE', 'NEURAOPS_CORE')),
  subject_id text not null,
  event_kind text not null check (event_kind in (
    'INGESTED',
    'TRANSFORMED',
    'PROBED',
    'PRIVACY_PREFLIGHT',
    'PRIVACY_ATTESTED',
    'CLINICAL_ATTESTED',
    'DEVICE_BASELINE_BOUND',
    'PROMOTION_DECIDED',
    'RETIRED',
    'RECALLED'
  )),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  artifact_sha256 text[] not null check (cardinality(artifact_sha256) > 0),
  actor_type text not null check (actor_type in ('HUMAN', 'AI', 'SYSTEM')),
  actor_id text not null,
  policy_bindings text[] not null check (cardinality(policy_bindings) > 0),
  parent_event_ids text[] not null default '{}',
  evidence_record_ids text[] not null default '{}',
  canonical_event jsonb not null,
  constraint evidence_ledger_event_id_matches_payload
    check (canonical_event ->> 'eventId' = event_id),
  constraint evidence_ledger_product_matches_payload
    check (canonical_event ->> 'product' = product),
  constraint evidence_ledger_subject_matches_payload
    check (canonical_event ->> 'subjectId' = subject_id),
  constraint evidence_ledger_kind_matches_payload
    check (canonical_event ->> 'kind' = event_kind)
);

create index if not exists evidence_ledger_product_subject_idx
  on governance.evidence_ledger_events (product, subject_id, occurred_at, recorded_at, event_id);

create index if not exists evidence_ledger_event_kind_idx
  on governance.evidence_ledger_events (product, event_kind, occurred_at);

create index if not exists evidence_ledger_artifact_sha_idx
  on governance.evidence_ledger_events using gin (artifact_sha256);

alter table governance.evidence_ledger_events enable row level security;

-- Private storage schema: client roles get no schema/table access.
revoke all on schema governance from public, anon, authenticated;
revoke all on table governance.evidence_ledger_events from public, anon, authenticated;

grant usage on schema governance to service_role;
grant select, insert on table governance.evidence_ledger_events to service_role;

-- Hard append-only guard. SECURITY INVOKER is sufficient: the trigger only rejects mutation.
create or replace function governance.reject_evidence_ledger_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, governance, pg_temp
as $$
begin
  raise exception 'evidence ledger is append-only; UPDATE/DELETE are forbidden';
end;
$$;

revoke all on function governance.reject_evidence_ledger_mutation() from public, anon, authenticated;

-- Recreate triggers deterministically for staging migration idempotence.
drop trigger if exists evidence_ledger_no_update on governance.evidence_ledger_events;
drop trigger if exists evidence_ledger_no_delete on governance.evidence_ledger_events;

create trigger evidence_ledger_no_update
before update on governance.evidence_ledger_events
for each row execute function governance.reject_evidence_ledger_mutation();

create trigger evidence_ledger_no_delete
before delete on governance.evidence_ledger_events
for each row execute function governance.reject_evidence_ledger_mutation();

-- Narrow RPC surface. api is the only schema intended to be added to Supabase Exposed Schemas.
revoke all on schema api from public, anon, authenticated;
grant usage on schema api to service_role;

create or replace function api.governance_ledger_find_event(p_event_id text)
returns setof governance.evidence_ledger_events
language sql
stable
security invoker
set search_path = pg_catalog, governance, pg_temp
as $$
  select e.*
  from governance.evidence_ledger_events e
  where e.event_id = p_event_id
  limit 1;
$$;

create or replace function api.governance_ledger_append_event(
  p_event_id text,
  p_product text,
  p_subject_id text,
  p_event_kind text,
  p_occurred_at timestamptz,
  p_recorded_at timestamptz,
  p_artifact_sha256 text[],
  p_actor_type text,
  p_actor_id text,
  p_policy_bindings text[],
  p_parent_event_ids text[],
  p_evidence_record_ids text[],
  p_canonical_event jsonb
)
returns setof governance.evidence_ledger_events
language plpgsql
volatile
security invoker
set search_path = pg_catalog, governance, pg_temp
as $$
begin
  if p_event_id is null or btrim(p_event_id) = '' then raise exception 'event_id is required'; end if;
  if p_subject_id is null or btrim(p_subject_id) = '' then raise exception 'subject_id is required'; end if;
  if p_actor_id is null or btrim(p_actor_id) = '' then raise exception 'actor_id is required'; end if;
  if p_product not in ('CLINIVERSE', 'NEURAOPS_CORE') then raise exception 'invalid product'; end if;
  if p_event_kind not in (
    'INGESTED','TRANSFORMED','PROBED','PRIVACY_PREFLIGHT','PRIVACY_ATTESTED',
    'CLINICAL_ATTESTED','DEVICE_BASELINE_BOUND','PROMOTION_DECIDED','RETIRED','RECALLED'
  ) then raise exception 'invalid event_kind'; end if;
  if p_actor_type not in ('HUMAN', 'AI', 'SYSTEM') then raise exception 'invalid actor_type'; end if;
  if p_occurred_at is null then raise exception 'occurred_at is required'; end if;
  if p_recorded_at is null then raise exception 'recorded_at is required'; end if;
  if p_canonical_event is null then raise exception 'canonical_event is required'; end if;
  if cardinality(p_artifact_sha256) < 1 then raise exception 'artifact_sha256 is required'; end if;
  if cardinality(p_policy_bindings) < 1 then raise exception 'policy_bindings is required'; end if;

  return query
  insert into governance.evidence_ledger_events (
    event_id, product, subject_id, event_kind, occurred_at, recorded_at,
    artifact_sha256, actor_type, actor_id, policy_bindings,
    parent_event_ids, evidence_record_ids, canonical_event
  ) values (
    p_event_id, p_product, p_subject_id, p_event_kind, p_occurred_at, p_recorded_at,
    p_artifact_sha256, p_actor_type, p_actor_id, p_policy_bindings,
    coalesce(p_parent_event_ids, '{}'), coalesce(p_evidence_record_ids, '{}'), p_canonical_event
  )
  returning *;
end;
$$;

create or replace function api.governance_ledger_list_subject(
  p_product text,
  p_subject_id text,
  p_limit integer default 100
)
returns setof governance.evidence_ledger_events
language plpgsql
stable
security invoker
set search_path = pg_catalog, governance, pg_temp
as $$
begin
  if p_product not in ('CLINIVERSE', 'NEURAOPS_CORE') then raise exception 'invalid product'; end if;
  if p_subject_id is null or btrim(p_subject_id) = '' then raise exception 'subject_id is required'; end if;
  if p_limit < 1 or p_limit > 500 then raise exception 'limit must be between 1 and 500'; end if;

  return query
  select e.*
  from governance.evidence_ledger_events e
  where e.product = p_product
    and e.subject_id = p_subject_id
  order by e.occurred_at asc, e.recorded_at asc, e.event_id asc
  limit p_limit;
end;
$$;

revoke all on function api.governance_ledger_find_event(text) from public, anon, authenticated;
revoke all on function api.governance_ledger_append_event(text,text,text,text,timestamptz,timestamptz,text[],text,text,text[],text[],text[],jsonb) from public, anon, authenticated;
revoke all on function api.governance_ledger_list_subject(text,text,integer) from public, anon, authenticated;

grant execute on function api.governance_ledger_find_event(text) to service_role;
grant execute on function api.governance_ledger_append_event(text,text,text,text,timestamptz,timestamptz,text[],text,text,text[],text[],text[],jsonb) to service_role;
grant execute on function api.governance_ledger_list_subject(text,text,integer) to service_role;

-- Deliberately absent: UPDATE/DELETE grants, client execution grants, Realtime publication,
-- direct PHI fields, and any change to Supabase Exposed Schemas. Exposed-schema configuration
-- is a separate explicit staging action after this SQL is reviewed and authorized.

commit;

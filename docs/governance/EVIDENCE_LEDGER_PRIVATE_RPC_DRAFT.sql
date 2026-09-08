-- DRAFT ONLY — DO NOT APPLY WITHOUT EXPLICIT RELEASE AUTHORIZATION.
-- Shared Cliniverse / NeuraOps Core private ledger RPC boundary v1.
-- Storage stays in private schema governance. Only narrow RPC functions live in exposed schema api.
-- No direct table exposure. No client-role execution. No Realtime publication.

begin;

create schema if not exists api;

revoke all on schema api from public, anon, authenticated;
grant usage on schema api to service_role;

-- Keep the governance storage schema private from client roles.
revoke all on schema governance from public, anon, authenticated;
revoke all on table governance.evidence_ledger_events from public, anon, authenticated;

grant usage on schema governance to service_role;
grant select, insert on table governance.evidence_ledger_events to service_role;

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
  if p_event_id is null or btrim(p_event_id) = '' then
    raise exception 'event_id is required';
  end if;
  if p_subject_id is null or btrim(p_subject_id) = '' then
    raise exception 'subject_id is required';
  end if;
  if p_product not in ('CLINIVERSE', 'NEURAOPS_CORE') then
    raise exception 'invalid product';
  end if;
  if cardinality(p_artifact_sha256) < 1 then
    raise exception 'artifact_sha256 is required';
  end if;
  if cardinality(p_policy_bindings) < 1 then
    raise exception 'policy_bindings is required';
  end if;

  return query
  insert into governance.evidence_ledger_events (
    event_id,
    product,
    subject_id,
    event_kind,
    occurred_at,
    recorded_at,
    artifact_sha256,
    actor_type,
    actor_id,
    policy_bindings,
    parent_event_ids,
    evidence_record_ids,
    canonical_event
  ) values (
    p_event_id,
    p_product,
    p_subject_id,
    p_event_kind,
    p_occurred_at,
    p_recorded_at,
    p_artifact_sha256,
    p_actor_type,
    p_actor_id,
    p_policy_bindings,
    coalesce(p_parent_event_ids, '{}'),
    coalesce(p_evidence_record_ids, '{}'),
    p_canonical_event
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
  if p_product not in ('CLINIVERSE', 'NEURAOPS_CORE') then
    raise exception 'invalid product';
  end if;
  if p_subject_id is null or btrim(p_subject_id) = '' then
    raise exception 'subject_id is required';
  end if;
  if p_limit < 1 or p_limit > 500 then
    raise exception 'limit must be between 1 and 500';
  end if;

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

-- Deliberately absent:
--   * grants to anon/authenticated
--   * direct table API grants
--   * UPDATE/DELETE RPCs
--   * Realtime publication
--   * PHI payload fields
-- The api schema itself would only be added to Supabase Exposed Schemas after explicit staging authorization.

commit;

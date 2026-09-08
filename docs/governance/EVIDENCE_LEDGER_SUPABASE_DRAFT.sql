-- DRAFT ONLY — DO NOT APPLY WITHOUT EXPLICIT RELEASE AUTHORIZATION.
-- Shared Cliniverse / NeuraOps Core Evidence & Provenance Ledger v1.
-- Design goals: append-only, no direct PHI payloads, server-side writes only,
-- globally unique event ids, product partitioning, SHA-bound artifacts, immutable audit history.

create schema if not exists governance;

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
  on governance.evidence_ledger_events (product, subject_id, occurred_at);

create index if not exists evidence_ledger_event_kind_idx
  on governance.evidence_ledger_events (product, event_kind, occurred_at);

create index if not exists evidence_ledger_artifact_sha_idx
  on governance.evidence_ledger_events using gin (artifact_sha256);

alter table governance.evidence_ledger_events enable row level security;

-- Client roles must not access the governance ledger directly.
revoke all on schema governance from anon, authenticated;
revoke all on table governance.evidence_ledger_events from anon, authenticated;

-- service_role is reserved for trusted server-side adapters only.
grant usage on schema governance to service_role;
grant select, insert on governance.evidence_ledger_events to service_role;

-- Hard append-only guard: UPDATE/DELETE are forbidden even for privileged application paths.
create or replace function governance.reject_evidence_ledger_mutation()
returns trigger
language plpgsql
security definer
set search_path = governance, pg_temp
as $$
begin
  raise exception 'evidence ledger is append-only; UPDATE/DELETE are forbidden';
end;
$$;

revoke all on function governance.reject_evidence_ledger_mutation() from public;

create trigger evidence_ledger_no_update
before update on governance.evidence_ledger_events
for each row execute function governance.reject_evidence_ledger_mutation();

create trigger evidence_ledger_no_delete
before delete on governance.evidence_ledger_events
for each row execute function governance.reject_evidence_ledger_mutation();

-- No permissive RLS policies are intentionally declared here.
-- Reads/writes must pass through the trusted server adapter boundary.
-- Idempotency is enforced in application logic by reading event_id first and comparing
-- canonical_event before any insert; same payload => NOOP, mutated payload => HOLD.
-- Direct PHI-shaped fields are rejected before persistence by evidenceLedgerPersistenceBoundary.ts.

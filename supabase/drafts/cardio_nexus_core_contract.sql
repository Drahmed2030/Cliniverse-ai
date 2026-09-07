-- Cardio Nexus Core database contract.
-- Review-only and fail-closed. The final rollback prevents persistent changes.
-- Do not promote this contract to a migration until privacy, clinical safety,
-- information security, integration ownership, and local governance approve it.

begin;

create schema if not exists cardio_nexus;

revoke all on schema cardio_nexus from public, anon, authenticated;

create table cardio_nexus.cases (
  id bigint generated always as identity primary key,
  public_id text not null unique,
  organization_id uuid not null,
  current_state text not null default 'draft' check (
    current_state in (
      'draft', 'referral-received', 'reviewed', 'accepted', 'identity-linked',
      'in-transport', 'cath-lab-activated', 'arrived', 'episode-recorded',
      'quality-validated'
    )
  ),
  version bigint not null default 0 check (version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cardio_nexus.case_identifiers (
  id bigint generated always as identity primary key,
  case_id bigint not null references cardio_nexus.cases(id) on delete restrict,
  identifier_kind text not null check (
    identifier_kind in ('referral-case-id', 'mrn', 'encounter', 'cath-episode')
  ),
  identifier_value text not null,
  source_system text not null,
  linked_at timestamptz not null,
  unique (case_id, identifier_kind, identifier_value)
);

create table cardio_nexus.reference_registry (
  id text primary key,
  title text not null,
  publisher text not null,
  authority text not null check (
    authority in ('local-approved', 'national-regulatory', 'international-guideline', 'interoperability-standard')
  ),
  version text not null,
  effective_date date,
  jurisdiction text not null,
  source_url text,
  source_checksum text,
  review_status text not null check (
    review_status in ('approved-local', 'verified-public', 'requires-local-review', 'retired')
  ),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table cardio_nexus.events (
  id bigint generated always as identity primary key,
  public_id text not null unique,
  case_id bigint not null references cardio_nexus.cases(id) on delete restrict,
  sequence bigint not null check (sequence > 0),
  event_kind text not null check (event_kind in ('transition', 'clock')),
  event_type text not null,
  actor_role text not null check (
    actor_role in ('referring', 'coordination', 'cardiology', 'cath-lab', 'quality')
  ),
  actor_id uuid not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  source_system text not null,
  source_record_id text not null,
  payload jsonb not null default '{}'::jsonb,
  reference_ids text[] not null default '{}',
  unique (case_id, sequence)
);

create table cardio_nexus.kpi_definitions (
  id text primary key,
  label text not null,
  start_clock text not null,
  end_clock text not null,
  target_minutes integer check (target_minutes is null or target_minutes > 0),
  reference_ids text[] not null default '{}',
  version text not null,
  active boolean not null default false
);

create table cardio_nexus.kpi_results (
  id bigint generated always as identity primary key,
  case_id bigint not null references cardio_nexus.cases(id) on delete restrict,
  kpi_id text not null references cardio_nexus.kpi_definitions(id) on delete restrict,
  definition_version text not null,
  elapsed_minutes integer,
  status text not null check (status in ('missing-clock', 'invalid-order', 'ready-for-validation', 'validated', 'excluded')),
  source_event_ids text[] not null default '{}',
  validated_by uuid,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'validated' and validated_by is not null and validated_at is not null)
    or status <> 'validated'
  )
);

create index cardio_nexus_cases_organization_id_idx on cardio_nexus.cases (organization_id);
create index cardio_nexus_identifiers_case_id_idx on cardio_nexus.case_identifiers (case_id);
create index cardio_nexus_events_case_id_recorded_at_idx on cardio_nexus.events (case_id, recorded_at desc);
create index cardio_nexus_events_actor_id_idx on cardio_nexus.events (actor_id);
create index cardio_nexus_kpi_results_case_id_idx on cardio_nexus.kpi_results (case_id);

alter table cardio_nexus.cases enable row level security;
alter table cardio_nexus.case_identifiers enable row level security;
alter table cardio_nexus.reference_registry enable row level security;
alter table cardio_nexus.events enable row level security;
alter table cardio_nexus.kpi_definitions enable row level security;
alter table cardio_nexus.kpi_results enable row level security;

revoke all on all tables in schema cardio_nexus from public, anon, authenticated;
revoke all on all sequences in schema cardio_nexus from public, anon, authenticated;

create or replace function cardio_nexus.reject_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Cardio Nexus events are append-only';
end;
$$;

create trigger cardio_nexus_events_append_only
before update or delete on cardio_nexus.events
for each row execute function cardio_nexus.reject_event_mutation();

comment on schema cardio_nexus is
  'Review-only Cardio Nexus contract. No production or patient data use is approved.';
comment on table cardio_nexus.events is
  'Append-only operational event ledger. Payload must follow an approved minimum-data contract.';

rollback;

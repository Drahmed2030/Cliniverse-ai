-- Clinical Orbit graph foundation — extends the EXISTING, currently-empty
-- public.kg_nodes / public.kg_edges tables. Does not create new tables and
-- does not replace them; only additive ALTER TABLE statements, safe to run
-- against empty tables with zero data-loss risk.
--
-- DRAFT / STAGING ONLY. NOT APPLIED TO PRODUCTION.
--
-- RECONCILIATION NOTE — read before applying:
-- supabase/drafts/deferred_capabilities_safe_hold.sql (itself never
-- confirmed applied anywhere, per its own "PRODUCTION HOLD" header) would
-- lock kg_nodes/kg_edges to service_role-only with zero client access,
-- declaring them "outside Apple v1." Batch 5 deliberately reverses that
-- intent for these two tables specifically: Clinical Orbit needs
-- authenticated learners to SELECT graph data. This migration is written to
-- be correct whether or not that safe-hold draft was ever separately
-- applied to this environment — it unconditionally (re)establishes the
-- exact privilege shape below via REVOKE + explicit GRANT + policy, so the
-- end state is deterministic either way. The other 11 tables in that draft
-- (case_cache, clinical_case_embeddings, clinical_documents, daily_cases,
-- evaluation_cases, evaluation_runs, generated_cases, mood_logs,
-- nexus_cases, nexus_messages, nexus_votes) are NOT touched by this
-- migration at all.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $preflight$
begin
  if to_regclass('public.kg_nodes') is null then
    raise exception 'public.kg_nodes does not exist in this environment — expected an existing table per Batch 5''s brief';
  end if;
  if to_regclass('public.kg_edges') is null then
    raise exception 'public.kg_edges does not exist in this environment — expected an existing table per Batch 5''s brief';
  end if;
end
$preflight$;

-- ── kg_nodes: link to the catalog, constrain the controlled vocabulary ────

alter table public.kg_nodes
  add column if not exists content_catalog_id uuid null references public.clinical_content_catalog(id) on delete set null;

comment on column public.kg_nodes.content_catalog_id is
  'Links a content-type graph node to its governed catalog row. Null for concept nodes (condition/finding/procedure/etc.) that represent a clinical idea, not a piece of app content.';

comment on column public.kg_nodes.metadata is
  'Must include a stable string "node_key" (e.g. condition:atrial_fibrillation, content:ecg:case:afib-rvr) — the identity the app, edges, and navigation history all use instead of the numeric id, so it survives a reseed.';

-- One catalog item must not silently map to multiple duplicate nodes.
create unique index if not exists kg_nodes_content_catalog_id_unique
  on public.kg_nodes (content_catalog_id)
  where content_catalog_id is not null;

-- node_key must be unique too (concept nodes have no catalog_id to key off).
create unique index if not exists kg_nodes_node_key_unique
  on public.kg_nodes ((metadata ->> 'node_key'))
  where metadata ->> 'node_key' is not null;

alter table public.kg_nodes
  drop constraint if exists kg_nodes_node_type_check;
alter table public.kg_nodes
  add constraint kg_nodes_node_type_check
  check (node_type in ('condition', 'finding', 'investigation', 'treatment', 'drug', 'guideline', 'calculator', 'content', 'procedure', 'anatomy'));

-- ── kg_edges: provenance + evidence status, controlled relation vocabulary ─

alter table public.kg_edges
  add column if not exists provenance_ref text,
  add column if not exists evidence_status text;

comment on column public.kg_edges.provenance_ref is
  'Required human-readable source for the claim this edge makes — a repo file, a catalog provenance_ref, or a named clinical guideline. This is what a "Why connected?" UI surfaces.';
comment on column public.kg_edges.evidence_status is
  'reviewed | pending_review | unverified. Only reviewed edges are ever returned outside reviewer/labs scope — see app/lib/clinicalOrbitGraphQueries.ts.';

alter table public.kg_edges
  drop constraint if exists kg_edges_relationship_check;
alter table public.kg_edges
  add constraint kg_edges_relationship_check
  check (relationship in ('related_to', 'demonstrates', 'diagnosed_by', 'treated_by', 'measured_by', 'supported_by', 'prerequisite_for', 'next_learning_step', 'compares_with'));

alter table public.kg_edges
  drop constraint if exists kg_edges_evidence_status_check;
alter table public.kg_edges
  add constraint kg_edges_evidence_status_check
  check (evidence_status is null or evidence_status in ('reviewed', 'pending_review', 'unverified'));

alter table public.kg_edges
  drop constraint if exists kg_edges_unique_relation;
alter table public.kg_edges
  add constraint kg_edges_unique_relation
  unique (source_node_id, target_node_id, relationship);

-- ── RLS: authenticated SELECT only, anon denied, no client writes ─────────

alter table public.kg_nodes enable row level security;
alter table public.kg_edges enable row level security;

revoke all privileges on table public.kg_nodes from anon, authenticated;
revoke all privileges on table public.kg_edges from anon, authenticated;
grant select on table public.kg_nodes to authenticated;
grant select on table public.kg_edges to authenticated;

drop policy if exists "kg_nodes_select_authenticated" on public.kg_nodes;
create policy "kg_nodes_select_authenticated"
  on public.kg_nodes
  for select
  to authenticated
  using (true);

drop policy if exists "kg_edges_select_authenticated" on public.kg_edges;
create policy "kg_edges_select_authenticated"
  on public.kg_edges
  for select
  to authenticated
  using (true);

-- Deliberately no INSERT/UPDATE/DELETE policy for authenticated or anon —
-- graph management is service_role-only via its default RLS-bypass
-- behavior, same as clinical_content_catalog in Batch 4.

-- ── Self-verifying assertions ──────────────────────────────────────────────

do $orbit_assertions$
begin
  if not (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'kg_nodes') then
    raise exception 'kg_nodes is missing RLS';
  end if;
  if not (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'kg_edges') then
    raise exception 'kg_edges is missing RLS';
  end if;

  if not has_table_privilege('authenticated', 'public.kg_nodes', 'SELECT') then
    raise exception 'authenticated cannot SELECT kg_nodes';
  end if;
  if not has_table_privilege('authenticated', 'public.kg_edges', 'SELECT') then
    raise exception 'authenticated cannot SELECT kg_edges';
  end if;

  if has_table_privilege('authenticated', 'public.kg_nodes', 'INSERT')
     or has_table_privilege('authenticated', 'public.kg_nodes', 'UPDATE')
     or has_table_privilege('authenticated', 'public.kg_nodes', 'DELETE') then
    raise exception 'authenticated has an unexpected write privilege on kg_nodes';
  end if;
  if has_table_privilege('authenticated', 'public.kg_edges', 'INSERT')
     or has_table_privilege('authenticated', 'public.kg_edges', 'UPDATE')
     or has_table_privilege('authenticated', 'public.kg_edges', 'DELETE') then
    raise exception 'authenticated has an unexpected write privilege on kg_edges';
  end if;

  if has_table_privilege('anon', 'public.kg_nodes', 'SELECT')
     or has_table_privilege('anon', 'public.kg_edges', 'SELECT') then
    raise exception 'anon can read the graph — not intended for this release';
  end if;
end
$orbit_assertions$;

commit;

-- Rollback for supabase/drafts/clinical_orbit_graph_v1.sql
--
-- DRAFT / STAGING ONLY. NOT APPLIED.
--
-- Undoes exactly what the forward migration added to the EXISTING
-- kg_nodes/kg_edges tables — drops the new columns, indexes, constraints,
-- and policies. Does NOT drop kg_nodes or kg_edges themselves (they existed
-- before this migration and are not owned by it) and does NOT restore the
-- deferred_capabilities_safe_hold.sql service-role-only lockdown — if that
-- posture is wanted again, apply that draft's own logic for these two
-- tables explicitly, as its own decision.
--
-- LEGACY POLICY NOTE: staging verification (2026-09-18) found two
-- pre-Batch-5 PUBLIC-role policies ("public read nodes", "public read
-- edges") that the forward migration now explicitly drops. This rollback
-- deliberately does NOT recreate them — there is no documented, approved
-- reason to restore a PUBLIC-role read policy, and doing so would be less
-- safe than the "revoke all privileges, no policy" state below. Rolling
-- back returns to the safest no-client-access shape, not to whatever
-- undocumented pre-Batch-5 state existed.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

drop policy if exists "kg_nodes_select_authenticated" on public.kg_nodes;
drop policy if exists "kg_edges_select_authenticated" on public.kg_edges;

-- Return to no client privileges at all, the safest empty state, rather
-- than guessing at whatever privilege shape existed before this migration.
revoke all privileges on table public.kg_nodes from anon, authenticated;
revoke all privileges on table public.kg_edges from anon, authenticated;

alter table public.kg_edges drop constraint if exists kg_edges_unique_relation;
alter table public.kg_edges drop constraint if exists kg_edges_evidence_status_check;
alter table public.kg_edges drop constraint if exists kg_edges_relationship_check;
alter table public.kg_edges drop column if exists evidence_status;
alter table public.kg_edges drop column if exists provenance_ref;

drop index if exists public.kg_nodes_node_key_unique;
drop index if exists public.kg_nodes_content_catalog_id_unique;
alter table public.kg_nodes drop constraint if exists kg_nodes_node_type_check;
alter table public.kg_nodes drop column if exists content_catalog_id;

commit;

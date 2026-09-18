-- Cliniverse Clinical Orbit graph post-apply verification
-- READ-ONLY. Run only after applying clinical_orbit_graph_v1.sql to a
-- STAGING project. Not to be run against production without explicit
-- migration-window approval.

-- 1) RLS state.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('kg_nodes', 'kg_edges')
order by c.relname;
-- Expected: rls_enabled = true for both.

-- 2) Policies.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public' and tablename in ('kg_nodes', 'kg_edges')
order by tablename, policyname;
-- Expected: exactly one SELECT policy per table, both "..._select_authenticated".

-- 2a) Legacy pre-Batch-5 PUBLIC-role policies must be absent. Live staging
-- verification (2026-09-18) found "public read nodes" / "public read edges"
-- predating this migration; the forward migration now drops them
-- explicitly. This query must return zero rows.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and (
    (tablename = 'kg_nodes' and policyname = 'public read nodes')
    or (tablename = 'kg_edges' and policyname = 'public read edges')
  );
-- Expected: 0 rows. Any row returned means the legacy policy was not removed.

-- 2b) Exactly one policy per table, no more, no less.
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public' and tablename in ('kg_nodes', 'kg_edges')
group by tablename
order by tablename;
-- Expected: kg_nodes = 1, kg_edges = 1.

-- 3) Table-level privileges.
select 'kg_nodes' as table_name,
       has_table_privilege('authenticated', 'public.kg_nodes', 'SELECT') as authenticated_select,
       has_table_privilege('authenticated', 'public.kg_nodes', 'INSERT') as authenticated_insert,
       has_table_privilege('authenticated', 'public.kg_nodes', 'UPDATE') as authenticated_update,
       has_table_privilege('authenticated', 'public.kg_nodes', 'DELETE') as authenticated_delete,
       has_table_privilege('anon', 'public.kg_nodes', 'SELECT') as anon_select
union all
select 'kg_edges',
       has_table_privilege('authenticated', 'public.kg_edges', 'SELECT'),
       has_table_privilege('authenticated', 'public.kg_edges', 'INSERT'),
       has_table_privilege('authenticated', 'public.kg_edges', 'UPDATE'),
       has_table_privilege('authenticated', 'public.kg_edges', 'DELETE'),
       has_table_privilege('anon', 'public.kg_edges', 'SELECT');
-- Expected: authenticated_select=true, every other column=false, for both rows.

-- 4) New columns and constraints exist.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'kg_nodes' and column_name = 'content_catalog_id';
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'kg_edges' and column_name in ('provenance_ref', 'evidence_status')
order by column_name;

select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.kg_nodes'::regclass
order by conname;
select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.kg_edges'::regclass
order by conname;
-- Expected kg_nodes: kg_nodes_node_type_check (CHECK), the content_catalog_id FK, the two unique indexes as constraints or listed separately below.
-- Expected kg_edges: kg_edges_relationship_check, kg_edges_evidence_status_check (both CHECK), kg_edges_unique_relation (UNIQUE).

select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'kg_nodes'
  and indexname in ('kg_nodes_content_catalog_id_unique', 'kg_nodes_node_key_unique');
-- Expected: both present.

-- 5) Row counts, once seeded (Section 5 of the batch).
-- Verified on staging 2026-09-18: kg_nodes = 17, kg_edges = 12, matching
-- CLINICAL_ORBIT_NODE_SEED / CLINICAL_ORBIT_EDGE_SEED exactly.
select 'kg_nodes' as table_name, count(*) from public.kg_nodes
union all
select 'kg_edges', count(*) from public.kg_edges;

select node_type, count(*) from public.kg_nodes group by node_type order by node_type;
select relationship, evidence_status, count(*) from public.kg_edges group by relationship, evidence_status order by relationship, evidence_status;

-- 6) Manual constraint exercise (throwaway transaction — do not commit
-- against production). Confirms the unique/CHECK constraints actually
-- reject bad data, not just that they're declared.
--   begin;
--   insert into public.kg_nodes (node_type, label, metadata)
--     values ('condition', 'Test Duplicate', '{"node_key":"condition:__test_dup"}'::jsonb);
--   insert into public.kg_nodes (node_type, label, metadata)  -- expected: unique_violation on node_key
--     values ('condition', 'Test Duplicate 2', '{"node_key":"condition:__test_dup"}'::jsonb);
--   insert into public.kg_nodes (node_type, label)  -- expected: check_violation
--     values ('not_a_real_type', 'Bad Type');
--   rollback;

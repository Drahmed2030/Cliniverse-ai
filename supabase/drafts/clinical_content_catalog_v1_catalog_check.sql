-- Cliniverse clinical_content_catalog post-apply catalog verification
-- READ-ONLY. Run only after applying clinical_content_catalog_v1.sql to a
-- STAGING project. Not to be run against production without explicit
-- migration-window approval.
--
-- Already run once against staging (xhwotblarwsxoanpiloe) on 2026-09-18 —
-- all checks below passed (RLS enabled, authenticated SELECT-only, anon
-- denied, unique/CHECK constraints present and enforced under a rolled-back
-- throwaway transaction). Re-run after any future change to this table.

-- 1) Table exists and RLS is enabled.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'clinical_content_catalog';
-- Expected: one row, rls_enabled = true.

-- 2) Effective policies.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'clinical_content_catalog'
order by policyname;
-- Expected: exactly one policy, "clinical_content_catalog_select_authenticated", cmd = SELECT.

-- 3) Table-level privileges.
select has_table_privilege('authenticated', 'public.clinical_content_catalog', 'SELECT') as authenticated_select,
       has_table_privilege('authenticated', 'public.clinical_content_catalog', 'INSERT') as authenticated_insert,
       has_table_privilege('authenticated', 'public.clinical_content_catalog', 'UPDATE') as authenticated_update,
       has_table_privilege('authenticated', 'public.clinical_content_catalog', 'DELETE') as authenticated_delete,
       has_table_privilege('anon', 'public.clinical_content_catalog', 'SELECT') as anon_select;
-- Expected: authenticated_select=true, all other columns=false.

-- 4) Unique constraint exists and rejects a duplicate logical item.
select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.clinical_content_catalog'::regclass
  and contype = 'u';
-- Expected: clinical_content_catalog_unique_item on (module, content_type, source_key).
-- To exercise it manually in a throwaway transaction (do not commit against
-- production):
--   begin;
--   insert into public.clinical_content_catalog
--     (source_key, module, content_type, title, access_tier, visibility, readiness)
--   values ('dup-check', 'test', 'case', 'Dup A', 'free', 'hidden', 'ready');
--   insert into public.clinical_content_catalog -- expected to fail with unique_violation
--     (source_key, module, content_type, title, access_tier, visibility, readiness)
--   values ('dup-check', 'test', 'case', 'Dup B', 'free', 'hidden', 'ready');
--   rollback;

-- 5) Check constraints exist for the controlled enums.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.clinical_content_catalog'::regclass
  and contype = 'c'
order by conname;
-- Expected: access_tier, visibility, readiness check constraints present.

-- 6) Row counts by readiness/visibility, once seeded (Section 5).
select readiness, visibility, count(*) as item_count
from public.clinical_content_catalog
group by readiness, visibility
order by readiness, visibility;

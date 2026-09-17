-- Cliniverse RLS reconciled-migration post-apply catalog verification
-- READ-ONLY metadata checks only. Run only after the reconciled migration
-- (rls_isolation_reconciled_v1.sql) has been applied to a STAGING project and
-- only after the approved migration window for production.
--
-- Adapted from security/rls-user-data-isolation @ 72cb123's
-- supabase/tests/rls_post_apply_catalog_check.sql, extended to also verify
-- the two things RC1 alone does not cover (see rls_isolation_reconciled_v1.sql's
-- header for the reconciliation rationale): the cases/user_progress table-level
-- GRANTs the new policies depend on, and service_role's is_user_pro grant.

-- 1) RLS state for every table this reconciliation touches.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('cases', 'user_progress', 'leaderboard')
order by c.relname;
-- Expected: rls_enabled = true for all three (leaderboard was already true via RC1).

-- 2) Effective RLS policies on the reconciled tables.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('cases', 'user_progress', 'leaderboard')
order by tablename, policyname;
-- Expected: cases has exactly "cases_select_authenticated" (SELECT); user_progress
-- has exactly the 3 own-row policies; leaderboard has zero policies.

-- 3) Table-level GRANTs the policies above depend on (the part RC1's REVOKE ALL
--    would otherwise leave unreachable).
select 'cases' as table_name, has_table_privilege('authenticated', 'public.cases', 'SELECT') as authenticated_select,
       has_table_privilege('authenticated', 'public.cases', 'INSERT') as authenticated_insert,
       has_table_privilege('authenticated', 'public.cases', 'UPDATE') as authenticated_update
union all
select 'user_progress', has_table_privilege('authenticated', 'public.user_progress', 'SELECT'),
       has_table_privilege('authenticated', 'public.user_progress', 'INSERT'),
       has_table_privilege('authenticated', 'public.user_progress', 'UPDATE');
-- Expected: cases → select=true, insert=false, update=false.
--           user_progress → select=true, insert=true, update=true.

-- 4) Leaderboard remains fully deny-by-default (RC1's state, untouched here).
select has_table_privilege('anon', 'public.leaderboard', 'SELECT') as anon_select,
       has_table_privilege('authenticated', 'public.leaderboard', 'SELECT') as authenticated_select;
-- Expected: both false.

-- 5) Entitlement RPC grants.
select p.proname,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_user_pro';
-- Expected: anon_can_execute=false, authenticated_can_execute=false,
--           service_role_can_execute=true.

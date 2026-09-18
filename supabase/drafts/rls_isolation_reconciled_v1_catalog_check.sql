-- Cliniverse RLS Batch 3 post-apply catalog verification
-- READ-ONLY. Updated after staging validation on 2026-09-18.

-- 1) RLS state.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles','subscriptions','case_completions','mcq_answers','cases','user_progress','leaderboard')
order by c.relname;
-- Expected: true for all rows.

-- 2) Policies.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','subscriptions','case_completions','mcq_answers','cases','user_progress','leaderboard')
order by tablename, policyname;
-- Expected:
-- profiles: own SELECT/INSERT/UPDATE
-- subscriptions: own SELECT
-- case_completions: own SELECT/INSERT
-- mcq_answers: own SELECT/INSERT
-- cases: authenticated SELECT
-- user_progress: own SELECT/INSERT/UPDATE
-- leaderboard: no client policy

-- 3) Table-level privileges required by the current app contracts.
select 'profiles' as table_name,
       has_table_privilege('authenticated','public.profiles','SELECT') as can_select,
       has_table_privilege('authenticated','public.profiles','INSERT') as can_insert,
       has_table_privilege('authenticated','public.profiles','UPDATE') as can_update,
       has_table_privilege('authenticated','public.profiles','DELETE') as can_delete
union all
select 'subscriptions',
       has_table_privilege('authenticated','public.subscriptions','SELECT'),
       has_table_privilege('authenticated','public.subscriptions','INSERT'),
       has_table_privilege('authenticated','public.subscriptions','UPDATE'),
       has_table_privilege('authenticated','public.subscriptions','DELETE')
union all
select 'cases',
       has_table_privilege('authenticated','public.cases','SELECT'),
       has_table_privilege('authenticated','public.cases','INSERT'),
       has_table_privilege('authenticated','public.cases','UPDATE'),
       has_table_privilege('authenticated','public.cases','DELETE')
union all
select 'user_progress',
       has_table_privilege('authenticated','public.user_progress','SELECT'),
       has_table_privilege('authenticated','public.user_progress','INSERT'),
       has_table_privilege('authenticated','public.user_progress','UPDATE'),
       has_table_privilege('authenticated','public.user_progress','DELETE')
union all
select 'leaderboard',
       has_table_privilege('authenticated','public.leaderboard','SELECT'),
       has_table_privilege('authenticated','public.leaderboard','INSERT'),
       has_table_privilege('authenticated','public.leaderboard','UPDATE'),
       has_table_privilege('authenticated','public.leaderboard','DELETE');

-- Expected:
-- profiles       true,true,true,false
-- subscriptions  true,false,false,false
-- cases          true,false,false,false
-- user_progress  true,true,true,false
-- leaderboard    false,false,false,false

-- 4) Entitlement RPC.
select p.proname,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_user_pro';
-- Expected: false,false,true.

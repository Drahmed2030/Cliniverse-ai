-- Cliniverse RLS post-apply catalog verification
-- READ-ONLY metadata checks. Run only after the approved migration window.

-- 1) RLS state for release-relevant tables.
select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'subscriptions',
    'case_completions',
    'mcq_answers',
    'cases',
    'user_progress',
    'leaderboard'
  )
order by c.relname;

-- 2) Effective RLS policies.
select schemaname,
       tablename,
       policyname,
       roles,
       cmd,
       qual,
       with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles',
    'subscriptions',
    'case_completions',
    'mcq_answers',
    'cases',
    'user_progress',
    'leaderboard'
  )
order by tablename, policyname;

-- 3) Verify legacy permissive profile policies are absent.
select policyname
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and policyname in ('Public read', 'Public insert', 'Public update');
-- Expected: zero rows.

-- 4) Verify subscription INSERT policy is not public-facing.
select policyname, roles, cmd, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'subscriptions'
order by policyname;

-- 5) Verify leaderboard is deny-by-default for clients in RC1.
select policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'leaderboard';
-- Expected: zero client policies unless separately approved later.

-- 6) Verify legacy entitlement RPC execution grants.
select p.proname,
       p.prosecdef as security_definer,
       pg_get_function_identity_arguments(p.oid) as arguments,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'is_user_pro';
-- Expected after migration 002:
-- anon_can_execute=false
-- authenticated_can_execute=false
-- service_role_can_execute=true (temporary compatibility only)

-- Read-only post-migration catalog assertions for Apple RC1.
-- Run after the forward migration and before authenticated two-user testing.

do $catalog_assertions$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('profiles', 'subscriptions', 'case_completions', 'mcq_answers', 'cases', 'user_progress', 'leaderboard')
      and not c.relrowsecurity
  ) then
    raise exception 'A required RC1 relation does not have RLS enabled';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'subscriptions')
      and 'public' = any (roles)
  ) then
    raise exception 'An active RC1 authority still has a public RLS policy';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_table_privilege('anon', 'public.subscriptions', 'SELECT') then
    raise exception 'anon still has active RC1 authority access';
  end if;

  if has_table_privilege('anon', 'public.subscriptions', 'INSERT')
     or has_table_privilege('authenticated', 'public.subscriptions', 'INSERT') then
    raise exception 'client subscription INSERT remains available';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'is_pro', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'subscription_status', 'UPDATE') then
    raise exception 'entitlement-like profile columns remain client-writable';
  end if;

  if has_function_privilege('anon', 'public.is_user_pro(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.is_user_pro(uuid)', 'EXECUTE') then
    raise exception 'legacy arbitrary-user entitlement RPC remains executable';
  end if;

  if has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE') then
    raise exception 'legacy signup trigger helper remains client-executable';
  end if;

  if has_function_privilege('anon', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE') then
    raise exception 'deferred knowledge matching remains client-executable';
  end if;
end
$catalog_assertions$;

select 'apple_rc1_catalog_assertions_passed' as result;

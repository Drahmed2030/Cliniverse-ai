-- Read-only verification for the emergency deny-all rollback state.

do $safe_hold_assertions$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('profiles', 'subscriptions', 'case_completions', 'mcq_answers', 'cases', 'user_progress', 'leaderboard')
      and not c.relrowsecurity
  ) then
    raise exception 'Safe-hold left a required table without RLS';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'subscriptions', 'case_completions', 'mcq_answers')
  ) then
    raise exception 'Safe-hold retained an active client policy';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
     or has_table_privilege('authenticated', 'public.profiles', 'SELECT')
     or has_table_privilege('anon', 'public.subscriptions', 'INSERT')
     or has_table_privilege('authenticated', 'public.subscriptions', 'INSERT') then
    raise exception 'Safe-hold retained client authority';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'name', 'UPDATE')
     or has_column_privilege('authenticated', 'public.subscriptions', 'plan', 'SELECT') then
    raise exception 'Safe-hold retained a column-level grant';
  end if;

  if has_function_privilege('anon', 'public.is_user_pro(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.is_user_pro(uuid)', 'EXECUTE')
     or has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
     or has_function_privilege('anon', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE') then
    raise exception 'Safe-hold retained a legacy RPC execution grant';
  end if;

  if not has_table_privilege('service_role', 'public.subscriptions', 'INSERT') then
    raise exception 'Safe-hold removed trusted service-role authority';
  end if;
end
$safe_hold_assertions$;

select 'apple_rc1_safe_hold_assertions_passed' as result;

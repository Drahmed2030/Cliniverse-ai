-- Read-only assertions for deferred-capability containment.
-- Run after the forward migration and before any runtime verification.

do $deferred_capability_safe_hold_assertions$
declare
  target_table text;
begin
  foreach target_table in array array[
    'case_cache',
    'clinical_case_embeddings',
    'clinical_documents',
    'daily_cases',
    'evaluation_cases',
    'evaluation_runs',
    'generated_cases',
    'kg_edges',
    'kg_nodes',
    'mood_logs',
    'nexus_cases',
    'nexus_messages',
    'nexus_votes'
  ]
  loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise exception 'Expected deferred table public.% is missing', target_table;
    end if;

    if not (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = target_table
    ) then
      raise exception 'Deferred safe-hold left public.% without RLS', target_table;
    end if;

    if has_table_privilege('anon', format('public.%I', target_table), 'SELECT')
       or has_table_privilege('anon', format('public.%I', target_table), 'INSERT')
       or has_table_privilege('anon', format('public.%I', target_table), 'UPDATE')
       or has_table_privilege('anon', format('public.%I', target_table), 'DELETE')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'SELECT')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'INSERT')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'UPDATE')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'DELETE') then
      raise exception 'Deferred safe-hold retained client authority on public.%', target_table;
    end if;

    if exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    ) then
      raise exception 'Deferred safe-hold retained a policy on public.%', target_table;
    end if;

    if not has_table_privilege('service_role', format('public.%I', target_table), 'SELECT') then
      raise exception 'Deferred safe-hold removed trusted service authority on public.%', target_table;
    end if;
  end loop;

  if has_function_privilege('anon', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE') then
    raise exception 'Deferred safe-hold retained client knowledge-match execution';
  end if;
end
$deferred_capability_safe_hold_assertions$;

select 'deferred_capabilities_safe_hold_assertions_passed' as result;

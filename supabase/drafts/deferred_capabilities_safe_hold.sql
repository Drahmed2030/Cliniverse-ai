-- Cliniverse AI deferred-capability data-containment SQL draft.
--
-- PRODUCTION HOLD: this is not a committed Supabase migration. Do not apply it
-- until the Supabase CLI creates the official migration file, a current backup
-- exists, staging execution and companion assertions pass, and an explicit
-- production migration-window GO has been recorded.
--
-- Purpose: legacy and future clinical-learning, Nexus, mood, document,
-- knowledge and evaluation tables are outside Apple v1. Their server routes
-- are already release-gated; this migration makes the Data API fail closed too.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $deferred_capability_lockdown$
declare
  target_table text;
  target_policy record;
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

    execute format('alter table public.%I enable row level security', target_table);

    -- A safe hold has no client policy. Future access must arrive through a
    -- separate, narrowly scoped migration with ownership tests.
    for target_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        target_policy.policyname,
        target_table
      );
    end loop;

    execute format(
      'revoke all privileges on table public.%I from PUBLIC, anon, authenticated',
      target_table
    );
    execute format(
      'grant select, insert, update, delete on table public.%I to service_role',
      target_table
    );
  end loop;
end
$deferred_capability_lockdown$;

-- Vector matching remains a trusted-server capability only.
revoke execute on function public.match_clinical_cases(vector, real, integer)
  from PUBLIC, anon, authenticated;
grant execute on function public.match_clinical_cases(vector, real, integer)
  to service_role;
alter function public.match_clinical_cases(vector, real, integer)
  set search_path = 'public';

do $deferred_capability_assertions$
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
    if not (
      select c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = target_table
    ) then
      raise exception 'Deferred table public.% does not have RLS enabled', target_table;
    end if;

    if has_table_privilege('anon', format('public.%I', target_table), 'SELECT')
       or has_table_privilege('anon', format('public.%I', target_table), 'INSERT')
       or has_table_privilege('anon', format('public.%I', target_table), 'UPDATE')
       or has_table_privilege('anon', format('public.%I', target_table), 'DELETE')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'SELECT')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'INSERT')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'UPDATE')
       or has_table_privilege('authenticated', format('public.%I', target_table), 'DELETE') then
      raise exception 'Client authority remains on deferred table public.%', target_table;
    end if;

    if exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = target_table
    ) then
      raise exception 'A client policy remains on deferred table public.%', target_table;
    end if;

    if not has_table_privilege('service_role', format('public.%I', target_table), 'SELECT') then
      raise exception 'Trusted service-role SELECT is missing on public.%', target_table;
    end if;
  end loop;

  if has_function_privilege('anon', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.match_clinical_cases(vector,real,integer)', 'EXECUTE') then
    raise exception 'Deferred knowledge matching remains client-executable';
  end if;
end
$deferred_capability_assertions$;

commit;

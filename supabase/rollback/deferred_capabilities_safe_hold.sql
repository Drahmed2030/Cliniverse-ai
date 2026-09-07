-- Emergency rollback posture for deferred-capability containment.
--
-- This deliberately remains deny-all for clients. It must never recreate the
-- permissive legacy policies. A corrected forward migration may re-enable a
-- narrowly scoped capability only after its ownership tests pass.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $deferred_capability_safe_hold$
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
$deferred_capability_safe_hold$;

revoke execute on function public.match_clinical_cases(vector, real, integer)
  from PUBLIC, anon, authenticated;
grant execute on function public.match_clinical_cases(vector, real, integer)
  to service_role;

commit;

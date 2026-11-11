-- SYNTHETIC FIXTURE. FRESH EMPTY LOCAL POSTGRESQL DATABASE ONLY.
-- Run from repo root:
-- psql "$LOCAL_ACCOUNT_DELETE_TEST_DSN" --no-psqlrc --set=ON_ERROR_STOP=1 --   --file=supabase/tests/20261109090000_account_deletion_cascade.sql
-- This bootstraps a minimal schema, not the hosted schema. Destroy the disposable
-- database afterwards. Test DML is rolled back. No hosted connection is authorized.

do $guard$
begin
  if pg_catalog.to_regnamespace('auth') is not null
     or pg_catalog.to_regclass('public.profiles') is not null then
    raise exception 'Use a fresh empty local fixture database';
  end if;
end
$guard$;

do $roles$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if not exists (select 1 from pg_catalog.pg_roles where rolname = role_name) then
      execute pg_catalog.format('create role %I', role_name);
    end if;
  end loop;
end
$roles$;
create schema auth;
create table auth.users (id uuid primary key);
create table public.profiles (id uuid not null);
create table public.case_completions (user_id uuid not null);
create table public.mcq_answers (user_id uuid not null);
create table public.subscriptions (user_id uuid not null);

-- An absent readiness RPC is unavailable/false to the server adapter.
do $before_candidate$
begin
  if pg_catalog.to_regprocedure('public.cliniverse_account_cleanup_ready()') is not null then
    raise exception 'Readiness unexpectedly present before candidate';
  end if;
end
$before_candidate$;

\ir ../proposed/20261109090000_cliniverse_account_deletion_candidate.sql

begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

set local role service_role;
do $ready$
begin
  if public.cliniverse_account_cleanup_ready() is distinct from true then
    raise exception 'Candidate did not enable readiness';
  end if;
end
$ready$;
reset role;

set local role anon;
do $anon_denied$
begin
  begin
    perform public.cliniverse_account_cleanup_ready();
    raise exception 'Anon executed readiness';
  exception when insufficient_privilege then null;
  end;
end
$anon_denied$;
reset role;

set local role authenticated;
do $authenticated_denied$
begin
  begin
    perform public.cliniverse_account_cleanup_ready();
    raise exception 'Authenticated executed readiness';
  exception when insufficient_privilege then null;
  end;
end
$authenticated_denied$;
reset role;

insert into auth.users values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

do $rows$
declare
  entry record;
begin
  for entry in select * from (values
    ('profiles', 'id'), ('case_completions', 'user_id'),
    ('mcq_answers', 'user_id'), ('subscriptions', 'user_id')
  ) as owned(table_name, owner_column) loop
    execute pg_catalog.format(
      'insert into public.%I (%I) select id from auth.users',
      entry.table_name, entry.owner_column
    );
  end loop;
end
$rows$;

-- A late failure after cascades must restore every row. The deferred FK is
-- checked inside the exception block so PostgreSQL rolls that block back.
create table public.fixture_deletion_block (
  user_id uuid references auth.users(id) deferrable initially deferred
);
insert into public.fixture_deletion_block values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

do $atomic_failure$
declare
  entry record;
  row_count integer;
begin
  begin
    delete from auth.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    set constraints all immediate;
    raise exception 'Expected a foreign-key failure';
  exception when foreign_key_violation then null;
  end;
  if (select count(*) from auth.users) <> 2 then
    raise exception 'Failed delete changed auth users';
  end if;
  for entry in select * from (values
    ('profiles', 'id'), ('case_completions', 'user_id'),
    ('mcq_answers', 'user_id'), ('subscriptions', 'user_id')
  ) as owned(table_name, owner_column) loop
    execute pg_catalog.format('select count(*) from public.%I', entry.table_name) into row_count;
    if row_count <> 2 then raise exception 'Failed delete changed %', entry.table_name; end if;
  end loop;
end
$atomic_failure$;

set constraints all immediate;
drop table public.fixture_deletion_block;
delete from auth.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

do $cascade$
declare
  entry record;
  owner uuid;
  row_count integer;
begin
  if exists (select 1 from auth.users where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
     or not exists (select 1 from auth.users where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') then
    raise exception 'Incorrect Auth account deleted';
  end if;
  for entry in select * from (values
    ('profiles', 'id'), ('case_completions', 'user_id'),
    ('mcq_answers', 'user_id'), ('subscriptions', 'user_id')
  ) as owned(table_name, owner_column) loop
    execute pg_catalog.format('select count(*) from public.%I', entry.table_name) into row_count;
    execute pg_catalog.format('select %I from public.%I', entry.owner_column, entry.table_name) into owner;
    if row_count <> 1 or owner is distinct from 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid then
      raise exception 'Cascade damaged the other account in %', entry.table_name;
    end if;
    begin
      execute pg_catalog.format('insert into public.%I (%I) values ($1)', entry.table_name, entry.owner_column)
        using 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid;
      raise exception 'Orphan insert accepted for %', entry.table_name;
    exception when foreign_key_violation then null;
    end;
  end loop;
end
$cascade$;

alter table public.profiles drop constraint cliniverse_profile_account_fk;
do $missing_constraint$
begin
  if public.cliniverse_account_cleanup_ready() is distinct from false then
    raise exception 'Missing constraint did not close readiness';
  end if;
end
$missing_constraint$;

rollback;
select 'account_deletion_cascade_passed' as result;

-- Transactional two-user RLS verification for the Apple RC1 migration.
-- Run on an isolated Supabase branch only. All fixture rows are rolled back.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

insert into auth.users (id, email)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'rc1-user-a@example.invalid'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'rc1-user-b@example.invalid');

-- User B starts with a profile. User A exercises the client bootstrap insert.
insert into public.profiles (id, name, rank)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'RC1 User B', 'Clinical Learner');

insert into public.subscriptions (id, user_id, plan, status, expires_at)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'pro_monthly', 'active', now() + interval '30 days'),
  ('bbbbbbbb-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'pro_yearly', 'active', now() + interval '1 year');

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

insert into public.profiles (id, name, specialty, country, rank)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'RC1 User A',
  'General Medicine',
  'GB',
  'Clinical Learner'
);

do $user_a_tests$
declare
  affected_rows integer;
begin
  if (select auth.uid()) <> 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid then
    raise exception 'User A JWT identity was not established';
  end if;

  select count(*) into affected_rows from public.profiles;
  if affected_rows <> 1 then
    raise exception 'User A profile SELECT returned % rows instead of 1', affected_rows;
  end if;

  select count(*) into affected_rows from public.subscriptions;
  if affected_rows <> 1 then
    raise exception 'User A subscription SELECT returned % rows instead of 1', affected_rows;
  end if;

  update public.profiles
  set country = 'US'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'User A could not update the allowed own profile field';
  end if;

  update public.profiles
  set country = 'CA'
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'User A updated User B profile';
  end if;

  begin
    update public.profiles
    set is_pro = true
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    raise exception 'User A updated is_pro';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.profiles (id, name)
    values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Wrong owner');
    raise exception 'User A inserted a mismatched profile';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.subscriptions (user_id, plan, status)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'pro_monthly', 'active');
    raise exception 'User A inserted a subscription';
  exception
    when insufficient_privilege then null;
  end;

  insert into public.case_completions (user_id, case_id, xp_earned, errors)
  values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'rc1-case-a', 10, 0);

  insert into public.mcq_answers (user_id, mcq_id, correct)
  values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'rc1-mcq-a', true);

  begin
    insert into public.case_completions (user_id, case_id)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'wrong-owner-case');
    raise exception 'User A inserted User B case completion';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.mcq_answers (user_id, mcq_id, correct)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'wrong-owner-mcq', false);
    raise exception 'User A inserted User B MCQ answer';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform public.is_user_pro('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    raise exception 'User A executed the legacy entitlement RPC';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform public.handle_new_user();
    raise exception 'User A executed the legacy signup trigger helper';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.cases;
    raise exception 'User A read a deferred table';
  exception
    when insufficient_privilege then null;
  end;
end
$user_a_tests$;

reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';

do $user_b_tests$
declare
  affected_rows integer;
begin
  select count(*) into affected_rows from public.profiles;
  if affected_rows <> 1 then
    raise exception 'User B profile SELECT returned % rows instead of 1', affected_rows;
  end if;

  select count(*) into affected_rows from public.subscriptions;
  if affected_rows <> 1 then
    raise exception 'User B subscription SELECT returned % rows instead of 1', affected_rows;
  end if;

  select count(*) into affected_rows from public.case_completions;
  if affected_rows <> 0 then
    raise exception 'User B read User A case completion';
  end if;

  select count(*) into affected_rows from public.mcq_answers;
  if affected_rows <> 0 then
    raise exception 'User B read User A MCQ answer';
  end if;

  update public.profiles
  set specialty = 'Cardiology'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  get diagnostics affected_rows = row_count;
  if affected_rows <> 0 then
    raise exception 'User B updated User A profile';
  end if;
end
$user_b_tests$;

reset role;
set local role anon;
set local "request.jwt.claims" = '{"role":"anon"}';

do $anon_tests$
begin
  begin
    perform 1 from public.profiles;
    raise exception 'Anon read profiles';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform 1 from public.subscriptions;
    raise exception 'Anon read subscriptions';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform public.is_user_pro('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    raise exception 'Anon executed the legacy entitlement RPC';
  exception
    when insufficient_privilege then null;
  end;


  begin
    perform public.handle_new_user();
    raise exception 'Anon executed the legacy signup trigger helper';
  exception
    when insufficient_privilege then null;
  end;
end
$anon_tests$;

reset role;
set local role service_role;

insert into public.subscriptions (id, user_id, plan, status, expires_at)
values (
  'aaaaaaaa-0000-4000-8000-000000000002',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'institution',
  'active',
  now() + interval '1 day'
);

reset role;
rollback;

select 'apple_rc1_two_user_rls_passed' as result;

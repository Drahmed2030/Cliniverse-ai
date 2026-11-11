-- REVIEW CANDIDATE — NOT APPLIED.
-- Review existing constraints, retention and untracked schema before any apply.
begin;

-- FK cleanup is atomic with Auth admin's hard delete and prevents concurrent
-- inserts from leaving new account-owned rows after the identity is gone.
alter table public.case_completions
  add constraint cliniverse_case_completion_account_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.mcq_answers
  add constraint cliniverse_mcq_answer_account_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.subscriptions
  add constraint cliniverse_subscription_account_fk
  foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.profiles
  add constraint cliniverse_profile_account_fk
  foreign key (id) references auth.users(id) on delete cascade;

-- A source-only route must refuse deletion until the cleanup schema is installed.
create function public.cliniverse_account_cleanup_ready()
returns boolean
language sql
stable
set search_path = ''
as $function$
  select count(*) = 4
  from pg_catalog.pg_constraint as fk
  join pg_catalog.pg_class as child on child.oid = fk.conrelid
  join pg_catalog.pg_namespace as child_schema on child_schema.oid = child.relnamespace
  join pg_catalog.pg_class as parent on parent.oid = fk.confrelid
  join pg_catalog.pg_namespace as parent_schema on parent_schema.oid = parent.relnamespace
  where parent_schema.nspname = 'auth' and parent.relname = 'users'
    and child_schema.nspname = 'public'
    and fk.contype = 'f' and fk.confdeltype = 'c' and fk.convalidated
    and (child.relname, fk.conname) in (
      ('case_completions', 'cliniverse_case_completion_account_fk'),
      ('mcq_answers', 'cliniverse_mcq_answer_account_fk'),
      ('subscriptions', 'cliniverse_subscription_account_fk'),
      ('profiles', 'cliniverse_profile_account_fk')
    );
$function$;

revoke all on function public.cliniverse_account_cleanup_ready()
  from public, anon, authenticated;
grant execute on function public.cliniverse_account_cleanup_ready() to service_role;

commit;

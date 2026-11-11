-- REVIEW CANDIDATE — NOT APPLIED.
-- Manual rollback after owner approval. Removing readiness closes the API.
begin;
drop function if exists public.cliniverse_account_cleanup_ready();
alter table public.case_completions drop constraint if exists cliniverse_case_completion_account_fk;
alter table public.mcq_answers drop constraint if exists cliniverse_mcq_answer_account_fk;
alter table public.subscriptions drop constraint if exists cliniverse_subscription_account_fk;
alter table public.profiles drop constraint if exists cliniverse_profile_account_fk;
commit;

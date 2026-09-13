-- REVIEW DRAFT ONLY: not an executable migration. No real eligibility is seeded.
-- Trusted server evaluates the existing TypeScript policy/scorer; clients cannot
-- publish decisions or scores. Registry changes and score commits share a row lock.
begin;
create schema ecg_account_private;
revoke all on schema ecg_account_private from public, anon, authenticated;
grant usage on schema ecg_account_private to service_role;
create table ecg_account_private.current_decisions (
 case_id text primary key check(length(trim(case_id))>0),
 decision_id text not null check(decision_id ~ '^[a-f0-9]{64}$'),
 evidence_digest text not null check(evidence_digest ~ '^[a-f0-9]{64}$'),
 learner_ready boolean not null,
 receipt jsonb not null check(jsonb_typeof(receipt)='object'),
 check(receipt->>'decisionId' is not distinct from decision_id),
 check(receipt->>'evidenceDigest' is not distinct from evidence_digest),
 check(receipt->>'decision' is not distinct from case when learner_ready then 'LEARNER_ELIGIBLE' else 'HOLD' end)
);
alter table ecg_account_private.current_decisions enable row level security;
alter table ecg_account_private.current_decisions force row level security;
revoke all on ecg_account_private.current_decisions from public, anon, authenticated;
grant select,insert,update on ecg_account_private.current_decisions to service_role;
create table public.ecg_competency_attempts (
 user_id uuid not null references auth.users(id),
 event_id text not null check(length(trim(event_id)) between 1 and 200),
 case_id text not null references ecg_account_private.current_decisions(case_id),
 decision_id text not null,
 evidence_digest text not null,
 decision_receipt jsonb not null,
 evidence jsonb not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(user_id,event_id)
);
create index ecg_attempts_history on public.ecg_competency_attempts(user_id,created_at desc,event_id desc);
alter table public.ecg_competency_attempts enable row level security;
alter table public.ecg_competency_attempts force row level security;
revoke all on public.ecg_competency_attempts from public,anon,authenticated,service_role;
grant select on public.ecg_competency_attempts to authenticated;
grant select,insert on public.ecg_competency_attempts to service_role;
create policy ecg_attempt_owner_read on public.ecg_competency_attempts for select to authenticated using ((select auth.uid())=user_id);
create function public.save_ecg_attempt_v1(
 p_user_id uuid,p_event_id text,p_case_id text,p_decision_id text,p_evidence_digest text,p_evidence jsonb
) returns public.ecg_competency_attempts
language plpgsql security invoker set search_path='' as $$
declare
 current_decision ecg_account_private.current_decisions;
 saved public.ecg_competency_attempts;
 score numeric;
begin
 if p_user_id is null then raise exception 'authenticated-account-required'; end if;
 -- SHARE prevents the trusted publisher changing eligibility until this commit ends.
 select * into current_decision from ecg_account_private.current_decisions where case_id=p_case_id for share;
 if not found or not current_decision.learner_ready then raise exception 'case-not-eligible'; end if;
 if current_decision.decision_id is distinct from p_decision_id or current_decision.evidence_digest is distinct from p_evidence_digest then
  raise exception 'eligibility-changed';
 end if;
 if jsonb_typeof(p_evidence) is distinct from 'object'
 or p_evidence->>'userId' is distinct from p_user_id::text
 or p_evidence->>'eventId' is distinct from p_event_id
 or p_evidence->>'caseId' is distinct from p_case_id
 or p_evidence#>>'{attempt,learnerId}' is distinct from p_user_id::text
 or p_evidence#>>'{attempt,attemptId}' is distinct from p_event_id
 or p_evidence#>>'{attempt,caseId}' is distinct from p_case_id
 or p_evidence#>>'{result,decision}' is distinct from 'SCORED'
 or p_evidence#>>'{attempt,gateState}' is distinct from 'LEARNER_ELIGIBLE'
 or p_evidence->>'scoringVersion' is distinct from '1.0.0'
 or coalesce(length(trim(p_evidence->>'humanClinicalAttestationId')),0)=0
 or jsonb_typeof(p_evidence#>'{result,overallScore}') is distinct from 'number'
 then raise exception 'invalid-prepared-evidence'; end if;
 score := (p_evidence#>>'{result,overallScore}')::numeric;
 if score<0 or score>1 then raise exception 'invalid-score'; end if;
 if p_evidence->>'observedAt' is null or not isfinite((p_evidence->>'observedAt')::timestamptz) then raise exception 'invalid-observed-time'; end if;
 insert into public.ecg_competency_attempts(user_id,event_id,case_id,decision_id,evidence_digest,decision_receipt,evidence)
 values(p_user_id,p_event_id,p_case_id,p_decision_id,p_evidence_digest,current_decision.receipt,p_evidence)
 on conflict(user_id,event_id) do nothing;
 select * into saved from public.ecg_competency_attempts where user_id=p_user_id and event_id=p_event_id;
 if saved.case_id is distinct from p_case_id or saved.decision_id is distinct from p_decision_id
 or saved.evidence_digest is distinct from p_evidence_digest or saved.evidence is distinct from p_evidence then
  raise exception 'attempt-identity-conflict';
 end if;
 return saved;
end;
$$;
revoke all on function public.save_ecg_attempt_v1(uuid,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_ecg_attempt_v1(uuid,text,text,text,text,jsonb) to service_role;
commit;

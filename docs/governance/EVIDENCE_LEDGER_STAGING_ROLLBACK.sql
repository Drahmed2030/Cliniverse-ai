-- STAGING ROLLBACK CANDIDATE ONLY — DO NOT APPLY WITHOUT EXPLICIT AUTHORIZATION.
-- This rollback refuses to remove the ledger if any persisted rows exist.

begin;

do $$
declare
  row_count bigint := 0;
begin
  if to_regclass('governance.evidence_ledger_events') is not null then
    execute 'select count(*) from governance.evidence_ledger_events' into row_count;
    if row_count > 0 then
      raise exception 'rollback refused: governance.evidence_ledger_events contains % row(s); export/reconcile evidence before destructive rollback', row_count;
    end if;
  end if;
end;
$$;

drop function if exists api.governance_ledger_find_event(text);
drop function if exists api.governance_ledger_append_event(text,text,text,text,timestamptz,timestamptz,text[],text,text,text[],text[],text[],jsonb);
drop function if exists api.governance_ledger_list_subject(text,text,integer);

-- Do not drop schema api: it may host other APIs later.

drop trigger if exists evidence_ledger_no_update on governance.evidence_ledger_events;
drop trigger if exists evidence_ledger_no_delete on governance.evidence_ledger_events;
drop function if exists governance.reject_evidence_ledger_mutation();

drop table if exists governance.evidence_ledger_events;

-- Do not drop schema governance: future governance objects may share it.
-- Removing api from Supabase Exposed Schemas, if it was added for this staging test,
-- is a separate explicit platform setting rollback and must be verified manually.

commit;

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { fixture } from '../../tests/fixtures/ecgEligibility.mjs'
import { ECG_RECORD_10_PRIMARY_SHA256 } from '../../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
import { prepareGovernedEcgAccountAttempt } from '../../app/lib/competency/ecgGovernedAccountAttempt.ts'
import { saveGovernedEcgAttempt } from '../../app/lib/competency/ecgAtomicAccountSave.ts'
const db=new PGlite()
const A='00000000-0000-4000-8000-000000000001',B='00000000-0000-4000-8000-000000000002'
const snapshot={...fixture(),caseId:'ecg-governed-case-001',sourceArtifactSha256:ECG_RECORD_10_PRIMARY_SHA256}
const input={caseId:snapshot.caseId,learnerId:A,attemptId:'fixture-save',scoringVersion:'1.0.0',dimensions:[{skillId:'fixture-only',weight:1,score:0.9}],confidence:0.7}
const time='2026-09-13T12:00:00Z'
const prepared=prepareGovernedEcgAccountAttempt(input,time,snapshot)
const {eligibility,evidence}=prepared
const auth={async getUser(){return {data:{user:{id:A}},error:null}}}
async function actor(role,user=''){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec(`set role ${role}`)}
async function save(patch={}){
 const e={...evidence,...patch}
 return db.query('select * from public.save_ecg_attempt_v1($1,$2,$3,$4,$5,$6)',[e.userId,e.eventId,e.caseId,eligibility.decisionId,eligibility.evidenceDigest,e])
}
const writer={async rpc(_name,p){try{await actor('service_role');const r=await db.query('select * from public.save_ecg_attempt_v1($1,$2,$3,$4,$5,$6)',Object.values(p));return {data:JSON.parse(JSON.stringify(r.rows[0])),error:null}}catch(error){return {data:null,error}}}}
before(async()=>{
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key); insert into auth.users values('${A}'),('${B}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated;
 alter default privileges in schema public grant all on tables to public;`)
 await db.exec(await readFile(new URL('../../supabase/drafts/ecg_account_atomic_v1.sql',import.meta.url),'utf8'))
 await actor('service_role')
 await db.query('insert into ecg_account_private.current_decisions values($1,$2,$3,true,$4)',[snapshot.caseId,eligibility.decisionId,eligibility.evidenceDigest,eligibility])
})
after(()=>db.close())
test('existing policy and scorer save through service RPC and return database acknowledgement',async()=>{
 const r=await saveGovernedEcgAttempt(auth,writer,input,time,snapshot);assert.equal(r.state,'saved');assert.equal(r.eventId,input.attemptId)
})
test('same attempt retry returns one row and original timestamp',async()=>{
 await actor('service_role');const first=(await save()).rows[0];const next=(await save()).rows[0];assert.equal(first.created_at.getTime(),next.created_at.getTime());assert.equal((await db.query('select count(*)::int n from public.ecg_competency_attempts')).rows[0].n,1)
})
test('conflicting payload cannot overwrite saved evidence',async()=>{
 await actor('service_role');await assert.rejects(save({result:{...evidence.result,overallScore:0.5}}),/attempt-identity-conflict/)
})
test('fresh owner session reads saved attempt and decision receipt; another account sees none',async()=>{
 await actor('authenticated',A);const rows=(await db.query('select * from public.ecg_competency_attempts')).rows;assert.equal(rows.length,1);assert.equal(rows[0].decision_receipt.decisionId,eligibility.decisionId)
 await actor('authenticated',B);assert.equal((await db.query('select * from public.ecg_competency_attempts')).rows.length,0)
})
test('authenticated and anonymous callers cannot call save, write scores or publish eligibility',async()=>{
 for(const role of ['authenticated','anon']){await actor(role,A);await assert.rejects(save(),e=>e.code==='42501');await assert.rejects(db.query('insert into public.ecg_competency_attempts(user_id,event_id) values($1,$2)',[A,'forged']),e=>e.code==='42501');await assert.rejects(db.query('select * from ecg_account_private.current_decisions'),e=>e.code==='42501')}
})
test('service writer cannot update or delete a saved score',async()=>{
 await actor('service_role');for(const op of ['update public.ecg_competency_attempts set event_id=event_id','delete from public.ecg_competency_attempts'])await assert.rejects(db.query(op),e=>e.code==='42501')
})
test('wrong owner or malformed score is rejected before insertion',async()=>{
 await actor('service_role');await assert.rejects(save({eventId:'invalid',userId:B}),/invalid-prepared-evidence/);await assert.rejects(save({result:{...evidence.result,overallScore:2}}),/invalid-score/)
})
test('failed outer transaction rolls back a newly inserted attempt',async()=>{
 await actor('service_role');await db.exec('begin')
 await save({...evidence,eventId:'rollback-only',attempt:{...evidence.attempt,attemptId:'rollback-only'}})
 await db.exec('rollback')
 assert.equal((await db.query("select count(*)::int n from public.ecg_competency_attempts where event_id='rollback-only'")).rows[0].n,0)
})
test('a HOLD snapshot never calls the persistence writer',async()=>{
 let called=false;const held={...snapshot,authorizedPromotionActorIds:[]}
 const r=await saveGovernedEcgAttempt(auth,{rpc(){called=true}},input,time,held)
 assert.equal(r.state,'not-saveable');assert.equal(called,false)
})
test('registry revision between preparation and save invalidates stale receipt',async()=>{
 await actor('service_role');await db.query("update ecg_account_private.current_decisions set decision_id=$1,receipt=jsonb_set(receipt,'{decisionId}',to_jsonb($1::text))",['c'.repeat(64)])
 await assert.rejects(save(),/eligibility-changed/)
})
test('later HOLD blocks a formerly valid prepared attempt',async()=>{
 await actor('service_role');await db.query("update ecg_account_private.current_decisions set learner_ready=false,receipt=jsonb_set(receipt,'{decision}', '\"HOLD\"')")
 await assert.rejects(save(),/case-not-eligible/)
})
test('wrong authenticated account never reaches the writer',async()=>{
 let called=false;await assert.rejects(saveGovernedEcgAttempt({async getUser(){return {data:{user:{id:B}},error:null}}},{rpc(){called=true}},input,time,snapshot),/mismatch/);assert.equal(called,false)
})

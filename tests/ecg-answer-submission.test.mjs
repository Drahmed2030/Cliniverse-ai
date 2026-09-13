import test from 'node:test'
import assert from 'node:assert/strict'
import { submitEcgAnswers, ecgRubricDigest } from '../app/lib/competency/ecgAnswerSubmission.ts'
import { fixture } from './fixtures/ecgEligibility.mjs'
import { ECG_RECORD_10_PRIMARY_SHA256, ECG_RECORD_10_EVIDENCE_EVENTS } from '../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
const owner='00000000-0000-4000-8000-000000000001'
function setup() {
 const snapshot={...fixture(),caseId:'ecg-governed-case-001',sourceArtifactSha256:ECG_RECORD_10_PRIMARY_SHA256}
 const rubric={caseId:snapshot.caseId,version:'fixture-1',clinicalEventId:'ecg-record-10-clinical-attested-v1',questions:[{id:'fixture-q',skillId:'fixture-skill',weight:1,optionIds:['a','b'],correctOptionId:'a',critical:true}]}
 rubric.approval={actorId:'fixture-reviewer',definitionSha256:ecgRubricDigest(rubric)}
 const payload={caseId:snapshot.caseId,attemptId:'00000000-0000-4000-8000-000000000002',rubricVersion:rubric.version,answers:[{questionId:'fixture-q',optionId:'a'}],confidence:0.7}
 const calls=[]
 const auth={getUser:async()=>({data:{user:{id:owner}},error:null})}
 const writer={rpc:async(name,args)=>{calls.push({name,args});return {error:null,data:{user_id:args.p_user_id,event_id:args.p_event_id,case_id:args.p_case_id,decision_id:args.p_decision_id,evidence_digest:args.p_evidence_digest,created_at:'2026-09-13T12:00:00Z'}}}}
 return {snapshot,rubric,payload,calls,auth,writer}
}
const run=s=>submitEcgAnswers(s.auth,s.writer,s.payload,s.snapshot,s.rubric,['fixture-reviewer'],'2026-09-13T12:00:00Z')
test('raw answers use authenticated owner, existing scorer and atomic writer; audit survives',async()=>{
 const s=setup();assert.equal((await run(s)).state,'saved');const e=s.calls[0].args.p_evidence
 assert.equal(e.userId,owner);assert.equal(e.result.overallScore,1);assert.equal(e.answerSubmission.rubricDigest,s.rubric.approval.definitionSha256)
 assert.deepEqual(e.answerSubmission.answers,s.payload.answers)
})
test('wrong answer produces zero and critical miss; confidence does not award points',async()=>{
 const s=setup();s.payload.answers[0].optionId='b';s.payload.confidence=1;await run(s)
 const e=s.calls[0].args.p_evidence;assert.equal(e.result.overallScore,0);assert.equal(e.attempt.dimensions[0].criticalMiss,true)
})
test('actual HOLD cannot grade or write despite a fixture rubric',async()=>{
 const s=setup();s.snapshot.events=ECG_RECORD_10_EVIDENCE_EVENTS;assert.equal((await run(s)).state,'not-saveable');assert.equal(s.calls.length,0)
})
test('identity, score, gate and timestamp injection rejected',async()=>{
 for(const field of ['learnerId','dimensions','gateState','observedAt']){const s=setup();s.payload[field]='injected';await assert.rejects(run(s));assert.equal(s.calls.length,0)}
})
test('missing, duplicate, unknown or decorated answers rejected before writer',async()=>{
 for(const answers of [[],[{questionId:'fixture-q',optionId:'c'}],[{questionId:'other',optionId:'a'}],[{questionId:'fixture-q',optionId:'a',score:1}],[{questionId:'fixture-q',optionId:'a'},{questionId:'fixture-q',optionId:'b'}]]){
 const s=setup();s.payload.answers=answers;await assert.rejects(run(s));assert.equal(s.calls.length,0)
 }
})
test('missing rubric is explicit; altered or untrusted grading reference cannot save',async()=>{
 const missing=setup();missing.rubric=null;assert.deepEqual((await run(missing)).blockers,['approved-answer-rubric-required'])
 for(const change of [s=>s.rubric.questions[0].correctOptionId='b',s=>s.rubric.approval.actorId='unknown',s=>s.payload.rubricVersion='old']){
 const s=setup();change(s);await assert.rejects(run(s));assert.equal(s.calls.length,0)
 }
})
test('sign-out and account switch before save prevent writing',async()=>{
 const s=setup();s.auth.getUser=async()=>({data:{user:null},error:null});await assert.rejects(run(s));assert.equal(s.calls.length,0)
 const switched=setup();let count=0;switched.auth.getUser=async()=>({data:{user:{id:++count===1?owner:'00000000-0000-4000-8000-000000000003'}},error:null})
 await assert.rejects(run(switched));assert.equal(switched.calls.length,0)
})

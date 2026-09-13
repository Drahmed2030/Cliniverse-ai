import test from 'node:test'
import assert from 'node:assert/strict'
import { getApprovedRecord10Rubric, submitApprovedRecord10Answers, ECG_RECORD10_RUBRIC_APPROVAL_SHA256 } from '../app/lib/competency/ecgRecord10ApprovedRubric.ts'
import { ecgRubricDigest } from '../app/lib/competency/ecgAnswerSubmission.ts'
import { fixture } from './fixtures/ecgEligibility.mjs'
import { ECG_RECORD_10_PRIMARY_SHA256, ECG_RECORD_10_EVIDENCE_EVENTS } from '../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
test('accepted rubric is fixed and returned copies cannot rewrite approval',()=>{
 const r=getApprovedRecord10Rubric();assert.equal(ecgRubricDigest(r),ECG_RECORD10_RUBRIC_APPROVAL_SHA256)
 r.questions[0].correctOptionId='af';assert.notEqual(ecgRubricDigest(r),ECG_RECORD10_RUBRIC_APPROVAL_SHA256)
 assert.equal(getApprovedRecord10Rubric().questions[0].correctOptionId,'sinus')
})
test('approved question scores through existing engine only with eligible fixture',async()=>{
 for(const [option,score] of [['sinus',1],['af',0],['flutter',0],['undetermined',0]]){
 const owner='00000000-0000-4000-8000-000000000001';let saved
 const auth={getUser:async()=>({data:{user:{id:owner}},error:null})}
 const writer={rpc:async(_name,args)=>{saved=args.p_evidence;return {error:null,data:{user_id:owner,event_id:args.p_event_id,case_id:args.p_case_id,decision_id:args.p_decision_id,evidence_digest:args.p_evidence_digest,created_at:'2026-09-13T12:00:00Z'}}}}
 const snapshot={...fixture(),caseId:'ecg-governed-case-001',sourceArtifactSha256:ECG_RECORD_10_PRIMARY_SHA256}
 const payload={caseId:snapshot.caseId,attemptId:'00000000-0000-4000-8000-000000000002',rubricVersion:'1.0.0',answers:[{questionId:'record10-rhythm-v1',optionId:option}]}
 assert.equal((await submitApprovedRecord10Answers(auth,writer,payload,snapshot,'2026-09-13T12:00:00Z')).state,'saved')
 assert.equal(saved.result.overallScore,score);assert.equal(saved.attempt.dimensions[0].criticalMiss,false)
 saved=null;snapshot.events=ECG_RECORD_10_EVIDENCE_EVENTS
 assert.equal((await submitApprovedRecord10Answers(auth,writer,payload,snapshot,'2026-09-13T12:00:00Z')).state,'not-saveable');assert.equal(saved,null)
 }
})

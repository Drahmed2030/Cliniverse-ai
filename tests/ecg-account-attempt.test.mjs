import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareEcgAccountAttempt } from '../app/lib/competency/ecgAccountAttempt.ts'
const attempt=()=>({scoringVersion:'1.0.0',caseId:'fixture-only',attemptId:'test-attempt',learnerId:'00000000-0000-4000-8000-000000000001',gateState:'LEARNER_ELIGIBLE',referenceAuthority:'HUMAN_REVIEWED',humanClinicalAttestationId:'fixture-attestation',dimensions:[{skillId:'fixture-skill',weight:1,score:0.9}],confidence:0.7})
const time='2026-09-13T12:00:00Z'
test('eligible fixture uses existing normalized ECG score, without Echo percent conversion',()=>{const out=prepareEcgAccountAttempt(attempt(),time);assert.equal(out.state,'prepared');assert.equal(out.evidence.result.overallScore,0.9)})
test('HOLD and rejected cases never produce saveable score evidence',()=>{for(const gateState of ['HOLD','REJECTED']){const out=prepareEcgAccountAttempt({...attempt(),gateState},time);assert.equal(out.state,'not-saveable');assert.equal('evidence' in out,false)}})
test('missing attestation cannot generate saveable score evidence',()=>{assert.equal(prepareEcgAccountAttempt({...attempt(),humanClinicalAttestationId:''},time).state,'not-saveable')})
test('untrusted authority, missing account and nonfinite date rejected',()=>{for(const patch of [{referenceAuthority:'DATASET'},{learnerId:'preview-session'},{scoringVersion:'2'}])assert.throws(()=>prepareEcgAccountAttempt({...attempt(),...patch},time));assert.throws(()=>prepareEcgAccountAttempt(attempt(),'bad'))})
test('caller mutation cannot rewrite prepared evidence',()=>{const value=attempt();const out=prepareEcgAccountAttempt(value,time);value.dimensions[0].score=0;assert.equal(out.evidence.attempt.dimensions[0].score,0.9)})

import test from 'node:test'
import assert from 'node:assert/strict'
import { ECG_RECORD_10_PRIMARY_SHA256, ECG_RECORD_10_EVIDENCE_EVENTS, evaluateEcgRecord10EvidenceBinding } from '../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
import { ECG_ELIGIBILITY_POLICY } from '../app/lib/clinicalIntelligence/ecgEligibilityDecision.ts'
import { fixture } from './fixtures/ecgEligibility.mjs'
test('existing record remains HOLD with specific missing evidence, not a hardcoded readiness flag',()=>{const r=evaluateEcgRecord10EvidenceBinding();assert.equal(r.decision,'HOLD');assert.ok(r.blockers.includes('device-ledger-binding-required'));assert.ok(r.blockers.includes('current-authorized-promotion-required'));assert.equal(r.integrityValid,true)})
test('complete authorized fixture can transition to eligible',()=>{const r=evaluateEcgRecord10EvidenceBinding(fixture());assert.deepEqual(r.blockers,[]);assert.equal(r.learnerReady,true)})
test('same snapshot produces same decision receipt; changed evidence invalidates it',()=>{const f=fixture();const a=evaluateEcgRecord10EvidenceBinding(f);assert.equal(a.decisionId,evaluateEcgRecord10EvidenceBinding(structuredClone(f)).decisionId);f.target.rendererVersion='2';const b=evaluateEcgRecord10EvidenceBinding(f);assert.notEqual(a.decisionId,b.decisionId);assert.equal(b.decision,'HOLD')})
test('PDF output, canonical waveform and platform evidence cannot transfer to another target',()=>{for(const key of ['outputArtifactSha256','canonicalWaveformSha256','platformFamily','calibrationPolicyVersion']){const f=fixture();f.target[key]=key.includes('Sha256')?'c'.repeat(64):'other';assert.equal(evaluateEcgRecord10EvidenceBinding(f).learnerReady,false)}})
test('untrusted actor and stale policy cannot authorize promotion',()=>{const f=fixture();f.authorizedPromotionActorIds=[];assert.equal(evaluateEcgRecord10EvidenceBinding(f).learnerReady,false);const g=fixture();g.events.at(-1).policies[0].policyVersion='old';assert.equal(evaluateEcgRecord10EvidenceBinding(g).learnerReady,false)})
test('latest HOLD overrides older promotion',()=>{const f=fixture();f.events.push({...structuredClone(f.events.at(-1)),eventId:'later-hold',decision:'HOLD',occurredAt:'2026-09-13T10:02:00Z'});assert.equal(evaluateEcgRecord10EvidenceBinding(f).learnerReady,false)})
test('recall or later negative clinical review prevents reuse of earlier approval',()=>{for(const kind of ['RECALLED','CLINICAL_ATTESTED']){const f=fixture();f.events.push({...structuredClone(f.events.at(-1)),eventId:'later-rejection',kind,decision:'REJECT',occurredAt:'2026-09-13T10:02:00Z',humanAttestation:{scope:'CLINICAL',attested:true}});assert.equal(evaluateEcgRecord10EvidenceBinding(f).learnerReady,false)}})
test('new device evidence must be a direct parent of the promotion',()=>{const f=fixture();f.events.at(-1).parentEventIds=[];assert.ok(evaluateEcgRecord10EvidenceBinding(f).blockers.includes('promotion-device-parent-required'))})

import { prepareGovernedEcgAccountAttempt } from '../app/lib/competency/ecgGovernedAccountAttempt.ts'
const attempt = () => ({ scoringVersion:'1.0.0', caseId:'ecg-governed-case-001', attemptId:'fixture-attempt', learnerId:'00000000-0000-4000-8000-000000000001', dimensions:[{skillId:'fixture-skill',weight:1,score:0.9}], confidence:0.7 })
const snapshot = (binding = fixture()) => ({...binding,caseId:'ecg-governed-case-001',sourceArtifactSha256:ECG_RECORD_10_PRIMARY_SHA256})
test('governed preparation derives attestation and score from trusted evidence despite caller overrides', () => {
 const r = prepareGovernedEcgAccountAttempt({...attempt(),gateState:'HOLD',referenceAuthority:'DATASET',humanClinicalAttestationId:'injected'},'2026-09-13T12:00:00Z',snapshot())
 assert.equal(r.state,'prepared')
 assert.equal(r.evidence.attempt.humanClinicalAttestationId,'ecg-record-10-clinical-attested-v1')
 assert.equal(r.evidence.result.overallScore,0.9)
 assert.equal(r.eligibility.decision,'LEARNER_ELIGIBLE')
})
test('caller eligible flag cannot bypass actual HOLD ledger', () => {
 const r = prepareGovernedEcgAccountAttempt({...attempt(),gateState:'LEARNER_ELIGIBLE'},'2026-09-13T12:00:00Z',snapshot({events:ECG_RECORD_10_EVIDENCE_EVENTS,authorizedPromotionActorIds:[]}))
 assert.equal(r.state,'not-saveable')
 assert.equal('evidence' in r,false)
})
test('governed preparation rejects case substitution', () => {
 assert.throws(()=>prepareGovernedEcgAccountAttempt({...attempt(),caseId:'other'},'2026-09-13T12:00:00Z',snapshot()),/mismatch/)
})
test('new clinical approval requires promotion referring to the current evidence', () => {
 const f=fixture()
 f.events.push({...structuredClone(f.events.find(e=>e.kind==='CLINICAL_ATTESTED')),eventId:'new-clinical',occurredAt:'2026-09-13T10:02:00Z'})
 assert.ok(evaluateEcgRecord10EvidenceBinding(f).blockers.includes('promotion-current-evidence-parent-required:CLINICAL_ATTESTED'))
})

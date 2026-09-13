import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { getRecord10ReviewedPdfSnapshot, evaluateRecord10ReviewedPdfBinding, RECORD10_RECONSTRUCTION } from '../app/lib/clinicalIntelligence/ecgRecord10ReviewedPdfBinding.ts'
import { evaluateEcgEligibility } from '../app/lib/clinicalIntelligence/ecgEligibilityDecision.ts'
import { evaluateEcgRecord10EvidenceBinding } from '../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
test('actual retained PDF evidence yields scoped eligible receipt with complete lineage',()=>{
 const result=evaluateRecord10ReviewedPdfBinding();assert.deepEqual(result.blockers,[]);assert.equal(result.learnerReady,true)
 assert.equal(result.integrityValid,true);assert.equal(result.deviceBaselineBound,true)
})
test('comparison manifest and renderer identities match committed bytes',()=>{
 for(const [file,key] of [['reconstruction-evidence.json','comparisonSha256'],['build_review.py','rendererSha256']]) {
 assert.equal(createHash('sha256').update(readFileSync(new URL('../tools/ecg-rebuild/'+file,import.meta.url))).digest('hex'),RECORD10_RECONSTRUCTION[key])
 }
})
test('reconstructed PDF and other devices cannot inherit reviewed PDF coverage',()=>{
 for(const patch of [{outputArtifactSha256:RECORD10_RECONSTRUCTION.rebuiltPdfSha256},{platformFamily:'ipad'},{rendererVersion:'2.0.0'},{canonicalWaveformSha256:'f'.repeat(64)}]){
 const s=getRecord10ReviewedPdfSnapshot();Object.assign(s.target,patch);assert.equal(evaluateEcgEligibility(s).learnerReady,false)
 }
})
test('revoked authority or missing device record fails closed',()=>{
 const a=getRecord10ReviewedPdfSnapshot();a.authorizedPromotionActorIds=[];assert.equal(evaluateEcgEligibility(a).learnerReady,false)
 const b=getRecord10ReviewedPdfSnapshot();b.events=b.events.filter(e=>e.kind!=='DEVICE_BASELINE_BOUND');assert.equal(evaluateEcgEligibility(b).learnerReady,false)
})
test('caller mutation does not change subsequent trusted snapshots or generic HOLD',()=>{
 const a=getRecord10ReviewedPdfSnapshot();a.events[0].decision='REJECT';assert.equal(evaluateEcgEligibility(a).learnerReady,false)
 assert.equal(evaluateRecord10ReviewedPdfBinding().learnerReady,true);assert.equal(evaluateEcgRecord10EvidenceBinding().learnerReady,false)
})

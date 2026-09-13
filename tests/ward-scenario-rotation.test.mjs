import test from 'node:test'
import assert from 'node:assert/strict'
import {createPractice,advancePractice,nextScenario,scenarioFor,practiceForVersion} from '../app/lib/ward/handoverScenarios.ts'
import {checkpointHandover,restoreHandover} from '../app/lib/ward/handoverCheckpoint.ts'
const at='2026-09-13T20:00:00Z',id='11111111-1111-4111-8111-111111111111'
for(const scenario of ['current-status','pending-items','receiving-clinician']){
 test(`${scenario}: feedback, completion and persisted replay stay in their own version`,()=>{
  let s=createPractice(scenario),definition=scenarioFor(s)
  for(const action of ['start','review-record',definition.incorrect])s=advancePractice(s,action,at)
  assert.equal(s.stage,'gaps');assert.equal(s.feedback,definition.feedback)
  s=advancePractice(s,definition.correct,at);s=advancePractice(s,'complete-handover',at)
  const row=checkpointHandover('owner',id,s)
  assert.equal(row.content_version,definition.version)
  assert.deepEqual(restoreHandover('owner',row),s)
  assert.equal(s.stage,'complete')
 })
}
test('rotation visits all three scenarios without changing their source facts',()=>{
 let s=createPractice('current-status');const patient=s.patient;const sequence=[]
 for(let i=0;i<4;i++){sequence.push(scenarioFor(s).title);assert.deepEqual(s.patient,patient);s=createPractice(nextScenario(s))}
 assert.equal(new Set(sequence.slice(0,3)).size,3);assert.equal(sequence[0],sequence[3])
})
test('legacy checkpoints remain legacy and unsupported versions fail closed',()=>{
 const legacy={user_id:'owner',session_id:id,checkpoint:2,content_version:'w1-handover-1.0.0',actions:[{action:'start',at},{action:'review-record',at}]}
 const s=restoreHandover('owner',legacy);assert.equal(s.scenario,undefined);assert.equal(s.stage,'gaps')
 assert.throws(()=>practiceForVersion('future'))
})
test('cross-scenario actions cannot advance a session',()=>{
 let s=createPractice('pending-items');s=advancePractice(s,'start',at);s=advancePractice(s,'review-record',at)
 assert.throws(()=>advancePractice(s,'retain-unassigned',at));assert.throws(()=>advancePractice(s,'mark-unknown',at))
})

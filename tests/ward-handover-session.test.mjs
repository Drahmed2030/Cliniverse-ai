import test from 'node:test'
import assert from 'node:assert/strict'
import { createHandoverSession, advanceHandover, draftHandover } from '../app/lib/ward/handoverSession.ts'
const patient = {id:'w1',name:'Fictional case',diagnosis:'Existing diagnosis',bed:'CCU-1',timeline:[{title:'Source event'}],workup:[{title:'Source result',summary:'Recorded summary'}],orders:[{label:'Existing monitoring',status:'pending'}]}
const at='2026-09-13T20:00:00Z'
test('full session preserves the source and produces four ordered actions',()=>{
 const source=structuredClone(patient); let session=createHandoverSession(patient)
 for(const action of ['start','review-record','mark-unknown','complete-handover'])session=advanceHandover(session,action,at)
 assert.equal(session.stage,'complete');assert.equal(session.events.length,4);assert.deepEqual(patient,source)
 assert.equal('score' in session,false);assert.equal('learnerReady' in session,false)
})
test('cannot finish before review or append actions after completion',()=>{
 let session=createHandoverSession(patient)
 assert.throws(()=>advanceHandover(session,'complete-handover',at))
 for(const action of ['start','review-record','mark-unknown','complete-handover'])session=advanceHandover(session,action,at)
 assert.throws(()=>advanceHandover(session,'complete-handover',at))
})
test('unsupported assumption gives feedback and remains at the decision',()=>{
 let session=createHandoverSession(patient)
 for(const action of ['start','review-record','assume-stable'])session=advanceHandover(session,action,at)
 assert.equal(session.stage,'gaps');assert.match(session.feedback,/no current observations/)
 assert.equal(advanceHandover(session,'mark-unknown',at).stage,'handover')
})
test('invalid timing, backward events and unsupported cases are rejected',()=>{
 assert.throws(()=>createHandoverSession({...patient,id:'w2'}))
 const session=advanceHandover(createHandoverSession(patient),'start',at)
 assert.throws(()=>advanceHandover(session,'review-record','bad'))
 assert.throws(()=>advanceHandover(session,'review-record','2020-01-01T00:00:00Z'))
})
test('draft preserves known facts, pending items and explicit gaps without invented results',()=>{
 const session=createHandoverSession(patient); const draft=draftHandover(session)
 assert.equal(draft.recorded,'Source result: Recorded summary')
 assert.match(draft.unknown,/not supplied/);assert.match(draft.followUp,/listed as pending/)
 session.patient.orders[0].status='done';assert.equal(patient.orders[0].status,'pending')
 assert.equal(draftHandover(session).followUp,'No pending items listed in the source snapshot.')
})

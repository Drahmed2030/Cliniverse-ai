import test from 'node:test'
import assert from 'node:assert/strict'
import {createHandoverSession,advanceHandover} from '../app/lib/ward/handoverSession.ts'
import {HANDOVER_SOURCE_V1} from '../app/lib/ward/handoverContentV1.ts'
import {checkpointHandover,restoreHandover} from '../app/lib/ward/handoverCheckpoint.ts'
import {handoverAccountRepository} from '../app/lib/ward/handoverAccountRepository.ts'
const owner='owner',id='11111111-1111-4111-8111-111111111111',at='2026-09-13T20:00:00Z'
const started=()=>advanceHandover(createHandoverSession(HANDOVER_SOURCE_V1),'start',at)
test('checkpoint resumes the same content and event-derived stage without trusting saved labels',()=>{
 const s=started(),r=checkpointHandover(owner,id,s);assert.deepEqual(restoreHandover(owner,JSON.parse(JSON.stringify(r))),s)
 assert.equal('patient' in r,false);assert.equal('score' in r,false)
})
test('foreign owner, wrong version, length mismatch, injected fields and invalid transitions rejected',()=>{
 const r=checkpointHandover(owner,id,started())
 for(const patch of [{user_id:'other'},{content_version:'future'},{checkpoint:5},{actions:[{action:'start',at,label:'injected'}]},{actions:[{action:'complete-handover',at}]}])assert.throws(()=>restoreHandover(owner,{...r,...patch}))
})
test('fresh checkpoint and completed checkpoint both replay',()=>{
 let s=createHandoverSession(HANDOVER_SOURCE_V1);assert.equal(restoreHandover(owner,checkpointHandover(owner,id,s)).stage,'brief')
 for(const a of ['start','review-record','mark-unknown','complete-handover'])s=advanceHandover(s,a,at)
 assert.equal(restoreHandover(owner,checkpointHandover(owner,id,s)).stage,'complete')
})
function fake({stored=null,identity='owner',writeError=null}={}) {
 const client={auth:{async getUser(){return {data:{user:{id:identity}},error:null}}},from(){let inserted=false;const q={select(){return q},eq(){return q},order(){return q},limit(){return q},insert(row){inserted=true;if(!stored&&!writeError)stored=row;return q},single(){return Promise.resolve({data:stored,error:null})},then(resolve){return Promise.resolve(inserted?{error:writeError}: {data:stored?[stored]:[],error:null}).then(resolve)}};return q}}
 return handoverAccountRepository(client)
}
test('repository verifies saved checkpoint and restores it',async()=>{const repo=fake(),r=checkpointHandover(owner,id,started());await repo.save(owner,r);assert.deepEqual(await repo.latest(owner),r)})
test('duplicate save only accepted when persisted content matches',async()=>{const r=checkpointHandover(owner,id,started());await fake({stored:r,writeError:{code:'23505'}}).save(owner,r);const other={...r,actions:[{action:'start',at:'2026-09-14T00:00:00Z'}]};await assert.rejects(()=>fake({stored:other,writeError:{code:'23505'}}).save(owner,r))})
test('account mismatch and failed writes never claim success',async()=>{const r=checkpointHandover(owner,id,started());await assert.rejects(()=>fake({identity:'other'}).save(owner,r));await assert.rejects(()=>fake({writeError:{code:'42501'}}).save(owner,r))})

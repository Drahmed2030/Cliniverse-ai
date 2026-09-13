import test from 'node:test'
import assert from 'node:assert/strict'
import { createEchoAccountEventRepository, EchoStorageUnavailable } from '../app/lib/competency/echoAccountEventRepository.ts'
const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const event = () => ({ eventId:'stable-attempt', userId:A, caseId:'case-a', taskId:'task-a', taskVersion:'v1', skillId:'skill-a', selectedAnswer:'a', normalizedScore:80, confidence:3, responseTimeMs:200, observedAt:'2026-09-13T00:00:00.000Z' })
function fixture() {
  const state = { owner:A, rows:[], loseAck:false, switchOnWrite:false, missing:false, queries:0 }
  const client = { auth:{ async getUser() { return { data:{user:{id:state.owner}}, error:null } } }, from(table) {
    assert.equal(table,'echo_competency_events'); state.queries++
    let row; const filters = {}
    const query = { insert(v) { row=v; return query }, select() { return query }, eq(k,v) { filters[k]=v; return query }, order() { return query }, limit() { return query }, single:run, maybeSingle:run }
    async function run() {
      if(state.missing) return {error:{code:'PGRST205'},data:null}
      if(row) {
        if(state.rows.some(r=>r.event_id===row.event_id)) return {error:{code:'23505'},data:null}
        state.rows.push({...row})
        if(state.switchOnWrite) state.owner=B
        if(state.loseAck) { state.loseAck=false; throw Error('lost response') }
        return {data:{...row},error:null}
      }
      return {data:state.rows.find(r=>r.user_id===state.owner && Object.entries(filters).every(([k,v])=>r[k]===v))??null,error:null}
    }
    return query
  } }
  return {state,client,repo:createEchoAccountEventRepository(client)}
}
test('save and reload returns the full original assessment',async()=>{
  const {repo}=fixture(); const value=event(); assert.deepEqual(await repo.save(value),value); assert.deepEqual(await repo.load(A,value.eventId),value)
})
test('lost acknowledgement can be retried without duplication',async()=>{
  const {repo,state}=fixture(); state.loseAck=true; await assert.rejects(repo.save(event())); await repo.save(event()); assert.equal(state.rows.length,1)
})
test('same identity cannot overwrite changed answer or score',async()=>{
  const {repo,state}=fixture(); await repo.save(event()); await assert.rejects(repo.save({...event(),selectedAnswer:'b'}),/conflict/); assert.equal(state.rows[0].selected_answer,'a')
})
test('account mismatch prevents any query',async()=>{
  const {repo,state}=fixture(); state.owner=B; await assert.rejects(repo.save(event())); await assert.rejects(repo.load(A,'stable-attempt')); assert.equal(state.queries,0)
})
test('account switch during write suppresses saved acknowledgement',async()=>{
  const {repo,state}=fixture(); state.switchOnWrite=true; await assert.rejects(repo.save(event()),/Account changed/); assert.equal(await repo.load(B,'stable-attempt'),null)
})
test('missing schema is unavailable, never empty history or saved success',async()=>{
  const {repo,state}=fixture(); state.missing=true; await assert.rejects(repo.save(event()),EchoStorageUnavailable); await assert.rejects(repo.load(A,'stable-attempt'),EchoStorageUnavailable)
})
test('invalid numeric or identity evidence fails before querying',async()=>{
  const {repo,state}=fixture(); for(const patch of [{normalizedScore:NaN},{confidence:Infinity},{responseTimeMs:0.5},{responseTimeMs:2147483648},{eventId:''},{caseId:undefined},{selectedAnswer:' '}]) await assert.rejects(repo.save({...event(),...patch})); assert.equal(state.queries,0)
})
test('caller mutation while awaiting auth cannot change stored attempt',async()=>{
  const {repo,state}=fixture(); const value=event(); const saving=repo.save(value); value.selectedAnswer='changed'; value.userId=B; await saving; assert.equal(state.rows[0].selected_answer,'a'); assert.equal(state.rows[0].user_id,A)
})
test('auth timeout fails with retry guidance',async()=>{
  const repo=createEchoAccountEventRepository({auth:{getUser:()=>new Promise(()=>{})}},5); await assert.rejects(repo.save(event()),/timed out/)
})

test('latest account assessment restores current task version only',async()=>{
  const {repo}=fixture();const value=event();await repo.save(value)
  const identity={caseId:value.caseId,taskId:value.taskId,taskVersion:value.taskVersion}
  assert.deepEqual(await repo.loadLatest(A,identity),value)
  assert.equal(await repo.loadLatest(A,{...identity,taskVersion:'v2'}),null)
})
test('latest assessment rejects a mismatched account and missing storage',async()=>{
  const {repo,state}=fixture(); const identity={caseId:'case-a',taskId:'task-a',taskVersion:'v1'}
  state.owner=B;await assert.rejects(repo.loadLatest(A,identity));assert.equal(state.queries,0)
  state.owner=A;state.missing=true;await assert.rejects(repo.loadLatest(A,identity),EchoStorageUnavailable)
})

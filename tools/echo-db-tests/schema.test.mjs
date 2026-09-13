import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
const db = new PGlite()
const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const columns = ['event_id','user_id','case_id','task_id','task_version','skill_id','selected_answer','normalized_score','confidence','response_time_ms','observed_at']
const base = {event_id:'attempt-a',user_id:A,case_id:'case-a',task_id:'task-a',task_version:'1',skill_id:'skill-a',selected_answer:'["a"]',normalized_score:100,confidence:3,response_time_ms:500,observed_at:'2026-09-13T01:00:00Z'}
async function actor(user, role='authenticated') {
  await db.exec('reset role')
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user??''])
  await db.exec(role==='anon'?'set role anon':'set role authenticated')
}
function insert(patch={},extra={}) {
  const row={...base,...patch,...extra}; const names=[...columns,...Object.keys(extra)]
  return db.query(`insert into public.echo_competency_events (${names.join(',')}) values (${names.map((_,i)=>`$${i+1}`).join(',')}) returning event_id,user_id,created_at`,names.map(k=>row[k]))
}
before(async()=>{
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    insert into auth.users values ('${A}'),('${B}');
    alter default privileges in schema public grant select on tables to public;`)
  await db.exec(await readFile(new URL('../../supabase/drafts/echo_competency_persistence_v1.sql',import.meta.url),'utf8'))
})
after(async()=>{ await db.close() })
test('owner inserts and receives database acknowledgement',async()=>{
  await actor(A); const {rows}=await insert(); assert.equal(rows[0].user_id,A); assert.ok(rows[0].created_at)
})
test('owner reads saved evidence in a fresh role session',async()=>{
  await actor(A); const {rows}=await db.query('select event_id from public.echo_competency_events'); assert.deepEqual(rows,[{event_id:'attempt-a'}])
})
test('other account cannot read evidence even without owner filter',async()=>{
  await actor(B); assert.deepEqual((await db.query('select * from public.echo_competency_events')).rows,[])
})
test('other account cannot insert on behalf of owner',async()=>{
  await actor(B); await assert.rejects(insert({event_id:'forged'}),e=>e.code==='42501')
})
test('retry identity is unique within the account',async()=>{
  await actor(A); await assert.rejects(insert(),e=>e.code==='23505')
})
test('same identity string in different account cannot reserve or collide with owner',async()=>{
  await actor(B); assert.equal((await insert({user_id:B})).rows[0].user_id,B)
})
test('same task/time attempt with a new event ID cannot duplicate evidence',async()=>{
  await actor(A); await assert.rejects(insert({event_id:'different-id'}),e=>e.code==='23505')
})
test('owner cannot update evidence',async()=>{
  await actor(A); await assert.rejects(db.query('update public.echo_competency_events set normalized_score=0'),e=>e.code==='42501')
})
test('owner cannot delete evidence',async()=>{
  await actor(A); await assert.rejects(db.query('delete from public.echo_competency_events'),e=>e.code==='42501')
})
test('client cannot supply server creation time',async()=>{
  await actor(A); await assert.rejects(insert({event_id:'audit-forge'},{created_at:'2000-01-01T00:00:00Z'}),e=>e.code==='42501')
})
test('anonymous role has no read or insert grants despite default public grant',async()=>{
  await actor(null,'anon'); await assert.rejects(db.query('select * from public.echo_competency_events'),e=>e.code==='42501'); await assert.rejects(insert(),e=>e.code==='42501')
})
test('authenticated role without user identity sees no rows and cannot insert',async()=>{
  await actor(null); assert.deepEqual((await db.query('select * from public.echo_competency_events')).rows,[]); await assert.rejects(insert(),e=>e.code==='42501')
})
test('database enforces score, confidence, time and text constraints',async()=>{
  await actor(A)
  for(const patch of [{normalized_score:101},{confidence:0},{response_time_ms:-1},{task_id:' '},{observed_at:'infinity'}]) await assert.rejects(insert({event_id:'invalid',...patch}),e=>e.code==='23514')
})
test('RLS is enabled and forced; no mastery relation created',async()=>{
  await db.exec('reset role'); const {rows}=await db.query("select relrowsecurity,relforcerowsecurity from pg_class where oid='public.echo_competency_events'::regclass"); assert.deepEqual(rows,[{relrowsecurity:true,relforcerowsecurity:true}]); assert.equal((await db.query("select to_regclass('public.echo_skill_mastery') as mastery")).rows[0].mastery,null)
})

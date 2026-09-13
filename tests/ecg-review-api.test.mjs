import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { submitApprovedRecord10Answers } from '../app/lib/competency/ecgRecord10ApprovedRubric.ts'
import { getRecord10ReviewedPdfSnapshot } from '../app/lib/clinicalIntelligence/ecgRecord10ReviewedPdfBinding.ts'
import { RECORD10_REVIEW_PDF } from '../app/lib/clinicalIntelligence/ecgReviewedPdfIdentity.ts'
const rows=new Map();let authenticated=true;let writes=0
const user={id:'00000000-0000-4000-8000-000000000001',email:'reviewer@cliniverseai.com',email_confirmed_at:'2026-09-13'}
const client={auth:{getUser:async()=>({data:{user:authenticated?user:null},error:null})},from(){let id;return {select(){return this},eq(k,v){if(k==='event_id')id=v;return this},maybeSingle:async()=>({data:rows.get(id)?{evidence:rows.get(id).evidence}:null,error:null}),order(){return this},limit:async()=>({data:[...rows.values()],error:null})}},rpc:async(_name,args)=>{writes++;const prior=rows.get(args.p_event_id);if(prior && JSON.stringify(prior.evidence)!==JSON.stringify(args.p_evidence))return {data:null,error:'conflict'};const row=prior??{user_id:args.p_user_id,event_id:args.p_event_id,case_id:args.p_case_id,decision_id:args.p_decision_id,evidence_digest:args.p_evidence_digest,created_at:'2026-09-13T12:00:00Z',evidence:args.p_evidence};rows.set(row.event_id,row);return {data:row,error:null}}}
globalThis.__ecgRouteTest={createClient:()=>client,supabaseUrl:'https://example.test',supabaseAnonKey:'test',submitApprovedRecord10Answers,getRecord10ReviewedPdfSnapshot,RECORD10_REVIEW_PDF}
const source=readFileSync(new URL('../app/api/ecg-review-attempt/route.ts',import.meta.url),'utf8').replace(/^import .*$/gm,'')
const js=ts.transpile(source,{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})
const route=await import('data:text/javascript;base64,'+Buffer.from('const {createClient,supabaseUrl,supabaseAnonKey,submitApprovedRecord10Answers,getRecord10ReviewedPdfSnapshot,RECORD10_REVIEW_PDF}=globalThis.__ecgRouteTest;\n'+js).toString('base64'))
const oldEnv={node:process.env.NODE_ENV,vercel:process.env.VERCEL_ENV,key:process.env.SUPABASE_SERVICE_ROLE_KEY}
process.env.NODE_ENV='test';process.env.VERCEL_ENV='preview';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only'
const payload={reviewedPdfSha256:RECORD10_REVIEW_PDF.sha256,reviewContext:'confirmed-external-iphone-xs-max-ios-18.7.10',submission:{attemptId:'10000000-0000-4000-8000-000000000001',caseId:'ecg-governed-case-001',rubricVersion:'1.0.0',answers:[{questionId:'record10-rhythm-v1',optionId:'sinus'}]}}
const request=(body=payload,origin='https://example.test')=>new Request('https://example.test/api/ecg-review-attempt',{method:'POST',headers:{authorization:'Bearer test',origin},body:JSON.stringify(body)})
test('API saves approved answer and exact retry returns a single row; changed answer rejected',async()=>{
 assert.equal((await route.POST(request())).status,200);assert.equal(rows.size,1)
 assert.equal((await route.POST(request())).status,200);assert.equal(rows.size,1)
 const changed=structuredClone(payload);changed.submission.answers[0].optionId='af';assert.equal((await route.POST(request(changed))).status,409);assert.equal(rows.size,1)
 const response=await route.GET(new Request('https://example.test',{headers:{authorization:'Bearer test'}}));assert.equal((await response.json()).attempts[0].score,1)
})
test('API blocks wrong artifact, absent identity, cross origin and production without writes',async()=>{
 const count=writes
 assert.equal((await route.POST(request({...payload,reviewedPdfSha256:'f'.repeat(64)}))).status,422)
 assert.equal((await route.POST(request(payload,'https://other.test'))).status,403)
 authenticated=false;assert.equal((await route.POST(request())).status,403);authenticated=true
 process.env.VERCEL_ENV='production';assert.equal((await route.POST(request())).status,403);process.env.VERCEL_ENV='preview'
 assert.equal(writes,count)
})
test.after(()=>{for(const [k,v] of [['NODE_ENV',oldEnv.node],['VERCEL_ENV',oldEnv.vercel],['SUPABASE_SERVICE_ROLE_KEY',oldEnv.key]])if(v===undefined)delete process.env[k];else process.env[k]=v;delete globalThis.__ecgRouteTest})

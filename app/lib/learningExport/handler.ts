import type { SupabaseClient } from '@supabase/supabase-js'
import { buildXapiExport } from './xapi.ts'
export function createLearningExportHandler(factory: (token: string) => SupabaseClient) {
return async function GET(request: Request) {
 const headers={'Cache-Control':'private, no-store','Vary':'Authorization'}
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
 if(!token)return Response.json({error:'Sign in to export your history.'},{status:401,headers})
 const client=factory(token)
 try {
 const {data,error}=await client.auth.getUser(token)
 if(error||!data.user)return Response.json({error:'Sign in to export your history.'},{status:401,headers})
 const owner=data.user.id
 const [echo,ecg]=await Promise.all([
 client.from('echo_competency_events').select('event_id,user_id,case_id,task_id,task_version,skill_id,normalized_score,confidence,response_time_ms,observed_at,created_at',{count:'exact'}).eq('user_id',owner).order('created_at').limit(1000),
 client.from('ecg_competency_attempts').select('event_id,user_id,case_id,decision_id,evidence_digest,decision_receipt,evidence,created_at',{count:'exact'}).eq('user_id',owner).order('created_at').limit(1000)])
 if(echo.error||ecg.error||echo.count===null||ecg.count===null)throw new Error('History unavailable')
 // Never label a server-capped response as a complete export.
 if(echo.count!==echo.data.length||ecg.count!==ecg.data.length)return Response.json({error:'History exceeds the current export limit. No partial file was created.'},{status:413,headers})
 const statements=buildXapiExport(owner,echo.data,ecg.data)
 return Response.json(statements,{headers:{...headers,'Content-Disposition':'attachment; filename="cliniverse-assessments-xapi.json"'}})
 }catch{return Response.json({error:'Export unavailable. Your saved history is unchanged.'},{status:503,headers})}
}

}

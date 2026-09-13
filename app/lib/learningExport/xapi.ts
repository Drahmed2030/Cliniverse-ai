import { createHash } from 'node:crypto'
const HOME = 'https://cliniverseai.com'
const EXT = `${HOME}/xapi/extensions/`
type Row = Record<string, unknown>
function text(value: unknown): string { if (typeof value !== 'string' || !value.trim()) throw new Error('Missing export identity'); return value }
function date(value: unknown) { const s=text(value); if (!Number.isFinite(Date.parse(s))) throw new Error('Invalid export timestamp'); return s }
function number(value: unknown, min: number, max: number) { if (typeof value!=='number'||!Number.isFinite(value)||value<min||value>max) throw new Error('Invalid export score'); return value }
function object(value: unknown): Row { if (!value || typeof value!=='object'||Array.isArray(value)) throw new Error('Invalid export evidence');return value as Row }
// RFC 4122 UUID v5 in the standard URL namespace; stable across retries.
function uuid(name: string) { const b=createHash('sha1').update(Buffer.from('6ba7b8119dad11d180b400c04fd430c8','hex')).update(name).digest().subarray(0,16); b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;const h=b.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}` }
function base(owner: string,row: Row,modality: string,activity: string,version: string) {
 if (row.user_id!==owner) throw new Error('Foreign account export')
 const event=text(row.event_id),caseId=text(row.case_id)
 date(row.created_at)
 return {id:uuid(JSON.stringify([HOME,'assessment-export-v1',owner,modality,event])),actor:{objectType:'Agent',account:{homePage:HOME,name:owner}},verb:{id:'http://adlnet.gov/expapi/verbs/answered',display:{en:'answered'}},object:{objectType:'Activity',id:`${HOME}/xapi/activities/${modality.toLowerCase()}/${encodeURIComponent(caseId)}/${encodeURIComponent(activity)}/versions/${encodeURIComponent(version)}`},context:{extensions:{[`${EXT}mapping-version`]:'1.0.0',[`${EXT}modality`]:modality,[`${EXT}content-version`]:version}}}
}
export function echoStatement(owner: string,row: Row) {
 const score=number(row.normalized_score,0,100),confidence=number(row.confidence,1,5),duration=number(row.response_time_ms,0,Number.MAX_SAFE_INTEGER)
 const statement=base(owner,row,'ECHO',text(row.task_id),text(row.task_version))
 return {...statement,timestamp:date(row.observed_at),result:{score:{scaled:score/100,raw:score,min:0,max:100},duration:`PT${duration/1000}S`,extensions:{[`${EXT}confidence`]:confidence,[`${EXT}confidence-scale`]:'1..5'}},context:{...statement.context,extensions:{...statement.context.extensions,[`${EXT}skill-id`]:text(row.skill_id)}}}
}
export function ecgStatement(owner: string,row: Row) {
 const evidence=object(row.evidence),receipt=object(row.decision_receipt),attempt=object(evidence.attempt),result=object(evidence.result)
 if (receipt.decision!=='LEARNER_ELIGIBLE'||receipt.learnerReady!==true||result.decision!=='SCORED'||attempt.gateState!=='LEARNER_ELIGIBLE'||
 receipt.decisionId!==row.decision_id||receipt.evidenceDigest!==row.evidence_digest||evidence.userId!==owner||attempt.learnerId!==owner||evidence.eventId!==row.event_id||attempt.attemptId!==row.event_id||evidence.caseId!==row.case_id||attempt.caseId!==row.case_id) throw new Error('Unbound ECG assessment')
 for(const key of ['decision_id','evidence_digest']) if(!/^[a-f0-9]{64}$/.test(text(row[key])))throw new Error('Invalid ECG receipt')
 const score=number(result.overallScore,0,1)
 const statement=base(owner,row,'ECG','assessment',text(evidence.scoringVersion))
 // No success/mastery claim: critical misses and thresholds stay in engine evidence.
 return {...statement,timestamp:date(evidence.observedAt),result:{score:{scaled:score,raw:score,min:0,max:1},extensions:{[`${EXT}engine-outcome`]:text(result.outcome),...(result.confidence == null ? {} : {[`${EXT}confidence`]:number(result.confidence,0,1),[`${EXT}confidence-scale`]:'0..1'})}},context:{...statement.context,extensions:{...statement.context.extensions,[`${EXT}decision-id`]:row.decision_id,[`${EXT}evidence-digest`]:row.evidence_digest}}}
}
export function buildXapiExport(owner: string,echo: Row[],ecg: Row[]) {
 text(owner)
 const statements=[...echo.map(r=>echoStatement(owner,r)),...ecg.map(r=>ecgStatement(owner,r))]
 if(new Set(statements.map(s=>s.id)).size!==statements.length)throw new Error('Duplicate export identity')
 return statements.sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp)||a.id.localeCompare(b.id))
}

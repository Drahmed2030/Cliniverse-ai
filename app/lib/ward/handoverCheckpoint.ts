import { advanceHandover, createHandoverSession, type HandoverAction, type HandoverSession } from './handoverSession.ts'
import { HANDOVER_CONTENT_VERSION, HANDOVER_SOURCE_V1 } from './handoverContentV1.ts'
export interface HandoverCheckpoint { user_id: string; session_id: string; checkpoint: number; content_version: string; actions: Array<{action:HandoverAction;at:string}> }
export function restoreHandover(owner: string, row: HandoverCheckpoint): HandoverSession {
  if(row.user_id !== owner || !/^[0-9a-f-]{36}$/i.test(row.session_id) || row.content_version !== HANDOVER_CONTENT_VERSION || !Array.isArray(row.actions) || row.actions.length > 64 || row.actions.length !== row.checkpoint) throw Error('Incompatible checkpoint')
  let state = createHandoverSession(HANDOVER_SOURCE_V1)
  for (const event of row.actions) {
    if(!event || Object.keys(event).sort().join(',') !== 'action,at') throw Error('Invalid checkpoint event')
    state = advanceHandover(state,event.action,event.at)
  }
  return state
}
export function checkpointHandover(owner:string, sessionId:string, session:HandoverSession): HandoverCheckpoint {
  const row={ user_id:owner,session_id:sessionId,checkpoint:session.events.length,content_version:HANDOVER_CONTENT_VERSION,actions:session.events.map(({action,at})=>({action,at})) }
  restoreHandover(owner,row)
  return row
}

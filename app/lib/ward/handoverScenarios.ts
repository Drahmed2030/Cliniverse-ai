import { advanceHandover, createHandoverSession, type HandoverAction, type HandoverSession } from './handoverSession.ts'
import { HANDOVER_SOURCE_V1 } from './handoverContentV1.ts'
export const SCENARIOS = {
  'current-status': { version:'w1-handover-1.0.0', title:'Current observations', question:'No current observations are supplied. How should the handover describe this?', correct:'mark-unknown', incorrect:'assume-stable', correctLabel:'Mark current status as unknown', incorrectLabel:'Assume stable because no alert is shown', feedback:'The supplied snapshot has no current observations. Absence of a new alert does not document stability. Keep this information unknown.', event:'Kept missing current observations explicitly unknown', debrief:'You kept the missing current status explicit.' },
  'pending-items': { version:'w1-pending-1.0.0', title:'Pending work', question:'Post-PCI monitoring is listed as pending. No completion update is supplied. What belongs in the draft?', correct:'retain-pending', incorrect:'assume-done', correctLabel:'Keep monitoring listed as pending', incorrectLabel:'Mark monitoring complete because time has passed', feedback:'Elapsed time is not a completion record. Preserve the pending status from the snapshot; do not invent a completed action.', event:'Preserved the documented pending item', debrief:'You distinguished a pending item from evidence that it was completed.' },
  'receiving-clinician': { version:'w1-recipient-1.0.0', title:'Receiving clinician', question:'The snapshot does not name a receiving clinician or record acknowledgement. Can this draft be labelled received?', correct:'retain-unassigned', incorrect:'assume-received', correctLabel:'Keep recipient and acknowledgement unconfirmed', incorrectLabel:'Mark received because the draft is complete', feedback:'Preparing a draft does not record delivery or acknowledgement. Leave the recipient and receipt unconfirmed.', event:'Kept the receiving clinician and acknowledgement unconfirmed', debrief:'You distinguished preparing a handover from an acknowledged transfer of information.' },
} as const
export type ScenarioId = keyof typeof SCENARIOS
const rotation:ScenarioId[]=['current-status','pending-items','receiving-clinician']
export function scenarioFor(session:HandoverSession) { return SCENARIOS[session.scenario ?? 'current-status'] }
export function nextScenario(session:HandoverSession):ScenarioId { return rotation[(rotation.indexOf(session.scenario ?? 'current-status')+1)%rotation.length] }
export function createPractice(id:ScenarioId):HandoverSession {
  const session=createHandoverSession(HANDOVER_SOURCE_V1)
  return id==='current-status' ? session : {...session,scenario:id}
}
export function practiceForVersion(version:string):HandoverSession {
  const id=rotation.find(id=>SCENARIOS[id].version===version)
  if(!id)throw Error('Unsupported content version')
  return createPractice(id)
}
export function advancePractice(session:HandoverSession,action:HandoverAction,at:string):HandoverSession {
  if(!session.scenario || session.stage!=='gaps')return advanceHandover(session,action,at)
  const scenario=scenarioFor(session)
  if(action!==scenario.correct && action!==scenario.incorrect)throw Error('Action unavailable for this scenario')
  const correct=action===scenario.correct
  // Reuse the existing transition and timestamp validation; branch text is versioned above.
  const advanced=advanceHandover(session,correct?'mark-unknown':'assume-stable',at)
  return {...advanced,feedback:correct?'':scenario.feedback,events:[...session.events,{action,at,label:correct?scenario.event:`Reconsidered an unsupported assumption about ${scenario.title.toLowerCase()}`} ]}
}

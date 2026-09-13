import type { WardPatient } from './types'

export type HandoverStage = 'brief' | 'review' | 'gaps' | 'handover' | 'complete'
export type HandoverAction = 'start' | 'review-record' | 'mark-unknown' | 'assume-stable' | 'complete-handover'
export interface HandoverSession {
  stage: HandoverStage
  patient: WardPatient
  events: Array<{ action: HandoverAction; at: string; label: string }>
  feedback: string
}
export function createHandoverSession(patient: WardPatient): HandoverSession {
  if (patient.id !== 'w1') throw new Error('Unsupported review scenario')
  return { stage: 'brief', patient: structuredClone(patient), events: [], feedback: '' }
}
export function advanceHandover(session: HandoverSession, action: HandoverAction, at: string): HandoverSession {
  if (!Number.isFinite(Date.parse(at))) throw new Error('Invalid event time')
  const previous = session.events.at(-1)
  if (previous && Date.parse(at) < Date.parse(previous.at)) throw new Error('Out-of-order event')
  const transitions: Partial<Record<HandoverStage, { action: HandoverAction; next: HandoverStage; label: string }>> = {
    brief: { action: 'start', next: 'review', label: 'Opened the fictional handover session' },
    review: { action: 'review-record', next: 'gaps', label: 'Reviewed the supplied case snapshot' },
    gaps: { action: 'mark-unknown', next: 'handover', label: 'Kept missing current observations explicitly unknown' },
    handover: { action: 'complete-handover', next: 'complete', label: 'Completed a draft handover for review' },
  }
  if (session.stage === 'gaps' && action === 'assume-stable') {
    return { ...session, events: [...session.events, { action, at, label: 'Considered an unsupported stability assumption' }], feedback: 'The supplied snapshot has no current observations. Absence of a new alert does not document stability. Keep this information unknown.' }
  }
  const transition = transitions[session.stage]
  if (!transition || transition.action !== action) throw new Error('Action unavailable at this stage')
  return { ...session, stage: transition.next, feedback: '', events: [...session.events, { action, at, label: transition.label }] }
}
export function draftHandover(session: HandoverSession) {
  const p = session.patient
  return {
    situation: `${p.name} · ${p.bed ?? 'Bed not supplied'} · ${p.diagnosis}`,
    background: p.timeline.map(event => event.title).join(' → '),
    recorded: p.workup.map(item => `${item.title}: ${item.summary ?? 'No summary supplied'}`).join('; '),
    unknown: 'Current observations, symptoms and the receiving clinician are not supplied in this snapshot.',
    followUp: p.orders.filter(order => order.status === 'pending').map(order => `${order.label}: listed as pending in the source snapshot`).join('; ') || 'No pending items listed in the source snapshot.',
  }
}

import { prepareReview, updatePreparation, type PreparationCheck, type PreparationState } from './reviewPreparation.ts'
export const reviewRequests = [
  { id: 'SIM-ECG-001', modality: 'ECG', purpose: 'Rehearse preparing a tracing for remote review', source: 'Synthetic referral desk', attachment: 'No tracing attached' },
  { id: 'SIM-ECHO-001', modality: 'Echo', purpose: 'Rehearse preparing an ultrasound study for remote review', source: 'Synthetic imaging desk', attachment: 'No study attached' },
] as const
export type ReviewRequestId = typeof reviewRequests[number]['id']
export type ReviewWorklist = Record<ReviewRequestId, PreparationState>
export function createReviewWorklist(): ReviewWorklist {
  return { 'SIM-ECG-001': { checked: [], prepared: false }, 'SIM-ECHO-001': { checked: [], prepared: false } }
}
export function changeRequest(list: ReviewWorklist, id: ReviewRequestId, action: { kind: 'check'; check: PreparationCheck; value: boolean } | { kind: 'prepare' } | { kind: 'reset' }): ReviewWorklist {
  if (!reviewRequests.some(request => request.id === id)) throw Error('Unknown request')
  const next = action.kind === 'check' ? updatePreparation(list[id], action.check, action.value) : action.kind === 'prepare' ? prepareReview(list[id]) : { checked: [], prepared: false }
  return { ...list, [id]: next }
}

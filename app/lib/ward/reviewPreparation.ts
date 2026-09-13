export const preparationChecks = [
  { id: 'source', label: 'Confirm the examination source and timestamp' },
  { id: 'identity', label: 'Confirm the examination belongs to the intended case' },
  { id: 'access', label: 'Confirm the reviewer is authorized to access the examination' },
  { id: 'quality', label: 'Confirm the full examination is available and readable' },
  { id: 'owner', label: 'Identify the responsible reviewer and escalation route' },
] as const
export type PreparationCheck = typeof preparationChecks[number]['id']
export type PreparationState = { checked: PreparationCheck[]; prepared: boolean }
export function updatePreparation(state: PreparationState, id: PreparationCheck, checked: boolean): PreparationState {
  if (!preparationChecks.some(item => item.id === id)) throw Error('Unknown preparation check')
  return { checked: checked ? [...new Set([...state.checked, id])] : state.checked.filter(value => value !== id), prepared: false }
}
export function prepareReview(state: PreparationState): PreparationState {
  if (!preparationChecks.every(item => state.checked.includes(item.id))) throw Error('Preparation incomplete')
  return { checked: [...state.checked], prepared: true }
}

export type CommercialPrimaryTab = 'today' | 'learn' | 'progress' | 'explore' | 'me'

export interface CommercialPrimaryNavigationItemV1 {
  id: CommercialPrimaryTab
  label: string
  role: 'PROMINENT' | 'CORE' | 'SECONDARY' | 'ACCOUNT'
  outcome: string
}

export const COMMERCIAL_PRIMARY_NAVIGATION_V1: readonly CommercialPrimaryNavigationItemV1[] = [
  { id: 'today', label: 'Today', role: 'PROMINENT', outcome: 'Show the next best action, due reviews, and resume state.' },
  { id: 'learn', label: 'Learn', role: 'CORE', outcome: 'Enter governed ECG, Echo, and approved simulation learning.' },
  { id: 'progress', label: 'Progress', role: 'CORE', outcome: 'Review mastery, competency history, and upcoming reviews.' },
  { id: 'explore', label: 'Explore', role: 'SECONDARY', outcome: 'Discover curated learning tools without competing with the core journey.' },
  { id: 'me', label: 'Me', role: 'ACCOUNT', outcome: 'Manage identity, plan, restore purchases, privacy, terms, and support.' },
] as const

export function evaluateCommercialPrimaryNavigationV1(
  items: readonly CommercialPrimaryNavigationItemV1[] = COMMERCIAL_PRIMARY_NAVIGATION_V1,
) {
  const blockers: string[] = []
  const ids = items.map(item => item.id)
  const labels = items.map(item => item.label.trim())

  if (items.length !== 5) blockers.push('exactly-five-primary-tabs-required')
  if (new Set(ids).size !== ids.length) blockers.push('duplicate-primary-tab')
  if (labels.some(label => !label)) blockers.push('navigation-label-required')
  if (items.filter(item => item.role === 'PROMINENT').length !== 1) blockers.push('exactly-one-prominent-tab-required')
  if (items.find(item => item.id === 'today')?.role !== 'PROMINENT') blockers.push('today-must-be-prominent')
  if (!items.some(item => item.id === 'learn')) blockers.push('learn-tab-required')
  if (!items.some(item => item.id === 'progress')) blockers.push('progress-tab-required')
  if (!items.some(item => item.id === 'explore')) blockers.push('explore-tab-required')
  if (!items.some(item => item.id === 'me')) blockers.push('me-tab-required')

  return { decision: blockers.length ? 'HOLD' as const : 'READY' as const, blockers }
}

export function describeCommercialPrimaryNavigationContractV1() {
  return {
    outcomeBasedNavigation: true,
    todayIsDefaultProminentDestination: true,
    intelligenceIsNotPrimaryNavigation: true,
    clinicalIntelligenceRemainsGovernanceGated: true,
    noDeviceSpecificNavigationForks: true,
    supportsCompactAndExpandedPresentation: true,
  } as const
}

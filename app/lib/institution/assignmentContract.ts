import { CONTENT_COLLECTIONS, type ContentCollection } from '../content/contentCollections'

export type AssignmentStatus = 'draft' | 'assigned' | 'completed' | 'archived'

export interface InstitutionAssignment {
  id: string
  organizationId: string
  cohortId: string
  collectionId: string
  title: string
  status: AssignmentStatus
  assignedAt?: string
  dueAt?: string
}

export const INSTITUTIONAL_COLLECTIONS = CONTENT_COLLECTIONS.filter(
  (collection): collection is ContentCollection => collection.audience === 'institution',
)

export function institutionalCollection(id: string) {
  return INSTITUTIONAL_COLLECTIONS.find(collection => collection.id === id) ?? null
}

export function makeInstitutionAssignment(input: Omit<InstitutionAssignment, 'status'> & { status?: AssignmentStatus }): InstitutionAssignment {
  const collection = institutionalCollection(input.collectionId)
  if (!collection) throw new Error('Institutional collection required')
  if (!input.organizationId || !input.cohortId) throw new Error('Organization and cohort are required')
  return {
    ...input,
    status: input.status ?? 'draft',
  }
}

export const RESIDENT_ONBOARDING_TEMPLATE = {
  id: 'resident-onboarding-template',
  collectionId: 'resident-onboarding',
  title: 'Resident Onboarding',
  purpose: 'Reusable cohort assignment for acute-care foundations, code curriculum, bedside decisions and handover practice.',
} as const

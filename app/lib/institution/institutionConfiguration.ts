export type InstitutionAssignmentSource =
  | 'institution-service'
  | 'lms'
  | 'admin-console'

export interface InstitutionConfiguration {
  organizationId: string
  cohortId: string
  assignmentSource: InstitutionAssignmentSource
  collectionId: string
  completionReceipt: 'summary' | 'event'
  branding?: {
    displayName: string
    accentToken?: string
  }
}

export type InstitutionConfigurationStatus =
  | {
      state: 'disabled'
      missing: readonly string[]
      reason: 'configuration-required'
    }
  | {
      state: 'ready'
      missing: readonly []
      organizationId: string
      cohortId: string
      collectionId: string
      assignmentSource: InstitutionAssignmentSource
    }

const REQUIRED_FIELDS = [
  'organizationId',
  'cohortId',
  'assignmentSource',
  'collectionId',
  'completionReceipt',
] as const

function present(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function institutionConfigurationStatus(
  config?: Partial<InstitutionConfiguration> | null,
): InstitutionConfigurationStatus {
  if (!config) {
    return {
      state: 'disabled',
      missing: [...REQUIRED_FIELDS],
      reason: 'configuration-required',
    }
  }

  const missing = REQUIRED_FIELDS.filter(field => !present(config[field]))

  if (missing.length > 0) {
    return {
      state: 'disabled',
      missing,
      reason: 'configuration-required',
    }
  }

  return {
    state: 'ready',
    missing: [],
    organizationId: config.organizationId!.trim(),
    cohortId: config.cohortId!.trim(),
    collectionId: config.collectionId!.trim(),
    assignmentSource: config.assignmentSource!,
  }
}

export const INSTITUTION_MODE_BOUNDARY = Object.freeze({
  defaultState: 'disabled',
  requiresExplicitConfiguration: true,
  storesSharedCredentials: false,
  assumesHospitalConnection: false,
  allowsIndividualModeWithoutInstitution: true,
} as const)

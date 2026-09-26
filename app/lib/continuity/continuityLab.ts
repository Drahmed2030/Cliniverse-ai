export const CONTINUITY_STAGE_ORDER = [
  'observe',
  'interpret',
  'decide',
  'change',
  'reconcile',
  'communicate',
  'close',
  'remember',
] as const

export type ContinuityStage = (typeof CONTINUITY_STAGE_ORDER)[number]

export type ContinuityEvidenceKind =
  | 'ecg'
  | 'echo'
  | 'lab'
  | 'case-context'
  | 'report'
  | 'handover'

export type ContinuityEvidenceAuthority =
  | 'cliniverse-governed'
  | 'health-cloud-context'
  | 'source-system'

export interface ContinuityEvidenceItem {
  id: string
  kind: ContinuityEvidenceKind
  label: string
  authority: ContinuityEvidenceAuthority
  version: string
  learningReady: boolean
  sourceRef?: string
}

export interface ContinuityEvidenceChange {
  beforeEvidenceId: string
  afterEvidenceId: string
  changeKind: 'corrected' | 'new-evidence' | 'conflict' | 'handover-update'
  learnerPrompt: string
}

export interface ContinuityLabCase {
  id: string
  title: string
  stages: readonly ContinuityStage[]
  evidence: readonly ContinuityEvidenceItem[]
  change: ContinuityEvidenceChange
  institutionEligible: boolean
  learnerExposure: 'internal' | 'learner'
}

export interface ContinuityCaseValidation {
  valid: boolean
  issues: string[]
}

function sameStageOrder(stages: readonly ContinuityStage[]): boolean {
  return (
    stages.length === CONTINUITY_STAGE_ORDER.length &&
    stages.every((stage, index) => stage === CONTINUITY_STAGE_ORDER[index])
  )
}

export function validateContinuityLabCase(
  item: ContinuityLabCase,
): ContinuityCaseValidation {
  const issues: string[] = []

  if (!item.id.trim()) issues.push('case-id-required')
  if (!item.title.trim()) issues.push('case-title-required')
  if (!sameStageOrder(item.stages)) issues.push('stage-order-invalid')

  const ids = new Set(item.evidence.map(evidence => evidence.id))
  if (ids.size !== item.evidence.length) issues.push('evidence-id-duplicate')
  if (item.evidence.length < 2) issues.push('evidence-change-requires-two-items')

  if (!ids.has(item.change.beforeEvidenceId)) {
    issues.push('change-before-evidence-missing')
  }
  if (!ids.has(item.change.afterEvidenceId)) {
    issues.push('change-after-evidence-missing')
  }
  if (item.change.beforeEvidenceId === item.change.afterEvidenceId) {
    issues.push('change-must-reference-distinct-evidence')
  }

  if (
    item.learnerExposure === 'learner' &&
    item.evidence.some(evidence => !evidence.learningReady)
  ) {
    issues.push('learner-exposure-requires-learning-ready-evidence')
  }

  if (
    item.learnerExposure === 'learner' &&
    item.evidence.some(
      evidence =>
        evidence.authority !== 'cliniverse-governed' && !evidence.sourceRef?.trim(),
    )
  ) {
    issues.push('external-context-requires-source-reference')
  }

  return { valid: issues.length === 0, issues }
}

export const CONTINUITY_LAB_V1_BOUNDARY = Object.freeze({
  productOwner: 'cliniverse',
  defaultExposure: 'internal',
  learningLoop: CONTINUITY_STAGE_ORDER,
  livePhi: false,
  diagnosticAuthority: false,
  directHospitalConnection: false,
  healthCloudRequiredForLiveInstitutionalDiagnostics: true,
} as const)

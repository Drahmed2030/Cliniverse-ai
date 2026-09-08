import type { UnifiedCompetencyTelemetryEvent } from './unifiedCompetencyTelemetryContract.ts'

export type EcgVerticalSliceStage = 'PREVIEW' | 'GOVERNED_CASE' | 'LEARNER_READY'
export type EcgSourceKind = 'SYNTHETIC' | 'LICENSED_DATASET'
export type EcgContentDecision = 'READY_FOR_GOVERNED_CASE' | 'HOLD' | 'REJECT'

export interface EcgCalibrationSpec {
  paperSpeedMmPerSec: 25 | 50
  gainMmPerMv: 5 | 10 | 20
  leadCount: number
  rhythmStripLead?: string
}

export interface EcgSourceEvidence {
  sourceKind: EcgSourceKind
  sourceId: string
  sourceVersion: string
  provenanceVerified: boolean
  licenseVerified: boolean
  commercialUseAllowed: boolean
  attributionRequired: boolean
  attributionPlanPresent: boolean
  containsPatientIdentifiers: boolean
}

export interface EcgClinicalReview {
  reviewerId?: string
  reviewed: boolean
  approved: boolean
  findingScope: readonly string[]
}

export interface EcgVerticalSliceInput {
  caseId: string
  stage: EcgVerticalSliceStage
  calibration: EcgCalibrationSpec
  source: EcgSourceEvidence
  clinicalReview: EcgClinicalReview
  skillIds: readonly string[]
  telemetry: readonly UnifiedCompetencyTelemetryEvent[]
}

export interface EcgVerticalSliceResult {
  decision: EcgContentDecision
  learnerReady: false
  blockers: readonly string[]
  telemetryBound: boolean
}

const REQUIRED_12_LEAD_COUNT = 12

export function evaluateEcgVerticalSlice(input: EcgVerticalSliceInput): EcgVerticalSliceResult {
  const blockers: string[] = []

  if (!input.caseId.trim()) blockers.push('case-id-required')
  if (input.calibration.leadCount !== REQUIRED_12_LEAD_COUNT) blockers.push('twelve-lead-ecg-required')
  if (![25, 50].includes(input.calibration.paperSpeedMmPerSec)) blockers.push('unsupported-paper-speed')
  if (![5, 10, 20].includes(input.calibration.gainMmPerMv)) blockers.push('unsupported-gain')
  if (!input.skillIds.length) blockers.push('skill-binding-required')

  if (!input.source.provenanceVerified) blockers.push('source-provenance-unverified')
  if (!input.source.licenseVerified) blockers.push('source-license-unverified')
  if (!input.source.commercialUseAllowed) blockers.push('commercial-use-not-allowed')
  if (input.source.attributionRequired && !input.source.attributionPlanPresent) blockers.push('attribution-plan-missing')
  if (input.source.containsPatientIdentifiers) blockers.push('patient-identifiers-present')

  if (input.source.sourceKind === 'SYNTHETIC' && input.stage !== 'PREVIEW') {
    blockers.push('synthetic-source-preview-only')
  }

  if (input.stage !== 'PREVIEW') {
    if (!input.clinicalReview.reviewed) blockers.push('human-clinical-review-required')
    if (input.clinicalReview.reviewed && !input.clinicalReview.approved) blockers.push('clinical-review-rejected')
    if (!input.clinicalReview.reviewerId?.trim()) blockers.push('clinical-reviewer-id-required')
  }

  const telemetryBound = input.telemetry.some(event =>
    event.modality === 'ECG' && event.caseId === input.caseId,
  )
  if (input.stage !== 'PREVIEW' && !telemetryBound) blockers.push('ecg-telemetry-binding-required')

  const reject = blockers.some(blocker =>
    blocker === 'commercial-use-not-allowed'
    || blocker === 'patient-identifiers-present'
    || blocker === 'clinical-review-rejected',
  )

  return {
    decision: reject ? 'REJECT' : blockers.length ? 'HOLD' : 'READY_FOR_GOVERNED_CASE',
    learnerReady: false,
    blockers,
    telemetryBound,
  }
}

export function describeEcgVerticalSliceBoundary() {
  return {
    syntheticPreviewAllowed: true,
    syntheticLearnerPromotionAllowed: false,
    licensedDatasetRequiredForGovernedCase: true,
    twelveLeadRequired: true,
    calibrationRequired: true,
    clinicalReviewRequiredBeyondPreview: true,
    telemetryRequiredBeyondPreview: true,
    learnerAutoPromotionAllowed: false,
  } as const
}

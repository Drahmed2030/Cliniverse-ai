export type ClinicalMediaModality = 'ECHO' | 'ECG' | 'XRAY' | 'CT' | 'ANGIO'

export type GovernanceState =
  | 'QUARANTINED'
  | 'TECHNICALLY_VERIFIED'
  | 'PRIVACY_CLEARED'
  | 'CLINICALLY_REVIEWED'
  | 'DEVICE_BASELINE_COVERED'
  | 'LEARNER_ELIGIBLE'
  | 'HOLD'
  | 'REJECTED'

export interface ClinicalMediaAssetGovernanceInput {
  assetId: string
  modality: ClinicalMediaModality
  sourceSha256: string
  derivativeSha256: string
  sourceRightsVerified: boolean
  commercialUsePermitted: boolean
  attributionPlanVerified: boolean
  decodeVerified: boolean
  timingIntegrityVerified: boolean
  geometryVerified: boolean
  audioPolicyVerified: boolean
  metadataPolicyVerified: boolean
  privacyCleared: boolean
  clinicalReviewed: boolean
  deviceBaselineCovered: boolean
  rendererContractVersion: string
  encodingRecipeVersion: string
  holdReasons?: readonly string[]
  rejectReasons?: readonly string[]
}

export interface ClinicalMediaGovernanceResult {
  assetId: string
  state: GovernanceState
  learnerEligible: boolean
  blockers: readonly string[]
}

function requireSha256(value: string, field: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error(`${field} must be a SHA256 hex digest`)
}

export function evaluateClinicalMediaGovernance(
  input: ClinicalMediaAssetGovernanceInput,
): ClinicalMediaGovernanceResult {
  requireSha256(input.sourceSha256, 'sourceSha256')
  requireSha256(input.derivativeSha256, 'derivativeSha256')

  if (input.rejectReasons?.length) {
    return { assetId: input.assetId, state: 'REJECTED', learnerEligible: false, blockers: [...input.rejectReasons] }
  }

  if (input.holdReasons?.length) {
    return { assetId: input.assetId, state: 'HOLD', learnerEligible: false, blockers: [...input.holdReasons] }
  }

  const blockers: string[] = []

  if (!input.sourceRightsVerified) blockers.push('source-rights-not-verified')
  if (!input.commercialUsePermitted) blockers.push('commercial-use-not-permitted')
  if (!input.attributionPlanVerified) blockers.push('attribution-plan-not-verified')

  if (blockers.length) {
    return { assetId: input.assetId, state: 'QUARANTINED', learnerEligible: false, blockers }
  }

  if (!input.decodeVerified) blockers.push('decode-not-verified')
  if (!input.timingIntegrityVerified) blockers.push('timing-integrity-not-verified')
  if (!input.geometryVerified) blockers.push('geometry-not-verified')
  if (!input.audioPolicyVerified) blockers.push('audio-policy-not-verified')
  if (!input.metadataPolicyVerified) blockers.push('metadata-policy-not-verified')

  if (blockers.length) {
    return { assetId: input.assetId, state: 'QUARANTINED', learnerEligible: false, blockers }
  }

  if (!input.privacyCleared) {
    return { assetId: input.assetId, state: 'TECHNICALLY_VERIFIED', learnerEligible: false, blockers: ['privacy-review-pending'] }
  }

  if (!input.clinicalReviewed) {
    return { assetId: input.assetId, state: 'PRIVACY_CLEARED', learnerEligible: false, blockers: ['clinical-review-pending'] }
  }

  if (!input.deviceBaselineCovered) {
    return { assetId: input.assetId, state: 'CLINICALLY_REVIEWED', learnerEligible: false, blockers: ['device-baseline-pending'] }
  }

  return { assetId: input.assetId, state: 'DEVICE_BASELINE_COVERED', learnerEligible: false, blockers: ['promotion-decision-pending'] }
}

export interface BatchSamplingPolicy {
  batchSize: number
  minimumClinicalSample: number
  minimumDeviceSample: number
  expandOnFailure: boolean
}

export function defaultBatchSamplingPolicy(batchSize: number): BatchSamplingPolicy {
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new Error('batchSize must be a positive integer')
  const minimumClinicalSample = Math.min(batchSize, Math.max(6, Math.ceil(batchSize * 0.15)))
  const minimumDeviceSample = Math.min(batchSize, Math.max(3, Math.ceil(batchSize * 0.05)))
  return { batchSize, minimumClinicalSample, minimumDeviceSample, expandOnFailure: true }
}

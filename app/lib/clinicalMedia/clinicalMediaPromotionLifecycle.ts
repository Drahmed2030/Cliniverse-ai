import type { GovernanceState } from './clinicalMediaGovernancePipeline'
import type { AssetStorageClass, ClinicalMediaRegistryRecord } from './clinicalMediaStorageRegistryBoundary'

export type PromotionLifecycleDecision = 'PROMOTE' | 'HOLD' | 'REJECT' | 'NOOP'
export type RetirementReason =
  | 'SUPERSEDED'
  | 'RIGHTS_WITHDRAWN'
  | 'PRIVACY_RECALL'
  | 'CLINICAL_QUALITY_RECALL'
  | 'TECHNICAL_REGRESSION'
  | 'POLICY_CHANGE'
  | 'OTHER'

export interface PromotionLifecycleInput {
  record: ClinicalMediaRegistryRecord
  promotionDecisionRecorded: boolean
  promotionDecisionRecordId?: string
  technicalGatePassed: boolean
  privacyAttestationPassed: boolean
  clinicalAttestationPassed: boolean
  deviceBaselineCovered: boolean
  rightsStillValid: boolean
  provenanceStillValid: boolean
}

export interface PromotionLifecycleResult {
  assetId: string
  decision: PromotionLifecycleDecision
  targetGovernanceState: GovernanceState
  targetStorageClass: AssetStorageClass
  learnerEligible: boolean
  blockers: readonly string[]
}

function requireText(value: string | undefined, field: string): void {
  if (!value?.trim()) throw new Error(`${field} is required`)
}

export function evaluatePromotionLifecycle(input: PromotionLifecycleInput): PromotionLifecycleResult {
  const { record } = input
  const blockers: string[] = []

  if (record.retiredAt) blockers.push('asset-retired')
  if (!input.rightsStillValid) blockers.push('rights-no-longer-valid')
  if (!input.provenanceStillValid) blockers.push('provenance-no-longer-valid')
  if (record.governanceState === 'REJECTED') blockers.push('governance-rejected')
  if (record.governanceState === 'HOLD') blockers.push('governance-hold')

  if (blockers.includes('governance-rejected') || blockers.includes('rights-no-longer-valid') || blockers.includes('provenance-no-longer-valid')) {
    return {
      assetId: record.assetId,
      decision: 'REJECT',
      targetGovernanceState: 'REJECTED',
      targetStorageClass: 'ARCHIVE',
      learnerEligible: false,
      blockers,
    }
  }

  if (blockers.length) {
    return {
      assetId: record.assetId,
      decision: 'HOLD',
      targetGovernanceState: 'HOLD',
      targetStorageClass: record.storage.storageClass,
      learnerEligible: false,
      blockers,
    }
  }

  if (!input.technicalGatePassed) blockers.push('technical-gate-not-passed')
  if (!input.privacyAttestationPassed) blockers.push('privacy-attestation-not-passed')
  if (!input.clinicalAttestationPassed) blockers.push('clinical-attestation-not-passed')
  if (!input.deviceBaselineCovered) blockers.push('device-baseline-not-covered')
  if (!input.promotionDecisionRecorded) blockers.push('promotion-decision-not-recorded')
  if (input.promotionDecisionRecorded) requireText(input.promotionDecisionRecordId, 'promotionDecisionRecordId')

  if (blockers.length) {
    return {
      assetId: record.assetId,
      decision: 'HOLD',
      targetGovernanceState: 'DEVICE_BASELINE_COVERED',
      targetStorageClass: 'GOVERNED',
      learnerEligible: false,
      blockers,
    }
  }

  if (record.governanceState === 'LEARNER_ELIGIBLE' && record.storage.storageClass === 'LEARNER_DISTRIBUTION') {
    return {
      assetId: record.assetId,
      decision: 'NOOP',
      targetGovernanceState: 'LEARNER_ELIGIBLE',
      targetStorageClass: 'LEARNER_DISTRIBUTION',
      learnerEligible: true,
      blockers: [],
    }
  }

  return {
    assetId: record.assetId,
    decision: 'PROMOTE',
    targetGovernanceState: 'LEARNER_ELIGIBLE',
    targetStorageClass: 'LEARNER_DISTRIBUTION',
    learnerEligible: true,
    blockers: [],
  }
}

export interface AssetRetirementRecord {
  assetId: string
  derivativeSha256: string
  retiredAt: string
  reason: RetirementReason
  reasonDetail?: string
  replacementAssetId?: string
  reviewerOrAuthority: string
}

export function validateRetirementRecord(record: AssetRetirementRecord): void {
  requireText(record.assetId, 'assetId')
  requireText(record.retiredAt, 'retiredAt')
  requireText(record.reviewerOrAuthority, 'reviewerOrAuthority')
  if (!/^[a-f0-9]{64}$/i.test(record.derivativeSha256)) throw new Error('derivativeSha256 must be a SHA256 hex digest')
  if (record.reason === 'SUPERSEDED') requireText(record.replacementAssetId, 'replacementAssetId')
  if (record.replacementAssetId === record.assetId) throw new Error('replacementAssetId must differ from retired assetId')
}

export interface ImmutableSupersessionInput {
  previous: ClinicalMediaRegistryRecord
  next: ClinicalMediaRegistryRecord
  reason: string
}

export function validateImmutableSupersession(input: ImmutableSupersessionInput): void {
  requireText(input.reason, 'reason')
  if (input.previous.assetId === input.next.assetId) throw new Error('supersession requires a new assetId')
  if (input.previous.derivativeSha256.toLowerCase() === input.next.derivativeSha256.toLowerCase()) {
    throw new Error('supersession requires a new derivative checksum')
  }
  if (input.next.supersedesAssetId !== input.previous.assetId) {
    throw new Error('next asset must explicitly reference superseded assetId')
  }
  if (input.previous.modality !== input.next.modality) throw new Error('superseding asset must preserve modality')
}

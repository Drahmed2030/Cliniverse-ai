import type { ClinicalMediaModality } from './clinicalMediaGovernancePipeline'

export type PrivacyRiskTier = 'LOW' | 'MODERATE' | 'HIGH'
export type PrivacyGovernanceDecision = 'AUTO_CLEAR_CANDIDATE' | 'HUMAN_ATTESTATION_REQUIRED' | 'REJECT'

export interface PrivacyGovernanceEvidenceV2 {
  assetId: string
  modality: ClinicalMediaModality
  derivativeSha256: string
  structuredIdentifierScanPassed: boolean
  burnedInIdentifierScanPassed: boolean
  disallowedDateTimeScanPassed: boolean
  metadataScanPassed: boolean
  provenanceComplete: boolean
  attributionPlanComplete: boolean
  dicomConfidentialityProfileApplied?: boolean
  patientIdentityRemovedFlagPresent?: boolean
  deidentificationMethodRecorded?: boolean
  residualAnnotationsPresent: boolean
  scanConfidence: number
  reidentificationRiskAssessed: boolean
  intendedUse: 'TEACHING' | 'RESEARCH' | 'INTERNAL_QA' | 'OTHER'
  humanReviewerRecordId?: string
  humanAttestationPassed?: boolean
}

export interface PrivacyGovernanceResultV2 {
  assetId: string
  decision: PrivacyGovernanceDecision
  riskTier: PrivacyRiskTier
  privacyCleared: boolean
  humanAttestationRequired: boolean
  blockers: readonly string[]
  warnings: readonly string[]
}

function requireSha256(value: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('derivativeSha256 must be a SHA256 hex digest')
}

export function evaluatePrivacyGovernanceV2(input: PrivacyGovernanceEvidenceV2): PrivacyGovernanceResultV2 {
  requireSha256(input.derivativeSha256)
  if (input.scanConfidence < 0 || input.scanConfidence > 1) throw new Error('scanConfidence must be between 0 and 1')

  const blockers: string[] = []
  const warnings: string[] = []

  if (!input.structuredIdentifierScanPassed) blockers.push('structured-identifiers-detected-or-unverified')
  if (!input.burnedInIdentifierScanPassed) blockers.push('burned-in-identifiers-detected-or-unverified')
  if (!input.disallowedDateTimeScanPassed) blockers.push('disallowed-date-time-detected-or-unverified')
  if (!input.metadataScanPassed) blockers.push('metadata-privacy-scan-failed')
  if (!input.provenanceComplete) blockers.push('provenance-incomplete')
  if (!input.attributionPlanComplete) blockers.push('attribution-plan-incomplete')
  if (!input.reidentificationRiskAssessed) blockers.push('reidentification-risk-not-assessed')

  if (input.modality === 'CT' || input.modality === 'XRAY') {
    if (input.dicomConfidentialityProfileApplied !== true) blockers.push('dicom-confidentiality-profile-not-applied')
    if (input.patientIdentityRemovedFlagPresent !== true) blockers.push('dicom-patient-identity-removed-flag-missing')
    if (input.deidentificationMethodRecorded !== true) blockers.push('dicom-deidentification-method-not-recorded')
  }

  if (blockers.length) {
    return {
      assetId: input.assetId,
      decision: 'REJECT',
      riskTier: 'HIGH',
      privacyCleared: false,
      humanAttestationRequired: true,
      blockers,
      warnings,
    }
  }

  let riskTier: PrivacyRiskTier = 'LOW'
  if (input.residualAnnotationsPresent || input.scanConfidence < 0.98) riskTier = 'MODERATE'
  if (input.intendedUse === 'OTHER') riskTier = 'MODERATE'

  if (input.residualAnnotationsPresent) warnings.push('residual-annotations-require-human-review')
  if (input.scanConfidence < 0.98) warnings.push('scan-confidence-below-auto-clear-threshold')

  const humanAttestationRequired = true
  const humanPass = input.humanAttestationPassed === true && Boolean(input.humanReviewerRecordId)

  if (humanPass) {
    return {
      assetId: input.assetId,
      decision: 'AUTO_CLEAR_CANDIDATE',
      riskTier,
      privacyCleared: true,
      humanAttestationRequired,
      blockers: [],
      warnings,
    }
  }

  return {
    assetId: input.assetId,
    decision: 'HUMAN_ATTESTATION_REQUIRED',
    riskTier,
    privacyCleared: false,
    humanAttestationRequired,
    blockers: ['named-human-privacy-attestation-pending'],
    warnings,
  }
}

export interface PrivacyBatchSamplingPolicyV2 {
  totalAssets: number
  humanReviewMinimum: number
  fullReviewRequired: boolean
}

export function privacyBatchSamplingPolicyV2(totalAssets: number, highRiskAssets: number): PrivacyBatchSamplingPolicyV2 {
  if (!Number.isInteger(totalAssets) || totalAssets <= 0) throw new Error('totalAssets must be a positive integer')
  if (!Number.isInteger(highRiskAssets) || highRiskAssets < 0 || highRiskAssets > totalAssets) throw new Error('highRiskAssets invalid')
  const humanReviewMinimum = highRiskAssets > 0 ? totalAssets : Math.min(totalAssets, Math.max(3, Math.ceil(totalAssets * 0.1)))
  return { totalAssets, humanReviewMinimum, fullReviewRequired: highRiskAssets > 0 }
}

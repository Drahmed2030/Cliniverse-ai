import type { ClinicalMediaModality } from './clinicalMediaGovernancePipeline'

export type PrivacyEscalationDecision = 'CLEAR_CANDIDATE' | 'HUMAN_REVIEW' | 'REJECT'

export interface ClinicalMediaPrivacyScanEvidence {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  scanTool: string
  scanToolVersion: string
  scannedAt: string
  metadataIdentifiersDetected: boolean | null
  burnedInIdentifiersDetected: boolean | null
  disallowedDateTimeDetected: boolean | null
  dicomDirectIdentifierTagsDetected?: boolean | null
  residualAnnotationsPresent: boolean | null
  attributionTextPresent: boolean | null
  provenanceRecordPresent: boolean
  scanComplete: boolean
  scanConfidence?: number | null
}

export interface ClinicalMediaPrivacyEscalationResult {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  decision: PrivacyEscalationDecision
  privacyCleared: false
  humanAttestationRequired: true
  blockers: readonly string[]
  reviewReasons: readonly string[]
}

function requireSha256(value: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('artifactSha256 must be a SHA256 hex digest')
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`)
}

export function evaluateClinicalMediaPrivacyEscalation(
  evidence: ClinicalMediaPrivacyScanEvidence,
): ClinicalMediaPrivacyEscalationResult {
  requireText(evidence.assetId, 'assetId')
  requireSha256(evidence.artifactSha256)
  requireText(evidence.scanTool, 'scanTool')
  requireText(evidence.scanToolVersion, 'scanToolVersion')
  requireText(evidence.scannedAt, 'scannedAt')

  const blockers: string[] = []
  const reviewReasons: string[] = []

  if (!evidence.scanComplete) blockers.push('privacy-scan-incomplete')
  if (!evidence.provenanceRecordPresent) blockers.push('provenance-record-missing')

  if (evidence.metadataIdentifiersDetected === true) blockers.push('metadata-identifiers-detected')
  if (evidence.burnedInIdentifiersDetected === true) blockers.push('burned-in-identifiers-detected')
  if (evidence.disallowedDateTimeDetected === true) blockers.push('disallowed-date-time-detected')
  if (evidence.dicomDirectIdentifierTagsDetected === true) blockers.push('dicom-direct-identifier-tags-detected')

  if (evidence.metadataIdentifiersDetected == null) reviewReasons.push('metadata-identifier-status-unknown')
  if (evidence.burnedInIdentifiersDetected == null) reviewReasons.push('burned-in-identifier-status-unknown')
  if (evidence.disallowedDateTimeDetected == null) reviewReasons.push('date-time-status-unknown')
  if (evidence.modality === 'CT' && evidence.dicomDirectIdentifierTagsDetected == null) {
    reviewReasons.push('dicom-identifier-tag-status-unknown')
  }

  if (evidence.residualAnnotationsPresent === true) reviewReasons.push('residual-annotations-require-human-acceptance')
  if (evidence.residualAnnotationsPresent == null) reviewReasons.push('residual-annotation-status-unknown')
  if (evidence.attributionTextPresent === false) reviewReasons.push('attribution-text-not-observed')
  if (evidence.attributionTextPresent == null) reviewReasons.push('attribution-text-status-unknown')

  if (evidence.scanConfidence != null) {
    if (!Number.isFinite(evidence.scanConfidence) || evidence.scanConfidence < 0 || evidence.scanConfidence > 1) {
      throw new Error('scanConfidence must be between 0 and 1')
    }
    if (evidence.scanConfidence < 0.95) reviewReasons.push('privacy-scan-confidence-below-threshold')
  } else {
    reviewReasons.push('privacy-scan-confidence-not-recorded')
  }

  const decision: PrivacyEscalationDecision = blockers.length
    ? 'REJECT'
    : reviewReasons.length
      ? 'HUMAN_REVIEW'
      : 'CLEAR_CANDIDATE'

  return {
    assetId: evidence.assetId,
    modality: evidence.modality,
    artifactSha256: evidence.artifactSha256,
    decision,
    privacyCleared: false,
    humanAttestationRequired: true,
    blockers,
    reviewReasons,
  }
}

export interface PrivacyEscalationBatchSummary {
  total: number
  clearCandidates: number
  humanReview: number
  rejected: number
  humanAttestationRequired: true
  escalationRequired: boolean
}

export function summarizePrivacyEscalationBatch(
  results: readonly ClinicalMediaPrivacyEscalationResult[],
): PrivacyEscalationBatchSummary {
  if (!results.length) throw new Error('At least one privacy result is required')
  const clearCandidates = results.filter(result => result.decision === 'CLEAR_CANDIDATE').length
  const humanReview = results.filter(result => result.decision === 'HUMAN_REVIEW').length
  const rejected = results.filter(result => result.decision === 'REJECT').length

  return {
    total: results.length,
    clearCandidates,
    humanReview,
    rejected,
    humanAttestationRequired: true,
    escalationRequired: humanReview > 0 || rejected > 0,
  }
}

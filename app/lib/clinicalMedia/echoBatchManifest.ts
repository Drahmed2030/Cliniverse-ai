import type { LicensedEchoClinicalStudioAsset } from './licensedEchoAsset.ts'
import { evaluateEchoQuality } from './echoQualityGate.ts'

export type EchoBatchQaState = 'source-verified' | 'media-verified' | 'clinical-review-required' | 'learner-ready' | 'blocked'

export interface EchoBatchRecord {
  batchId: 'echo-batch-01'
  caseId: string
  assetId: string
  modality: 'echo'
  view: string
  diagnosisLabel: string
  sourcePageUrl: string
  licenseId: string
  provenanceFingerprint: string
  qaState: EchoBatchQaState
  qualityScore: number
  blockingIssues: string[]
}

function fingerprint(asset: LicensedEchoClinicalStudioAsset): string {
  return `${asset.rights.originalSha1}:${asset.rights.derivativeSha256}`
}

export function toEchoBatchRecord(
  asset: LicensedEchoClinicalStudioAsset,
  diagnosisLabel = asset.cine.sourceLabel,
): EchoBatchRecord {
  const quality = evaluateEchoQuality(asset)
  const qaState: EchoBatchQaState =
    quality.releaseState === 'blocked'
      ? 'blocked'
      : quality.releaseState === 'learner-ready'
        ? 'learner-ready'
        : asset.reviewStatus === 'source-rights-reviewed-clinical-copy-review-required'
          ? 'clinical-review-required'
          : 'media-verified'

  return {
    batchId: 'echo-batch-01',
    caseId: asset.assetId,
    assetId: asset.assetId,
    modality: 'echo',
    view: asset.cine.view,
    diagnosisLabel,
    sourcePageUrl: asset.rights.sourcePageUrl,
    licenseId: asset.rights.licenseId,
    provenanceFingerprint: fingerprint(asset),
    qaState,
    qualityScore: quality.score,
    blockingIssues: quality.blockingIssues,
  }
}

export function validateEchoBatch(records: readonly EchoBatchRecord[]): void {
  const caseIds = new Set<string>()
  const assetIds = new Set<string>()
  const fingerprints = new Set<string>()

  for (const record of records) {
    if (record.batchId !== 'echo-batch-01' || record.modality !== 'echo') {
      throw new Error(`Invalid Echo Batch 01 record: ${record.caseId}`)
    }
    if (!record.caseId || !record.assetId || !record.sourcePageUrl || !record.licenseId) {
      throw new Error(`Echo batch records must preserve identity, source and license: ${record.caseId}`)
    }
    if (caseIds.has(record.caseId)) throw new Error(`Duplicate Echo caseId: ${record.caseId}`)
    if (assetIds.has(record.assetId)) throw new Error(`Duplicate Echo assetId: ${record.assetId}`)
    if (fingerprints.has(record.provenanceFingerprint)) {
      throw new Error(`Duplicate Echo provenance fingerprint: ${record.provenanceFingerprint}`)
    }

    caseIds.add(record.caseId)
    assetIds.add(record.assetId)
    fingerprints.add(record.provenanceFingerprint)
  }
}

export function summarizeEchoBatch(records: readonly EchoBatchRecord[]) {
  validateEchoBatch(records)

  return {
    batchId: 'echo-batch-01' as const,
    total: records.length,
    learnerReady: records.filter(record => record.qaState === 'learner-ready').length,
    clinicalReviewRequired: records.filter(record => record.qaState === 'clinical-review-required').length,
    blocked: records.filter(record => record.qaState === 'blocked').length,
    averageQualityScore: records.length
      ? Math.round(records.reduce((sum, record) => sum + record.qualityScore, 0) / records.length)
      : 0,
  }
}

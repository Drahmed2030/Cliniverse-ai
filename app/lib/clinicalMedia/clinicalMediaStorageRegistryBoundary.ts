import type { ClinicalMediaModality, GovernanceState } from './clinicalMediaGovernancePipeline'

export type StorageProviderKind = 'OBJECT_STORAGE' | 'DICOM_STORE' | 'EXTERNAL_MANAGED_STORE'
export type AssetStorageClass = 'QUARANTINE' | 'GOVERNED' | 'LEARNER_DISTRIBUTION' | 'ARCHIVE'

export interface ClinicalMediaStorageLocator {
  providerKind: StorageProviderKind
  storageClass: AssetStorageClass
  bucketOrStore: string
  objectKeyOrInstanceRef: string
  region?: string
  versionId?: string
  etag?: string
}

export interface ClinicalMediaRegistryRecord {
  assetId: string
  modality: ClinicalMediaModality
  sourceSha256: string
  derivativeSha256: string
  governanceState: GovernanceState
  rendererContractVersion: string
  encodingRecipeVersion: string
  provenanceRecordId: string
  licenseRecordId: string
  privacyReviewRecordId?: string
  clinicalReviewRecordId?: string
  deviceBaselineRecordId?: string
  storage: ClinicalMediaStorageLocator
  createdAt: string
  updatedAt: string
  retiredAt?: string
  supersedesAssetId?: string
}

export interface StoragePromotionDecision {
  allowed: boolean
  targetStorageClass: AssetStorageClass
  blockers: readonly string[]
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`)
}

function requireSha256(value: string, field: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error(`${field} must be a SHA256 hex digest`)
}

export function validateRegistryRecord(record: ClinicalMediaRegistryRecord): void {
  requireText(record.assetId, 'assetId')
  requireSha256(record.sourceSha256, 'sourceSha256')
  requireSha256(record.derivativeSha256, 'derivativeSha256')
  requireText(record.rendererContractVersion, 'rendererContractVersion')
  requireText(record.encodingRecipeVersion, 'encodingRecipeVersion')
  requireText(record.provenanceRecordId, 'provenanceRecordId')
  requireText(record.licenseRecordId, 'licenseRecordId')
  requireText(record.storage.bucketOrStore, 'storage.bucketOrStore')
  requireText(record.storage.objectKeyOrInstanceRef, 'storage.objectKeyOrInstanceRef')

  if (record.governanceState === 'PRIVACY_CLEARED' && !record.privacyReviewRecordId) {
    throw new Error('privacyReviewRecordId is required once privacy is cleared')
  }
  if (['CLINICALLY_REVIEWED', 'DEVICE_BASELINE_COVERED', 'LEARNER_ELIGIBLE'].includes(record.governanceState) && !record.clinicalReviewRecordId) {
    throw new Error('clinicalReviewRecordId is required once clinical review is claimed')
  }
  if (['DEVICE_BASELINE_COVERED', 'LEARNER_ELIGIBLE'].includes(record.governanceState) && !record.deviceBaselineRecordId) {
    throw new Error('deviceBaselineRecordId is required once device baseline coverage is claimed')
  }
}

export function evaluateStoragePromotion(record: ClinicalMediaRegistryRecord): StoragePromotionDecision {
  validateRegistryRecord(record)
  const blockers: string[] = []

  if (record.retiredAt) blockers.push('asset-retired')
  if (record.governanceState === 'HOLD') blockers.push('governance-hold')
  if (record.governanceState === 'REJECTED') blockers.push('governance-rejected')

  if (record.storage.storageClass === 'QUARANTINE') {
    if (record.governanceState === 'QUARANTINED') {
      return { allowed: true, targetStorageClass: 'QUARANTINE', blockers: [] }
    }
    if (['TECHNICALLY_VERIFIED', 'PRIVACY_CLEARED', 'CLINICALLY_REVIEWED', 'DEVICE_BASELINE_COVERED', 'LEARNER_ELIGIBLE'].includes(record.governanceState)) {
      return { allowed: blockers.length === 0, targetStorageClass: 'GOVERNED', blockers }
    }
  }

  if (record.governanceState === 'LEARNER_ELIGIBLE') {
    if (!record.privacyReviewRecordId) blockers.push('privacy-review-record-missing')
    if (!record.clinicalReviewRecordId) blockers.push('clinical-review-record-missing')
    if (!record.deviceBaselineRecordId) blockers.push('device-baseline-record-missing')
    return { allowed: blockers.length === 0, targetStorageClass: 'LEARNER_DISTRIBUTION', blockers }
  }

  return { allowed: blockers.length === 0, targetStorageClass: record.storage.storageClass, blockers }
}

export interface ImmutableAssetVersionLink {
  previousAssetId: string
  nextAssetId: string
  previousDerivativeSha256: string
  nextDerivativeSha256: string
  reason: string
}

export function validateImmutableAssetVersionLink(link: ImmutableAssetVersionLink): void {
  requireText(link.previousAssetId, 'previousAssetId')
  requireText(link.nextAssetId, 'nextAssetId')
  requireSha256(link.previousDerivativeSha256, 'previousDerivativeSha256')
  requireSha256(link.nextDerivativeSha256, 'nextDerivativeSha256')
  requireText(link.reason, 'reason')
  if (link.previousAssetId === link.nextAssetId) throw new Error('asset versions must use distinct assetIds')
  if (link.previousDerivativeSha256.toLowerCase() === link.nextDerivativeSha256.toLowerCase()) {
    throw new Error('new asset version must not silently reuse an identical derivative checksum')
  }
}

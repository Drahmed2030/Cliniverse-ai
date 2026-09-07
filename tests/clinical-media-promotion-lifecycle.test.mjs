import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluatePromotionLifecycle,
  validateImmutableSupersession,
  validateRetirementRecord,
} from '../app/lib/clinicalMedia/clinicalMediaPromotionLifecycle.ts'

const shaA = 'a'.repeat(64)
const shaB = 'b'.repeat(64)

function record(overrides = {}) {
  return {
    assetId: 'echo-a-v1',
    modality: 'ECHO',
    sourceSha256: shaA,
    derivativeSha256: shaB,
    governanceState: 'DEVICE_BASELINE_COVERED',
    rendererContractVersion: '1.0.0',
    encodingRecipeVersion: 'h264-mp4-v1',
    provenanceRecordId: 'prov-1',
    licenseRecordId: 'lic-1',
    privacyReviewRecordId: 'privacy-1',
    clinicalReviewRecordId: 'clinical-1',
    deviceBaselineRecordId: 'device-1',
    storage: {
      providerKind: 'OBJECT_STORAGE',
      storageClass: 'GOVERNED',
      bucketOrStore: 'clinical-media',
      objectKeyOrInstanceRef: 'echo/a-v1.mp4',
    },
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
    ...overrides,
  }
}

function lifecycle(overrides = {}) {
  return {
    record: record(),
    promotionDecisionRecorded: true,
    promotionDecisionRecordId: 'promotion-1',
    technicalGatePassed: true,
    privacyAttestationPassed: true,
    clinicalAttestationPassed: true,
    deviceBaselineCovered: true,
    rightsStillValid: true,
    provenanceStillValid: true,
    ...overrides,
  }
}

test('fully governed asset can be promoted to learner distribution', () => {
  const result = evaluatePromotionLifecycle(lifecycle())
  assert.equal(result.decision, 'PROMOTE')
  assert.equal(result.targetGovernanceState, 'LEARNER_ELIGIBLE')
  assert.equal(result.targetStorageClass, 'LEARNER_DISTRIBUTION')
  assert.equal(result.learnerEligible, true)
})

test('missing human privacy attestation holds fail closed', () => {
  const result = evaluatePromotionLifecycle(lifecycle({ privacyAttestationPassed: false }))
  assert.equal(result.decision, 'HOLD')
  assert.equal(result.learnerEligible, false)
  assert.ok(result.blockers.includes('privacy-attestation-not-passed'))
})

test('missing promotion decision record holds fail closed', () => {
  const result = evaluatePromotionLifecycle(lifecycle({ promotionDecisionRecorded: false, promotionDecisionRecordId: undefined }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('promotion-decision-not-recorded'))
})

test('rights or provenance withdrawal rejects and archives', () => {
  const rights = evaluatePromotionLifecycle(lifecycle({ rightsStillValid: false }))
  const provenance = evaluatePromotionLifecycle(lifecycle({ provenanceStillValid: false }))
  assert.equal(rights.decision, 'REJECT')
  assert.equal(rights.targetStorageClass, 'ARCHIVE')
  assert.equal(provenance.decision, 'REJECT')
})

test('retired asset cannot be promoted again', () => {
  const result = evaluatePromotionLifecycle(lifecycle({ record: record({ retiredAt: '2026-09-08T00:00:00Z' }) }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('asset-retired'))
})

test('already distributed eligible asset is idempotent', () => {
  const result = evaluatePromotionLifecycle(lifecycle({
    record: record({
      governanceState: 'LEARNER_ELIGIBLE',
      storage: {
        providerKind: 'OBJECT_STORAGE',
        storageClass: 'LEARNER_DISTRIBUTION',
        bucketOrStore: 'clinical-media',
        objectKeyOrInstanceRef: 'echo/a-v1.mp4',
      },
    }),
  }))
  assert.equal(result.decision, 'NOOP')
  assert.equal(result.learnerEligible, true)
})

test('supersession requires new asset id, new checksum, explicit lineage and same modality', () => {
  const previous = record()
  const next = record({
    assetId: 'echo-a-v2',
    derivativeSha256: 'c'.repeat(64),
    supersedesAssetId: 'echo-a-v1',
  })
  assert.doesNotThrow(() => validateImmutableSupersession({ previous, next, reason: 'quality improvement' }))
  assert.throws(() => validateImmutableSupersession({ previous, next: { ...next, assetId: previous.assetId }, reason: 'bad' }), /new assetId/)
  assert.throws(() => validateImmutableSupersession({ previous, next: { ...next, derivativeSha256: previous.derivativeSha256 }, reason: 'bad' }), /new derivative checksum/)
})

test('superseded retirement requires a replacement asset and distinct id', () => {
  assert.doesNotThrow(() => validateRetirementRecord({
    assetId: 'echo-a-v1',
    derivativeSha256: shaB,
    retiredAt: '2026-09-08T00:00:00Z',
    reason: 'SUPERSEDED',
    replacementAssetId: 'echo-a-v2',
    reviewerOrAuthority: 'governance-review-1',
  }))

  assert.throws(() => validateRetirementRecord({
    assetId: 'echo-a-v1',
    derivativeSha256: shaB,
    retiredAt: '2026-09-08T00:00:00Z',
    reason: 'SUPERSEDED',
    reviewerOrAuthority: 'governance-review-1',
  }), /replacementAssetId/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../app/lib/clinicalMedia/licensedEchoAsset.ts'
import {
  summarizeEchoBatch,
  toEchoBatchRecord,
  validateEchoBatch,
} from '../app/lib/clinicalMedia/echoBatchManifest.ts'

test('Echo Batch 01 derives a traceable manifest record from a governed licensed asset', () => {
  const record = toEchoBatchRecord(A4C_NORMAL_CLINICAL_STUDIO_ASSET)

  assert.equal(record.batchId, 'echo-batch-01')
  assert.equal(record.modality, 'echo')
  assert.equal(record.view, 'A4C')
  assert.equal(record.licenseId, 'CC-BY-SA-3.0')
  assert.equal(record.qualityScore, 90)
  assert.equal(record.qaState, 'clinical-review-required')
  assert.match(record.provenanceFingerprint, /^[a-f0-9]{40}:[a-f0-9]{64}$/)
  assert.doesNotThrow(() => validateEchoBatch([record]))
})

test('Echo Batch 01 rejects duplicated provenance even when record identity is changed', () => {
  const original = toEchoBatchRecord(A4C_NORMAL_CLINICAL_STUDIO_ASSET)
  const duplicate = {
    ...original,
    caseId: `${original.caseId}-duplicate`,
    assetId: `${original.assetId}-duplicate`,
  }

  assert.throws(() => validateEchoBatch([original, duplicate]), /Duplicate Echo provenance fingerprint/)
})

test('Echo Batch 01 exposes release-readiness metrics without publishing anything', () => {
  const record = toEchoBatchRecord(A4C_NORMAL_CLINICAL_STUDIO_ASSET)
  const summary = summarizeEchoBatch([record])

  assert.deepEqual(summary, {
    batchId: 'echo-batch-01',
    total: 1,
    learnerReady: 0,
    clinicalReviewRequired: 1,
    blocked: 0,
    averageQualityScore: 90,
  })
})

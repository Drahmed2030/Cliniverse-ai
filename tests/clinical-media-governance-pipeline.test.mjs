import test from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultBatchSamplingPolicy,
  evaluateClinicalMediaGovernance,
} from '../app/lib/clinicalMedia/clinicalMediaGovernancePipeline.ts'

const base = {
  assetId: 'asset-1',
  modality: 'ECHO',
  sourceSha256: 'a'.repeat(64),
  derivativeSha256: 'b'.repeat(64),
  sourceRightsVerified: true,
  commercialUsePermitted: true,
  attributionPlanVerified: true,
  decodeVerified: true,
  timingIntegrityVerified: true,
  geometryVerified: true,
  audioPolicyVerified: true,
  metadataPolicyVerified: true,
  privacyCleared: true,
  clinicalReviewed: true,
  deviceBaselineCovered: true,
  rendererContractVersion: 'echo-renderer-v1',
  encodingRecipeVersion: 'echo-h264-v1',
}

test('fully governed asset still requires explicit promotion decision', () => {
  const result = evaluateClinicalMediaGovernance(base)
  assert.equal(result.state, 'DEVICE_BASELINE_COVERED')
  assert.equal(result.learnerEligible, false)
  assert.ok(result.blockers.includes('promotion-decision-pending'))
})

test('privacy pending fails closed after technical verification', () => {
  const result = evaluateClinicalMediaGovernance({ ...base, privacyCleared: false })
  assert.equal(result.state, 'TECHNICALLY_VERIFIED')
  assert.equal(result.learnerEligible, false)
})

test('explicit hold overrides promotion path', () => {
  const result = evaluateClinicalMediaGovernance({ ...base, holdReasons: ['specialist-review-required'] })
  assert.equal(result.state, 'HOLD')
  assert.equal(result.learnerEligible, false)
})

test('batch sampling scales and expands on failure', () => {
  const policy = defaultBatchSamplingPolicy(100)
  assert.equal(policy.minimumClinicalSample, 15)
  assert.equal(policy.minimumDeviceSample, 5)
  assert.equal(policy.expandOnFailure, true)
})

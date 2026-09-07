import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateRendererBaselineCoverage,
  rendererBaselineRequiresRevalidation,
} from '../app/lib/clinicalMedia/rendererBaselineContract.ts'

const baseline = {
  baselineId: 'echo-apple-webkit-v1',
  fingerprint: {
    modality: 'ECHO',
    rendererId: 'clinical-studio-echo-cine',
    rendererVersion: '1.0.0',
    mediaPolicyVersion: 'echo-media-policy-v1',
    encodingRecipeVersion: 'h264-mp4-v1',
    platformFamily: 'APPLE_WEBKIT',
  },
  status: 'ACTIVE',
  establishedAt: '2026-09-07',
  sampleAssetIds: ['a','b','c','d','e','f'],
  currentDeviceEvidence: true,
  legacyDeviceEvidence: true,
  playbackStarts: true,
  controlsWork: true,
  geometryPreserved: true,
  noBlankFailure: true,
  representativeFeatures: ['grayscale-cine','color-doppler','overlay-heavy','dark-field','small-target'],
  notes: [],
}

function asset(overrides = {}) {
  return {
    assetId: 'echo-new',
    modality: 'ECHO',
    rendererId: 'clinical-studio-echo-cine',
    rendererVersion: '1.0.0',
    mediaPolicyVersion: 'echo-media-policy-v1',
    encodingRecipeVersion: 'h264-mp4-v1',
    technicallyVerified: true,
    requiredRepresentativeFeatures: ['grayscale-cine'],
    highRiskOrNovelFeatures: [],
    ...overrides,
  }
}

test('matching technically verified asset can reuse active renderer baseline', () => {
  const result = evaluateRendererBaselineCoverage(asset(), baseline)
  assert.equal(result.decision, 'COVERED')
  assert.equal(result.deviceBaselineCovered, true)
})

test('novel feature requires only a new sample, not full batch retest', () => {
  const result = evaluateRendererBaselineCoverage(asset({ highRiskOrNovelFeatures: ['3d-volume'] }), baseline)
  assert.equal(result.decision, 'SAMPLE_REQUIRED')
  assert.equal(result.deviceBaselineCovered, false)
  assert.ok(result.blockers.includes('novel-feature-requires-device-sample:3d-volume'))
})

test('renderer or recipe drift fails closed', () => {
  assert.equal(evaluateRendererBaselineCoverage(asset({ rendererVersion: '2.0.0' }), baseline).decision, 'HOLD')
  assert.equal(evaluateRendererBaselineCoverage(asset({ encodingRecipeVersion: 'h265-v1' }), baseline).decision, 'HOLD')
})

test('current-device evidence is required for an active baseline', () => {
  const result = evaluateRendererBaselineCoverage(asset(), { ...baseline, currentDeviceEvidence: false })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('baseline-core-playback-evidence-incomplete'))
})

test('technical gate must pass before baseline coverage can be reused', () => {
  const result = evaluateRendererBaselineCoverage(asset({ technicallyVerified: false }), baseline)
  assert.equal(result.decision, 'HOLD')
})

test('baseline revalidation is triggered only by meaningful renderer/platform drift or regression', () => {
  assert.equal(rendererBaselineRequiresRevalidation({
    rendererVersionChanged: false,
    mediaPolicyVersionChanged: false,
    encodingRecipeVersionChanged: false,
    platformEngineMajorChanged: false,
    playbackRegressionDetected: false,
    newHighRiskFeatureIntroduced: false,
  }), false)

  assert.equal(rendererBaselineRequiresRevalidation({
    rendererVersionChanged: false,
    mediaPolicyVersionChanged: false,
    encodingRecipeVersionChanged: false,
    platformEngineMajorChanged: false,
    playbackRegressionDetected: true,
    newHighRiskFeatureIntroduced: false,
  }), true)
})

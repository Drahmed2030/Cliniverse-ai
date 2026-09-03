import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSyntheticLead,
  DOOR_TO_ECG_MARKER_LEADS,
  matchesConfiguredMarker,
} from '../app/lib/cardiology/ecgWaveform.ts'
import { CLINICAL_STUDIO_ASSETS } from '../app/lib/clinicalMedia/clinicalStudioManifest.ts'
import {
  CLINICAL_MEDIA_FORMATS,
  compileClinicalMedia,
} from '../app/lib/clinicalMedia/clinicalMediaCompiler.ts'

test('the ECG waveform engine is deterministic and has an explicit answer key', () => {
  assert.equal(createSyntheticLead('V3').path, createSyntheticLead('V3').path)
  assert.deepEqual(DOOR_TO_ECG_MARKER_LEADS, ['V2', 'V3', 'V4'])
  assert.equal(matchesConfiguredMarker(['V2', 'V3', 'V4']), true)
  assert.equal(matchesConfiguredMarker(['II', 'V2', 'V3']), false)
})

test('Clinical Studio assets are serializable, synthetic and review-gated', () => {
  assert.doesNotThrow(() => JSON.stringify(CLINICAL_STUDIO_ASSETS))
  assert.deepEqual(CLINICAL_STUDIO_ASSETS.map(asset => asset.locale), ['en', 'ar'])
  for (const asset of CLINICAL_STUDIO_ASSETS) {
    assert.equal(asset.dataMode, 'synthetic-non-clinical')
    assert.equal(asset.intendedUse, 'education-only')
    assert.equal(asset.reviewStatus, 'draft-human-review-required')
    assert.deepEqual(asset.renderTargets, ['web-svg', 'remotion-video'])
    assert.match(asset.disclaimer, /Not validated/i)
  }
})

test('the media compiler produces bilingual, contiguous and export-ready timelines', () => {
  const english = compileClinicalMedia('en', 'landscape')
  const arabic = compileClinicalMedia('ar', 'portrait')

  assert.equal(english.direction, 'ltr')
  assert.equal(arabic.direction, 'rtl')
  assert.equal(english.durationInFrames, 720)
  assert.equal(arabic.durationInFrames, 720)
  assert.equal(english.durationInFrames / english.fps, 24)
  assert.deepEqual(
    english.scenes.map(scene => [scene.startFrame, scene.endFrame]),
    [[0, 150], [150, 390], [390, 570], [570, 720]],
  )
  assert.match(arabic.scenes[0].title, /التخطيط/)
  assert.equal(english.governance.dataMode, 'synthetic-non-clinical')
  assert.equal(english.governance.reviewStatus, 'draft-human-review-required')
})

test('all approved media ratios have explicit deterministic dimensions', () => {
  assert.deepEqual(CLINICAL_MEDIA_FORMATS, {
    landscape: { label: '16:9', width: 1280, height: 720 },
    portrait: { label: '9:16', width: 720, height: 1280 },
    square: { label: '1:1', width: 1080, height: 1080 },
  })
})

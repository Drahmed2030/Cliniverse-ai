import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSyntheticLead,
  DOOR_TO_ECG_MARKER_LEADS,
  matchesConfiguredMarker,
} from '../app/lib/cardiology/ecgWaveform.ts'
import { CLINICAL_STUDIO_ASSETS } from '../app/lib/clinicalMedia/clinicalStudioManifest.ts'

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
    assert.match(asset.disclaimer, /Not validated/i)
  }
})

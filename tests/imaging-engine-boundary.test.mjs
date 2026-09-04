import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  ECHO_LEARNING_ASSETS,
  IMAGING_ENGINE_BOUNDARIES,
  validateImagingLearningAsset,
} from '../app/lib/clinicalMedia/imagingEngineContract.ts'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('ECG, Echo and CT have distinct scientific engine boundaries', () => {
  assert.deepEqual(
    Object.values(IMAGING_ENGINE_BOUNDARIES).map(engine => engine.scientificModel),
    ['parametric-signal', 'cine-frame-sequence', 'voxel-volume'],
  )
  assert.equal(new Set(Object.values(IMAGING_ENGINE_BOUNDARIES).map(engine => engine.engineId)).size, 3)
  for (const engine of Object.values(IMAGING_ENGINE_BOUNDARIES)) {
    assert.equal(engine.diagnosticUse, 'prohibited')
    assert.equal(engine.patientDataUse, 'prohibited')
  }
})

test('the first Echo assets are bilingual synthetic drafts with explicit provenance', () => {
  assert.deepEqual(ECHO_LEARNING_ASSETS.map(asset => asset.locale), ['en', 'ar'])
  for (const asset of ECHO_LEARNING_ASSETS) {
    assert.equal(validateImagingLearningAsset(asset), asset)
    assert.equal(asset.dataMode, 'synthetic-non-clinical')
    assert.equal(asset.reviewStatus, 'draft-human-review-required')
    assert.equal(asset.provenance.patientIdentifiers, 'none')
    assert.match(asset.disclaimer, /Not an echocardiogram/i)
  }
})

test('a modality cannot be routed through another modality engine', () => {
  assert.throws(
    () => validateImagingLearningAsset({
      ...ECHO_LEARNING_ASSETS[0],
      engineId: IMAGING_ENGINE_BOUNDARIES.ecg.engineId,
    }),
    /modality-specific engine/,
  )
})

test('the Apple release entry does not reactivate legacy imaging upload or generated cases', () => {
  const page = read('app/page.tsx')
  const release = read('app/components/ReleaseApp.tsx')
  assert.match(page, /<ReleaseApp/)
  assert.doesNotMatch(page, /ToolsPage|LiveCaseViewer|RadiologyModule|GrandRoundsAI/)
  assert.doesNotMatch(release, /ToolsPage|LiveCaseViewer|RadiologyModule|GrandRoundsAI|generate-case/)
})

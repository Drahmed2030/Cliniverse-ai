import assert from 'node:assert/strict'
import test from 'node:test'

const SOURCE_URL = new URL('../app/lib/clinicalMedia/clinicalMediaAutomatedGate.ts', import.meta.url)
const source = await (await fetch(SOURCE_URL)).text()

function requireText(fragment) {
  assert.ok(source.includes(fragment), `Expected automated gate contract to contain: ${fragment}`)
}

test('automated gate is checksum-bound and fail-closed', () => {
  requireText("blockers.push('derivative-checksum-mismatch')")
  requireText("blockers.push('decode-failed')")
  requireText("blockers.push('geometry-invalid')")
  requireText("blockers.push('metadata-policy-failed')")
  requireText("blockers.push('unexpected-audio-present')")
})

test('cine media requires frames, duration, monotonic timestamps and geometry', () => {
  requireText("input.mediaKind === 'CINE_VIDEO'")
  requireText("cine-frame-count-invalid")
  requireText("cine-duration-invalid")
  requireText("cine-timestamps-not-monotonic")
  requireText("cine-width-invalid")
  requireText("cine-height-invalid")
})

test('DICOM series requires instance count and ordering, with unknown completeness held', () => {
  requireText("input.mediaKind === 'DICOM_SERIES'")
  requireText("dicom-instance-count-invalid")
  requireText("dicom-ordering-invalid")
  requireText("dicom-series-incomplete")
  requireText("dicom-series-completeness-not-established")
})

test('modality/media-kind compatibility is explicit', () => {
  requireText("ECHO: ['CINE_VIDEO', 'DICOM_SERIES']")
  requireText("ECG: ['WAVEFORM', 'STATIC_IMAGE', 'DICOM_SERIES']")
  requireText("XRAY: ['STATIC_IMAGE', 'DICOM_SERIES']")
  requireText("CT: ['DICOM_SERIES']")
  requireText("ANGIO: ['CINE_VIDEO', 'DICOM_SERIES']")
})

test('automation never self-clears privacy, clinical review or learner eligibility', () => {
  requireText('privacyCleared: false')
  requireText('clinicalReviewed: false')
  requireText('learnerEligible: false')
})

test('batch summary requires every asset to pass for technical verification', () => {
  requireText('allTechnicallyVerified: results.length > 0 && pass.length === results.length')
  requireText('failedAssetIds: fail.map')
  requireText('heldAssetIds: hold.map')
})

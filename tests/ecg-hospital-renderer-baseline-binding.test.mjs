import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgHospitalRendererBinding,
  evaluateEcgHospitalRendererCoverage,
} from '../app/lib/clinicalIntelligence/ecgHospitalRendererBaselineBinding.ts'

const canonicalSha = 'a'.repeat(64)
const outputSha = 'b'.repeat(64)

function target(overrides = {}) {
  return {
    canonicalWaveformSha256: canonicalSha,
    outputArtifactSha256: outputSha,
    platformFamily: 'IPHONE_IOS',
    rendererId: 'cliniverse-ecg-renderer',
    rendererVersion: '1.0.0',
    layoutPolicyId: 'ecg-12lead-layout',
    layoutPolicyVersion: '1.0.0',
    calibrationPolicyId: 'ecg-calibration-preserve-source',
    calibrationPolicyVersion: '1.0.0',
    outputRecipeId: 'ecg-review-pdf',
    outputRecipeVersion: '1.0.0',
    ...overrides,
  }
}

function evidence(overrides = {}) {
  return {
    fingerprint: {
      rendererId: 'cliniverse-ecg-renderer',
      rendererVersion: '1.0.0',
      layoutPolicyId: 'ecg-12lead-layout',
      layoutPolicyVersion: '1.0.0',
      calibrationPolicyId: 'ecg-calibration-preserve-source',
      calibrationPolicyVersion: '1.0.0',
      outputRecipeId: 'ecg-review-pdf',
      outputRecipeVersion: '1.0.0',
      platformFamily: 'IPHONE_IOS',
      canonicalWaveformSha256: canonicalSha,
      outputArtifactSha256: outputSha,
    },
    platformFamily: 'IPHONE_IOS',
    exactOutputArtifactSha256: outputSha,
    currentDeviceEvidence: true,
    geometryPreserved: true,
    fullTimelinePreserved: true,
    leadIdentityPreserved: true,
    calibrationPreserved: true,
    annotationsReadable: true,
    deviations: [],
    ...overrides,
  }
}

test('hospital renderer baseline covers only exact canonical, output and platform identity', () => {
  const result = evaluateEcgHospitalRendererCoverage(target(), evidence())
  assert.equal(result.decision, 'COVERED')
  assert.deepEqual(result.blockers, [])
})

test('platform family mismatch fails closed', () => {
  const result = evaluateEcgHospitalRendererCoverage(target(), evidence({ platformFamily: 'IPAD_IPADOS' }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('platform-family-mismatch'))
})

test('canonical or output artifact drift invalidates baseline reuse', () => {
  const canonicalDrift = evaluateEcgHospitalRendererCoverage(
    target({ canonicalWaveformSha256: 'c'.repeat(64) }),
    evidence(),
  )
  assert.ok(canonicalDrift.blockers.includes('canonical-waveform-identity-mismatch'))

  const outputDrift = evaluateEcgHospitalRendererCoverage(
    target({ outputArtifactSha256: 'd'.repeat(64) }),
    evidence(),
  )
  assert.ok(outputDrift.blockers.includes('output-artifact-identity-mismatch'))
})

test('device evidence and deviations remain fail-closed', () => {
  const untested = evaluateEcgHospitalRendererCoverage(target(), evidence({ currentDeviceEvidence: false }))
  assert.ok(untested.blockers.includes('current-device-evidence-required'))

  const deviated = evaluateEcgHospitalRendererCoverage(target(), evidence({ deviations: ['cropping-observed'] }))
  assert.ok(deviated.blockers.includes('renderer-deviation:cropping-observed'))

  const boundary = describeEcgHospitalRendererBinding()
  assert.equal(boundary.sourceVendorExcludedFromRendererIdentity, true)
  assert.equal(boundary.exactOutputArtifactIdentityRequired, true)
  assert.equal(boundary.exactPlatformFamilyRequired, true)
})

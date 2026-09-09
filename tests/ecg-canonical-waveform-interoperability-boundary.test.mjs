import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgInteroperabilityBoundary,
  validateCanonicalEcgWaveform,
} from '../app/lib/clinicalIntelligence/ecgCanonicalWaveformInteroperabilityBoundary.ts'

const leads = [
  'I', 'II', 'III', 'aVR', 'aVL', 'aVF',
  'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
].map(leadId => ({
  leadId,
  sampleCount: 5000,
  samplingFrequencyHz: 500,
  gainUnitsPerMv: 1000,
  baselineUnits: 0,
  unit: 'mV',
}))

function validWaveform(overrides = {}) {
  return {
    canonicalVersion: '1.0.0',
    sourceFormat: 'WFDB',
    sourceRecordId: 'ptb-xl:10',
    durationMs: 10000,
    leadCount: 12,
    leads,
    sourceArtifactSha256: ['e1ac8a8873741cb85d2533c9c3c79acfaa34b2f9f80a108b6b1dfc0635c0c2e5'],
    decoderId: 'wfdb-raw16le',
    decoderVersion: '1.0.0',
    calibrationPolicyId: 'ecg-calibration-preserve-source',
    calibrationPolicyVersion: '1.0.0',
    timingPreserved: true,
    samplesPreserved: true,
    annotationsPreservedAsMetadata: true,
    ...overrides,
  }
}

test('canonical ECG waveform validates a complete 12-lead WFDB record', () => {
  const result = validateCanonicalEcgWaveform(validWaveform())
  assert.equal(result.valid, true)
  assert.deepEqual(result.blockers, [])
})

test('canonical model rejects a missing required lead', () => {
  const missingV6 = leads.filter(lead => lead.leadId !== 'V6')
  const result = validateCanonicalEcgWaveform(validWaveform({ leadCount: 11, leads: missingV6 }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('required-lead-missing:V6'))
})

test('canonical model rejects silent timing or sample changes', () => {
  const timing = validateCanonicalEcgWaveform(validWaveform({ timingPreserved: false }))
  const samples = validateCanonicalEcgWaveform(validWaveform({ samplesPreserved: false }))
  assert.ok(timing.blockers.includes('timing-must-be-preserved'))
  assert.ok(samples.blockers.includes('samples-must-be-preserved'))
})

test('interoperability boundary keeps renderer source-agnostic', () => {
  const boundary = describeEcgInteroperabilityBoundary()
  assert.deepEqual(boundary.sourceAdapters, ['WFDB', 'DICOM_WAVEFORM', 'SCP_ECG', 'VENDOR_ADAPTER'])
  assert.equal(boundary.rendererReadsCanonicalModel, true)
  assert.equal(boundary.sourceSpecificLogicAllowedInRenderer, false)
  assert.equal(boundary.futureHospitalFormatsDoNotChangeCompetencyContract, true)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgInteroperabilityBoundary,
  validateCanonicalEcgWaveform,
  validateHospitalCanonicalEcgWaveformV11,
  validateEcgAdapterResultV1,
} from '../app/lib/clinicalIntelligence/ecgCanonicalWaveformInteroperabilityBoundary.ts'

const sha = 'a'.repeat(64)

const leadsV10 = [
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

function waveformV10(overrides = {}) {
  return {
    canonicalVersion: '1.0.0',
    sourceFormat: 'WFDB',
    sourceRecordId: 'ptb-xl:10',
    durationMs: 10000,
    leadCount: 12,
    leads: leadsV10,
    sourceArtifactSha256: [sha],
    decoderId: 'wfdb-raw16le',
    decoderVersion: '1.0.0',
    calibrationPolicyId: 'preserve-source',
    calibrationPolicyVersion: '1.0.0',
    timingPreserved: true,
    samplesPreserved: true,
    annotationsPreservedAsMetadata: true,
    ...overrides,
  }
}

const leadsV11 = leadsV10.map((lead, index) => ({
  ...lead,
  channelInstanceId: `channel-${index + 1}`,
  sourceCode: lead.leadId,
  sourceCodingSystem: 'DICOM-CID-3001',
  multiplexGroupId: 'group-1',
  startOffsetMs: 0,
  channelSkewMs: 0,
}))

function waveformV11(overrides = {}) {
  return {
    ...waveformV10(),
    canonicalVersion: '1.1.0',
    profile: 'COMPLETE_SIMULTANEOUS_12_LEAD',
    sourceFormat: 'DICOM_WAVEFORM',
    leads: leadsV11,
    sampleBufferRef: {
      artifactId: 'canonical-buffer-1',
      sha256: 'b'.repeat(64),
      encoding: 'signed-int16-little-endian',
      immutable: true,
    },
    multiplexGroups: [{
      groupId: 'group-1',
      startOffsetMs: 0,
      durationMs: 10000,
      channelInstanceIds: leadsV11.map(lead => lead.channelInstanceId),
    }],
    annotations: [{
      annotationId: 'ann-1',
      code: 'R_PEAK',
      codingSystem: 'CLINIVERSE-ECG',
      startMs: 2628,
      channelInstanceIds: ['channel-2'],
      interpretationStatus: 'DERIVED',
    }],
    ingestionProvenance: {
      sourceSystemId: 'hospital-ecg-system',
      sourceProfileId: 'dicom-12lead-waveform-storage',
      adapterId: 'dicom-waveform-adapter',
      adapterVersion: '1.0.0',
      decoderId: 'dicom-waveform-decoder',
      decoderVersion: '1.0.0',
      configurationDigestSha256: 'c'.repeat(64),
      mappingEvidenceId: 'mapping-evidence-1',
      canonicalWaveformSha256: 'd'.repeat(64),
    },
    ...overrides,
  }
}

test('base validator rejects malformed runtime values previously accepted', () => {
  const cases = [
    waveformV10({ annotationsPreservedAsMetadata: false }),
    waveformV10({ sourceArtifactSha256: ['not-a-sha'] }),
    waveformV10({ durationMs: Number.NaN }),
    waveformV10({ canonicalVersion: '9.9.9' }),
    waveformV10({ leads: leadsV10.map((lead, i) => i === 0 ? { ...lead, samplingFrequencyHz: Number.NaN } : lead) }),
  ]
  for (const candidate of cases) assert.equal(validateCanonicalEcgWaveform(candidate).valid, false)
})

test('base validator rejects duplicate leads and duration/sample inconsistency', () => {
  const duplicated = [...leadsV10.slice(0, 11), { ...leadsV10[0] }]
  const duplicateResult = validateCanonicalEcgWaveform(waveformV10({ leads: duplicated }))
  assert.ok(duplicateResult.blockers.includes('duplicate-lead-id'))

  const inconsistent = leadsV10.map((lead, i) => i === 0 ? { ...lead, sampleCount: 4000 } : lead)
  const durationResult = validateCanonicalEcgWaveform(waveformV10({ leads: inconsistent }))
  assert.ok(durationResult.blockers.includes('sample-duration-inconsistent:I'))
})

test('hospital v1.1 profile validates immutable samples, channel identities, groups and provenance', () => {
  const result = validateHospitalCanonicalEcgWaveformV11(waveformV11())
  assert.equal(result.valid, true)
  assert.deepEqual(result.blockers, [])
})

test('hospital v1.1 profile fails closed when sample or coded-channel semantics are absent', () => {
  const withoutBuffer = validateHospitalCanonicalEcgWaveformV11(waveformV11({ sampleBufferRef: undefined }))
  assert.ok(withoutBuffer.blockers.includes('immutable-sample-buffer-required'))

  const uncoded = leadsV11.map((lead, i) => i === 1 ? { ...lead, sourceCode: '' } : lead)
  const withoutCodes = validateHospitalCanonicalEcgWaveformV11(waveformV11({ leads: uncoded }))
  assert.ok(withoutCodes.blockers.includes('coded-lead-metadata-required:II'))
})

test('general ECG transport profile does not fabricate a universal 12-lead requirement', () => {
  const subset = leadsV10.slice(0, 3)
  const result = validateCanonicalEcgWaveform(waveformV10({
    profile: 'GENERAL_ECG_WAVEFORM',
    leadCount: 3,
    leads: subset,
  }))
  assert.equal(result.blockers.some(blocker => blocker.startsWith('required-lead-missing:')), false)
})

test('adapter result contract requires source, adapter, decoder, mapping and canonical digest evidence', () => {
  const valid = validateEcgAdapterResultV1({
    status: 'ADAPTED',
    sourceFormat: 'DICOM_WAVEFORM',
    sourceProfileId: 'dicom-12lead-waveform-storage',
    sourceSystemId: 'hospital-ecg-system',
    adapterId: 'dicom-adapter',
    adapterVersion: '1.0.0',
    decoderId: 'dicom-decoder',
    decoderVersion: '1.0.0',
    configurationDigestSha256: 'c'.repeat(64),
    sourceArtifactSha256: ['a'.repeat(64)],
    canonicalWaveformSha256: 'd'.repeat(64),
    mappingEvidenceId: 'mapping-1',
    unsupportedFeatureBlockers: [],
  })
  assert.equal(valid.valid, true)

  const unsupported = validateEcgAdapterResultV1({
    status: 'UNSUPPORTED',
    sourceFormat: 'DICOM_WAVEFORM',
    sourceProfileId: 'general-ecg-waveform-storage',
    sourceSystemId: 'hospital-ecg-system',
    adapterId: 'dicom-adapter',
    adapterVersion: '1.0.0',
    decoderId: 'dicom-decoder',
    decoderVersion: '1.0.0',
    configurationDigestSha256: 'c'.repeat(64),
    sourceArtifactSha256: ['a'.repeat(64)],
    unsupportedFeatureBlockers: ['sequential-group-rendering-not-supported'],
  })
  assert.equal(unsupported.valid, true)
})

test('renderer fingerprint is no longer source-vendor or decoder identity', () => {
  const boundary = describeEcgInteroperabilityBoundary()
  assert.equal(boundary.ingestionProvenanceSeparateFromRendererFingerprint, true)
  assert.equal(boundary.transportModelSeparateFromTwelveLeadEducationalProfile, true)
  assert.equal(boundary.hospitalCanonicalVersion, '1.1.0')
})

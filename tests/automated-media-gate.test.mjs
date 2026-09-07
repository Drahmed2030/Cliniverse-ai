import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_MODALITY_MEDIA_POLICIES,
  evaluateAutomatedMediaGate,
  summarizeAutomatedMediaBatch,
} from '../app/lib/clinicalMedia/automatedMediaGate.ts'

const sha = 'a'.repeat(64)

function echoEvidence(overrides = {}) {
  return {
    assetId: 'echo-test-v1',
    modality: 'ECHO',
    artifactSha256: sha,
    probeTool: 'ffprobe',
    probeToolVersion: '7.1',
    probedAt: '2026-09-07T13:30:00Z',
    container: 'mp4',
    videoCodec: 'h264',
    audioStreams: 0,
    videoStreams: 1,
    width: 648,
    height: 480,
    durationMs: 980,
    frameCount: 50,
    nominalFps: 51,
    timestampsMonotonic: true,
    decodeComplete: true,
    unexpectedMetadataPresent: false,
    corruptionDetected: false,
    ...overrides,
  }
}

test('Echo policy accepts a clean H264 MP4 cine', () => {
  const result = evaluateAutomatedMediaGate(echoEvidence())
  assert.equal(result.decision, 'PASS')
  assert.equal(result.technicallyVerified, true)
  assert.deepEqual(result.blockers, [])
})

test('checksum must be a real SHA256 digest', () => {
  assert.throws(() => evaluateAutomatedMediaGate(echoEvidence({ artifactSha256: 'bad' })), /SHA256/)
})

test('corruption and decode failure reject fail-closed', () => {
  const corrupted = evaluateAutomatedMediaGate(echoEvidence({ corruptionDetected: true }))
  const decode = evaluateAutomatedMediaGate(echoEvidence({ decodeComplete: false }))
  assert.equal(corrupted.decision, 'REJECT')
  assert.equal(decode.decision, 'REJECT')
})

test('unexpected audio and metadata hold for human escalation', () => {
  const result = evaluateAutomatedMediaGate(echoEvidence({ audioStreams: 1, unexpectedMetadataPresent: true }))
  assert.equal(result.decision, 'HOLD')
  assert.equal(result.technicallyVerified, false)
  assert.ok(result.blockers.includes('unexpected-audio-stream'))
  assert.ok(result.blockers.includes('unexpected-metadata-present'))
})

test('non-monotonic timestamps reject Echo cine', () => {
  const result = evaluateAutomatedMediaGate(echoEvidence({ timestampsMonotonic: false }))
  assert.equal(result.decision, 'REJECT')
})

test('unknown timestamp integrity holds rather than assuming pass', () => {
  const result = evaluateAutomatedMediaGate(echoEvidence({ timestampsMonotonic: null }))
  assert.equal(result.decision, 'HOLD')
})

test('policy mismatch cannot be evaluated', () => {
  assert.throws(
    () => evaluateAutomatedMediaGate(echoEvidence(), DEFAULT_MODALITY_MEDIA_POLICIES.CT),
    /modality\/policy mismatch/,
  )
})

test('batch summary escalates any hold or rejection', () => {
  const pass = evaluateAutomatedMediaGate(echoEvidence())
  const hold = evaluateAutomatedMediaGate(echoEvidence({ assetId: 'echo-hold', unexpectedMetadataPresent: true }))
  const reject = evaluateAutomatedMediaGate(echoEvidence({ assetId: 'echo-reject', corruptionDetected: true }))
  const summary = summarizeAutomatedMediaBatch([pass, hold, reject])
  assert.deepEqual(summary, {
    total: 3,
    passed: 1,
    held: 1,
    rejected: 1,
    technicallyVerified: false,
    escalationRequired: true,
  })
})

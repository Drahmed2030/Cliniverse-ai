import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateBatch01ExistingTechnicalEvidence } from '../app/lib/clinicalMedia/echoBatch01EvidenceReuse.ts'

const shaA = 'a'.repeat(64)
const shaB = 'b'.repeat(64)

function evidence(overrides = {}) {
  return {
    candidateId: 'echo-test',
    sourceSha256: shaA,
    derivativeSha256: shaB,
    observedDerivativeSha256: shaB,
    derivativeIntegrityVerified: true,
    derivativeFrameCount: 32,
    temporalFidelity: 'PASS-identical-presentation-timestamps',
    technicalPrivacyScreen: 'PASS-source-technical-only',
    machineEvidencePaths: ['technical.json', 'ffprobe.json', 'evidence.json'],
    ...overrides,
  }
}

test('exact-SHA machine evidence may satisfy the Batch 01 technical gate without a local re-probe', () => {
  const result = evaluateBatch01ExistingTechnicalEvidence(evidence())
  assert.equal(result.decision, 'PASS')
  assert.equal(result.technicallyVerified, true)
  assert.equal(result.evidenceReused, true)
  assert.equal(result.localReprobeRequiredForThisPilot, false)
})

test('checksum drift holds fail closed', () => {
  const result = evaluateBatch01ExistingTechnicalEvidence(evidence({ observedDerivativeSha256: 'c'.repeat(64) }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('derivative-checksum-mismatch'))
})

test('machine evidence reuse does not infer human privacy approval', () => {
  const result = evaluateBatch01ExistingTechnicalEvidence(evidence())
  assert.equal('privacyCleared' in result, false)
})

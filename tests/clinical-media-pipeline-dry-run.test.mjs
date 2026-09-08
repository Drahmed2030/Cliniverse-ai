import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateClinicalMediaPipelineDryRun } from '../app/lib/clinicalMedia/clinicalMediaPipelineDryRun.ts'

const sha = 'a'.repeat(64)

function input(overrides = {}) {
  return {
    assetId: 'echo-pilot',
    modality: 'ECHO',
    artifactSha256: sha,
    sourceAndRights: 'PASS',
    automatedMediaGate: 'PASS',
    privacyHumanAttestation: 'PASS',
    clinicalHumanAttestation: 'PASS',
    rendererBaseline: 'PASS',
    registryBoundary: 'PASS',
    promotionDecision: 'PASS',
    ...overrides,
  }
}

test('pending privacy attestation stops after technical verification', () => {
  const result = evaluateClinicalMediaPipelineDryRun(input({ privacyHumanAttestation: 'PENDING' }))
  assert.equal(result.finalState, 'TECHNICALLY_VERIFIED')
  assert.equal(result.firstBlockingStage, 'privacyHumanAttestation')
  assert.equal(result.learnerEligible, false)
})

test('clinical hold stops after privacy clearance', () => {
  const result = evaluateClinicalMediaPipelineDryRun(input({ clinicalHumanAttestation: 'HOLD' }))
  assert.equal(result.finalState, 'PRIVACY_CLEARED')
  assert.equal(result.firstBlockingStage, 'clinicalHumanAttestation')
})

test('renderer hold stops after clinical review', () => {
  const result = evaluateClinicalMediaPipelineDryRun(input({ rendererBaseline: 'HOLD' }))
  assert.equal(result.finalState, 'CLINICALLY_REVIEWED')
})

test('reject at any stage fails closed', () => {
  const result = evaluateClinicalMediaPipelineDryRun(input({ sourceAndRights: 'REJECT' }))
  assert.equal(result.finalState, 'REJECTED')
  assert.equal(result.learnerEligible, false)
})

test('dry-run never self-promotes learner eligibility', () => {
  const result = evaluateClinicalMediaPipelineDryRun(input())
  assert.equal(result.finalState, 'DEVICE_BASELINE_COVERED')
  assert.equal(result.learnerEligible, false)
  assert.ok(result.blockers.includes('promotion-execution-not-performed-in-dry-run'))
})

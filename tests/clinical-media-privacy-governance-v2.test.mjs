import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluatePrivacyGovernanceV2, privacyBatchSamplingPolicyV2 } from '../app/lib/clinicalMedia/clinicalMediaPrivacyGovernanceV2.ts'

const sha = 'a'.repeat(64)

function echo(overrides = {}) {
  return {
    assetId: 'echo-test',
    modality: 'ECHO',
    derivativeSha256: sha,
    structuredIdentifierScanPassed: true,
    burnedInIdentifierScanPassed: true,
    disallowedDateTimeScanPassed: true,
    metadataScanPassed: true,
    provenanceComplete: true,
    attributionPlanComplete: true,
    residualAnnotationsPresent: false,
    scanConfidence: 0.995,
    reidentificationRiskAssessed: true,
    intendedUse: 'TEACHING',
    ...overrides,
  }
}

test('automation never clears privacy without named human attestation', () => {
  const result = evaluatePrivacyGovernanceV2(echo())
  assert.equal(result.decision, 'HUMAN_ATTESTATION_REQUIRED')
  assert.equal(result.privacyCleared, false)
  assert.equal(result.humanAttestationRequired, true)
})

test('named human attestation can close a clean low-risk record', () => {
  const result = evaluatePrivacyGovernanceV2(echo({ humanReviewerRecordId: 'privacy-review-1', humanAttestationPassed: true }))
  assert.equal(result.privacyCleared, true)
  assert.equal(result.riskTier, 'LOW')
})

test('burned-in identifier failure rejects fail closed', () => {
  const result = evaluatePrivacyGovernanceV2(echo({ burnedInIdentifierScanPassed: false }))
  assert.equal(result.decision, 'REJECT')
  assert.equal(result.riskTier, 'HIGH')
})

test('residual annotations raise risk and warning', () => {
  const result = evaluatePrivacyGovernanceV2(echo({ residualAnnotationsPresent: true }))
  assert.equal(result.riskTier, 'MODERATE')
  assert.ok(result.warnings.includes('residual-annotations-require-human-review'))
})

test('DICOM imaging requires confidentiality profile markers', () => {
  const result = evaluatePrivacyGovernanceV2(echo({ modality: 'CT' }))
  assert.equal(result.decision, 'REJECT')
  assert.ok(result.blockers.includes('dicom-confidentiality-profile-not-applied'))
  assert.ok(result.blockers.includes('dicom-patient-identity-removed-flag-missing'))
  assert.ok(result.blockers.includes('dicom-deidentification-method-not-recorded'))
})

test('high-risk asset forces full-batch human review', () => {
  assert.deepEqual(privacyBatchSamplingPolicyV2(100, 1), { totalAssets: 100, humanReviewMinimum: 100, fullReviewRequired: true })
})

test('low-risk batch uses bounded representative human sample', () => {
  assert.deepEqual(privacyBatchSamplingPolicyV2(100, 0), { totalAssets: 100, humanReviewMinimum: 10, fullReviewRequired: false })
})

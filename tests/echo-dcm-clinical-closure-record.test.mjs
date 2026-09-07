import test from 'node:test'
import assert from 'node:assert/strict'
import { DCM_CANDIDATE_ID, DCM_DERIVATIVE_SHA256 } from '../app/lib/clinicalMedia/echoDcmDerivativeReview.ts'
import { evaluateDcmClinicalClosure } from '../app/lib/clinicalMedia/echoDcmClinicalClosureRecord.ts'

const passRecord = {
  candidateId: DCM_CANDIDATE_ID,
  artifactSha256: DCM_DERIVATIVE_SHA256,
  reviewerName: 'Reviewer',
  reviewerQualifications: 'Cardiology / echocardiography reviewer',
  reviewedAtIso: '2026-09-07T00:00:00Z',
  environment: 'direct cine review',
  artifactIdentity: 'PASS', a4cView: 'PASS', sourceDcmLabel: 'PASS', globalLvFunctionTeaching: 'PASS',
  chamberDilationTeaching: 'PASS', motionSufficiency: 'PASS', overlayAnatomy: 'PASS', privacyFrames: 'PASS',
  privacyProvenance: 'PASS', licenseAttribution: 'PASS', audio: 'PASS', teachingCopy: 'PASS', notes: [],
}

test('missing human review remains pending', () => {
  const result = evaluateDcmClinicalClosure(null)
  assert.equal(result.state, 'pending')
  assert.equal(result.learnerReady, false)
  assert.equal(result.binaryCommitEligible, false)
})

test('reviewer attestation is required', () => {
  const result = evaluateDcmClinicalClosure({ ...passRecord, reviewerName: '' })
  assert.equal(result.state, 'hold')
  assert.deepEqual(result.blockingFields, ['reviewer-attestation-incomplete'])
})

test('any HOLD prevents closure', () => {
  const result = evaluateDcmClinicalClosure({ ...passRecord, motionSufficiency: 'HOLD' })
  assert.equal(result.state, 'hold')
})

test('any REJECT rejects clinical closure', () => {
  const result = evaluateDcmClinicalClosure({ ...passRecord, a4cView: 'REJECT' })
  assert.equal(result.state, 'rejected')
})

test('all PASS clears clinical and privacy only, never release', () => {
  const result = evaluateDcmClinicalClosure(passRecord)
  assert.equal(result.state, 'clinical-privacy-cleared')
  assert.equal(result.humanAttestationComplete, true)
  assert.equal(result.learnerReady, false)
  assert.equal(result.binaryCommitEligible, false)
})

test('checksum mismatch fails closed', () => {
  assert.throws(() => evaluateDcmClinicalClosure({ ...passRecord, artifactSha256: 'bad' }), /artifact identity mismatch/)
})

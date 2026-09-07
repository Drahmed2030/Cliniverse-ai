import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DCM_DERIVATIVE_SHA256,
} from '../app/lib/clinicalMedia/echoDcmDerivativeReview.ts'
import {
  evaluateDcmClinicalPrivacyClosure,
} from '../app/lib/clinicalMedia/echoDcmClinicalPrivacyClosure.ts'

const approvedClinical = {
  reviewerRole: 'cardiology-echo-reviewer',
  artifactSha256: DCM_DERIVATIVE_SHA256,
  a4cViewConfirmed: true,
  dcmPatternSuitableForTeaching: true,
  globalLvFunctionTeachingSupported: true,
  chamberDilationTeachingSupported: true,
  motionAndLoopSufficientForTeaching: true,
  preservedAnnotationsDoNotObscureAnatomy: true,
  numericalEfClaimsExcluded: true,
  etiologyClaimsExcluded: true,
  hemodynamicClaimsExcluded: true,
  treatmentClaimsExcluded: true,
  notes: [],
}

const approvedPrivacy = {
  reviewerRole: 'privacy-provenance-reviewer',
  artifactSha256: DCM_DERIVATIVE_SHA256,
  noDirectPatientIdentifiers: true,
  noDisallowedAcquisitionDateTime: true,
  sourceCreditsAndProvenanceAcceptable: true,
  residualAnnotationsReviewed: true,
  redistributionAttributionPlanAccepted: true,
  notes: [],
}

test('starts awaiting specialist and never permits binary inclusion', () => {
  const result = evaluateDcmClinicalPrivacyClosure(null, null)
  assert.equal(result.state, 'awaiting-specialist')
  assert.equal(result.binaryCommitEligible, false)
  assert.equal(result.learnerReady, false)
})

test('moves to privacy only after specialist review clears', () => {
  const result = evaluateDcmClinicalPrivacyClosure(approvedClinical, null)
  assert.equal(result.state, 'awaiting-privacy')
  assert.equal(result.specialistClinicalComplete, true)
  assert.equal(result.finalPrivacyComplete, false)
})

test('clinical and privacy may close while device playback remains a later hard gate', () => {
  const result = evaluateDcmClinicalPrivacyClosure(approvedClinical, approvedPrivacy)
  assert.equal(result.state, 'clinical-privacy-cleared')
  assert.equal(result.devicePlaybackDeferred, true)
  assert.equal(result.devicePlaybackRequiredBeforeBinaryInclusion, true)
  assert.equal(result.binaryCommitEligible, false)
  assert.equal(result.learnerReady, false)
})

test('hard clinical rejection stays rejected', () => {
  const result = evaluateDcmClinicalPrivacyClosure({ ...approvedClinical, a4cViewConfirmed: false }, approvedPrivacy)
  assert.equal(result.state, 'rejected')
})

test('checksum mismatch fails closed', () => {
  assert.throws(
    () => evaluateDcmClinicalPrivacyClosure({ ...approvedClinical, artifactSha256: 'wrong' }, approvedPrivacy),
    /checksum mismatch/,
  )
})

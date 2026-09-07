import test from 'node:test'
import assert from 'node:assert/strict'
import {
  APICAL_HCM_SOURCE_SHA256,
  evaluateApicalHcmReadiness,
} from '../app/lib/clinicalMedia/echoApicalHcmReadiness.ts'

const clinicalPass = {
  reviewerRole: 'cardiology-echo-reviewer',
  sourceSha256: APICAL_HCM_SOURCE_SHA256,
  a4cViewConfirmed: true,
  sourceLabelConsistentWithVisiblePattern: true,
  apicalPatternSuitableForTeaching: true,
  discriminationAgainstNormalSupported: true,
  motionSufficientForTeaching: true,
  preservedOverlaysDoNotObscureApicalAnatomy: true,
  wallThicknessMeasurementExcluded: true,
  lvotObstructionClaimExcluded: true,
  genotypeInferenceExcluded: true,
  prognosisExcluded: true,
  independentDiagnosisExcluded: true,
  notes: [],
}

const privacyPass = {
  reviewerRole: 'privacy-provenance-reviewer',
  sourceSha256: APICAL_HCM_SOURCE_SHA256,
  noDirectPatientIdentifiers: true,
  noDisallowedAcquisitionDateTime: true,
  residualAnnotationsReviewed: true,
  sourceCreditsAndProvenanceAcceptable: true,
  redistributionAttributionPlanAccepted: true,
  notes: [],
}

test('missing reviews hold derivative preparation', () => {
  const result = evaluateApicalHcmReadiness(null, null)
  assert.equal(result.state, 'clinical-review-required')
  assert.equal(result.governedDerivativeAllowed, false)
  assert.equal(result.learnerReady, false)
})

test('complete bounded reviews allow derivative preparation only', () => {
  const result = evaluateApicalHcmReadiness(clinicalPass, privacyPass)
  assert.equal(result.state, 'derivative-ready')
  assert.equal(result.governedDerivativeAllowed, true)
  assert.equal(result.binaryCommitEligible, false)
  assert.equal(result.learnerReady, false)
})

test('source checksum mismatch fails closed', () => {
  assert.throws(() => evaluateApicalHcmReadiness({ ...clinicalPass, sourceSha256: 'bad' }, privacyPass), /checksum mismatch/)
})

test('independent diagnosis claims block derivative preparation', () => {
  const result = evaluateApicalHcmReadiness({ ...clinicalPass, independentDiagnosisExcluded: false }, privacyPass)
  assert.equal(result.state, 'clinical-review-required')
  assert.ok(result.blockingIssues.includes('independent-diagnosis-boundary-not-accepted'))
})

test('privacy or core teaching failures can hard reject', () => {
  const result = evaluateApicalHcmReadiness(clinicalPass, { ...privacyPass, noDirectPatientIdentifiers: false })
  assert.equal(result.state, 'rejected')
  assert.equal(result.governedDerivativeAllowed, false)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DCM_DERIVATIVE_SHA256,
  evaluateDcmDerivativeReview,
} from '../app/lib/clinicalMedia/echoDcmDerivativeReview.ts'

test('DCM derivative remains held while specialist, privacy and playback reviews are pending', () => {
  const result = evaluateDcmDerivativeReview(null, null, null)
  assert.equal(result.state, 'hold')
  assert.equal(result.binaryCommitEligible, false)
  assert.equal(result.learnerReady, false)
  assert.deepEqual(result.blockingIssues, [
    'specialist-clinical-review-pending',
    'final-privacy-review-pending',
    'physical-device-playback-pending',
  ])
})

test('review submissions must be tied to the exact derivative checksum', () => {
  assert.throws(
    () => evaluateDcmDerivativeReview({
      reviewerRole: 'cardiology-echo-reviewer', artifactSha256: 'wrong', a4cViewConfirmed: true,
      dcmPatternSuitableForTeaching: true, globalLvFunctionTeachingSupported: true,
      chamberDilationTeachingSupported: true, motionAndLoopSufficientForTeaching: true,
      preservedAnnotationsDoNotObscureAnatomy: true, numericalEfClaimsExcluded: true,
      etiologyClaimsExcluded: true, hemodynamicClaimsExcluded: true, treatmentClaimsExcluded: true, notes: [],
    }, null, null),
    /checksum mismatch/,
  )
})

test('a fully approved derivative may become binary-commit eligible but never learner-ready from this gate alone', () => {
  const clinical = {
    reviewerRole: 'cardiology-echo-reviewer', artifactSha256: DCM_DERIVATIVE_SHA256,
    a4cViewConfirmed: true, dcmPatternSuitableForTeaching: true, globalLvFunctionTeachingSupported: true,
    chamberDilationTeachingSupported: true, motionAndLoopSufficientForTeaching: true,
    preservedAnnotationsDoNotObscureAnatomy: true, numericalEfClaimsExcluded: true,
    etiologyClaimsExcluded: true, hemodynamicClaimsExcluded: true, treatmentClaimsExcluded: true, notes: [],
  }
  const privacy = {
    reviewerRole: 'privacy-provenance-reviewer', artifactSha256: DCM_DERIVATIVE_SHA256,
    noDirectPatientIdentifiers: true, noDisallowedAcquisitionDateTime: true,
    sourceCreditsAndProvenanceAcceptable: true, residualAnnotationsReviewed: true,
    redistributionAttributionPlanAccepted: true, notes: [],
  }
  const playback = {
    artifactSha256: DCM_DERIVATIVE_SHA256, iphoneSafariPassed: true, ipadSafariPassed: true,
    desktopSafariPassed: true, motionStableOnDevices: true, anatomyReadableOnDevices: true, notes: [],
  }
  const result = evaluateDcmDerivativeReview(clinical, privacy, playback)
  assert.equal(result.state, 'approved-for-binary-inclusion')
  assert.equal(result.binaryCommitEligible, true)
  assert.equal(result.learnerReady, false)
})

test('privacy or clinical identity failures hard-reject the derivative', () => {
  const clinical = {
    reviewerRole: 'cardiology-echo-reviewer', artifactSha256: DCM_DERIVATIVE_SHA256,
    a4cViewConfirmed: true, dcmPatternSuitableForTeaching: true, globalLvFunctionTeachingSupported: true,
    chamberDilationTeachingSupported: true, motionAndLoopSufficientForTeaching: true,
    preservedAnnotationsDoNotObscureAnatomy: true, numericalEfClaimsExcluded: true,
    etiologyClaimsExcluded: true, hemodynamicClaimsExcluded: true, treatmentClaimsExcluded: true, notes: [],
  }
  const privacy = {
    reviewerRole: 'privacy-provenance-reviewer', artifactSha256: DCM_DERIVATIVE_SHA256,
    noDirectPatientIdentifiers: false, noDisallowedAcquisitionDateTime: true,
    sourceCreditsAndProvenanceAcceptable: true, residualAnnotationsReviewed: true,
    redistributionAttributionPlanAccepted: true, notes: [],
  }
  const result = evaluateDcmDerivativeReview(clinical, privacy, null)
  assert.equal(result.state, 'rejected')
  assert.equal(result.binaryCommitEligible, false)
})

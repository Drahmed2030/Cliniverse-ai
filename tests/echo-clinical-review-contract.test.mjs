import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_BATCH_01_CLINICAL_PROMOTION, summarizeEchoBatch01ClinicalPromotion } from '../app/lib/clinicalMedia/echoBatch01ClinicalPromotion.ts'
import { canPrepareGovernedDerivative, evaluateEchoClinicalReview } from '../app/lib/clinicalMedia/echoClinicalReviewContract.ts'
import { getEchoSkill, validateEchoSkillGraph } from '../app/lib/competency/echoSkillGraph.ts'

const dcm = ECHO_BATCH_01_CLINICAL_PROMOTION.find(record => record.candidateId === 'echo-a4c-dcm-e00476')
if (!dcm) throw new Error('Missing DCM promotion candidate')

function approvedSubmission(candidateId) {
  return {
    candidateId,
    reviewerRole: 'cardiology-echo-reviewer',
    viewConfirmed: true,
    sourceLabelConsistentWithVisiblePattern: true,
    teachingObjectivesSupported: true,
    prohibitedClaimsAccepted: true,
    privacyFinalReviewPassed: true,
    motionSufficientForTeaching: true,
    overlaysAcceptableForDerivativePlanning: true,
    mobileReadable: true,
    ipadReadable: true,
    desktopReadable: true,
    notes: [],
  }
}

test('clinical approval permits derivative preparation but never learner-ready directly', () => {
  const result = evaluateEchoClinicalReview(dcm, approvedSubmission(dcm.candidateId))
  assert.equal(result.decision, 'approve-derivative')
  assert.equal(result.learnerReady, false)
  assert.equal(canPrepareGovernedDerivative(result), true)
})

test('privacy failure rejects candidate fail closed', () => {
  const submission = approvedSubmission(dcm.candidateId)
  submission.privacyFinalReviewPassed = false
  const result = evaluateEchoClinicalReview(dcm, submission)
  assert.equal(result.decision, 'reject')
  assert.equal(result.derivativeAllowed, false)
  assert.ok(result.blockingIssues.includes('privacy-final-review-failed'))
})

test('readability or motion uncertainty holds rather than promotes', () => {
  const submission = approvedSubmission(dcm.candidateId)
  submission.motionSufficientForTeaching = false
  submission.ipadReadable = false
  const result = evaluateEchoClinicalReview(dcm, submission)
  assert.equal(result.decision, 'hold')
  assert.equal(result.derivativeAllowed, false)
})

test('pericardial effusion has a governed skill and no remaining graph gap', () => {
  validateEchoSkillGraph()
  const skill = getEchoSkill('echo.pericardium.effusion-pattern')
  assert.equal(skill.domain, 'pericardial-patterns')
  assert.match(skill.measurableOutcome, /without inferring tamponade/i)
  const summary = summarizeEchoBatch01ClinicalPromotion()
  assert.deepEqual(summary.skillGraphGaps, [])
})

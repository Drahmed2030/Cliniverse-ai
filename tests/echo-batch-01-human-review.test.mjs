import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECHO_BATCH_01_REVIEW_ARTIFACTS,
  evaluateEchoBatchHumanReview,
} from '../app/lib/clinicalMedia/echoBatch01HumanReview.ts'

const artifact = ECHO_BATCH_01_REVIEW_ARTIFACTS[0]

function clinical(overrides = {}) {
  return {
    candidateId: artifact.candidateId,
    artifactSha256: artifact.derivativeSha256,
    reviewerName: 'Clinical Reviewer',
    reviewerQualifications: 'Cardiology / Echocardiography',
    reviewedAt: '2026-09-07',
    environment: 'controlled cine review',
    viewConfirmed: 'PASS',
    sourceLabelSuitableAsTeachingContext: 'PASS',
    teachingFocusSupported: 'PASS',
    motionSufficientForTeaching: 'PASS',
    anatomyAndOverlaysAcceptable: 'PASS',
    prohibitedClaimsAccepted: 'PASS',
    notes: [],
    ...overrides,
  }
}

function privacy(overrides = {}) {
  return {
    candidateId: artifact.candidateId,
    artifactSha256: artifact.derivativeSha256,
    reviewerName: 'Privacy Reviewer',
    reviewerRole: 'privacy-provenance-reviewer',
    reviewedAt: '2026-09-07',
    noDirectIdentifiers: 'PASS',
    noDisallowedDateTime: 'PASS',
    residualAnnotationsAccepted: 'PASS',
    provenanceAccepted: 'PASS',
    attributionPlanAccepted: 'PASS',
    notes: [],
    ...overrides,
  }
}

test('intact batch review artifacts are six unique SHA-bound candidates', () => {
  assert.equal(ECHO_BATCH_01_REVIEW_ARTIFACTS.length, 6)
  assert.equal(new Set(ECHO_BATCH_01_REVIEW_ARTIFACTS.map(item => item.candidateId)).size, 6)
  assert.equal(new Set(ECHO_BATCH_01_REVIEW_ARTIFACTS.map(item => item.derivativeSha256)).size, 6)
})

test('human review remains pending when privacy review is absent', () => {
  const result = evaluateEchoBatchHumanReview(clinical(), null)
  assert.equal(result.clinicalState, 'cleared')
  assert.equal(result.privacyState, 'pending')
  assert.equal(result.humanReviewCleared, false)
  assert.equal(result.learnerReady, false)
  assert.equal(result.binaryCommitEligible, false)
})

test('HOLD decision fails closed', () => {
  const result = evaluateEchoBatchHumanReview(clinical({ motionSufficientForTeaching: 'HOLD' }), privacy())
  assert.equal(result.clinicalState, 'hold')
  assert.equal(result.humanReviewCleared, false)
  assert.equal(result.learnerReady, false)
})

test('REJECT decision fails closed', () => {
  const result = evaluateEchoBatchHumanReview(clinical({ teachingFocusSupported: 'REJECT' }), privacy())
  assert.equal(result.clinicalState, 'rejected')
  assert.equal(result.humanReviewCleared, false)
})

test('checksum mismatch cannot be reviewed', () => {
  assert.throws(
    () => evaluateEchoBatchHumanReview(clinical({ artifactSha256: '0'.repeat(64) }), privacy()),
    /checksum mismatch/,
  )
})

test('complete human review still does not authorize binary inclusion or learner-ready', () => {
  const result = evaluateEchoBatchHumanReview(clinical(), privacy())
  assert.equal(result.humanReviewCleared, true)
  assert.equal(result.binaryCommitEligible, false)
  assert.equal(result.learnerReady, false)
  assert.ok(result.blockers.includes('device-playback-pending'))
  assert.ok(result.blockers.includes('post-review-quality-gate-pending'))
})

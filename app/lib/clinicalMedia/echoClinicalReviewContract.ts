import type { EchoClinicalPromotionRecord } from './echoBatch01ClinicalPromotion.ts'

export type EchoClinicalReviewDecision = 'approve-derivative' | 'hold' | 'reject'

export interface EchoClinicalReviewSubmission {
  candidateId: string
  reviewerRole: 'cardiology-echo-reviewer'
  viewConfirmed: boolean
  sourceLabelConsistentWithVisiblePattern: boolean
  teachingObjectivesSupported: boolean
  prohibitedClaimsAccepted: boolean
  privacyFinalReviewPassed: boolean
  motionSufficientForTeaching: boolean
  overlaysAcceptableForDerivativePlanning: boolean
  mobileReadable: boolean
  ipadReadable: boolean
  desktopReadable: boolean
  notes: readonly string[]
}

export interface EchoClinicalReviewResult {
  candidateId: string
  decision: EchoClinicalReviewDecision
  blockingIssues: readonly string[]
  derivativeAllowed: boolean
  learnerReady: false
}

export function evaluateEchoClinicalReview(
  record: EchoClinicalPromotionRecord,
  submission: EchoClinicalReviewSubmission,
): EchoClinicalReviewResult {
  if (submission.candidateId !== record.candidateId) {
    throw new Error(`Clinical review candidate mismatch: ${submission.candidateId}`)
  }

  const blockingIssues: string[] = []
  if (!submission.viewConfirmed) blockingIssues.push('view-not-confirmed')
  if (!submission.sourceLabelConsistentWithVisiblePattern) blockingIssues.push('source-label-not-supported')
  if (!submission.teachingObjectivesSupported) blockingIssues.push('teaching-objectives-not-supported')
  if (!submission.prohibitedClaimsAccepted) blockingIssues.push('teaching-boundary-not-accepted')
  if (!submission.privacyFinalReviewPassed) blockingIssues.push('privacy-final-review-failed')
  if (!submission.motionSufficientForTeaching) blockingIssues.push('motion-insufficient')
  if (!submission.overlaysAcceptableForDerivativePlanning) blockingIssues.push('overlay-risk')
  if (!submission.mobileReadable) blockingIssues.push('mobile-readability-failed')
  if (!submission.ipadReadable) blockingIssues.push('ipad-readability-failed')
  if (!submission.desktopReadable) blockingIssues.push('desktop-readability-failed')

  if (!submission.sourceLabelConsistentWithVisiblePattern || !submission.privacyFinalReviewPassed) {
    return {
      candidateId: record.candidateId,
      decision: 'reject',
      blockingIssues,
      derivativeAllowed: false,
      learnerReady: false,
    }
  }

  if (blockingIssues.length) {
    return {
      candidateId: record.candidateId,
      decision: 'hold',
      blockingIssues,
      derivativeAllowed: false,
      learnerReady: false,
    }
  }

  return {
    candidateId: record.candidateId,
    decision: 'approve-derivative',
    blockingIssues: [],
    derivativeAllowed: true,
    learnerReady: false,
  }
}

/**
 * A successful clinical review only permits derivative preparation.
 * Learner-ready still requires governed derivative creation, checksum,
 * post-derivative privacy/media review and final quality-gate evaluation.
 */
export function canPrepareGovernedDerivative(result: EchoClinicalReviewResult): boolean {
  return result.decision === 'approve-derivative' && result.derivativeAllowed && !result.learnerReady
}

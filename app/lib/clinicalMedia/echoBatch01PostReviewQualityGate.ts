export type EchoPostReviewDecision = 'PASS' | 'HOLD' | 'REJECT'

export interface EchoPostReviewQualitySubmission {
  candidateId: string
  artifactSha256: string
  reviewerName: string
  reviewedAt: string
  clinicalReviewCleared: boolean
  privacyReviewCleared: boolean
  legacyQuickTimePlaybackPassed: boolean
  legacySafariPlaybackPassed: boolean
  currentIPhonePlaybackPassed: boolean
  currentIPadPlaybackStatus: 'PASS' | 'PENDING_NOT_AVAILABLE' | 'HOLD' | 'FAIL'
  checksumReverifiedAfterDeviceReview: EchoPostReviewDecision
  sourceAndLicenseEvidenceIntact: EchoPostReviewDecision
  teachingFocusStillMatchesArtifact: EchoPostReviewDecision
  prohibitedClaimsStillEnforced: EchoPostReviewDecision
  mediaIntegrityUnchanged: EchoPostReviewDecision
  playerIntegrationPathStable: EchoPostReviewDecision
  notes: readonly string[]
}

export interface EchoPostReviewQualityResult {
  candidateId: string
  artifactSha256: string
  state: 'pending-human-review' | 'hold' | 'rejected' | 'quality-cleared'
  postReviewQualityCleared: boolean
  learnerReady: false
  binaryCommitEligible: false
  blockers: readonly string[]
}

function classify(decisions: readonly EchoPostReviewDecision[]): 'hold' | 'rejected' | 'quality-cleared' {
  if (decisions.includes('REJECT')) return 'rejected'
  if (decisions.includes('HOLD')) return 'hold'
  return 'quality-cleared'
}

export function evaluateEchoBatch01PostReviewQualityGate(
  submission: EchoPostReviewQualitySubmission,
): EchoPostReviewQualityResult {
  const blockers: string[] = []

  if (!submission.reviewerName.trim()) throw new Error('Post-review quality gate requires reviewer name')
  if (!submission.reviewedAt.trim()) throw new Error('Post-review quality gate requires review date')

  if (!submission.clinicalReviewCleared || !submission.privacyReviewCleared) {
    blockers.push(
      !submission.clinicalReviewCleared ? 'specialist-clinical-review-pending' : '',
      !submission.privacyReviewCleared ? 'final-privacy-review-pending' : '',
    )
    return {
      candidateId: submission.candidateId,
      artifactSha256: submission.artifactSha256,
      state: 'pending-human-review',
      postReviewQualityCleared: false,
      learnerReady: false,
      binaryCommitEligible: false,
      blockers: blockers.filter(Boolean),
    }
  }

  if (!submission.legacyQuickTimePlaybackPassed) blockers.push('legacy-quicktime-playback-not-passed')
  if (!submission.legacySafariPlaybackPassed) blockers.push('legacy-safari-playback-not-passed')
  if (!submission.currentIPhonePlaybackPassed) blockers.push('current-iphone-playback-not-passed')
  if (submission.currentIPadPlaybackStatus === 'HOLD') blockers.push('ipad-playback-hold')
  if (submission.currentIPadPlaybackStatus === 'FAIL') blockers.push('ipad-playback-fail')

  const state = classify([
    submission.checksumReverifiedAfterDeviceReview,
    submission.sourceAndLicenseEvidenceIntact,
    submission.teachingFocusStillMatchesArtifact,
    submission.prohibitedClaimsStillEnforced,
    submission.mediaIntegrityUnchanged,
    submission.playerIntegrationPathStable,
  ])

  if (state !== 'quality-cleared') blockers.push(`post-review-quality-${state}`)
  if (submission.currentIPadPlaybackStatus === 'PENDING_NOT_AVAILABLE') blockers.push('ipad-evidence-pending-nonblocking-for-batch-closure')

  const postReviewQualityCleared = state === 'quality-cleared' &&
    submission.legacyQuickTimePlaybackPassed &&
    submission.legacySafariPlaybackPassed &&
    submission.currentIPhonePlaybackPassed &&
    submission.currentIPadPlaybackStatus !== 'HOLD' &&
    submission.currentIPadPlaybackStatus !== 'FAIL'

  return {
    candidateId: submission.candidateId,
    artifactSha256: submission.artifactSha256,
    state: postReviewQualityCleared ? 'quality-cleared' : (state === 'rejected' ? 'rejected' : 'hold'),
    postReviewQualityCleared,
    learnerReady: false,
    binaryCommitEligible: false,
    blockers,
  }
}

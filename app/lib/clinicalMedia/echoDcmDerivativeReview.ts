export const DCM_CANDIDATE_ID = 'echo-a4c-dcm-e00476' as const
export const DCM_DERIVATIVE_SHA256 = '7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f' as const

export type DcmDerivativeReviewState = 'pending' | 'hold' | 'approved-for-binary-inclusion' | 'rejected'

export interface DcmSpecialistClinicalReview {
  reviewerRole: 'cardiology-echo-reviewer'
  artifactSha256: string
  a4cViewConfirmed: boolean
  dcmPatternSuitableForTeaching: boolean
  globalLvFunctionTeachingSupported: boolean
  chamberDilationTeachingSupported: boolean
  motionAndLoopSufficientForTeaching: boolean
  preservedAnnotationsDoNotObscureAnatomy: boolean
  numericalEfClaimsExcluded: boolean
  etiologyClaimsExcluded: boolean
  hemodynamicClaimsExcluded: boolean
  treatmentClaimsExcluded: boolean
  notes: readonly string[]
}

export interface DcmFinalPrivacyReview {
  reviewerRole: 'privacy-provenance-reviewer'
  artifactSha256: string
  noDirectPatientIdentifiers: boolean
  noDisallowedAcquisitionDateTime: boolean
  sourceCreditsAndProvenanceAcceptable: boolean
  residualAnnotationsReviewed: boolean
  redistributionAttributionPlanAccepted: boolean
  notes: readonly string[]
}

export interface DcmPlaybackVerification {
  artifactSha256: string
  iphoneSafariPassed: boolean
  ipadSafariPassed: boolean
  desktopSafariPassed: boolean
  motionStableOnDevices: boolean
  anatomyReadableOnDevices: boolean
  notes: readonly string[]
}

export interface DcmDerivativeGateResult {
  candidateId: typeof DCM_CANDIDATE_ID
  artifactSha256: typeof DCM_DERIVATIVE_SHA256
  state: DcmDerivativeReviewState
  blockingIssues: readonly string[]
  binaryCommitEligible: boolean
  learnerReady: false
}

function assertBoundChecksum(actual: string, reviewType: string): void {
  if (actual !== DCM_DERIVATIVE_SHA256) {
    throw new Error(`${reviewType} artifact checksum mismatch`)
  }
}

export function evaluateDcmDerivativeReview(
  clinical: DcmSpecialistClinicalReview | null,
  privacy: DcmFinalPrivacyReview | null,
  playback: DcmPlaybackVerification | null,
): DcmDerivativeGateResult {
  const blockingIssues: string[] = []

  if (!clinical) blockingIssues.push('specialist-clinical-review-pending')
  if (!privacy) blockingIssues.push('final-privacy-review-pending')
  if (!playback) blockingIssues.push('physical-device-playback-pending')

  if (clinical) {
    assertBoundChecksum(clinical.artifactSha256, 'clinical-review')
    if (!clinical.a4cViewConfirmed) blockingIssues.push('a4c-view-not-confirmed')
    if (!clinical.dcmPatternSuitableForTeaching) blockingIssues.push('dcm-pattern-not-suitable')
    if (!clinical.globalLvFunctionTeachingSupported) blockingIssues.push('global-lv-function-teaching-not-supported')
    if (!clinical.chamberDilationTeachingSupported) blockingIssues.push('chamber-dilation-teaching-not-supported')
    if (!clinical.motionAndLoopSufficientForTeaching) blockingIssues.push('motion-loop-insufficient')
    if (!clinical.preservedAnnotationsDoNotObscureAnatomy) blockingIssues.push('annotations-obscure-anatomy')
    if (!clinical.numericalEfClaimsExcluded) blockingIssues.push('numerical-ef-boundary-not-accepted')
    if (!clinical.etiologyClaimsExcluded) blockingIssues.push('etiology-boundary-not-accepted')
    if (!clinical.hemodynamicClaimsExcluded) blockingIssues.push('hemodynamic-boundary-not-accepted')
    if (!clinical.treatmentClaimsExcluded) blockingIssues.push('treatment-boundary-not-accepted')
  }

  if (privacy) {
    assertBoundChecksum(privacy.artifactSha256, 'privacy-review')
    if (!privacy.noDirectPatientIdentifiers) blockingIssues.push('direct-identifier-risk')
    if (!privacy.noDisallowedAcquisitionDateTime) blockingIssues.push('acquisition-date-time-risk')
    if (!privacy.sourceCreditsAndProvenanceAcceptable) blockingIssues.push('source-provenance-review-failed')
    if (!privacy.residualAnnotationsReviewed) blockingIssues.push('residual-annotations-not-reviewed')
    if (!privacy.redistributionAttributionPlanAccepted) blockingIssues.push('attribution-plan-not-accepted')
  }

  if (playback) {
    assertBoundChecksum(playback.artifactSha256, 'playback-review')
    if (!playback.iphoneSafariPassed) blockingIssues.push('iphone-safari-playback-failed')
    if (!playback.ipadSafariPassed) blockingIssues.push('ipad-safari-playback-failed')
    if (!playback.desktopSafariPassed) blockingIssues.push('desktop-safari-playback-failed')
    if (!playback.motionStableOnDevices) blockingIssues.push('device-motion-stability-failed')
    if (!playback.anatomyReadableOnDevices) blockingIssues.push('device-anatomy-readability-failed')
  }

  const hardReject = blockingIssues.some(issue =>
    ['direct-identifier-risk', 'source-provenance-review-failed', 'dcm-pattern-not-suitable', 'a4c-view-not-confirmed'].includes(issue),
  )

  return {
    candidateId: DCM_CANDIDATE_ID,
    artifactSha256: DCM_DERIVATIVE_SHA256,
    state: hardReject ? 'rejected' : blockingIssues.length ? 'hold' : 'approved-for-binary-inclusion',
    blockingIssues,
    binaryCommitEligible: !hardReject && blockingIssues.length === 0,
    learnerReady: false,
  }
}

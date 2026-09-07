import {
  DCM_CANDIDATE_ID,
  DCM_DERIVATIVE_SHA256,
  evaluateDcmDerivativeReview,
  type DcmFinalPrivacyReview,
  type DcmSpecialistClinicalReview,
} from './echoDcmDerivativeReview.ts'

export type DcmClinicalPrivacyClosureState =
  | 'awaiting-specialist'
  | 'awaiting-privacy'
  | 'clinical-privacy-cleared'
  | 'rejected'

export interface DcmClinicalPrivacyClosureResult {
  candidateId: typeof DCM_CANDIDATE_ID
  artifactSha256: typeof DCM_DERIVATIVE_SHA256
  state: DcmClinicalPrivacyClosureState
  blockingIssues: readonly string[]
  specialistClinicalComplete: boolean
  finalPrivacyComplete: boolean
  devicePlaybackDeferred: true
  devicePlaybackRequiredBeforeBinaryInclusion: true
  binaryCommitEligible: false
  learnerReady: false
}

/**
 * Closes only the human clinical/privacy portion of the DCM review.
 *
 * This deliberately does not relax the full derivative release gate:
 * physical Apple playback remains required before binary inclusion, and
 * learner-ready still requires the downstream Echo quality/release gates.
 */
export function evaluateDcmClinicalPrivacyClosure(
  clinical: DcmSpecialistClinicalReview | null,
  privacy: DcmFinalPrivacyReview | null,
): DcmClinicalPrivacyClosureResult {
  const fullGate = evaluateDcmDerivativeReview(clinical, privacy, null)
  const blockingIssues = fullGate.blockingIssues.filter(issue => issue !== 'physical-device-playback-pending')

  const clinicalIssues = new Set([
    'a4c-view-not-confirmed',
    'dcm-pattern-not-suitable',
    'global-lv-function-teaching-not-supported',
    'chamber-dilation-teaching-not-supported',
    'motion-loop-insufficient',
    'annotations-obscure-anatomy',
    'numerical-ef-boundary-not-accepted',
    'etiology-boundary-not-accepted',
    'hemodynamic-boundary-not-accepted',
    'treatment-boundary-not-accepted',
  ])
  const privacyIssues = new Set([
    'direct-identifier-risk',
    'acquisition-date-time-risk',
    'source-provenance-review-failed',
    'residual-annotations-not-reviewed',
    'attribution-plan-not-accepted',
  ])

  const specialistClinicalComplete = Boolean(clinical) && !blockingIssues.some(issue => clinicalIssues.has(issue))
  const finalPrivacyComplete = Boolean(privacy) && !blockingIssues.some(issue => privacyIssues.has(issue))
  const hardReject = fullGate.state === 'rejected'

  const state: DcmClinicalPrivacyClosureState = hardReject
    ? 'rejected'
    : !specialistClinicalComplete
      ? 'awaiting-specialist'
      : !finalPrivacyComplete
        ? 'awaiting-privacy'
        : 'clinical-privacy-cleared'

  return {
    candidateId: DCM_CANDIDATE_ID,
    artifactSha256: DCM_DERIVATIVE_SHA256,
    state,
    blockingIssues,
    specialistClinicalComplete,
    finalPrivacyComplete,
    devicePlaybackDeferred: true,
    devicePlaybackRequiredBeforeBinaryInclusion: true,
    binaryCommitEligible: false,
    learnerReady: false,
  }
}

export const APICAL_HCM_CANDIDATE_ID = 'echo-a4c-apical-hcm-e00291' as const
export const APICAL_HCM_SOURCE_SHA256 = 'e23aa565789effcae9728fc8e9a4b71e6a90062e8c0014e4fe85899bd419f97a' as const

export type ApicalHcmReadinessState = 'clinical-review-required' | 'derivative-ready' | 'rejected'

export interface ApicalHcmClinicalReviewSubmission {
  reviewerRole: 'cardiology-echo-reviewer'
  sourceSha256: string
  a4cViewConfirmed: boolean
  sourceLabelConsistentWithVisiblePattern: boolean
  apicalPatternSuitableForTeaching: boolean
  discriminationAgainstNormalSupported: boolean
  motionSufficientForTeaching: boolean
  preservedOverlaysDoNotObscureApicalAnatomy: boolean
  wallThicknessMeasurementExcluded: boolean
  lvotObstructionClaimExcluded: boolean
  genotypeInferenceExcluded: boolean
  prognosisExcluded: boolean
  independentDiagnosisExcluded: boolean
  notes: readonly string[]
}

export interface ApicalHcmPrivacyReviewSubmission {
  reviewerRole: 'privacy-provenance-reviewer'
  sourceSha256: string
  noDirectPatientIdentifiers: boolean
  noDisallowedAcquisitionDateTime: boolean
  residualAnnotationsReviewed: boolean
  sourceCreditsAndProvenanceAcceptable: boolean
  redistributionAttributionPlanAccepted: boolean
  notes: readonly string[]
}

export interface ApicalHcmReadinessResult {
  candidateId: typeof APICAL_HCM_CANDIDATE_ID
  sourceSha256: typeof APICAL_HCM_SOURCE_SHA256
  state: ApicalHcmReadinessState
  blockingIssues: readonly string[]
  governedDerivativeAllowed: boolean
  binaryCommitEligible: false
  learnerReady: false
}

function assertSourceBound(actual: string, context: string): void {
  if (actual !== APICAL_HCM_SOURCE_SHA256) throw new Error(`${context} source checksum mismatch`)
}

export function evaluateApicalHcmReadiness(
  clinical: ApicalHcmClinicalReviewSubmission | null,
  privacy: ApicalHcmPrivacyReviewSubmission | null,
): ApicalHcmReadinessResult {
  const blockingIssues: string[] = []

  if (!clinical) blockingIssues.push('specialist-clinical-review-pending')
  if (!privacy) blockingIssues.push('final-privacy-review-pending')

  if (clinical) {
    assertSourceBound(clinical.sourceSha256, 'clinical-review')
    if (!clinical.a4cViewConfirmed) blockingIssues.push('a4c-view-not-confirmed')
    if (!clinical.sourceLabelConsistentWithVisiblePattern) blockingIssues.push('source-label-not-supported')
    if (!clinical.apicalPatternSuitableForTeaching) blockingIssues.push('apical-pattern-not-suitable')
    if (!clinical.discriminationAgainstNormalSupported) blockingIssues.push('normal-discrimination-not-supported')
    if (!clinical.motionSufficientForTeaching) blockingIssues.push('motion-insufficient')
    if (!clinical.preservedOverlaysDoNotObscureApicalAnatomy) blockingIssues.push('overlays-obscure-apical-anatomy')
    if (!clinical.wallThicknessMeasurementExcluded) blockingIssues.push('wall-thickness-boundary-not-accepted')
    if (!clinical.lvotObstructionClaimExcluded) blockingIssues.push('lvot-boundary-not-accepted')
    if (!clinical.genotypeInferenceExcluded) blockingIssues.push('genotype-boundary-not-accepted')
    if (!clinical.prognosisExcluded) blockingIssues.push('prognosis-boundary-not-accepted')
    if (!clinical.independentDiagnosisExcluded) blockingIssues.push('independent-diagnosis-boundary-not-accepted')
  }

  if (privacy) {
    assertSourceBound(privacy.sourceSha256, 'privacy-review')
    if (!privacy.noDirectPatientIdentifiers) blockingIssues.push('direct-identifier-risk')
    if (!privacy.noDisallowedAcquisitionDateTime) blockingIssues.push('acquisition-date-time-risk')
    if (!privacy.residualAnnotationsReviewed) blockingIssues.push('residual-annotations-not-reviewed')
    if (!privacy.sourceCreditsAndProvenanceAcceptable) blockingIssues.push('source-provenance-review-failed')
    if (!privacy.redistributionAttributionPlanAccepted) blockingIssues.push('attribution-plan-not-accepted')
  }

  const hardReject = blockingIssues.some(issue => [
    'direct-identifier-risk',
    'source-provenance-review-failed',
    'a4c-view-not-confirmed',
    'source-label-not-supported',
    'apical-pattern-not-suitable',
  ].includes(issue))

  return {
    candidateId: APICAL_HCM_CANDIDATE_ID,
    sourceSha256: APICAL_HCM_SOURCE_SHA256,
    state: hardReject ? 'rejected' : blockingIssues.length ? 'clinical-review-required' : 'derivative-ready',
    blockingIssues,
    governedDerivativeAllowed: !hardReject && blockingIssues.length === 0,
    binaryCommitEligible: false,
    learnerReady: false,
  }
}

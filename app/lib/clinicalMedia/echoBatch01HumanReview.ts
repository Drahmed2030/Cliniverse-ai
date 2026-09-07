export type BatchHumanReviewDecision = 'PASS' | 'HOLD' | 'REJECT'

export interface EchoBatchHumanReviewArtifact {
  candidateId: string
  derivativeSha256: string
  teachingFocus: string
  prohibitedClaims: readonly string[]
}

export interface EchoBatchClinicalReviewSubmission {
  candidateId: string
  artifactSha256: string
  reviewerName: string
  reviewerQualifications: string
  reviewedAt: string
  environment: string
  viewConfirmed: BatchHumanReviewDecision
  sourceLabelSuitableAsTeachingContext: BatchHumanReviewDecision
  teachingFocusSupported: BatchHumanReviewDecision
  motionSufficientForTeaching: BatchHumanReviewDecision
  anatomyAndOverlaysAcceptable: BatchHumanReviewDecision
  prohibitedClaimsAccepted: BatchHumanReviewDecision
  notes: readonly string[]
}

export interface EchoBatchPrivacyReviewSubmission {
  candidateId: string
  artifactSha256: string
  reviewerName: string
  reviewerRole: string
  reviewedAt: string
  noDirectIdentifiers: BatchHumanReviewDecision
  noDisallowedDateTime: BatchHumanReviewDecision
  residualAnnotationsAccepted: BatchHumanReviewDecision
  provenanceAccepted: BatchHumanReviewDecision
  attributionPlanAccepted: BatchHumanReviewDecision
  notes: readonly string[]
}

export interface EchoBatchHumanReviewResult {
  candidateId: string
  artifactSha256: string
  clinicalState: 'pending' | 'hold' | 'rejected' | 'cleared'
  privacyState: 'pending' | 'hold' | 'rejected' | 'cleared'
  humanReviewCleared: boolean
  binaryCommitEligible: false
  learnerReady: false
  blockers: readonly string[]
}

export const ECHO_BATCH_01_REVIEW_ARTIFACTS: readonly EchoBatchHumanReviewArtifact[] = [
  {
    candidateId: 'echo-a4c-pericardial-effusion-e00674',
    derivativeSha256: 'ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a',
    teachingFocus: 'Qualitative pericardial-space pattern recognition',
    prohibitedClaims: ['tamponade-inference','size-quantification','hemodynamic-compromise','treatment-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
  {
    candidateId: 'echo-a4c-severe-hcm-mm0002',
    derivativeSha256: '39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913',
    teachingFocus: 'Source-supported hypertrophic pattern recognition',
    prohibitedClaims: ['wall-thickness-measurement','lvot-obstruction-inference','genotype-inference','prognosis','treatment-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
  {
    candidateId: 'echo-a4c-severe-ms-e00613',
    derivativeSha256: 'c9db61d29ae454e9967023aa0b2ce3e218b333b4b199f6394b8665199616f274',
    teachingFocus: 'Source-supported mitral stenosis pattern recognition',
    prohibitedClaims: ['valve-area-calculation','pressure-gradient-quantification','hemodynamic-severity','treatment-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
  {
    candidateId: 'echo-a3c-severe-ar-e00234',
    derivativeSha256: '13f3d791637cdc7e8704fd36fc98269b458afc0d472f03ca1349540b09ca91cc',
    teachingFocus: 'Source-supported aortic regurgitation pattern recognition',
    prohibitedClaims: ['vena-contracta','pressure-half-time','regurgitant-volume','hemodynamic-severity','treatment-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
  {
    candidateId: 'echo-psax-severe-as-e00261',
    derivativeSha256: '1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715',
    teachingFocus: 'Source-supported stenotic aortic valve pattern recognition',
    prohibitedClaims: ['valve-area-calculation','gradient-calculation','velocity-calculation','intervention-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
  {
    candidateId: 'echo-a4c-arvd-e00299',
    derivativeSha256: '2e83143bd1e969b4b53349687cc2371cc9896c54e7c2c475659c7bb1b767c97b',
    teachingFocus: 'Source-supported RV/cardiomyopathy pattern recognition',
    prohibitedClaims: ['independent-arvc-diagnosis','genetic-inference','risk-inference','prognosis','treatment-recommendation','independent-diagnosis-from-one-clip','exclusion-of-alternative-pathology','learner-discrimination-before-specialist-approval','unsupported-measurements','numerical-ef'],
  },
] as const

function findArtifact(candidateId: string): EchoBatchHumanReviewArtifact {
  const artifact = ECHO_BATCH_01_REVIEW_ARTIFACTS.find(item => item.candidateId === candidateId)
  if (!artifact) throw new Error(`Candidate is not an intact Batch 01 review artifact: ${candidateId}`)
  return artifact
}

function requireAttestation(value: string, field: string): void {
  if (!value.trim()) throw new Error(`Human review requires ${field}`)
}

function classify(decisions: readonly BatchHumanReviewDecision[]): 'hold' | 'rejected' | 'cleared' {
  if (decisions.includes('REJECT')) return 'rejected'
  if (decisions.includes('HOLD')) return 'hold'
  return 'cleared'
}

export function evaluateEchoBatchHumanReview(
  clinical: EchoBatchClinicalReviewSubmission | null,
  privacy: EchoBatchPrivacyReviewSubmission | null,
): EchoBatchHumanReviewResult {
  const candidateId = clinical?.candidateId ?? privacy?.candidateId
  if (!candidateId) throw new Error('At least one human review submission is required')
  if (clinical && privacy && clinical.candidateId !== privacy.candidateId) throw new Error('Clinical/privacy candidate mismatch')

  const artifact = findArtifact(candidateId)
  const blockers: string[] = []

  let clinicalState: EchoBatchHumanReviewResult['clinicalState'] = 'pending'
  if (clinical) {
    if (clinical.artifactSha256 !== artifact.derivativeSha256) throw new Error('Clinical review artifact checksum mismatch')
    requireAttestation(clinical.reviewerName, 'clinical reviewer name')
    requireAttestation(clinical.reviewerQualifications, 'clinical reviewer qualifications')
    requireAttestation(clinical.reviewedAt, 'clinical review date')
    requireAttestation(clinical.environment, 'clinical review environment')
    clinicalState = classify([
      clinical.viewConfirmed,
      clinical.sourceLabelSuitableAsTeachingContext,
      clinical.teachingFocusSupported,
      clinical.motionSufficientForTeaching,
      clinical.anatomyAndOverlaysAcceptable,
      clinical.prohibitedClaimsAccepted,
    ])
    if (clinicalState !== 'cleared') blockers.push(`clinical-${clinicalState}`)
  } else blockers.push('specialist-clinical-review-pending')

  let privacyState: EchoBatchHumanReviewResult['privacyState'] = 'pending'
  if (privacy) {
    if (privacy.artifactSha256 !== artifact.derivativeSha256) throw new Error('Privacy review artifact checksum mismatch')
    requireAttestation(privacy.reviewerName, 'privacy reviewer name')
    requireAttestation(privacy.reviewerRole, 'privacy reviewer role')
    requireAttestation(privacy.reviewedAt, 'privacy review date')
    privacyState = classify([
      privacy.noDirectIdentifiers,
      privacy.noDisallowedDateTime,
      privacy.residualAnnotationsAccepted,
      privacy.provenanceAccepted,
      privacy.attributionPlanAccepted,
    ])
    if (privacyState !== 'cleared') blockers.push(`privacy-${privacyState}`)
  } else blockers.push('final-privacy-review-pending')

  const humanReviewCleared = clinicalState === 'cleared' && privacyState === 'cleared'
  if (humanReviewCleared) blockers.push('device-playback-pending', 'post-review-quality-gate-pending')

  return {
    candidateId,
    artifactSha256: artifact.derivativeSha256,
    clinicalState,
    privacyState,
    humanReviewCleared,
    binaryCommitEligible: false,
    learnerReady: false,
    blockers,
  }
}

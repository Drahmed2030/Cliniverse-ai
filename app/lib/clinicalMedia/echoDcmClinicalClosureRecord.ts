import { DCM_CANDIDATE_ID, DCM_DERIVATIVE_SHA256 } from './echoDcmDerivativeReview.ts'

export type DcmHumanDecision = 'PASS' | 'HOLD' | 'REJECT'

export interface DcmClinicalClosureRecord {
  candidateId: typeof DCM_CANDIDATE_ID
  artifactSha256: typeof DCM_DERIVATIVE_SHA256
  reviewerName: string
  reviewerQualifications: string
  reviewedAtIso: string
  environment: string
  artifactIdentity: DcmHumanDecision
  a4cView: DcmHumanDecision
  sourceDcmLabel: DcmHumanDecision
  globalLvFunctionTeaching: DcmHumanDecision
  chamberDilationTeaching: DcmHumanDecision
  motionSufficiency: DcmHumanDecision
  overlayAnatomy: DcmHumanDecision
  privacyFrames: DcmHumanDecision
  privacyProvenance: DcmHumanDecision
  licenseAttribution: DcmHumanDecision
  audio: DcmHumanDecision
  teachingCopy: DcmHumanDecision
  revisedTeachingCopy?: string
  notes: readonly string[]
}

export interface DcmClinicalClosureSummary {
  state: 'pending' | 'hold' | 'rejected' | 'clinical-privacy-cleared'
  blockingFields: readonly string[]
  humanAttestationComplete: boolean
  learnerReady: false
  binaryCommitEligible: false
}

const REQUIRED_DECISION_FIELDS: readonly (keyof DcmClinicalClosureRecord)[] = [
  'artifactIdentity', 'a4cView', 'sourceDcmLabel', 'globalLvFunctionTeaching', 'chamberDilationTeaching',
  'motionSufficiency', 'overlayAnatomy', 'privacyFrames', 'privacyProvenance', 'licenseAttribution', 'audio', 'teachingCopy',
] as const

export function evaluateDcmClinicalClosure(record: DcmClinicalClosureRecord | null): DcmClinicalClosureSummary {
  if (!record) return { state: 'pending', blockingFields: ['human-review-not-submitted'], humanAttestationComplete: false, learnerReady: false, binaryCommitEligible: false }
  if (record.candidateId !== DCM_CANDIDATE_ID || record.artifactSha256 !== DCM_DERIVATIVE_SHA256) {
    throw new Error('DCM clinical closure artifact identity mismatch')
  }

  const attestationComplete = Boolean(
    record.reviewerName.trim() && record.reviewerQualifications.trim() && record.reviewedAtIso.trim() && record.environment.trim(),
  )
  const rejected = REQUIRED_DECISION_FIELDS.filter(field => record[field] === 'REJECT')
  const held = REQUIRED_DECISION_FIELDS.filter(field => record[field] !== 'PASS')

  if (!attestationComplete) {
    return { state: 'hold', blockingFields: ['reviewer-attestation-incomplete'], humanAttestationComplete: false, learnerReady: false, binaryCommitEligible: false }
  }
  if (rejected.length) {
    return { state: 'rejected', blockingFields: rejected.map(String), humanAttestationComplete: true, learnerReady: false, binaryCommitEligible: false }
  }
  if (held.length) {
    return { state: 'hold', blockingFields: held.map(String), humanAttestationComplete: true, learnerReady: false, binaryCommitEligible: false }
  }

  return { state: 'clinical-privacy-cleared', blockingFields: [], humanAttestationComplete: true, learnerReady: false, binaryCommitEligible: false }
}

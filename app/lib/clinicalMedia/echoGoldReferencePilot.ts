import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from './licensedEchoAsset.ts'
import {
  evaluateEchoMedia2026,
  canReplaceFoundationReference,
  type EchoMedia2026Candidate,
} from './echoMediaStandard2026.ts'

export const A4C_FOUNDATION_REFERENCE_ID = A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId

export interface EchoGoldReferenceCandidate {
  candidateId: string
  sourcePageUrl: string
  acquisitionEra: 'legacy' | 'modern' | 'unknown'
  rightsState: 'unverified' | 'commercial-reuse-verified'
  mediaState: 'metadata-only' | 'media-reviewed'
  clinicalState: 'unreviewed' | 'view-confirmed'
  standardInput?: EchoMedia2026Candidate
}

export interface EchoGoldReferenceDecision {
  candidateId: string
  decision: 'reject' | 'hold-for-media-review' | 'promote'
  reason: string
  candidateScore: number | null
  foundationScore: number
}

const foundationInput: EchoMedia2026Candidate = {
  candidateId: A4C_FOUNDATION_REFERENCE_ID,
  sourcePageUrl: A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.sourcePageUrl,
  sourceDate: '2007-10-01',
  width: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.width,
  height: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.height,
  framesPerSecond: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.framesPerSecond,
  durationMs: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.durationMs,
  view: 'A4C',
  intendedUse: 'education-only',
  licenseId: A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.licenseId,
  vrtConfirmed: true,
  provenanceVerified: true,
  privacyReviewed: true,
  directIdentifiersVisible: false,
  unexpectedAudio: false,
  clinicallySuitableForViewRecognition: true,
  clinicallySuitableForDiscrimination: false,
  mobileReadable: true,
  ipadReadable: true,
  desktopReadable: true,
  distractingOverlays: true,
  normalReferenceConfirmed: false,
  motionContinuous: true,
  clinicalReviewComplete: false,
}

export const A4C_FOUNDATION_STANDARD_2026 = evaluateEchoMedia2026(foundationInput)

/**
 * Gold promotion is intentionally fail-closed. Search metadata alone can never promote
 * a replacement: the actual media, rights and clinical view must all be reviewed first.
 */
export function evaluateA4cGoldCandidate(candidate: EchoGoldReferenceCandidate): EchoGoldReferenceDecision {
  if (candidate.rightsState !== 'commercial-reuse-verified') {
    return { candidateId: candidate.candidateId, decision: 'reject', reason: 'commercial-reuse-not-verified', candidateScore: null, foundationScore: A4C_FOUNDATION_STANDARD_2026.score }
  }
  if (candidate.mediaState !== 'media-reviewed' || candidate.clinicalState !== 'view-confirmed' || !candidate.standardInput) {
    return { candidateId: candidate.candidateId, decision: 'hold-for-media-review', reason: 'gold-requires-reviewed-media-and-confirmed-view', candidateScore: null, foundationScore: A4C_FOUNDATION_STANDARD_2026.score }
  }

  if (!candidate.standardInput.privacyReviewed || candidate.standardInput.clinicalReviewComplete !== true) {
    return { candidateId: candidate.candidateId, decision: 'hold-for-media-review', reason: 'privacy-or-clinical-review-incomplete', candidateScore: null, foundationScore: A4C_FOUNDATION_STANDARD_2026.score }
  }
  if (candidate.standardInput.candidateId !== candidate.candidateId || candidate.standardInput.sourcePageUrl !== candidate.sourcePageUrl) {
    return { candidateId: candidate.candidateId, decision: 'reject', reason: 'candidate-evidence-identity-mismatch', candidateScore: null, foundationScore: A4C_FOUNDATION_STANDARD_2026.score }
  }
  const candidateStandard = evaluateEchoMedia2026(candidate.standardInput)
  const promotion = canReplaceFoundationReference({ foundation: A4C_FOUNDATION_STANDARD_2026, challenger: candidateStandard })
  return {
    candidateId: candidate.candidateId,
    decision: promotion ? 'promote' : 'reject',
    reason: promotion ? 'candidate-clears-gold-margin' : candidateStandard.blockingIssues.join(',') || 'insufficient-quality-improvement',
    candidateScore: candidateStandard.score,
    foundationScore: A4C_FOUNDATION_STANDARD_2026.score,
  }
}

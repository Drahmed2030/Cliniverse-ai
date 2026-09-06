import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from './licensedEchoAsset.ts'
import {
  evaluateEchoMediaStandard2026,
  shouldPromoteEchoGoldReference,
  type EchoMediaStandard2026Input,
} from './echoMediaStandard2026.ts'

export const A4C_FOUNDATION_REFERENCE_ID = A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId

export interface EchoGoldReferenceCandidate {
  candidateId: string
  sourcePageUrl: string
  acquisitionEra: 'legacy' | 'modern' | 'unknown'
  rightsState: 'unverified' | 'commercial-reuse-verified'
  mediaState: 'metadata-only' | 'media-reviewed'
  clinicalState: 'unreviewed' | 'view-confirmed'
  standardInput?: EchoMediaStandard2026Input
}

export interface EchoGoldReferenceDecision {
  candidateId: string
  decision: 'reject' | 'hold-for-media-review' | 'promote'
  reason: string
  candidateScore: number | null
  foundationScore: number
}

const foundationInput: EchoMediaStandard2026Input = {
  width: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.width,
  height: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.height,
  framesPerSecond: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.framesPerSecond,
  durationMs: A4C_NORMAL_CLINICAL_STUDIO_ASSET.cine.durationMs,
  viewConfirmed: true,
  motionContinuous: true,
  clinicallyUsefulFieldOfView: true,
  distractingOverlay: true,
  mobileReadable: true,
  tabletDesktopReadable: true,
  provenanceVerified: true,
  commercialReuseVerified: true,
  privacyPassed: true,
  discriminationTrainingSuitable: true,
}

export const A4C_FOUNDATION_STANDARD_2026 = evaluateEchoMediaStandard2026(foundationInput)

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

  const candidateStandard = evaluateEchoMediaStandard2026(candidate.standardInput)
  const promotion = shouldPromoteEchoGoldReference(A4C_FOUNDATION_STANDARD_2026, candidateStandard)
  return {
    candidateId: candidate.candidateId,
    decision: promotion.promote ? 'promote' : 'reject',
    reason: promotion.promote ? 'candidate-clears-gold-margin' : promotion.reason,
    candidateScore: candidateStandard.score,
    foundationScore: A4C_FOUNDATION_STANDARD_2026.score,
  }
}

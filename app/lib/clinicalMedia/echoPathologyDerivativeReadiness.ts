import policy from './echoPathologyDerivativePolicy.json' with { type: 'json' }
import { ECHO_BATCH_01_CANDIDATES } from './echoBatch01CandidateRegistry.ts'

export const ECHO_PATHOLOGY_DERIVATIVE_POLICY = policy

export interface PathologySourceScreen {
  candidateId: string
  sourceSha256: string | null
  sourcePageSha256: string | null
  commercialReuseVerified: boolean
  licenseId: string
  completeFrameReview: boolean
  noDirectIdentifiers: boolean
  noUnresolvedDateTime: boolean
  noUnexpectedAudio: boolean
  usableViewContext: boolean
  anatomyPreservable: boolean
  prohibitedClaims: readonly string[]
}

/** Technical local-laboratory permission only. Does not replace Clinical Review Contract. */
export function evaluatePathologySource(screen: PathologySourceScreen) {
  const rule = policy.find(p => p.candidateId === screen.candidateId)
  if (!rule || !ECHO_BATCH_01_CANDIDATES.some(c => c.candidateId === screen.candidateId)) {
    throw new Error('Candidate outside pathology batch scope')
  }
  const blockers: string[] = []
  let reject = false
  if (!screen.sourceSha256) blockers.push('source-inaccessible')
  else if (screen.sourceSha256 !== rule.sourceSha256) {
    blockers.push('source-checksum-mismatch'); reject = true
  }
  if (screen.sourcePageSha256 !== rule.sourcePageSha256 ||
    screen.commercialReuseVerified !== true || screen.licenseId !== 'CC-BY-SA-3.0') {
    blockers.push('rights-or-license-evidence-unverified'); reject = true
  }
  for (const key of ['completeFrameReview', 'noDirectIdentifiers', 'noUnresolvedDateTime',
    'noUnexpectedAudio', 'usableViewContext', 'anatomyPreservable'] as const) {
    if (screen[key] !== true) blockers.push(key)
  }
  for (const claim of rule.prohibitedClaims) {
    if (!screen.prohibitedClaims.includes(claim)) blockers.push(`missing-boundary:${claim}`)
  }
  if (rule.specialistRequiredBeforeTransformation) blockers.push(rule.transformationHoldReason!)
  return {
    candidateId: screen.candidateId,
    disposition: reject ? 'reject' : blockers.length ? 'hold' : 'process-derivative',
    blockers,
    governedPromotionAllowed: false,
    specialistReview: 'pending-human-review',
    finalPrivacyReview: 'pending-human-review',
    devicePlayback: 'pending-observation',
    promotionBlockers: ['specialist-clinical-review-pending', 'final-privacy-review-pending',
      'device-playback-pending', 'post-derivative-governance-required'],
    learnerReady: false,
    binaryCommitEligible: false,
  } as const
}

export function evaluatePathologyBatch(screens: readonly PathologySourceScreen[]) {
  const ids = new Set<string>()
  return screens.map(screen => {
    if (ids.has(screen.candidateId)) throw new Error('Duplicate candidate ID')
    ids.add(screen.candidateId)
    return evaluatePathologySource(screen)
  })
}

export function evaluatePathologyArtifact(screen: PathologySourceScreen, artifact: {
  expectedSha256: string | null
  actualSha256: string | null
  decodePassed: boolean
  completeContactSheetReview: boolean
  clinicalReviewComplete: boolean
  finalPrivacyReviewComplete: boolean
}) {
  const source = evaluatePathologySource(screen)
  const blockers = [...source.blockers]
  if (!artifact.expectedSha256 || !/^[a-f0-9]{64}$/.test(artifact.expectedSha256) ||
    artifact.actualSha256 !== artifact.expectedSha256) blockers.push('derivative-checksum-unverified')
  if (artifact.decodePassed !== true) blockers.push('derivative-decode-unverified')
  if (artifact.completeContactSheetReview !== true) blockers.push('derivative-frame-review-incomplete')
  return {
    ...source,
    disposition: source.disposition === 'reject' ? 'reject' : blockers.length ? 'hold' : 'process-derivative',
    blockers,
    artifactIntegrityVerified: !blockers.length,
    // Human approval is never granted by this technical batch evaluator.
    promotionBlockers: [...source.promotionBlockers,
      ...(artifact.clinicalReviewComplete ? ['clinical-attestation-requires-existing-review-contract'] : []),
      ...(artifact.finalPrivacyReviewComplete ? ['privacy-attestation-requires-existing-review-contract'] : [])],
  }
}

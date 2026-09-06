export type EchoReferenceTier = 'foundation' | 'gold-candidate' | 'gold'

export interface EchoMedia2026Candidate {
  candidateId: string
  sourcePageUrl: string
  sourceDate: string
  width: number
  height: number
  durationMs: number
  framesPerSecond?: number | null
  view: string
  intendedUse: 'education-only'
  licenseId: string
  vrtConfirmed: boolean
  provenanceVerified: boolean
  privacyReviewed: boolean
  directIdentifiersVisible: boolean
  unexpectedAudio: boolean
  clinicallySuitableForViewRecognition: boolean
  clinicallySuitableForDiscrimination: boolean
  mobileReadable: boolean
  ipadReadable: boolean
  desktopReadable: boolean
  distractingOverlays: boolean
}

export interface EchoMedia2026Score {
  candidateId: string
  score: number
  releaseTier: EchoReferenceTier
  blockingIssues: string[]
  reasons: string[]
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function evaluateEchoMedia2026(candidate: EchoMedia2026Candidate): EchoMedia2026Score {
  const blockingIssues: string[] = []
  const reasons: string[] = []

  if (!candidate.provenanceVerified) blockingIssues.push('provenance-unverified')
  if (!candidate.vrtConfirmed) blockingIssues.push('vrt-unconfirmed')
  if (candidate.licenseId !== 'CC-BY-SA-3.0') blockingIssues.push('license-not-approved')
  if (!candidate.privacyReviewed) blockingIssues.push('privacy-not-reviewed')
  if (candidate.directIdentifiersVisible) blockingIssues.push('direct-identifiers-visible')
  if (candidate.unexpectedAudio) blockingIssues.push('unexpected-audio')
  if (!candidate.clinicallySuitableForViewRecognition) blockingIssues.push('not-suitable-for-view-recognition')

  let score = 0
  const pixelCount = candidate.width * candidate.height
  score += pixelCount >= 1280 * 720 ? 20 : pixelCount >= 640 * 480 ? 14 : 8
  score += candidate.framesPerSecond && candidate.framesPerSecond >= 40 ? 15 : candidate.framesPerSecond && candidate.framesPerSecond >= 25 ? 10 : 5
  score += candidate.durationMs >= 1200 && candidate.durationMs <= 5000 ? 10 : 6
  score += candidate.clinicallySuitableForViewRecognition ? 15 : 0
  score += candidate.clinicallySuitableForDiscrimination ? 10 : 0
  score += candidate.mobileReadable ? 5 : 0
  score += candidate.ipadReadable ? 5 : 0
  score += candidate.desktopReadable ? 5 : 0
  score += candidate.distractingOverlays ? 0 : 5
  score += candidate.provenanceVerified ? 5 : 0
  score += candidate.vrtConfirmed && candidate.licenseId === 'CC-BY-SA-3.0' ? 5 : 0

  score = clamp(score)
  reasons.push(`resolution-${candidate.width}x${candidate.height}`)
  if (candidate.framesPerSecond) reasons.push(`fps-${candidate.framesPerSecond}`)
  if (candidate.clinicallySuitableForDiscrimination) reasons.push('supports-discrimination-training')
  if (!candidate.distractingOverlays) reasons.push('clean-viewing-surface')

  const releaseTier: EchoReferenceTier = blockingIssues.length
    ? 'foundation'
    : score >= 85
      ? 'gold'
      : 'gold-candidate'

  return { candidateId: candidate.candidateId, score, releaseTier, blockingIssues, reasons }
}

export function canReplaceFoundationReference(params: {
  foundation: EchoMedia2026Score
  challenger: EchoMedia2026Score
  minimumImprovement?: number
}): boolean {
  const minimumImprovement = params.minimumImprovement ?? 8
  return params.challenger.releaseTier === 'gold'
    && params.challenger.blockingIssues.length === 0
    && params.challenger.score >= params.foundation.score + minimumImprovement
}

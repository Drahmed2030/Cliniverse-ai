import { ECHO_BATCH_01_REVIEW_ARTIFACTS } from './echoBatch01HumanReview.ts'

export type PlaybackDecision = 'PASS' | 'HOLD' | 'FAIL'
export type ApplePlaybackEnvironment =
  | 'macos-catalina-safari'
  | 'macos-catalina-quicktime'
  | 'iphone-safari'
  | 'iphone-in-app'
  | 'ipad-safari'
  | 'ipad-in-app'
  | 'ipad-split-view'

export interface EchoPlaybackReviewSubmission {
  candidateId: string
  artifactSha256: string
  environment: ApplePlaybackEnvironment
  deviceModel: string
  osVersion: string
  appOrBrowserVersion: string
  reviewedAt: string
  reviewerName: string
  playbackStarts: PlaybackDecision
  playPauseWorks: PlaybackDecision
  seekWorks: PlaybackDecision
  frameSteppingWorks: PlaybackDecision
  loopWorks: PlaybackDecision
  aspectRatioPreserved: PlaybackDecision
  noCropOrDistortion: PlaybackDecision
  anatomyReadable: PlaybackDecision
  overlaysReadable: PlaybackDecision
  noBlankOrBlackFailure: PlaybackDecision
  reducedMotionSafe: PlaybackDecision
  notes: readonly string[]
}

export interface EchoPlaybackReviewResult {
  candidateId: string
  artifactSha256: string
  environment: ApplePlaybackEnvironment
  state: 'hold' | 'failed' | 'cleared'
  devicePlaybackCleared: boolean
  legacyCompatibilityEvidence: boolean
  currentApplePlatformEvidence: boolean
  learnerReady: false
  binaryCommitEligible: false
  blockers: readonly string[]
}

function findArtifact(candidateId: string) {
  const artifact = ECHO_BATCH_01_REVIEW_ARTIFACTS.find(item => item.candidateId === candidateId)
  if (!artifact) throw new Error(`Candidate is not an intact Batch 01 review artifact: ${candidateId}`)
  return artifact
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`Playback review requires ${field}`)
}

function classify(decisions: readonly PlaybackDecision[]): 'hold' | 'failed' | 'cleared' {
  if (decisions.includes('FAIL')) return 'failed'
  if (decisions.includes('HOLD')) return 'hold'
  return 'cleared'
}

export function evaluateEchoPlaybackReview(submission: EchoPlaybackReviewSubmission): EchoPlaybackReviewResult {
  const artifact = findArtifact(submission.candidateId)
  if (submission.artifactSha256 !== artifact.derivativeSha256) throw new Error('Playback review artifact checksum mismatch')

  requireText(submission.deviceModel, 'device model')
  requireText(submission.osVersion, 'OS version')
  requireText(submission.appOrBrowserVersion, 'app/browser version')
  requireText(submission.reviewedAt, 'review date')
  requireText(submission.reviewerName, 'reviewer name')

  const state = classify([
    submission.playbackStarts,
    submission.playPauseWorks,
    submission.seekWorks,
    submission.frameSteppingWorks,
    submission.loopWorks,
    submission.aspectRatioPreserved,
    submission.noCropOrDistortion,
    submission.anatomyReadable,
    submission.overlaysReadable,
    submission.noBlankOrBlackFailure,
    submission.reducedMotionSafe,
  ])

  const legacyCompatibilityEvidence = submission.environment === 'macos-catalina-safari' || submission.environment === 'macos-catalina-quicktime'
  const currentApplePlatformEvidence = !legacyCompatibilityEvidence
  const blockers: string[] = []

  if (state === 'hold') blockers.push('device-playback-hold')
  if (state === 'failed') blockers.push('device-playback-failed')
  if (legacyCompatibilityEvidence) blockers.push('current-apple-platform-playback-pending')
  if (state === 'cleared') blockers.push('post-review-quality-gate-pending')

  return {
    candidateId: submission.candidateId,
    artifactSha256: artifact.derivativeSha256,
    environment: submission.environment,
    state,
    devicePlaybackCleared: state === 'cleared',
    legacyCompatibilityEvidence,
    currentApplePlatformEvidence,
    learnerReady: false,
    binaryCommitEligible: false,
    blockers,
  }
}

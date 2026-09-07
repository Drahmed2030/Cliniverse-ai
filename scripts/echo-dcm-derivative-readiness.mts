/** Offline, artifact-specific review checklist. Never grants runtime release authority. */
export const DCM_DERIVATIVE_IDENTITY = {
  candidateId: 'echo-a4c-dcm-e00476',
  sourceSha256: 'ea5a6bf54bcbda40a73ea76f3dd7fab876c9c48c8d4abd9461748cb9538aaf45',
  sourcePageSha256: '3804aef310a1ddd0e8e1a8d96fb637e2bc93d0b216b20b7a9e1c19c01a2f5fd3',
  derivativeSha256: '7aa9c9b446c84f6de3af0eaf3cbcfd0821b5f70f8b12d031fa027b083079397f',
} as const

export interface DcmDerivativeReview {
  candidateId: string
  sourceSha256: string
  sourcePageSha256: string
  derivativeSha256: string
  derivativeBytes: number
  sourceFrameCount: number
  derivativeFrameCount: number
  sourceDurationMs: number
  derivativeDurationMs: number
  sourceTimestampsMs: number[]
  derivativeTimestampsMs: number[]
  rightsVerified: boolean
  attributionAndShareAlikeRecorded: boolean
  sourceMetadataVerified: boolean
  playbackFormatVerified: boolean
  noAudioStreams: boolean
  noDirectIdentifiersObserved: boolean
  noUndocumentedAcquisitionDateTimeObserved: boolean
  allFramesScreened: boolean
  anatomyPreserved: boolean
  motionContinuityScreenPassed: boolean
  noInterpolation: boolean
  privacyReviewComplete: boolean
  privacyReviewEvidence: string | null
  clinicalReviewComplete: boolean
  clinicalReviewEvidence: string | null
  devicePlaybackReviewComplete: boolean
  requestedNumericalEfClaims: boolean
}

export function evaluateDcmDerivativeReadiness(input: Partial<DcmDerivativeReview> = {}) {
  const technicalBlockers: string[] = []
  for (const key of ['candidateId', 'sourceSha256', 'sourcePageSha256', 'derivativeSha256'] as const) {
    if (input[key] !== DCM_DERIVATIVE_IDENTITY[key]) technicalBlockers.push(`${key}-mismatch`)
  }
  for (const key of [
    'rightsVerified', 'attributionAndShareAlikeRecorded', 'sourceMetadataVerified',
    'playbackFormatVerified', 'noAudioStreams', 'noDirectIdentifiersObserved',
    'noUndocumentedAcquisitionDateTimeObserved', 'allFramesScreened', 'anatomyPreserved',
    'motionContinuityScreenPassed', 'noInterpolation',
  ] as const) {
    if (input[key] !== true) technicalBlockers.push(`${key}-not-confirmed`)
  }
  if (input.derivativeBytes !== 253578) technicalBlockers.push('derivative-size-mismatch')
  if (input.sourceFrameCount !== 44 || input.derivativeFrameCount !== 44) {
    technicalBlockers.push('frame-count-mismatch')
  }
  if (input.sourceDurationMs !== 863 || input.derivativeDurationMs !== 862) {
    technicalBlockers.push('duration-mismatch')
  }
  const before = input.sourceTimestampsMs
  const after = input.derivativeTimestampsMs
  if (!Array.isArray(before) || !Array.isArray(after) || before.length !== 44 || after.length !== 44 ||
      before[0] !== 0 || before[43] !== 843 ||
      before.some((t, i) => !Number.isInteger(t) || t !== after[i] ||
        (i > 0 && ![19, 20].includes(t - before[i - 1])))) {
    technicalBlockers.push('timestamp-sequence-mismatch')
  }
  // Absence is not consent to quantitative claims; this source has no numerical EF authority.
  if (input.requestedNumericalEfClaims !== false) technicalBlockers.push('numerical-ef-prohibited')
  const blockers = [...technicalBlockers]
  if (input.privacyReviewComplete !== true || !input.privacyReviewEvidence?.trim()) {
    blockers.push('privacy-review-incomplete')
  }
  if (input.clinicalReviewComplete !== true || !input.clinicalReviewEvidence?.trim()) {
    blockers.push('clinical-review-incomplete')
  }
  if (input.devicePlaybackReviewComplete !== true) blockers.push('device-playback-review-incomplete')
  return {
    technicalPreviewPrepared: technicalBlockers.length === 0,
    status: blockers.length === 0 ? 'ready-for-existing-governance-review' : 'hold',
    blockers,
    // A lab checklist cannot bypass Echo quality/clinical contracts or install a Studio asset.
    binaryCommitAllowed: false,
    learnerReady: false,
    numericalEfClaimsAllowed: false,
    normalGoldPromotionAllowed: false,
  }
}

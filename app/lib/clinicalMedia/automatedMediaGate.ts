import type { ClinicalMediaModality } from './clinicalMediaGovernancePipeline'

export type MediaGateDecision = 'PASS' | 'HOLD' | 'REJECT'

export interface MediaProbeEvidence {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  probeTool: string
  probeToolVersion: string
  probedAt: string
  container: string
  videoCodec: string | null
  audioStreams: number
  videoStreams: number
  width: number | null
  height: number | null
  durationMs: number | null
  frameCount: number | null
  nominalFps: number | null
  timestampsMonotonic: boolean | null
  decodeComplete: boolean
  unexpectedMetadataPresent: boolean
  corruptionDetected: boolean
}

export interface ModalityMediaPolicy {
  modality: ClinicalMediaModality
  allowedContainers: readonly string[]
  allowedVideoCodecs: readonly string[]
  requireVideo: boolean
  allowAudio: boolean
  minimumWidth?: number
  minimumHeight?: number
  minimumDurationMs?: number
  maximumDurationMs?: number
  minimumFrameCount?: number
  requireMonotonicTimestamps: boolean
}

export interface AutomatedMediaGateResult {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  decision: MediaGateDecision
  technicallyVerified: boolean
  checks: Readonly<Record<string, MediaGateDecision>>
  blockers: readonly string[]
}

export const DEFAULT_MODALITY_MEDIA_POLICIES: Readonly<Record<ClinicalMediaModality, ModalityMediaPolicy>> = {
  ECHO: {
    modality: 'ECHO',
    allowedContainers: ['mp4'],
    allowedVideoCodecs: ['h264'],
    requireVideo: true,
    allowAudio: false,
    minimumWidth: 320,
    minimumHeight: 240,
    minimumDurationMs: 500,
    maximumDurationMs: 15000,
    minimumFrameCount: 12,
    requireMonotonicTimestamps: true,
  },
  ANGIO: {
    modality: 'ANGIO',
    allowedContainers: ['mp4'],
    allowedVideoCodecs: ['h264'],
    requireVideo: true,
    allowAudio: false,
    minimumWidth: 320,
    minimumHeight: 240,
    minimumDurationMs: 500,
    maximumDurationMs: 30000,
    minimumFrameCount: 12,
    requireMonotonicTimestamps: true,
  },
  ECG: {
    modality: 'ECG',
    allowedContainers: ['png', 'svg', 'pdf', 'json'],
    allowedVideoCodecs: [],
    requireVideo: false,
    allowAudio: false,
    requireMonotonicTimestamps: false,
  },
  XRAY: {
    modality: 'XRAY',
    allowedContainers: ['png', 'jpg', 'jpeg', 'webp', 'dcm'],
    allowedVideoCodecs: [],
    requireVideo: false,
    allowAudio: false,
    minimumWidth: 512,
    minimumHeight: 512,
    requireMonotonicTimestamps: false,
  },
  CT: {
    modality: 'CT',
    allowedContainers: ['dcm'],
    allowedVideoCodecs: [],
    requireVideo: false,
    allowAudio: false,
    minimumWidth: 256,
    minimumHeight: 256,
    requireMonotonicTimestamps: false,
  },
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`)
}

function requireSha256(value: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('artifactSha256 must be a SHA256 hex digest')
}

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/^video\//, '')
}

export function evaluateAutomatedMediaGate(
  evidence: MediaProbeEvidence,
  policy: ModalityMediaPolicy = DEFAULT_MODALITY_MEDIA_POLICIES[evidence.modality],
): AutomatedMediaGateResult {
  requireText(evidence.assetId, 'assetId')
  requireSha256(evidence.artifactSha256)
  requireText(evidence.probeTool, 'probeTool')
  requireText(evidence.probeToolVersion, 'probeToolVersion')
  requireText(evidence.probedAt, 'probedAt')

  if (policy.modality !== evidence.modality) throw new Error('modality/policy mismatch')

  const checks: Record<string, MediaGateDecision> = {}
  const blockers: string[] = []
  let reject = false

  const set = (name: string, decision: MediaGateDecision, blocker?: string) => {
    checks[name] = decision
    if (decision !== 'PASS' && blocker) blockers.push(blocker)
    if (decision === 'REJECT') reject = true
  }

  set(
    'containerAllowed',
    policy.allowedContainers.map(normalized).includes(normalized(evidence.container)) ? 'PASS' : 'REJECT',
    'container-not-allowed',
  )

  if (policy.requireVideo) {
    set('videoStreamPresent', evidence.videoStreams === 1 ? 'PASS' : evidence.videoStreams > 1 ? 'HOLD' : 'REJECT', 'video-stream-policy-failed')
    set(
      'videoCodecAllowed',
      evidence.videoCodec && policy.allowedVideoCodecs.map(normalized).includes(normalized(evidence.videoCodec)) ? 'PASS' : 'REJECT',
      'video-codec-not-allowed',
    )
  } else {
    set('videoStreamPolicy', evidence.videoStreams === 0 ? 'PASS' : 'HOLD', 'unexpected-video-stream')
  }

  set('audioPolicy', policy.allowAudio || evidence.audioStreams === 0 ? 'PASS' : 'HOLD', 'unexpected-audio-stream')
  set('decodeComplete', evidence.decodeComplete ? 'PASS' : 'REJECT', 'decode-incomplete')
  set('corruptionFree', evidence.corruptionDetected ? 'REJECT' : 'PASS', 'corruption-detected')
  set('metadataPolicy', evidence.unexpectedMetadataPresent ? 'HOLD' : 'PASS', 'unexpected-metadata-present')

  if (policy.minimumWidth !== undefined) {
    set('minimumWidth', evidence.width !== null && evidence.width >= policy.minimumWidth ? 'PASS' : 'HOLD', 'width-below-policy-or-unknown')
  }
  if (policy.minimumHeight !== undefined) {
    set('minimumHeight', evidence.height !== null && evidence.height >= policy.minimumHeight ? 'PASS' : 'HOLD', 'height-below-policy-or-unknown')
  }
  if (policy.minimumDurationMs !== undefined) {
    set('minimumDuration', evidence.durationMs !== null && evidence.durationMs >= policy.minimumDurationMs ? 'PASS' : 'HOLD', 'duration-below-policy-or-unknown')
  }
  if (policy.maximumDurationMs !== undefined) {
    set('maximumDuration', evidence.durationMs !== null && evidence.durationMs <= policy.maximumDurationMs ? 'PASS' : 'HOLD', 'duration-above-policy-or-unknown')
  }
  if (policy.minimumFrameCount !== undefined) {
    set('minimumFrameCount', evidence.frameCount !== null && evidence.frameCount >= policy.minimumFrameCount ? 'PASS' : 'HOLD', 'frame-count-below-policy-or-unknown')
  }
  if (policy.requireMonotonicTimestamps) {
    set('timestampsMonotonic', evidence.timestampsMonotonic === true ? 'PASS' : evidence.timestampsMonotonic === false ? 'REJECT' : 'HOLD', 'timestamp-integrity-not-verified')
  }

  const hasHold = Object.values(checks).includes('HOLD')
  const decision: MediaGateDecision = reject ? 'REJECT' : hasHold ? 'HOLD' : 'PASS'

  return {
    assetId: evidence.assetId,
    modality: evidence.modality,
    artifactSha256: evidence.artifactSha256,
    decision,
    technicallyVerified: decision === 'PASS',
    checks,
    blockers,
  }
}

export interface BatchAutomatedMediaGateSummary {
  total: number
  passed: number
  held: number
  rejected: number
  technicallyVerified: boolean
  escalationRequired: boolean
}

export function summarizeAutomatedMediaBatch(results: readonly AutomatedMediaGateResult[]): BatchAutomatedMediaGateSummary {
  if (!results.length) throw new Error('At least one media gate result is required')
  const passed = results.filter(result => result.decision === 'PASS').length
  const held = results.filter(result => result.decision === 'HOLD').length
  const rejected = results.filter(result => result.decision === 'REJECT').length
  return {
    total: results.length,
    passed,
    held,
    rejected,
    technicallyVerified: passed === results.length,
    escalationRequired: held > 0 || rejected > 0,
  }
}

import 'server-only'
import { createHash } from 'node:crypto'
import { FlightRecorder, pseudonymizeOperationalId } from './flight-recorder'
import type { OperationalContext } from './operational-telemetry'

export type ProgressiveDecision = {
  flag: string
  enabled: boolean
  rolloutPercent: number
  bucket: number
  subjectHash: string
  variant: 'control' | 'treatment'
  reason: 'disabled' | 'allowlisted' | 'rollout'
}

function clampRolloutPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function deterministicBucket(flag: string, subjectKey: string): number {
  const digest = createHash('sha256').update(`${flag}:${subjectKey}`).digest()
  return digest.readUInt32BE(0) % 10000
}

export function decideProgressiveExposure(input: {
  flag: string
  subjectKey: string
  enabled: boolean
  rolloutPercent: number
  allowlistedSubjectHashes?: string[]
}): ProgressiveDecision {
  const rolloutPercent = clampRolloutPercent(input.rolloutPercent)
  const subjectHash = pseudonymizeOperationalId(input.subjectKey)
  const bucket = deterministicBucket(input.flag, input.subjectKey)
  const allowlisted = input.allowlistedSubjectHashes?.includes(subjectHash) ?? false
  const exposed = input.enabled && (allowlisted || bucket < Math.round(rolloutPercent * 100))

  return {
    flag: input.flag,
    enabled: input.enabled,
    rolloutPercent,
    bucket,
    subjectHash,
    variant: exposed ? 'treatment' : 'control',
    reason: !input.enabled ? 'disabled' : allowlisted ? 'allowlisted' : 'rollout',
  }
}

export async function recordProgressiveDecision(input: {
  recorder: FlightRecorder
  context: OperationalContext
  operation: string
  decision: ProgressiveDecision
}) {
  return input.recorder.record({
    kind: 'progressive.decision',
    operation: input.operation,
    correlationId: input.context.correlationId,
    traceId: input.context.traceId,
    spanId: input.context.spanId,
    outcome: 'decision',
    attributes: {
      flag: input.decision.flag,
      enabled: input.decision.enabled,
      rollout_percent: input.decision.rolloutPercent,
      bucket: input.decision.bucket,
      subject_hash: input.decision.subjectHash,
      variant: input.decision.variant,
      reason: input.decision.reason,
    },
  })
}

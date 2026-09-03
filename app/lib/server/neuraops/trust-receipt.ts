import 'server-only'
import { createHash } from 'node:crypto'
import type { FlightRecorder } from '../observability/flight-recorder'
import type { OperationalContext } from '../observability/operational-telemetry'
import {
  NEURAOPS_GEMINI_MODEL,
  NEURAOPS_GEMINI_ENDPOINT,
  NEURAOPS_PROBE_MARKER,
  NEURAOPS_GEMINI_THINKING_LEVEL,
  type NeuraOpsProbeResult,
} from './gateway'

export const NEURAOPS_AI_POLICY_VERSION = 'neuraops-ai-policy-2026-09-v1' as const
export const NEURAOPS_PROBE_TEMPLATE_VERSION = 'gemini-connectivity-probe-v2' as const

export type NeuraOpsTrustReceipt = {
  schemaVersion: 1
  receiptId: string
  correlationId: string
  traceId: string
  completedAt: string
  provider: 'google-gemini'
  model: typeof NEURAOPS_GEMINI_MODEL
  policyVersion: typeof NEURAOPS_AI_POLICY_VERSION
  templateVersion: typeof NEURAOPS_PROBE_TEMPLATE_VERSION
  inputContractHash: string
  endpointContractHash: string
  dataClassification: 'synthetic-non-clinical'
  humanReviewRequired: true
  resultCode: NeuraOpsProbeResult['code']
  latencyMs: number
  markerMatched: boolean
  providerStatus?: number
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function createNeuraOpsTrustReceipt(input: {
  context: OperationalContext
  result: NeuraOpsProbeResult
  completedAt?: string
}): NeuraOpsTrustReceipt {
  const completedAt = input.completedAt ?? new Date().toISOString()
  const inputContractHash = sha256(
    `${NEURAOPS_PROBE_TEMPLATE_VERSION}|${NEURAOPS_GEMINI_MODEL}|${NEURAOPS_GEMINI_THINKING_LEVEL}|${NEURAOPS_PROBE_MARKER}|fictional-simulation`,
  )
  const endpointContractHash = sha256(NEURAOPS_GEMINI_ENDPOINT)
  const receiptId = sha256(
    `${input.context.correlationId}|${input.context.traceId}|${completedAt}|${input.result.code}|${inputContractHash}`,
  ).slice(0, 32)

  return {
    schemaVersion: 1,
    receiptId,
    correlationId: input.context.correlationId,
    traceId: input.context.traceId,
    completedAt,
    provider: 'google-gemini',
    model: NEURAOPS_GEMINI_MODEL,
    policyVersion: NEURAOPS_AI_POLICY_VERSION,
    templateVersion: NEURAOPS_PROBE_TEMPLATE_VERSION,
    inputContractHash,
    endpointContractHash,
    dataClassification: 'synthetic-non-clinical',
    humanReviewRequired: true,
    resultCode: input.result.code,
    latencyMs: input.result.latencyMs,
    markerMatched: input.result.markerMatched,
    ...(input.result.providerStatus == null ? {} : { providerStatus: input.result.providerStatus }),
  }
}

export async function recordNeuraOpsTrustReceipt(input: {
  recorder: FlightRecorder
  context: OperationalContext
  receipt: NeuraOpsTrustReceipt
}): Promise<void> {
  await input.recorder.record({
    kind: 'ai.receipt',
    operation: 'neuraops.gemini.synthetic_probe',
    correlationId: input.context.correlationId,
    traceId: input.context.traceId,
    spanId: input.context.spanId,
    outcome: input.receipt.resultCode === 'ready' ? 'success' : 'failure',
    durationMs: input.receipt.latencyMs,
    attributes: {
      receipt_id: input.receipt.receiptId,
      provider: input.receipt.provider,
      model: input.receipt.model,
      policy_version: input.receipt.policyVersion,
      template_version: input.receipt.templateVersion,
      input_contract_hash: input.receipt.inputContractHash,
      endpoint_contract_hash: input.receipt.endpointContractHash,
      data_classification: input.receipt.dataClassification,
      human_review_required: input.receipt.humanReviewRequired,
      result_code: input.receipt.resultCode,
      marker_matched: input.receipt.markerMatched,
      provider_status: input.receipt.providerStatus ?? null,
    },
  })
}

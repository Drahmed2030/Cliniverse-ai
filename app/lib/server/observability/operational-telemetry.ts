import 'server-only'
import { randomUUID } from 'node:crypto'
import {
  SpanStatusCode,
  trace,
  type Attributes,
  type Span,
} from '@opentelemetry/api'
import {
  FlightRecorder,
  sanitizeOperationalAttributes,
  type SafeAttributeValue,
} from './flight-recorder'

const tracer = trace.getTracer('cliniverse-ai-runtime', '1.0.0')

export type OperationalContext = {
  correlationId: string
  traceId: string
  spanId?: string
}

function toOtelAttributes(attributes: Record<string, SafeAttributeValue>): Attributes {
  const converted: Attributes = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== null) converted[key] = value
  }
  return converted
}

function usableTraceId(span: Span): string | null {
  const value = span.spanContext().traceId
  if (!value || /^0+$/.test(value)) return null
  return value
}

function usableSpanId(span: Span): string | undefined {
  const value = span.spanContext().spanId
  if (!value || /^0+$/.test(value)) return undefined
  return value
}

export function createCorrelationId(candidate?: string | null): string {
  if (candidate && /^[A-Za-z0-9._:-]{8,128}$/.test(candidate)) return candidate
  return randomUUID()
}

export async function withOperationalSpan<T>(input: {
  operation: string
  correlationId: string
  recorder: FlightRecorder
  attributes?: Record<string, unknown>
  run: (context: OperationalContext) => Promise<T>
}): Promise<T> {
  const safeAttributes = sanitizeOperationalAttributes(input.attributes)

  return tracer.startActiveSpan(input.operation, { attributes: toOtelAttributes(safeAttributes) }, async (span) => {
    const traceId = usableTraceId(span) ?? input.correlationId.replaceAll('-', '')
    const spanId = usableSpanId(span)
    const context: OperationalContext = {
      correlationId: input.correlationId,
      traceId,
      spanId,
    }
    const startedAt = Date.now()

    await input.recorder.record({
      kind: 'operation.started',
      operation: input.operation,
      correlationId: context.correlationId,
      traceId: context.traceId,
      spanId: context.spanId,
      outcome: 'started',
      attributes: safeAttributes,
    })

    try {
      const result = await input.run(context)
      const durationMs = Date.now() - startedAt
      span.setStatus({ code: SpanStatusCode.OK })
      span.setAttribute('cliniverse.correlation_id', input.correlationId)
      span.setAttribute('cliniverse.duration_ms', durationMs)
      await input.recorder.record({
        kind: 'operation.completed',
        operation: input.operation,
        correlationId: context.correlationId,
        traceId: context.traceId,
        spanId: context.spanId,
        outcome: 'success',
        durationMs,
        attributes: safeAttributes,
      })
      return result
    } catch (error) {
      const durationMs = Date.now() - startedAt
      const errorType = error instanceof Error ? error.name : 'UnknownError'
      span.setStatus({ code: SpanStatusCode.ERROR, message: errorType })
      span.setAttribute('cliniverse.correlation_id', input.correlationId)
      span.setAttribute('cliniverse.error_type', errorType)
      span.recordException({ name: errorType, message: errorType })
      await input.recorder.record({
        kind: 'operation.failed',
        operation: input.operation,
        correlationId: context.correlationId,
        traceId: context.traceId,
        spanId: context.spanId,
        outcome: 'failure',
        durationMs,
        attributes: { ...safeAttributes, error_type: errorType },
      })
      throw error
    } finally {
      span.end()
    }
  })
}

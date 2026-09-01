import 'server-only'
import { createHash, randomUUID } from 'node:crypto'

export type FlightEventKind =
  | 'operation.started'
  | 'operation.completed'
  | 'operation.failed'
  | 'lineage.edge'
  | 'progressive.decision'

export type SafeAttributeValue = string | number | boolean | null

export type FlightEvent = {
  schemaVersion: 1
  eventId: string
  timestamp: string
  service: 'cliniverse-ai'
  kind: FlightEventKind
  operation: string
  correlationId: string
  traceId: string
  spanId?: string
  outcome: 'started' | 'success' | 'failure' | 'decision'
  durationMs?: number
  attributes: Record<string, SafeAttributeValue>
}

export interface FlightRecorderSink {
  record(event: FlightEvent): Promise<void> | void
}

const FORBIDDEN_ATTRIBUTE_KEY = /(authorization|cookie|token|secret|password|signedtransaction|payload|prompt|message|clinical|note|email|phone|name)/i
const MAX_ATTRIBUTE_STRING_LENGTH = 256

export function pseudonymizeOperationalId(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 24)
}

export function sanitizeOperationalAttributes(
  attributes: Record<string, unknown> = {},
): Record<string, SafeAttributeValue> {
  const safe: Record<string, SafeAttributeValue> = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (FORBIDDEN_ATTRIBUTE_KEY.test(key)) continue
    if (value == null) {
      safe[key] = null
      continue
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      if (typeof value === 'number' && !Number.isFinite(value)) continue
      safe[key] = value
      continue
    }
    if (typeof value === 'string') {
      safe[key] = value.slice(0, MAX_ATTRIBUTE_STRING_LENGTH)
    }
  }

  return safe
}

export class InMemoryFlightRecorderSink implements FlightRecorderSink {
  readonly events: FlightEvent[] = []

  record(event: FlightEvent) {
    this.events.push(event)
  }
}

export class StructuredConsoleFlightRecorderSink implements FlightRecorderSink {
  record(event: FlightEvent) {
    console.info('cliniverse.flight_recorder', JSON.stringify(event))
  }
}

export class FlightRecorder {
  constructor(private readonly sink: FlightRecorderSink) {}

  async record(input: Omit<FlightEvent, 'schemaVersion' | 'eventId' | 'timestamp' | 'service' | 'attributes'> & {
    attributes?: Record<string, unknown>
  }): Promise<FlightEvent> {
    const event: FlightEvent = {
      schemaVersion: 1,
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      service: 'cliniverse-ai',
      ...input,
      attributes: sanitizeOperationalAttributes(input.attributes),
    }
    await this.sink.record(event)
    return event
  }
}

export function createServerFlightRecorder(): FlightRecorder {
  return new FlightRecorder(new StructuredConsoleFlightRecorderSink())
}

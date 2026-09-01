import 'server-only'
import type { FlightEvent } from './flight-recorder'

export type IncidentReplayFrame = {
  index: number
  eventId: string
  timestamp: string
  kind: FlightEvent['kind']
  operation: string
  outcome: FlightEvent['outcome']
  deltaMsFromPrevious: number
  durationMs?: number
  attributes: FlightEvent['attributes']
}

export type IncidentReplay = {
  correlationId: string
  traceIds: string[]
  startedAt: string | null
  endedAt: string | null
  totalDurationMs: number | null
  failed: boolean
  frames: IncidentReplayFrame[]
}

export function buildIncidentReplay(events: FlightEvent[], correlationId: string): IncidentReplay {
  const matching = events
    .filter((event) => event.correlationId === correlationId)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))

  const frames = matching.map((event, index) => {
    const previous = index > 0 ? matching[index - 1] : null
    return {
      index,
      eventId: event.eventId,
      timestamp: event.timestamp,
      kind: event.kind,
      operation: event.operation,
      outcome: event.outcome,
      deltaMsFromPrevious: previous
        ? Math.max(0, Date.parse(event.timestamp) - Date.parse(previous.timestamp))
        : 0,
      durationMs: event.durationMs,
      attributes: event.attributes,
    }
  })

  const startedAt = matching[0]?.timestamp ?? null
  const endedAt = matching.at(-1)?.timestamp ?? null
  const totalDurationMs = startedAt && endedAt
    ? Math.max(0, Date.parse(endedAt) - Date.parse(startedAt))
    : null

  return {
    correlationId,
    traceIds: [...new Set(matching.map((event) => event.traceId))],
    startedAt,
    endedAt,
    totalDurationMs,
    failed: matching.some((event) => event.outcome === 'failure'),
    frames,
  }
}

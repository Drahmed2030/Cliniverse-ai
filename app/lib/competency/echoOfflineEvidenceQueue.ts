import type { EchoCompetencyEvent, EchoMasteryProjectionRow } from './echoPersistenceContract.ts'
import type { EchoStudioPersistencePort } from './echoStudioIntegrationBoundary.ts'

export interface EchoQueuedEvidence {
  event: EchoCompetencyEvent
  projection: EchoMasteryProjectionRow
  queuedAt: string
  attempts: number
  lastAttemptAt: string | null
}

export interface EchoEvidenceQueueState {
  items: EchoQueuedEvidence[]
}

export interface EchoEvidenceFlushResult {
  state: EchoEvidenceQueueState
  persistedEventIds: string[]
  failedEventIds: string[]
}

export function enqueueEchoEvidence(
  state: EchoEvidenceQueueState,
  item: Omit<EchoQueuedEvidence, 'attempts' | 'lastAttemptAt'>,
): EchoEvidenceQueueState {
  // eventId is the idempotency key across offline retries and process restarts.
  if (state.items.some(existing => existing.event.eventId === item.event.eventId)) return state

  return {
    items: [
      ...state.items,
      { ...item, attempts: 0, lastAttemptAt: null },
    ],
  }
}

export async function flushEchoEvidenceQueue(params: {
  state: EchoEvidenceQueueState
  port?: EchoStudioPersistencePort | null
  attemptedAt: string
  maxAttempts?: number
}): Promise<EchoEvidenceFlushResult> {
  if (!params.port) {
    return {
      state: params.state,
      persistedEventIds: [],
      failedEventIds: params.state.items.map(item => item.event.eventId),
    }
  }

  const maxAttempts = params.maxAttempts ?? 5
  const remaining: EchoQueuedEvidence[] = []
  const persistedEventIds: string[] = []
  const failedEventIds: string[] = []

  // Preserve queue order so immutable evidence reaches storage before later projections.
  for (const item of params.state.items) {
    if (item.attempts >= maxAttempts) {
      remaining.push(item)
      failedEventIds.push(item.event.eventId)
      continue
    }

    try {
      await params.port.appendEvent(item.event)
      await params.port.upsertProjection(item.projection)
      persistedEventIds.push(item.event.eventId)
    } catch {
      remaining.push({
        ...item,
        attempts: item.attempts + 1,
        lastAttemptAt: params.attemptedAt,
      })
      failedEventIds.push(item.event.eventId)
    }
  }

  return {
    state: { items: remaining },
    persistedEventIds,
    failedEventIds,
  }
}

export function echoEvidenceQueueHealth(state: EchoEvidenceQueueState) {
  return {
    pending: state.items.length,
    retrying: state.items.filter(item => item.attempts > 0).length,
    exhausted: state.items.filter(item => item.attempts >= 5).length,
  }
}

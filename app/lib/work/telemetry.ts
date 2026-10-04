export interface SafeWorkAttributes {
  operation?: 'session' | 'list' | 'detail' | 'source' | 'review' | 'outcome'
  outcome?: 'success' | 'denied' | 'stale' | 'uncertain' | 'invalid' | 'unavailable'
  durationMs?: number
  statusClass?: '2xx' | '3xx' | '4xx' | '5xx'
  schemaVersion?: 1
  correlationId?: string
}

/** Closed value and key allowlists; never forwards identifiers, payloads or raw errors. */
export function workTelemetryAttributes(input: unknown): SafeWorkAttributes {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {}
  const value = input as Record<string, unknown>
  const result: SafeWorkAttributes = {}
  if (['session', 'list', 'detail', 'source', 'review', 'outcome'].includes(value.operation as string)) result.operation = value.operation as SafeWorkAttributes['operation']
  if (['success', 'denied', 'stale', 'uncertain', 'invalid', 'unavailable'].includes(value.outcome as string)) result.outcome = value.outcome as SafeWorkAttributes['outcome']
  if (typeof value.durationMs === 'number' && Number.isFinite(value.durationMs) && value.durationMs >= 0 && value.durationMs <= 60000) result.durationMs = value.durationMs
  if (['2xx', '3xx', '4xx', '5xx'].includes(value.statusClass as string)) result.statusClass = value.statusClass as SafeWorkAttributes['statusClass']
  if (value.schemaVersion === 1) result.schemaVersion = 1
  // Caller must generate a fresh correlation UUID, never derive it from a patient/assignment ID.
  if (typeof value.correlationId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.correlationId)) result.correlationId = value.correlationId
  return result
}

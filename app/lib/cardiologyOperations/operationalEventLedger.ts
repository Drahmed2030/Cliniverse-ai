import type { OperationalEvent, OperationalEventSource, OperationalEventType, OperationalEvidenceReference, OperationalRoleId } from './operationalCore'

// operationalEventLedger — Batch 10 Section 3. Generalizes the append-only,
// deterministic-ordering engine already proven in
// app/lib/cardiology/nexusCore.ts's applyNexusEvent — same invariants
// (no gaps, no duplicates, ISO timestamps, immutable history), but over the
// shared OperationalEvent contract so every Cardiology Operations module
// (not just QAPAS) can append to one ledger shape. Does not replace
// nexusCore.ts or duplicate its transition-rule engine — see
// nexusOperationalProfile.ts for how an existing NexusCase ledger is
// projected into this shape.

export interface OperationalLedgerErrorResult {
  ok: false
  error: {
    code: 'DUPLICATE_EVENT' | 'EVENT_ORDER_INVALID' | 'INVALID_TIMESTAMP' | 'ENCOUNTER_MISMATCH' | 'MISSING_EVIDENCE'
    message: string
  }
}

export interface OperationalLedgerOkResult {
  ok: true
  value: readonly OperationalEvent[]
}

export type OperationalLedgerResult = OperationalLedgerOkResult | OperationalLedgerErrorResult

function isIsoTimestamp(value: string): boolean {
  return typeof value === 'string' && value.includes('T') && Number.isFinite(Date.parse(value))
}

/**
 * The only sanctioned way to add an OperationalEvent to a ledger.
 * Deterministic ordering: sequence must equal history.length + 1 — no gaps,
 * no reordering, no silent skip. Rejects a duplicate eventId even if every
 * other field matches. Every event must carry non-empty evidence
 * (referenceIds + sourceRef) — an event with no provenance is refused
 * rather than silently accepted with a made-up reference.
 */
export function appendOperationalEvent(
  history: readonly OperationalEvent[],
  event: OperationalEvent,
): OperationalLedgerResult {
  if (history.length > 0 && history[0].encounterId !== event.encounterId) {
    return failure('ENCOUNTER_MISMATCH', 'The event belongs to a different encounter than this ledger.')
  }
  if (history.some(item => item.eventId === event.eventId)) {
    return failure('DUPLICATE_EVENT', 'The event ID already exists in this ledger.')
  }
  if (event.sequence !== history.length + 1) {
    return failure('EVENT_ORDER_INVALID', 'The event sequence must append to the ledger without gaps.')
  }
  if (!isIsoTimestamp(event.occurredAt) || !isIsoTimestamp(event.recordedAt)) {
    return failure('INVALID_TIMESTAMP', 'Event times must be valid ISO timestamps.')
  }
  if (!event.evidence.referenceIds.length || !event.evidence.sourceRef.trim()) {
    return failure('MISSING_EVIDENCE', 'An operational event must carry at least one reference id and a source ref.')
  }

  return { ok: true, value: [...history, event] }
}

export function createOperationalEvent(params: {
  history: readonly OperationalEvent[]
  encounterId: string
  type: OperationalEventType
  actorRole: OperationalRoleId
  actorId: string
  occurredAt: string
  source: OperationalEventSource
  evidence: OperationalEvidenceReference
  payload?: Readonly<Record<string, string | number | boolean | null>>
}): OperationalEvent {
  return {
    eventId: `OP-EVT-${params.encounterId}-${String(params.history.length + 1).padStart(4, '0')}`,
    encounterId: params.encounterId,
    sequence: params.history.length + 1,
    type: params.type,
    actorRole: params.actorRole,
    actorId: params.actorId,
    occurredAt: params.occurredAt,
    recordedAt: params.occurredAt,
    source: params.source,
    evidence: params.evidence,
    payload: params.payload ?? {},
  }
}

/** Deterministic — same ledger always yields the same ordered view, sorted by sequence (which is already gapless/append-only, but this guards a caller that received an unordered array). */
export function orderedLedger(history: readonly OperationalEvent[]): readonly OperationalEvent[] {
  return [...history].sort((a, b) => a.sequence - b.sequence)
}

export function eventsOfType(history: readonly OperationalEvent[], type: OperationalEventType): readonly OperationalEvent[] {
  return history.filter(event => event.type === type)
}

function failure(code: OperationalLedgerErrorResult['error']['code'], message: string): OperationalLedgerErrorResult {
  return { ok: false, error: { code, message } }
}

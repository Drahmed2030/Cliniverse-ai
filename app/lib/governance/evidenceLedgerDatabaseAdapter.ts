import type { EvidenceLedgerEvent, LedgerProduct } from './evidenceProvenanceLedger.ts'
import {
  buildPersistedLedgerEnvelope,
  evaluateLedgerPersistence,
  type ExistingLedgerRow,
  type LedgerPersistenceDecision,
} from './evidenceLedgerPersistenceBoundary.ts'

export interface GovernanceLedgerDatabaseRow {
  event_id: string
  product: LedgerProduct
  subject_id: string
  event_kind: EvidenceLedgerEvent['kind']
  occurred_at: string
  recorded_at: string
  artifact_sha256: readonly string[]
  actor_type: EvidenceLedgerEvent['actor']['actorType']
  actor_id: string
  policy_bindings: readonly string[]
  parent_event_ids: readonly string[]
  evidence_record_ids: readonly string[]
  canonical_event: EvidenceLedgerEvent
}

export interface GovernanceLedgerDatabaseAdapter {
  findByEventId(eventId: string): Promise<GovernanceLedgerDatabaseRow | null>
  append(row: GovernanceLedgerDatabaseRow): Promise<void>
}

export interface PersistLedgerEventInput {
  event: EvidenceLedgerEvent
  recordedAt: string
  adapter: GovernanceLedgerDatabaseAdapter
}

export interface PersistLedgerEventResult {
  decision: LedgerPersistenceDecision
  blockers: readonly string[]
  row?: GovernanceLedgerDatabaseRow
}

function rowToExisting(row: GovernanceLedgerDatabaseRow): ExistingLedgerRow {
  return {
    eventId: row.event_id,
    product: row.product,
    canonicalEvent: row.canonical_event,
  }
}

export function envelopeToDatabaseRow(
  event: EvidenceLedgerEvent,
  recordedAt: string,
): GovernanceLedgerDatabaseRow {
  const envelope = buildPersistedLedgerEnvelope(event, recordedAt)
  return {
    event_id: envelope.eventId,
    product: envelope.product,
    subject_id: envelope.subjectId,
    event_kind: envelope.eventKind,
    occurred_at: envelope.occurredAt,
    recorded_at: envelope.recordedAt,
    artifact_sha256: envelope.artifactSha256,
    actor_type: envelope.actorType,
    actor_id: envelope.actorId,
    policy_bindings: envelope.policyBindings,
    parent_event_ids: envelope.parentEventIds,
    evidence_record_ids: envelope.evidenceRecordIds,
    canonical_event: envelope.canonicalEvent,
  }
}

export async function persistLedgerEvent(
  input: PersistLedgerEventInput,
): Promise<PersistLedgerEventResult> {
  const existing = await input.adapter.findByEventId(input.event.eventId)
  const result = evaluateLedgerPersistence({
    event: input.event,
    recordedAt: input.recordedAt,
    existingRows: existing ? [rowToExisting(existing)] : [],
  })

  if (result.decision !== 'APPEND') {
    return { decision: result.decision, blockers: result.blockers }
  }

  const row = envelopeToDatabaseRow(input.event, input.recordedAt)
  await input.adapter.append(row)
  return { decision: 'APPEND', blockers: [], row }
}

export function validateGovernanceLedgerDatabaseRow(row: GovernanceLedgerDatabaseRow): readonly string[] {
  const blockers: string[] = []
  if (row.event_id !== row.canonical_event.eventId) blockers.push('event-id-mismatch')
  if (row.product !== row.canonical_event.product) blockers.push('product-mismatch')
  if (row.subject_id !== row.canonical_event.subjectId) blockers.push('subject-id-mismatch')
  if (row.event_kind !== row.canonical_event.kind) blockers.push('event-kind-mismatch')
  if (row.occurred_at !== row.canonical_event.occurredAt) blockers.push('occurred-at-mismatch')

  const expectedShas = row.canonical_event.artifacts.map(artifact => artifact.sha256.toLowerCase())
  if (JSON.stringify(row.artifact_sha256) !== JSON.stringify(expectedShas)) blockers.push('artifact-sha-list-mismatch')

  if (row.actor_type !== row.canonical_event.actor.actorType) blockers.push('actor-type-mismatch')
  if (row.actor_id !== row.canonical_event.actor.actorId) blockers.push('actor-id-mismatch')

  return blockers
}

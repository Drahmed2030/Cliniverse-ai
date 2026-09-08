import type {
  EvidenceLedgerEvent,
  LedgerProduct,
} from './evidenceProvenanceLedger.ts'
import { validateEvidenceLedgerEvent } from './evidenceProvenanceLedger.ts'

export type LedgerPersistenceDecision = 'APPEND' | 'NOOP' | 'HOLD'

export interface PersistedLedgerEventEnvelope {
  eventId: string
  product: LedgerProduct
  subjectId: string
  eventKind: EvidenceLedgerEvent['kind']
  occurredAt: string
  recordedAt: string
  artifactSha256: readonly string[]
  actorType: EvidenceLedgerEvent['actor']['actorType']
  actorId: string
  policyBindings: readonly string[]
  parentEventIds: readonly string[]
  evidenceRecordIds: readonly string[]
  canonicalEvent: EvidenceLedgerEvent
}

export interface ExistingLedgerRow {
  eventId: string
  product: LedgerProduct
  canonicalEvent: EvidenceLedgerEvent
}

export interface LedgerPersistenceInput {
  event: EvidenceLedgerEvent
  recordedAt: string
  existingRows: readonly ExistingLedgerRow[]
}

export interface LedgerPersistenceResult {
  decision: LedgerPersistenceDecision
  blockers: readonly string[]
  envelope?: PersistedLedgerEventEnvelope
}

const FORBIDDEN_PHI_KEYS = new Set([
  'patientname',
  'patient_name',
  'patientid',
  'patient_id',
  'mrn',
  'medicalrecordnumber',
  'medical_record_number',
  'dob',
  'dateofbirth',
  'date_of_birth',
  'email',
  'phone',
  'telephone',
  'address',
  'nationalid',
  'national_id',
])

function requireText(value: string | undefined, field: string, blockers: string[]): void {
  if (!value?.trim()) blockers.push(`${field}-required`)
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9_]/g, '')
}

function scanForbiddenPhiKeys(value: unknown, path: string, blockers: string[]): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenPhiKeys(item, `${path}[${index}]`, blockers))
    return
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PHI_KEYS.has(normalizeKey(key))) blockers.push(`direct-phi-key-forbidden:${path}.${key}`)
    scanForbiddenPhiKeys(child, `${path}.${key}`, blockers)
  }
}

function sameCanonicalEvent(a: EvidenceLedgerEvent, b: EvidenceLedgerEvent): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function buildPersistedLedgerEnvelope(
  event: EvidenceLedgerEvent,
  recordedAt: string,
): PersistedLedgerEventEnvelope {
  return {
    eventId: event.eventId,
    product: event.product,
    subjectId: event.subjectId,
    eventKind: event.kind,
    occurredAt: event.occurredAt,
    recordedAt,
    artifactSha256: event.artifacts.map(artifact => artifact.sha256.toLowerCase()),
    actorType: event.actor.actorType,
    actorId: event.actor.actorId,
    policyBindings: event.policies.map(policy => `${policy.policyId}@${policy.policyVersion}`),
    parentEventIds: [...(event.parentEventIds ?? [])],
    evidenceRecordIds: [...(event.evidenceRecordIds ?? [])],
    canonicalEvent: event,
  }
}

export function evaluateLedgerPersistence(
  input: LedgerPersistenceInput,
): LedgerPersistenceResult {
  const blockers: string[] = []
  requireText(input.recordedAt, 'recordedAt', blockers)

  const eventValidation = validateEvidenceLedgerEvent(input.event)
  blockers.push(...eventValidation.blockers.map(blocker => `event-invalid:${blocker}`))
  scanForbiddenPhiKeys(input.event, 'event', blockers)

  const sameIdRows = input.existingRows.filter(row => row.eventId === input.event.eventId)
  if (sameIdRows.length > 1) blockers.push('existing-ledger-event-id-not-unique')
  const existing = sameIdRows[0]

  if (existing) {
    if (existing.product !== input.event.product) blockers.push('event-id-collision-across-products')
    if (!sameCanonicalEvent(existing.canonicalEvent, input.event)) blockers.push('append-only-event-mutation-forbidden')

    if (blockers.length) return { decision: 'HOLD', blockers }
    return { decision: 'NOOP', blockers: [] }
  }

  if (blockers.length) return { decision: 'HOLD', blockers }

  return {
    decision: 'APPEND',
    blockers: [],
    envelope: buildPersistedLedgerEnvelope(input.event, input.recordedAt),
  }
}

export interface LedgerPersistencePartition {
  product: LedgerProduct
  logicalPartitionKey: string
}

export function getLedgerPersistencePartition(product: LedgerProduct): LedgerPersistencePartition {
  return {
    product,
    logicalPartitionKey: `governance-ledger:${product.toLowerCase()}`,
  }
}

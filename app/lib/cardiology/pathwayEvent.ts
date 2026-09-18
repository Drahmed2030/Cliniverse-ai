import { z } from 'zod'
import { sha256Hex } from '../receipts/canonicalHash.ts'
import type { PathwaySessionStage } from './pathwaySession.ts'

// PathwayEvent — Batch 7. A typed, append-only event contract for Pathway
// Replay Intelligence v2. Every event is hash-chained to the one before it
// (previousEventHash → eventHash), so a stored history can be checked for
// tampering by recomputing hashes, not just trusted at face value. This is
// a TAMPER-EVIDENT structural chain, not a blockchain, not a signature, and
// not an identity proof — see app/lib/receipts/canonicalHash.ts.
//
// No patient identifiers and no PHI may ever appear in an event payload —
// enforced at construction time by assertNoForbiddenIdentifiers below, not
// just documented.

export const PATHWAY_EVENT_SCHEMA_VERSION = 1 as const
export const PATHWAY_EVENT_GENESIS_HASH = '0'.repeat(64)

export const PATHWAY_EVENT_TYPES = [
  'pathway.opened',
  'evidence.reviewed',
  'drill.started',
  'drill.submitted',
  'receipt.created',
  'reassessment.started',
  'reassessment.completed',
  'closure.requested',
  'review.pending',
  'review.completed',
] as const

export type PathwayEventType = typeof PATHWAY_EVENT_TYPES[number]
export type PathwayActorType = 'learner' | 'system' | 'reviewer'

/** JSON-safe, flat-ish payload — never a patient identifier or free-text clinical note. */
export type PathwayEventPayloadValue = string | number | boolean | null
export type PathwayEventPayload = Readonly<Record<string, PathwayEventPayloadValue>>

export interface PathwayEvent {
  schemaVersion: typeof PATHWAY_EVENT_SCHEMA_VERSION
  eventId: string
  sessionId: string
  eventType: PathwayEventType
  occurredAt: string
  stage: PathwaySessionStage
  actorType: PathwayActorType
  evidenceRefs: readonly string[]
  payload: PathwayEventPayload
  previousEventHash: string
  eventHash: string
}

export type CreatePathwayEventInput = Omit<PathwayEvent, 'schemaVersion' | 'eventHash'>

const FORBIDDEN_KEY_PATTERN = /patient|mrn|ssn|dob|nhs_?number|nationalid/i
const FORBIDDEN_VALUE_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/ // SSN-shaped

function assertNoForbiddenIdentifiers(payload: PathwayEventPayload): void {
  for (const [key, value] of Object.entries(payload)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) {
      throw new Error(`Pathway event payload key "${key}" looks like a patient identifier field, which is never permitted.`)
    }
    if (typeof value === 'string' && FORBIDDEN_VALUE_PATTERN.test(value)) {
      throw new Error(`Pathway event payload value for "${key}" matches a patient-identifier shape, which is never permitted.`)
    }
  }
}

/** Computes eventHash over every field except eventHash itself, chained from previousEventHash. */
export async function createPathwayEvent(input: CreatePathwayEventInput): Promise<PathwayEvent> {
  if (!input.sessionId.trim()) throw new Error('Pathway event requires a sessionId.')
  if (!input.eventId.trim()) throw new Error('Pathway event requires an eventId.')
  if (!PATHWAY_EVENT_TYPES.includes(input.eventType)) throw new Error(`Unknown pathway event type: ${input.eventType}`)
  if (Number.isNaN(Date.parse(input.occurredAt))) throw new Error(`Pathway event ${input.eventId} has an invalid occurredAt timestamp.`)
  assertNoForbiddenIdentifiers(input.payload)

  const withoutHash: Omit<PathwayEvent, 'eventHash'> = {
    schemaVersion: PATHWAY_EVENT_SCHEMA_VERSION,
    eventId: input.eventId,
    sessionId: input.sessionId,
    eventType: input.eventType,
    occurredAt: input.occurredAt,
    stage: input.stage,
    actorType: input.actorType,
    evidenceRefs: [...input.evidenceRefs],
    payload: { ...input.payload },
    previousEventHash: input.previousEventHash,
  }

  const eventHash = await sha256Hex(withoutHash)
  return { ...withoutHash, eventHash }
}

/** Appends a new event onto an existing history, chaining from the last event's hash (or the genesis hash for the first event). */
export async function appendPathwayEvent(
  history: readonly PathwayEvent[],
  input: Omit<CreatePathwayEventInput, 'previousEventHash'>,
): Promise<PathwayEvent[]> {
  const previousEventHash = history.length ? history[history.length - 1].eventHash : PATHWAY_EVENT_GENESIS_HASH
  const event = await createPathwayEvent({ ...input, previousEventHash })
  return [...history, event]
}

export interface PathwayEventChainVerification {
  valid: boolean
  brokenAtIndex: number | null
  reason: string | null
}

/** Recomputes every event's hash and checks the previousEventHash chain end-to-end. Detects both a tampered payload and a reordered/spliced history. */
export async function verifyPathwayEventChain(history: readonly PathwayEvent[]): Promise<PathwayEventChainVerification> {
  let expectedPrevious = PATHWAY_EVENT_GENESIS_HASH
  for (let index = 0; index < history.length; index += 1) {
    const event = history[index]
    if (event.previousEventHash !== expectedPrevious) {
      return { valid: false, brokenAtIndex: index, reason: 'previousEventHash does not match the prior event in the chain' }
    }
    const { eventHash, ...withoutHash } = event
    const recomputed = await sha256Hex(withoutHash)
    if (recomputed !== eventHash) {
      return { valid: false, brokenAtIndex: index, reason: 'eventHash does not match the recomputed hash of this event' }
    }
    expectedPrevious = eventHash
  }
  return { valid: true, brokenAtIndex: null, reason: null }
}

/** Derives the furthest stage reached, purely from event history — a cross-check against the session reducer's own tracked stage, not a replacement for it. */
export function deriveStageFromEventHistory(history: readonly PathwayEvent[]): PathwaySessionStage {
  const rank: Record<PathwaySessionStage, number> = { replay: 0, drill: 1, reassessment: 2, closure: 3 }
  let furthest: PathwaySessionStage = 'replay'
  for (const event of history) {
    if (rank[event.stage] > rank[furthest]) furthest = event.stage
  }
  return furthest
}

// ── Zod restore/import boundary ────────────────────────────────────────
// Runtime validation belongs exactly at trust boundaries: session/local
// storage restore and any future external event import. Internal code that
// only ever passes freshly-created PathwayEvent values does not need to
// re-validate through Zod on every call.

const pathwayEventPayloadValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])

export const pathwayEventSchema = z.object({
  schemaVersion: z.literal(PATHWAY_EVENT_SCHEMA_VERSION),
  eventId: z.string().min(1),
  sessionId: z.string().min(1),
  eventType: z.enum(PATHWAY_EVENT_TYPES),
  occurredAt: z.string().refine(value => !Number.isNaN(Date.parse(value)), 'invalid timestamp'),
  stage: z.enum(['replay', 'drill', 'reassessment', 'closure']),
  actorType: z.enum(['learner', 'system', 'reviewer']),
  evidenceRefs: z.array(z.string()),
  payload: z.record(z.string(), pathwayEventPayloadValueSchema),
  previousEventHash: z.string().length(64),
  eventHash: z.string().length(64),
}).strict()

export const pathwayEventHistorySchema = z.array(pathwayEventSchema)

/** Fails closed: any malformed event, unsupported schema version, or broken hash chain returns null rather than a partially-trusted history. */
export async function parsePathwayEventHistory(raw: unknown): Promise<PathwayEvent[] | null> {
  const result = pathwayEventHistorySchema.safeParse(raw)
  if (!result.success) return null
  const verification = await verifyPathwayEventChain(result.data)
  if (!verification.valid) return null
  return result.data
}

import { sha256Hex } from '../receipts/canonicalHash.ts'
import {
  RESUSCITATION_EVENT_TYPES,
  type ResuscitationEvent,
} from './resuscitationCore.ts'

// resuscitationEvent — Batch 9 Section 10. Reuses Batch 7's event/receipt
// concepts (app/lib/cardiology/pathwayEvent.ts's design) rather than
// building a new evidence model — same hash-chaining primitive
// (app/lib/receipts/canonicalHash.ts), same fail-closed restore posture,
// adapted for the resuscitation event vocabulary
// (RESUSCITATION_EVENT_TYPES in resuscitationCore.ts).

export const RESUSCITATION_EVENT_GENESIS_HASH = '0'.repeat(64)

export type CreateResuscitationEventInput = Omit<ResuscitationEvent, 'schemaVersion' | 'eventHash'>

export async function createResuscitationEvent(input: CreateResuscitationEventInput): Promise<ResuscitationEvent> {
  if (!input.sessionId.trim()) throw new Error('Resuscitation event requires a sessionId.')
  if (!input.eventId.trim()) throw new Error('Resuscitation event requires an eventId.')
  if (!RESUSCITATION_EVENT_TYPES.includes(input.eventType)) throw new Error(`Unknown resuscitation event type: ${input.eventType}`)
  if (Number.isNaN(Date.parse(input.occurredAt))) throw new Error(`Resuscitation event ${input.eventId} has an invalid occurredAt timestamp.`)

  const withoutHash: Omit<ResuscitationEvent, 'eventHash'> = {
    schemaVersion: 1,
    eventId: input.eventId,
    sessionId: input.sessionId,
    eventType: input.eventType,
    occurredAt: input.occurredAt,
    scenarioId: input.scenarioId,
    actorType: input.actorType,
    payload: { ...input.payload },
    previousEventHash: input.previousEventHash,
  }
  const eventHash = await sha256Hex(withoutHash)
  return { ...withoutHash, eventHash }
}

export async function appendResuscitationEvent(
  history: readonly ResuscitationEvent[],
  input: Omit<CreateResuscitationEventInput, 'previousEventHash'>,
): Promise<ResuscitationEvent[]> {
  const previousEventHash = history.length ? history[history.length - 1].eventHash : RESUSCITATION_EVENT_GENESIS_HASH
  const event = await createResuscitationEvent({ ...input, previousEventHash })
  return [...history, event]
}

export interface ResuscitationEventChainVerification {
  valid: boolean
  brokenAtIndex: number | null
}

export async function verifyResuscitationEventChain(history: readonly ResuscitationEvent[]): Promise<ResuscitationEventChainVerification> {
  let expectedPrevious = RESUSCITATION_EVENT_GENESIS_HASH
  for (let index = 0; index < history.length; index += 1) {
    const event = history[index]
    if (event.previousEventHash !== expectedPrevious) return { valid: false, brokenAtIndex: index }
    const { eventHash, ...withoutHash } = event
    const recomputed = await sha256Hex(withoutHash)
    if (recomputed !== eventHash) return { valid: false, brokenAtIndex: index }
    expectedPrevious = eventHash
  }
  return { valid: true, brokenAtIndex: null }
}

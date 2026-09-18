import { sha256Hex } from '../receipts/canonicalHash.ts'
import type { ResuscitationEvidenceReceipt } from './resuscitationCore.ts'

// evidenceReceipt — Batch 9 Section 14. A shared receipt family over Batch
// 7's tamper-evident receipt infrastructure (app/lib/receipts/canonicalHash.ts)
// — no competing receipt schema. One function, four subtypes (lesson,
// drill, simulation, pathway) rather than four separate hashing
// implementations. Same rule as Batch 7/8: never a signature, certificate,
// or credential.

export interface CreateResuscitationReceiptInput {
  subtype: ResuscitationEvidenceReceipt['subtype']
  unitOrScenarioId: string
  sourceRefs: readonly string[]
  eventRefs: readonly string[]
  /** Arbitrary subtype-specific payload (score, attempts, etc.) folded into the canonical hash — e.g. a simulation's performance summary. Never includes PHI. */
  payload: Readonly<Record<string, string | number | boolean | null>>
}

export async function createResuscitationEvidenceReceipt(
  input: CreateResuscitationReceiptInput,
): Promise<ResuscitationEvidenceReceipt> {
  if (!input.unitOrScenarioId.trim()) throw new Error('A resuscitation receipt requires a unit or scenario id.')
  if (!input.sourceRefs.length) throw new Error('A resuscitation receipt requires sourceRefs.')
  if (!input.eventRefs.length) throw new Error('A resuscitation receipt requires at least one eventRef — a receipt without evidence is not tamper-evident of anything.')

  const canonicalPayload = {
    schemaVersion: 1 as const,
    subtype: input.subtype,
    unitOrScenarioId: input.unitOrScenarioId,
    sourceRefs: [...input.sourceRefs],
    eventRefs: [...input.eventRefs],
    payload: { ...input.payload },
    verification: 'tamper-evident-structural-receipt' as const,
    humanReviewRequired: true as const,
  }
  const receiptHash = await sha256Hex(canonicalPayload)

  return {
    schemaVersion: 1,
    receiptId: `resuscitation-receipt-${input.subtype}-${receiptHash.slice(0, 16)}`,
    receiptHash,
    subtype: input.subtype,
    sourceRefs: canonicalPayload.sourceRefs,
    eventRefs: canonicalPayload.eventRefs,
    verification: 'tamper-evident-structural-receipt',
    humanReviewRequired: true,
  }
}

/** Recomputes the hash from the receipt's own visible fields plus the original payload the caller must still hold — a receipt alone (without its originating payload) cannot re-verify itself, by design, the same way a hash alone can't reconstruct its input. Callers that need to verify must recompute via createResuscitationEvidenceReceipt with the same input and compare receiptHash. */
export function receiptClaimsCertificationOrCredential(receipt: ResuscitationEvidenceReceipt): boolean {
  const serialized = JSON.stringify(receipt).toLowerCase()
  return serialized.includes('certificate') || serialized.includes('credential') || serialized.includes('signature')
}

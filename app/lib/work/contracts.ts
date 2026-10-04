import { z } from 'zod'

const ref = z.string().trim().min(1).max(128)
const timestamp = z.iso.datetime({ offset: true })
const version = z.literal(1)
export const EvidenceTrustSchema = z.strictObject({
  availability: z.enum(['available', 'unavailable', 'unknown', 'permission-limited']),
  freshness: z.enum(['current', 'stale', 'unknown']),
  verification: z.enum(['verified', 'unverified', 'unknown']),
  sourceAuthority: z.enum(['cliniverse-governed', 'health-cloud-context', 'source-system']),
  provenanceRef: z.string().max(128).optional(),
})
export const WorkSessionSchema = z.strictObject({
  schemaVersion: version, subjectRef: ref, organizationRef: ref,
  organizationLabel: z.string().min(1).max(200),
  sessionGeneration: z.number().int().nonnegative(),
  capabilities: z.array(ref).max(100), expiresAt: timestamp,
})
export const AssignedChangeSchema = z.strictObject({
  schemaVersion: version, assignmentId: ref, organizationRef: ref,
  patientContext: z.strictObject({ reference: ref }),
  assignmentRevision: ref, sourceRevision: ref, reviewRevision: ref,
  title: z.string().min(1).max(200),
  changes: z.array(z.strictObject({ field: ref, before: z.string().max(2000).nullable(), current: z.string().max(2000).nullable() })).max(100),
  sourceRef: ref, sourceUpdatedAt: timestamp, retrievedAt: timestamp,
  evidenceTrust: EvidenceTrustSchema, allowedActions: z.array(ref).max(100),
})
export const AssignedChangePageSchema = z.strictObject({
  schemaVersion: version, items: z.array(AssignedChangeSchema).max(25), nextCursor: ref.nullable(),
})
// First synthetic slice supports bounded plain text only; no arbitrary URL or HTML delivery.
export const SourceEvidenceSchema = z.strictObject({
  schemaVersion: version, assignmentId: ref, organizationRef: ref, sourceRef: ref,
  sourceRevision: ref, reviewRevision: ref, mediaType: z.literal('text/plain'),
  content: z.string().max(65536), retrievedAt: timestamp,
})
export const ReviewRequestSchema = z.strictObject({ operationId: ref, reviewRevision: ref, sourceRevision: ref })
export const ReviewReceiptSchema = z.strictObject({
  schemaVersion: version, receiptId: ref, operationId: ref, assignmentId: ref,
  organizationRef: ref, reviewerRef: ref, reviewRevision: ref, sourceRevision: ref,
  recordedAt: timestamp, status: z.literal('recorded'), workflowEffect: z.literal('review_only'),
})
export const ReviewOutcomeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('recorded'), receipt: ReviewReceiptSchema }),
  z.strictObject({ kind: z.literal('pending') }),
  z.strictObject({ kind: z.literal('not-recorded') }),
  z.strictObject({ kind: z.literal('unknown') }),
])
export type WorkSession = z.infer<typeof WorkSessionSchema>
export type AssignedChange = z.infer<typeof AssignedChangeSchema>
export type AssignedChangePage = z.infer<typeof AssignedChangePageSchema>
export type SourceEvidence = z.infer<typeof SourceEvidenceSchema>
export type ReviewRequest = z.infer<typeof ReviewRequestSchema>
export type ReviewReceipt = z.infer<typeof ReviewReceiptSchema>
export type ReviewOutcome = z.infer<typeof ReviewOutcomeSchema>
export interface WorkGateway {
  session(signal: AbortSignal): Promise<WorkSession>
  list(cursor: string | null, signal: AbortSignal): Promise<AssignedChangePage>
  detail(id: string, signal: AbortSignal): Promise<AssignedChange>
  source(id: string, signal: AbortSignal): Promise<SourceEvidence>
  acknowledge(id: string, request: ReviewRequest, signal: AbortSignal): Promise<ReviewReceipt>
  outcome(id: string, operationId: string, signal: AbortSignal): Promise<ReviewOutcome>
}
export function parseWorkJson<T>(text: string, schema: z.ZodType<T>): T {
  if (new TextEncoder().encode(text).byteLength > 262144) throw new Error('work_response_too_large')
  try { return schema.parse(JSON.parse(text)) }
  catch { throw new Error('work_response_invalid') }
}

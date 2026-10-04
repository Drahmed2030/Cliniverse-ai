import { ReviewRequestSchema } from './contracts.ts'
import type { WorkGateway, WorkSession, AssignedChange, SourceEvidence, ReviewReceipt } from './contracts.ts'

export type Scenario = 'happy' | 'stale' | 'revoked' | 'timeout-after-commit' | 'malformed' | 'reassigned'

/** In-memory synthetic preview only. No network, environment credentials or durable storage. */
export function createSyntheticGateway(clock: () => number, scenario: Scenario, institution: 'A' | 'B' = 'A'): WorkGateway {
  if (!['happy', 'stale', 'revoked', 'timeout-after-commit', 'malformed', 'reassigned'].includes(scenario)
    || !['A', 'B'].includes(institution)) throw new Error('synthetic_scenario_invalid')
  const suffix = institution.toLowerCase()
  const now = () => new Date(clock()).toISOString()
  const organizationRef = `synthetic:org:${suffix}`
  const subjectRef = `synthetic:doctor:${suffix}`
  const assignmentId = `synthetic:assignment:${suffix}`
  const createdAt = now()
  const expiresAt = new Date(clock() + 3600000).toISOString()
  const records = new Map<string, { fingerprint: string; receipt: ReviewReceipt }>()
  const item: AssignedChange = {
    schemaVersion: 1, assignmentId, organizationRef,
    patientContext: { reference: `synthetic:subject:${suffix}` },
    assignmentRevision: 'synthetic:assignment-revision:1', sourceRevision: 'synthetic:source-revision:1', reviewRevision: 'synthetic:review-revision:1',
    title: 'Synthetic source change', changes: [{ field: 'synthetic:status', before: 'pending', current: 'available' }],
    sourceRef: `synthetic:source:${suffix}`, sourceUpdatedAt: createdAt, retrievedAt: createdAt,
    evidenceTrust: { availability: 'available', freshness: 'current', verification: 'verified', sourceAuthority: 'health-cloud-context', provenanceRef: 'synthetic:provenance:1' },
    allowedActions: ['acknowledge_review'],
  }
  const guard = (signal: AbortSignal, id?: string) => {
    if (signal.aborted) throw new Error('work_request_aborted')
    if (scenario === 'revoked' || clock() >= Date.parse(expiresAt)) throw new Error('work_access_revoked')
    if (id !== undefined && id !== assignmentId) throw new Error('work_assignment_unavailable')
  }
  return {
    async session(signal) {
      if (signal.aborted) throw new Error('work_request_aborted')
      const session: WorkSession = { schemaVersion: 1, subjectRef, organizationRef,
        organizationLabel: `Synthetic institution ${institution}`, sessionGeneration: 1,
        capabilities: scenario === 'revoked' ? [] : ['acknowledge_review'], expiresAt }
      // Deliberately invalid provider response; only the synthetic malformed scenario emits it.
      return scenario === 'malformed' ? { ...session, schemaVersion: 2 } as unknown as WorkSession : session
    },
    async list(cursor, signal) {
      guard(signal)
      if (cursor !== null) throw new Error('work_cursor_invalid')
      return { schemaVersion: 1, items: [structuredClone(item)], nextCursor: null }
    },
    async detail(id, signal) { guard(signal, id); return structuredClone(item) },
    async source(id, signal) {
      guard(signal, id)
      const source: SourceEvidence = { schemaVersion: 1, assignmentId, organizationRef,
        sourceRef: item.sourceRef, sourceRevision: item.sourceRevision, reviewRevision: item.reviewRevision,
        mediaType: 'text/plain', content: 'Synthetic evidence only. No patient data.', retrievedAt: now() }
      return source
    },
    async acknowledge(id, input, signal) {
      // Authorization precedes replay, including an already committed operation.
      guard(signal, id)
      const parsed = ReviewRequestSchema.safeParse(input)
      if (!parsed.success) throw new Error('work_request_invalid')
      const request = parsed.data
      const key = JSON.stringify([organizationRef, subjectRef, request.operationId])
      const fingerprint = JSON.stringify([id, request.reviewRevision, request.sourceRevision])
      const existing = records.get(key)
      if (existing) {
        if (existing.fingerprint !== fingerprint) throw new Error('work_operation_conflict')
        return structuredClone(existing.receipt)
      }
      if (scenario === 'stale' || scenario === 'reassigned'
        || request.sourceRevision !== item.sourceRevision || request.reviewRevision !== item.reviewRevision) throw new Error('work_revision_conflict')
      const receipt: ReviewReceipt = { schemaVersion: 1, receiptId: `synthetic:receipt:${suffix}:${records.size + 1}`,
        operationId: request.operationId, assignmentId, organizationRef, reviewerRef: subjectRef,
        reviewRevision: request.reviewRevision, sourceRevision: request.sourceRevision,
        recordedAt: now(), status: 'recorded', workflowEffect: 'review_only' }
      records.set(key, { fingerprint, receipt })
      if (scenario === 'timeout-after-commit') throw new Error('work_outcome_uncertain')
      return structuredClone(receipt)
    },
    async outcome(id, operationId, signal) {
      guard(signal, id)
      const existing = records.get(JSON.stringify([organizationRef, subjectRef, operationId]))
      return existing ? { kind: 'recorded', receipt: structuredClone(existing.receipt) } : { kind: 'not-recorded' }
    },
  }
}

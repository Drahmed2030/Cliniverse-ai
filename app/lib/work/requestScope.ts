import { z } from 'zod'
import {
  WorkSessionSchema, AssignedChangePageSchema, AssignedChangeSchema, SourceEvidenceSchema,
  ReviewRequestSchema, ReviewReceiptSchema, ReviewOutcomeSchema,
} from './contracts.ts'
import type { WorkGateway, WorkSession, ReviewRequest, ReviewReceipt, ReviewOutcome } from './contracts.ts'

const reference = z.string().trim().min(1).max(128)
const PendingOperationSchema = z.strictObject({
  organizationRef: reference, subjectRef: reference, assignmentId: reference, request: ReviewRequestSchema,
})
export type PendingOperation = z.infer<typeof PendingOperationSchema>

/** One authenticated in-memory scope. Closing cancels observation, never reverses a remote commit.
 * No storage, logging, retry, authorization authority or clinical workflow mutation lives here.
 */
export function createWorkRequestScope(
  gateway: WorkGateway, input: WorkSession,
  options: { now?: () => number; timeoutMs?: number } = {},
) {
  const session = WorkSessionSchema.parse(input)
  const now = options.now ?? Date.now
  const timeoutMs = options.timeoutMs ?? 15000
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw Error('work_timeout_invalid')
  const controllers = new Set<AbortController>()
  let closed = false
  let pending: PendingOperation | null = null
  let writing = false
  let recovering = false

  function check() {
    if (closed) throw Error('work_scope_closed')
    if (now() >= Date.parse(session.expiresAt)) throw Error('work_access_revoked')
  }
  async function call<T>(run: (signal: AbortSignal) => Promise<T>): Promise<T> {
    check()
    const controller = new AbortController()
    controllers.add(controller)
    let timer: ReturnType<typeof setTimeout> | undefined
    let rejectAbort: (() => void) | undefined
    try {
      const interrupted = new Promise<never>((_, reject) => {
        rejectAbort = () => reject(Error(closed ? 'work_scope_closed' : 'work_request_timeout'))
        controller.signal.addEventListener('abort', rejectAbort, { once: true })
        timer = setTimeout(() => controller.abort(), timeoutMs)
      })
      const result = await Promise.race([run(controller.signal), interrupted])
      check()
      return result
    } finally {
      clearTimeout(timer)
      if (rejectAbort) controller.signal.removeEventListener('abort', rejectAbort)
      controllers.delete(controller)
    }
  }
  function parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const parsed = schema.safeParse(value)
    if (!parsed.success) throw Error('work_response_invalid')
    return parsed.data
  }
  function matchReceipt(receipt: ReviewReceipt, operation: PendingOperation) {
    if (receipt.organizationRef !== operation.organizationRef || receipt.reviewerRef !== operation.subjectRef
      || receipt.assignmentId !== operation.assignmentId || receipt.operationId !== operation.request.operationId
      || receipt.reviewRevision !== operation.request.reviewRevision || receipt.sourceRevision !== operation.request.sourceRevision) {
      throw Error('work_response_invalid')
    }
  }
  const snapshot = () => pending ? structuredClone(pending) : null
  return {
    close() {
      closed = true
      for (const controller of controllers) controller.abort()
    },
    pendingOperation: snapshot,
    async list(cursor: string | null) {
      const result = parse(AssignedChangePageSchema, await call(s => gateway.list(cursor, s)))
      if (result.items.some(item => item.organizationRef !== session.organizationRef)) throw Error('work_response_invalid')
      return result
    },
    async detail(id: string) {
      const result = parse(AssignedChangeSchema, await call(s => gateway.detail(id, s)))
      if (result.organizationRef !== session.organizationRef || result.assignmentId !== id) throw Error('work_response_invalid')
      return result
    },
    async source(id: string) {
      const result = parse(SourceEvidenceSchema, await call(s => gateway.source(id, s)))
      if (result.organizationRef !== session.organizationRef || result.assignmentId !== id) throw Error('work_response_invalid')
      return result
    },
    async acknowledge(id: string, inputRequest: ReviewRequest) {
      check()
      if (pending || writing || recovering) throw Error('work_operation_pending')
      if (!session.capabilities.includes('acknowledge_review')) throw Error('work_access_revoked')
      const operation = PendingOperationSchema.parse({ organizationRef: session.organizationRef,
        subjectRef: session.subjectRef, assignmentId: id, request: inputRequest })
      pending = operation
      writing = true
      try {
        // Clone prevents a provider from mutating the recovery descriptor.
        const receipt = parse(ReviewReceiptSchema, await call(s => gateway.acknowledge(id, structuredClone(operation.request), s)))
        matchReceipt(receipt, operation)
        pending = null
        return receipt
      } catch (error) {
        // Only an explicit, known no-commit response releases the pending operation.
        if (error instanceof Error && error.message === 'work_revision_conflict') {
          pending = null
          throw Error('work_revision_conflict')
        }
        throw Error('work_outcome_uncertain')
      } finally { writing = false }
    },
    async reconcile(inputOperation: PendingOperation): Promise<ReviewOutcome> {
      check()
      const operation = parse(PendingOperationSchema, inputOperation)
      if (operation.organizationRef !== session.organizationRef || operation.subjectRef !== session.subjectRef) {
        throw Error('work_recovery_scope_mismatch')
      }
      if (writing || recovering) throw Error('work_operation_pending')
      if (pending && (pending.assignmentId !== operation.assignmentId
        || pending.request.operationId !== operation.request.operationId
        || pending.request.reviewRevision !== operation.request.reviewRevision
        || pending.request.sourceRevision !== operation.request.sourceRevision)) throw Error('work_operation_pending')
      pending = operation
      recovering = true
      try {
        const outcome = parse(ReviewOutcomeSchema, await call(s => gateway.outcome(operation.assignmentId, operation.request.operationId, s)))
        if (outcome.kind === 'recorded') matchReceipt(outcome.receipt, operation)
        if (outcome.kind === 'recorded' || outcome.kind === 'not-recorded') pending = null
        return outcome
      } catch { throw Error('work_outcome_uncertain') }
      finally { recovering = false }
    },
  }
}
export type WorkRequestScope = ReturnType<typeof createWorkRequestScope>

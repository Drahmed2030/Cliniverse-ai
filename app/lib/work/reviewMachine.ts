import { evidenceUseDecision } from '../trust/evidenceTrust.ts'
import { evidencePresentationState } from '../trust/trustedSurfaceState.ts'
import {
  WorkSessionSchema, AssignedChangeSchema, SourceEvidenceSchema, ReviewRequestSchema,
  ReviewReceiptSchema, ReviewOutcomeSchema,
} from './contracts.ts'
import type { WorkSession, AssignedChange, SourceEvidence, ReviewRequest, ReviewReceipt } from './contracts.ts'

type Context = { readonly generation: number; readonly session: WorkSession }
type Detail = Context & { readonly assignment: AssignedChange; readonly sourceSeenRevision: string | null }
type Source = Detail & { readonly source: SourceEvidence }
export type ReviewState =
  | { readonly kind: 'checking' | 'unavailable'; readonly generation: number }
  | (Context & { readonly kind: 'queue' })
  | (Context & { readonly kind: 'comparing'; readonly assignmentId: string })
  | (Detail & { readonly kind: 'detail' | 'stale' })
  | (Source & { readonly kind: 'source' })
  | (Source & { readonly kind: 'submitting' | 'uncertain'; readonly request: ReviewRequest })
  | (Detail & { readonly kind: 'recorded'; readonly receipt: ReviewReceipt })

export type ReviewEvent = { readonly generation: number } & (
  | { readonly type: 'RESET' | 'REVOKED' | 'TIMEOUT' | 'CONFLICT' }
  | { readonly type: 'SESSION'; readonly session: unknown }
  | { readonly type: 'SELECT'; readonly assignmentId: string }
  | { readonly type: 'DETAIL'; readonly assignment: unknown }
  | { readonly type: 'SOURCE'; readonly source: unknown }
  | { readonly type: 'SOURCE_RENDERED'; readonly reviewRevision: string }
  | { readonly type: 'CONFIRM'; readonly operationId: string; readonly now: string }
  | { readonly type: 'RECEIPT'; readonly receipt: unknown }
  | { readonly type: 'OUTCOME'; readonly outcome: unknown }
)

export function initialReviewState(generation = 0): ReviewState {
  if (!Number.isSafeInteger(generation) || generation < 0) throw new Error('work_generation_invalid')
  return { kind: 'checking', generation }
}

function acceptReceipt(state: Source & { readonly request: ReviewRequest }, input: unknown): ReviewState {
  const parsed = ReviewReceiptSchema.safeParse(input)
  const r = parsed.success ? parsed.data : null
  if (!r || r.organizationRef !== state.session.organizationRef || r.reviewerRef !== state.session.subjectRef
    || r.assignmentId !== state.assignment.assignmentId || r.operationId !== state.request.operationId
    || r.sourceRevision !== state.request.sourceRevision || r.reviewRevision !== state.request.reviewRevision) {
    return { ...state, kind: 'uncertain' }
  }
  return { kind: 'recorded', generation: state.generation, session: state.session,
    assignment: state.assignment, sourceSeenRevision: state.sourceSeenRevision, receipt: r }
}

/** Pure presentation controller. No authorization authority, I/O, storage or optimistic completion. */
export function transition(state: ReviewState, event: ReviewEvent): ReviewState {
  if (event.generation !== state.generation) return state
  if (event.type === 'RESET') return initialReviewState(state.generation + 1)
  if (event.type === 'REVOKED') return { kind: 'unavailable', generation: state.generation + 1 }
  if (event.type === 'SESSION') {
    if (state.kind !== 'checking') return state
    const parsed = WorkSessionSchema.safeParse(event.session)
    // Local request cancellation generations are independent of the server's session generation.
    if (!parsed.success) return { kind: 'unavailable', generation: state.generation + 1 }
    return { kind: 'queue', generation: state.generation, session: parsed.data }
  }
  if (!('session' in state)) return state
  // No navigation, refresh or second submission may overwrite an unresolved operation.
  if (state.kind === 'submitting' || state.kind === 'uncertain') {
    if (event.type === 'TIMEOUT') return { ...state, kind: 'uncertain' }
    if (event.type === 'RECEIPT') return acceptReceipt(state, event.receipt)
    if (event.type === 'CONFLICT') return { kind: 'stale', generation: state.generation, session: state.session, assignment: state.assignment, sourceSeenRevision: null }
    if (event.type === 'OUTCOME') {
      const outcome = ReviewOutcomeSchema.safeParse(event.outcome)
      if (!outcome.success) return { ...state, kind: 'uncertain' }
      if (outcome.data.kind === 'recorded') return acceptReceipt(state, outcome.data.receipt)
      if (outcome.data.kind === 'not-recorded') return { kind: 'stale', generation: state.generation, session: state.session, assignment: state.assignment, sourceSeenRevision: null }
      return { ...state, kind: 'uncertain' }
    }
    return state
  }
  if (event.type === 'SELECT') {
    if (!event.assignmentId.trim() || event.assignmentId.length > 128) return state
    return { kind: 'comparing', generation: state.generation, session: state.session, assignmentId: event.assignmentId }
  }
  if (event.type === 'DETAIL') {
    const parsed = AssignedChangeSchema.safeParse(event.assignment)
    if (!parsed.success || parsed.data.organizationRef !== state.session.organizationRef) return state
    const a = parsed.data
    const selected = state.kind === 'comparing' ? state.assignmentId : 'assignment' in state ? state.assignment.assignmentId : null
    if (a.assignmentId !== selected) return state
    const changed = 'assignment' in state && (a.sourceRevision !== state.assignment.sourceRevision
      || a.assignmentRevision !== state.assignment.assignmentRevision || a.reviewRevision !== state.assignment.reviewRevision
      || a.sourceRef !== state.assignment.sourceRef)
    return { kind: changed ? 'stale' : 'detail', generation: state.generation, session: state.session, assignment: a, sourceSeenRevision: null }
  }
  if (!('assignment' in state)) return state
  if (event.type === 'SOURCE') {
    // A stale detail must first be refreshed; a source response alone cannot repair it.
    if (state.kind !== 'detail' && state.kind !== 'source') return state
    const parsed = SourceEvidenceSchema.safeParse(event.source)
    if (!parsed.success) return state
    const s = parsed.data, a = state.assignment
    if (s.organizationRef !== state.session.organizationRef || s.assignmentId !== a.assignmentId
      || s.sourceRef !== a.sourceRef || s.sourceRevision !== a.sourceRevision || s.reviewRevision !== a.reviewRevision) return state
    return { kind: 'source', generation: state.generation, session: state.session, assignment: a, source: s, sourceSeenRevision: null }
  }
  if (event.type === 'SOURCE_RENDERED' && state.kind === 'source') {
    if (event.reviewRevision !== state.source.reviewRevision) return state
    return { ...state, sourceSeenRevision: event.reviewRevision }
  }
  if (event.type === 'CONFIRM' && state.kind === 'source') {
    const now = Date.parse(event.now)
    if (!Number.isFinite(now) || now >= Date.parse(state.session.expiresAt)) return { kind: 'unavailable', generation: state.generation + 1 }
    if (state.sourceSeenRevision !== state.assignment.reviewRevision
      || !state.session.capabilities.includes('acknowledge_review')
      || !state.assignment.allowedActions.includes('acknowledge_review')
      || !evidenceUseDecision(state.assignment.evidenceTrust).usable
      || evidencePresentationState(state.assignment.evidenceTrust).state !== 'ready') return state
    const request = ReviewRequestSchema.safeParse({ operationId: event.operationId, reviewRevision: state.assignment.reviewRevision, sourceRevision: state.assignment.sourceRevision })
    return request.success ? { ...state, kind: 'submitting', request: request.data } : state
  }
  return state
}

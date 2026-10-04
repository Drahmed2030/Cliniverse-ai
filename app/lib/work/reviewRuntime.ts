import { WorkSessionSchema } from './contracts.ts'
import type { AssignedChange, ReviewReceipt, WorkGateway } from './contracts.ts'
import { initialReviewState, transition } from './reviewMachine.ts'
import type { ReviewEvent, ReviewState } from './reviewMachine.ts'
import { createWorkRequestScope } from './requestScope.ts'
import type { PendingOperation, WorkRequestScope } from './requestScope.ts'

type Recovery = { kind: 'uncertain' | 'not-recorded' } | { kind: 'recorded'; receipt: ReviewReceipt }
export type WorkSnapshot = { state: ReviewState; items: readonly AssignedChange[]; busy: boolean; recovery: Recovery | null }

/** Framework-independent effect runner. All data and unresolved operation handles stay in memory. */
export function createWorkReviewRuntime(gateway: WorkGateway, options: {
  now?: () => number; operationId?: () => string; timeoutMs?: number; available?: () => boolean
} = {}) {
  const now = options.now ?? Date.now
  const operationId = options.operationId ?? (() => crypto.randomUUID())
  let snapshot: WorkSnapshot = { state: initialReviewState(), items: [], busy: false, recovery: null }
  const listeners = new Set<() => void>()
  let scope: WorkRequestScope | null = null
  let pending: PendingOperation | null = null
  let sessionRequest: AbortController | null = null
  let expiry: ReturnType<typeof setTimeout> | undefined
  const emit = (patch: Partial<WorkSnapshot>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(fn => fn()) }
  const send = (event: ReviewEvent) => emit({ state: transition(snapshot.state, event) })
  const current = (generation: number) => snapshot.state.generation === generation
  function cancel() {
    pending = scope?.pendingOperation() ?? pending
    scope?.close(); scope = null
    sessionRequest?.abort(); sessionRequest = null
    clearTimeout(expiry)
  }
  function suspend() {
    cancel()
    emit({ state: { kind: 'unavailable', generation: snapshot.state.generation + 1 }, items: [], recovery: null, busy: false })
  }
  function available() {
    if (options.available && !options.available()) { suspend(); return false }
    return true
  }
  async function start() {
    if (!available()) return
    cancel()
    const generation = snapshot.state.generation + 1
    emit({ state: initialReviewState(generation), items: [], busy: true, recovery: null })
    const controller = new AbortController()
    sessionRequest = controller
    let timeout: ReturnType<typeof setTimeout> | undefined
    let onAbort: (() => void) | undefined
    try {
      const interrupted = new Promise<never>((_, reject) => {
        onAbort = () => reject(Error('work_session_interrupted'))
        controller.signal.addEventListener('abort', onAbort, { once: true })
        timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000)
      })
      const input = await Promise.race([gateway.session(controller.signal), interrupted])
      if (!current(generation)) return
      const session = WorkSessionSchema.parse(input)
      if (now() >= Date.parse(session.expiresAt)) throw Error('work_access_revoked')
      if (pending && (pending.subjectRef !== session.subjectRef || pending.organizationRef !== session.organizationRef)) throw Error('work_recovery_scope_mismatch')
      scope = createWorkRequestScope(gateway, session, { now, timeoutMs: options.timeoutMs })
      send({ type: 'SESSION', generation, session })
      // Expiry masks protected data even when no new request is made.
      const checkExpiry = () => {
        const remaining = Date.parse(session.expiresAt) - now()
        if (remaining <= 0) suspend()
        else expiry = setTimeout(checkExpiry, Math.min(remaining, 2147483647))
      }
      checkExpiry()
      if (pending) emit({ recovery: { kind: 'uncertain' } })
      else {
        const page = await scope.list(null)
        if (current(generation)) emit({ items: page.items })
      }
    } catch { if (current(generation)) suspend() }
    finally {
      clearTimeout(timeout)
      if (onAbort) controller.signal.removeEventListener('abort', onAbort)
      if (sessionRequest === controller) sessionRequest = null
      if (current(generation)) emit({ busy: false })
    }
  }
  async function select(id: string) {
    if (!available()) return
    if (!scope || snapshot.busy || snapshot.recovery || !['queue', 'detail', 'source', 'stale', 'recorded'].includes(snapshot.state.kind)) return
    const generation = snapshot.state.generation
    send({ type: 'SELECT', generation, assignmentId: id }); emit({ busy: true })
    try {
      const assignment = await scope.detail(id)
      if (current(generation)) send({ type: 'DETAIL', generation, assignment })
    } catch { if (current(generation)) suspend() }
    finally { if (current(generation)) emit({ busy: false }) }
  }
  async function openSource() {
    if (!available()) return
    const state = snapshot.state
    if (!scope || snapshot.busy || state.kind !== 'detail') return
    const generation = state.generation
    emit({ busy: true })
    try {
      const source = await scope.source(state.assignment.assignmentId)
      if (current(generation)) {
        send({ type: 'SOURCE', generation, source })
        if (snapshot.state.kind !== 'source') suspend()
      }
    } catch { if (current(generation)) suspend() }
    finally { if (current(generation)) emit({ busy: false }) }
  }
  async function confirm() {
    if (!available()) return
    if (!scope || snapshot.busy || snapshot.state.kind !== 'source') return
    const generation = snapshot.state.generation
    const state = transition(snapshot.state, { type: 'CONFIRM', generation, operationId: operationId(), now: new Date(now()).toISOString() })
    emit({ state })
    if (state.kind === 'unavailable') { suspend(); return }
    if (state.kind !== 'submitting') return
    emit({ busy: true })
    try {
      const receipt = await scope.acknowledge(state.assignment.assignmentId, state.request)
      if (current(generation)) { pending = null; send({ type: 'RECEIPT', generation, receipt }) }
    } catch (error) {
      if (current(generation)) {
        pending = scope?.pendingOperation() ?? pending
        send({ type: error instanceof Error && error.message === 'work_revision_conflict' ? 'CONFLICT' : 'TIMEOUT', generation })
      }
    } finally { if (current(generation)) emit({ busy: false }) }
  }
  async function reconcile() {
    if (!available()) return
    if (!scope || snapshot.busy) return
    const operation = scope.pendingOperation() ?? pending
    if (!operation) return
    const generation = snapshot.state.generation
    emit({ busy: true })
    try {
      const outcome = await scope.reconcile(operation)
      if (!current(generation)) return
      if (outcome.kind === 'recorded' || outcome.kind === 'not-recorded') pending = null
      if (snapshot.state.kind === 'uncertain') send({ type: 'OUTCOME', generation, outcome })
      else emit({ recovery: outcome.kind === 'recorded' ? { kind: 'recorded', receipt: outcome.receipt }
        : { kind: outcome.kind === 'not-recorded' ? 'not-recorded' : 'uncertain' } })
    } catch { /* Keep the original pending operation; never automatically retry a write. */ }
    finally { if (current(generation)) emit({ busy: false }) }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } },
    start, suspend, select, openSource, confirm, reconcile,
    sourceRendered(reviewRevision: string) {
      send({ type: 'SOURCE_RENDERED', generation: snapshot.state.generation, reviewRevision })
    },
    async back() {
      if (snapshot.state.kind === 'submitting' || snapshot.state.kind === 'uncertain' || pending) return
      await start()
    },
  }
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkRequestScope } from '../app/lib/work/requestScope.ts'
import { createSyntheticGateway } from '../app/lib/work/syntheticGateway.ts'
const clock = () => Date.parse('2026-10-04T12:00:00Z')
const signal = new AbortController().signal
const request = { operationId: 'synthetic:operation:1', reviewRevision: 'synthetic:review-revision:1', sourceRevision: 'synthetic:source-revision:1' }
const id = 'synthetic:assignment:a'
async function fixture(overrides = {}, options = {}) {
  const base = createSyntheticGateway(clock, 'happy')
  const session = await base.session(signal)
  const gateway = { ...base, ...overrides }
  return { scope: createWorkRequestScope(gateway, session, { now: clock, timeoutMs: 100, ...options }), session, gateway }
}
function deferred() { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }

test('closed scope aborts reads and rejects a late provider response', async () => {
  const d = deferred(); let providerSignal
  const { scope } = await fixture({ list: (_, s) => { providerSignal = s; return d.promise } })
  const read = scope.list(null)
  scope.close()
  await assert.rejects(read, /work_scope_closed/)
  assert.equal(providerSignal.aborted, true)
  d.resolve({ schemaVersion: 1, items: [], nextCursor: null })
  await assert.rejects(scope.list(null), /work_scope_closed/)
})
test('only one write starts; another operation cannot overwrite the pending request', async () => {
  const d = deferred(); let writes = 0
  const { scope } = await fixture({ acknowledge: () => { writes++; return d.promise } })
  const first = scope.acknowledge(id, request)
  await assert.rejects(scope.acknowledge(id, request), /work_operation_pending/)
  await assert.rejects(scope.acknowledge(id, { ...request, operationId: 'other' }), /work_operation_pending/)
  assert.equal(writes, 1)
  scope.close()
  await assert.rejects(first, /work_outcome_uncertain/)
  assert.equal(scope.pendingOperation().request.operationId, request.operationId)
})
test('timeout after commit recovers the original receipt without a second write', async () => {
  const gateway = createSyntheticGateway(clock, 'timeout-after-commit')
  const session = await gateway.session(signal)
  const scope = createWorkRequestScope(gateway, session, { now: clock, timeoutMs: 100 })
  await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
  const operation = scope.pendingOperation()
  scope.close()
  const resumed = createWorkRequestScope(gateway, await gateway.session(signal), { now: clock })
  const outcome = await resumed.reconcile(operation)
  assert.equal(outcome.kind, 'recorded')
  assert.equal(outcome.receipt.operationId, request.operationId)
  assert.equal(resumed.pendingOperation(), null)
})
test('recovery requires the original subject and organization before calling the provider', async () => {
  const { scope, session, gateway } = await fixture({ acknowledge: async () => { throw Error('timeout') } })
  await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
  let reads = 0
  for (const patch of [{ organizationRef: 'other-org' }, { subjectRef: 'other-subject' }]) {
    const other = createWorkRequestScope({ ...gateway, outcome: async () => { reads++; return { kind: 'unknown' } } }, { ...session, ...patch }, { now: clock })
    await assert.rejects(other.reconcile(scope.pendingOperation()), /work_recovery_scope_mismatch/)
  }
  assert.equal(reads, 0)
})
test('recovery handle contains only operation and scope identifiers; callers cannot mutate it', async () => {
  const { scope } = await fixture({ acknowledge: async () => { throw Error('timeout') } })
  await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
  const pending = scope.pendingOperation()
  assert.deepEqual(Object.keys(pending).sort(), ['assignmentId', 'organizationRef', 'request', 'subjectRef'])
  pending.request.operationId = 'tampered'
  assert.equal(scope.pendingOperation().request.operationId, request.operationId)
})
test('late commit response cannot turn a timed-out call into success', async () => {
  const d = deferred()
  const { scope, gateway } = await fixture({ acknowledge: () => d.promise }, { timeoutMs: 5 })
  await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
  assert.equal(scope.pendingOperation().request.operationId, request.operationId)
  d.resolve(await createSyntheticGateway(clock, 'happy').acknowledge(id, request, signal))
  await Promise.resolve()
  assert.equal(scope.pendingOperation().request.operationId, request.operationId)
})
test('malformed or cross-organization data fail closed', async () => {
  const { scope } = await fixture({ list: async () => ({ schemaVersion: 2, items: [], nextCursor: null }) })
  await assert.rejects(scope.list(null), /work_response_invalid/)
  const foreign = createSyntheticGateway(clock, 'happy', 'B')
  const f = await fixture({ detail: () => foreign.detail('synthetic:assignment:b', signal) })
  await assert.rejects(f.scope.detail(id), /work_response_invalid/)
})
test('expired session prevents provider calls', async () => {
  let calls = 0
  const { scope } = await fixture({ list: async () => { calls++; return { schemaVersion: 1, items: [], nextCursor: null } } }, { now: () => clock() + 7200000 })
  await assert.rejects(scope.list(null), /work_access_revoked/)
  assert.equal(calls, 0)
})
test('receipt must match scope, assignment, operation and revisions', async () => {
  const base = createSyntheticGateway(clock, 'happy')
  const receipt = await base.acknowledge(id, request, signal)
  for (const key of ['organizationRef', 'reviewerRef', 'assignmentId', 'operationId', 'reviewRevision', 'sourceRevision']) {
    const { scope } = await fixture({ acknowledge: async () => ({ ...receipt, [key]: 'wrong' }) })
    await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
    assert.ok(scope.pendingOperation())
  }
})
test('known revision conflict permits refresh; unknown failure retains pending operation', async () => {
  const { scope } = await fixture({ acknowledge: async () => { throw Error('work_revision_conflict') } })
  await assert.rejects(scope.acknowledge(id, request), /work_revision_conflict/)
  assert.equal(scope.pendingOperation(), null)
})
test('unknown or malformed outcomes retain the operation and block another write', async () => {
  for (const outcome of [{ kind: 'unknown' }, { kind: 'pending' }, { kind: 'invalid' }]) {
    const { scope } = await fixture({ acknowledge: async () => { throw Error('timeout') }, outcome: async () => outcome })
    await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
    const recovery = scope.reconcile(scope.pendingOperation())
    if (outcome.kind === 'invalid') await assert.rejects(recovery, /work_outcome_uncertain/)
    else assert.equal((await recovery).kind, outcome.kind)
    assert.ok(scope.pendingOperation())
    await assert.rejects(scope.acknowledge(id, request), /work_operation_pending/)
  }
})
test('not-recorded outcome releases the operation without manufacturing a receipt', async () => {
  const { scope } = await fixture({ acknowledge: async () => { throw Error('timeout') }, outcome: async () => ({ kind: 'not-recorded' }) })
  await assert.rejects(scope.acknowledge(id, request), /work_outcome_uncertain/)
  assert.deepEqual(await scope.reconcile(scope.pendingOperation()), { kind: 'not-recorded' })
  assert.equal(scope.pendingOperation(), null)
})
test('expiry while a request is outstanding suppresses its response', async () => {
  let current = clock()
  const d = deferred()
  const { scope } = await fixture({ list: () => d.promise }, { now: () => current })
  const read = scope.list(null)
  current += 7200000
  d.resolve({ schemaVersion: 1, items: [], nextCursor: null })
  await assert.rejects(read, /work_access_revoked/)
})

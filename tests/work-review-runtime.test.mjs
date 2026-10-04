import test from 'node:test'
import assert from 'node:assert/strict'
import { createWorkReviewRuntime } from '../app/lib/work/reviewRuntime.ts'
import { createSyntheticGateway } from '../app/lib/work/syntheticGateway.ts'
const now = () => Date.parse('2026-10-04T12:00:00Z')
const id = 'synthetic:assignment:a'
const options = { now, operationId: () => 'synthetic:operation:1', timeoutMs: 100 }
const create = (scenario = 'happy', overrides = {}) => createWorkReviewRuntime({ ...createSyntheticGateway(now, scenario), ...overrides }, options)
async function source(runtime) { await runtime.start(); await runtime.select(id); await runtime.openSource() }
function deferred() { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }

test('runtime requires rendered source and explicit confirmation before recording', async t => {
  const r = create(); t.after(() => r.suspend())
  await source(r)
  await r.confirm()
  assert.equal(r.getSnapshot().state.kind, 'source')
  r.sourceRendered('synthetic:review-revision:1')
  await r.confirm()
  assert.equal(r.getSnapshot().state.kind, 'recorded')
  assert.equal(r.getSnapshot().state.receipt.workflowEffect, 'review_only')
})
test('late detail from a previous screen cannot replace the current queue', async t => {
  const d = deferred(); const r = create('happy', { detail: () => d.promise }); t.after(() => r.suspend())
  await r.start()
  const select = r.select(id)
  await r.back()
  const gateway = createSyntheticGateway(now, 'happy')
  d.resolve(await gateway.detail(id, new AbortController().signal))
  await select
  assert.equal(r.getSnapshot().state.kind, 'queue')
})
test('suspension clears source and queue data and recovery does not resubmit', async t => {
  const base = createSyntheticGateway(now, 'timeout-after-commit'); let writes = 0
  const r = createWorkReviewRuntime({ ...base, acknowledge: (...args) => { writes++; return base.acknowledge(...args) } }, options)
  t.after(() => r.suspend())
  await source(r); r.sourceRendered('synthetic:review-revision:1'); await r.confirm()
  assert.equal(r.getSnapshot().state.kind, 'uncertain')
  r.suspend()
  assert.equal('assignment' in r.getSnapshot().state, false)
  assert.deepEqual(r.getSnapshot().items, [])
  await r.start()
  assert.equal(r.getSnapshot().recovery.kind, 'uncertain')
  await r.reconcile()
  assert.equal(r.getSnapshot().recovery.kind, 'recorded')
  assert.equal(writes, 1)
})
test('a different authenticated organization cannot recover an old operation', async t => {
  const a = createSyntheticGateway(now, 'timeout-after-commit'), b = createSyntheticGateway(now, 'happy', 'B')
  let other = false, reads = 0
  const r = createWorkReviewRuntime({ ...a, session: s => (other ? b : a).session(s), outcome: (...args) => { reads++; return a.outcome(...args) } }, options)
  t.after(() => r.suspend())
  await source(r); r.sourceRendered('synthetic:review-revision:1'); await r.confirm()
  r.suspend(); other = true; await r.start(); await r.reconcile()
  assert.equal(r.getSnapshot().state.kind, 'unavailable')
  assert.equal(reads, 0)
  assert.equal(r.getSnapshot().recovery, null)
})
test('duplicate confirmation is locked synchronously before a provider resolves', async t => {
  const d = deferred(); let calls = 0
  const r = create('happy', { acknowledge: () => { calls++; return d.promise } }); t.after(() => r.suspend())
  await source(r); r.sourceRendered('synthetic:review-revision:1')
  const first = r.confirm(); await r.confirm()
  assert.equal(calls, 1)
  r.suspend(); await first
  assert.equal(r.getSnapshot().state.kind, 'unavailable')
})
test('revoked and malformed sessions fail closed', async t => {
  for (const scenario of ['revoked', 'malformed']) {
    const r = create(scenario); t.after(() => r.suspend()); await r.start()
    assert.equal(r.getSnapshot().state.kind, 'unavailable')
    assert.deepEqual(r.getSnapshot().items, [])
  }
})
test('stale provider response requires fresh source; never shows success', async t => {
  const r = create('stale'); t.after(() => r.suspend())
  await source(r); r.sourceRendered('synthetic:review-revision:1'); await r.confirm()
  assert.equal(r.getSnapshot().state.kind, 'stale')
  assert.equal(r.getSnapshot().state.sourceSeenRevision, null)
})
test('offline retry cannot reveal content or confirm a review', async t => {
  let available = true
  const r = createWorkReviewRuntime(createSyntheticGateway(now, 'happy'), { ...options, available: () => available })
  t.after(() => r.suspend())
  await source(r); r.sourceRendered('synthetic:review-revision:1')
  available = false
  await r.confirm()
  assert.equal(r.getSnapshot().state.kind, 'unavailable')
  await r.start()
  assert.equal(r.getSnapshot().state.kind, 'unavailable')
  assert.deepEqual(r.getSnapshot().items, [])
})

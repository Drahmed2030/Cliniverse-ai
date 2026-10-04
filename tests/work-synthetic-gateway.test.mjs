import test from 'node:test'
import assert from 'node:assert/strict'
import { createSyntheticGateway } from '../app/lib/work/syntheticGateway.ts'
import { AssignedChangeSchema, SourceEvidenceSchema, WorkSessionSchema } from '../app/lib/work/contracts.ts'
const clock = () => Date.parse('2026-10-04T12:00:00Z')
const signal = () => new AbortController().signal
async function request(gateway) {
  const page = await gateway.list(null, signal())
  const item = page.items[0]
  return { id: item.assignmentId, body: { operationId: 'synthetic:op:1', sourceRevision: item.sourceRevision, reviewRevision: item.reviewRevision } }
}
test('synthetic gateway exposes validated synthetic data and stable review-only replay', async () => {
  const g = createSyntheticGateway(clock, 'happy')
  assert.equal(WorkSessionSchema.parse(await g.session(signal())).organizationLabel, 'Synthetic institution A')
  const r = await request(g)
  assert.match(AssignedChangeSchema.parse(await g.detail(r.id, signal())).title, /Synthetic/)
  assert.match(SourceEvidenceSchema.parse(await g.source(r.id, signal())).content, /Synthetic/)
  const first = await g.acknowledge(r.id, r.body, signal())
  assert.equal(first.workflowEffect, 'review_only')
  assert.deepEqual(await g.acknowledge(r.id, r.body, signal()), first)
  first.receiptId = 'tampered'
  assert.notEqual((await g.outcome(r.id, r.body.operationId, signal())).receipt.receiptId, 'tampered')
})
test('operation-key reuse with changed payload conflicts', async () => {
  const g = createSyntheticGateway(clock, 'happy'), r = await request(g)
  await g.acknowledge(r.id, r.body, signal())
  await assert.rejects(g.acknowledge(r.id, { ...r.body, sourceRevision: 'other' }, signal()), /operation_conflict/)
})
test('timeout after commit is reconciled without a second clinical effect', async () => {
  const g = createSyntheticGateway(clock, 'timeout-after-commit'), r = await request(g)
  await assert.rejects(g.acknowledge(r.id, r.body, signal()), /outcome_uncertain/)
  const outcome = await g.outcome(r.id, r.body.operationId, signal())
  assert.equal(outcome.kind, 'recorded')
  assert.equal(outcome.receipt.workflowEffect, 'review_only')
  assert.deepEqual(await g.acknowledge(r.id, r.body, signal()), outcome.receipt)
})
for (const scenario of ['stale', 'reassigned']) test(`${scenario} rejects old review at submission`, async () => {
  const g = createSyntheticGateway(clock, scenario), r = await request(g)
  await assert.rejects(g.acknowledge(r.id, r.body, signal()), /revision_conflict/)
  assert.deepEqual(await g.outcome(r.id, r.body.operationId, signal()), { kind: 'not-recorded' })
})
test('revoked access rejects reads, mutations and outcome replay', async () => {
  const g = createSyntheticGateway(clock, 'revoked')
  assert.deepEqual((await g.session(signal())).capabilities, [])
  for (const action of [() => g.list(null, signal()), () => g.acknowledge('synthetic:assignment:a', { operationId: 'op:1', sourceRevision: 's:1', reviewRevision: 'r:1' }, signal()), () => g.outcome('synthetic:assignment:a', 'op:1', signal())]) await assert.rejects(action(), /access_revoked/)
})
test('fixture organizations cannot read each other or share operation receipts', async () => {
  const a = createSyntheticGateway(clock, 'happy', 'A'), b = createSyntheticGateway(clock, 'happy', 'B')
  const r = await request(a), rb = await request(b)
  await a.acknowledge(r.id, r.body, signal())
  await assert.rejects(b.detail(r.id, signal()), /assignment_unavailable/)
  assert.deepEqual(await b.outcome(rb.id, r.body.operationId, signal()), { kind: 'not-recorded' })
})
test('aborted request never records a receipt', async () => {
  const g = createSyntheticGateway(clock, 'happy'), r = await request(g), abort = new AbortController()
  abort.abort()
  await assert.rejects(g.acknowledge(r.id, r.body, abort.signal), /request_aborted/)
  assert.deepEqual(await g.outcome(r.id, r.body.operationId, signal()), { kind: 'not-recorded' })
})
test('malformed scenario is rejected by the production boundary schema', async () => {
  const g = createSyntheticGateway(clock, 'malformed')
  assert.equal(WorkSessionSchema.safeParse(await g.session(signal())).success, false)
})
test('expired authorization is checked before replaying a committed receipt', async () => {
  let time = clock()
  const g = createSyntheticGateway(() => time, 'happy'), r = await request(g)
  await g.acknowledge(r.id, r.body, signal())
  time += 3600001
  await assert.rejects(g.acknowledge(r.id, r.body, signal()), /access_revoked/)
  await assert.rejects(g.outcome(r.id, r.body.operationId, signal()), /access_revoked/)
})

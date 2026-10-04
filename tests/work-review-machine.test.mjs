import test from 'node:test'
import assert from 'node:assert/strict'
import { transition, initialReviewState } from '../app/lib/work/reviewMachine.ts'
import { WorkSessionSchema, AssignedChangeSchema, ReviewReceiptSchema, parseWorkJson } from '../app/lib/work/contracts.ts'

const session = { schemaVersion: 1, subjectRef: 'doctor:1', organizationRef: 'org:1', organizationLabel: 'Synthetic hospital', sessionGeneration: 1, capabilities: ['acknowledge_review'], expiresAt: '2030-01-01T00:00:00Z' }
const trust = { availability: 'available', freshness: 'current', verification: 'verified', provenanceRef: 'synthetic:evidence:1', sourceAuthority: 'health-cloud-context' }
const assignment = { schemaVersion: 1, assignmentId: 'assignment:1', organizationRef: 'org:1', patientContext: { reference: 'synthetic:subject:1' }, assignmentRevision: 'a:1', sourceRevision: 's:1', reviewRevision: 'r:1', title: 'Synthetic change', changes: [], sourceRef: 'source:1', sourceUpdatedAt: '2026-10-04T12:00:00Z', retrievedAt: '2026-10-04T12:01:00Z', evidenceTrust: trust, allowedActions: ['acknowledge_review'] }
const source = { schemaVersion: 1, assignmentId: 'assignment:1', organizationRef: 'org:1', sourceRef: 'source:1', sourceRevision: 's:1', reviewRevision: 'r:1', mediaType: 'text/plain', content: 'Synthetic evidence', retrievedAt: '2026-10-04T12:01:00Z' }
const receipt = { schemaVersion: 1, receiptId: 'receipt:1', operationId: 'op:1', assignmentId: 'assignment:1', organizationRef: 'org:1', reviewerRef: 'doctor:1', reviewRevision: 'r:1', sourceRevision: 's:1', recordedAt: '2026-10-04T12:02:00Z', status: 'recorded', workflowEffect: 'review_only' }
const send = (s, event) => transition(s, { generation: 1, ...event })
function ready(overrides = {}) {
  let s = send(initialReviewState(1), { type: 'SESSION', session })
  s = send(s, { type: 'SELECT', assignmentId: 'assignment:1' })
  s = send(s, { type: 'DETAIL', assignment: { ...assignment, ...overrides } })
  s = send(s, { type: 'SOURCE', source })
  return send(s, { type: 'SOURCE_RENDERED', reviewRevision: 'r:1' })
}
const confirm = s => send(s, { type: 'CONFIRM', operationId: 'op:1', now: '2026-10-04T12:02:00Z' })

test('explicit review produces a matching review-only receipt without clinical completion', () => {
  const pending = confirm(ready())
  assert.equal(pending.kind, 'submitting')
  assert.deepEqual(pending.request, { operationId: 'op:1', reviewRevision: 'r:1', sourceRevision: 's:1' })
  const done = send(pending, { type: 'RECEIPT', receipt })
  assert.equal(done.kind, 'recorded')
  assert.equal(done.receipt.workflowEffect, 'review_only')
  assert.equal('workflowState' in done, false)
})
for (const [key, value] of [['availability','unavailable'], ['freshness','stale'], ['verification','unverified'], ['provenanceRef','']]) {
  test(`untrusted evidence (${key}) cannot be confirmed`, () => {
    assert.notEqual(confirm(ready({ evidenceTrust: { ...trust, [key]: value } })).kind, 'submitting')
  })
}
test('loaded but unrendered source cannot be confirmed', () => {
  const s = ready()
  assert.notEqual(confirm({ ...s, sourceSeenRevision: null }).kind, 'submitting')
})
test('new source or assignment revision invalidates prior source-seen state', () => {
  for (const patch of [{ sourceRevision: 's:2', reviewRevision: 'r:2' }, { assignmentRevision: 'a:2', reviewRevision: 'r:2' }]) {
    const s = send(ready(), { type: 'DETAIL', assignment: { ...assignment, ...patch } })
    assert.equal(s.kind, 'stale')
    assert.equal(s.sourceSeenRevision, null)
    assert.notEqual(confirm(s).kind, 'submitting')
  }
})
test('no capability or allowed action blocks submission', () => {
  assert.notEqual(confirm(ready({ allowedActions: [] })).kind, 'submitting')
  const s = ready()
  assert.notEqual(confirm({ ...s, session: { ...session, capabilities: [] } }).kind, 'submitting')
})
test('expired session clears protected data before confirmation', () => {
  const s = send(ready(), { type: 'CONFIRM', operationId: 'op:1', now: '2031-01-01T00:00:00Z' })
  assert.equal(s.kind, 'unavailable')
  assert.equal('assignment' in s, false)
})
test('double confirm does not replace the in-flight operation', () => {
  const s = confirm(ready())
  assert.equal(send(s, { type: 'CONFIRM', operationId: 'op:2', now: '2026-10-04T12:02:00Z' }), s)
})
test('timeout remains uncertain and later reconciles the original receipt', () => {
  const s = send(confirm(ready()), { type: 'TIMEOUT' })
  assert.equal(s.kind, 'uncertain')
  assert.equal(confirm(s), s)
  assert.equal(send(s, { type: 'OUTCOME', outcome: { kind: 'unknown' } }).kind, 'uncertain')
  assert.equal(send(s, { type: 'OUTCOME', outcome: { kind: 'recorded', receipt } }).kind, 'recorded')
})
for (const key of ['operationId','assignmentId','organizationRef','reviewerRef','sourceRevision','reviewRevision']) {
  test(`mismatched receipt ${key} cannot produce recorded`, () => {
    assert.equal(send(confirm(ready()), { type: 'RECEIPT', receipt: { ...receipt, [key]: 'wrong' } }).kind, 'uncertain')
  })
}
test('switch clears protected data and ignores late receipt from previous context', () => {
  const s = send(confirm(ready()), { type: 'RESET' })
  assert.equal(s.kind, 'checking')
  assert.equal(s.generation, 2)
  assert.equal('source' in s, false)
  assert.equal(send(s, { type: 'RECEIPT', receipt }), s)
})
test('local response generation is independent of upstream session generation', () => {
  const reset = send(ready(), { type: 'RESET' })
  const refreshed = transition(reset, { generation: 2, type: 'SESSION', session })
  assert.equal(refreshed.kind, 'queue')
  assert.equal(refreshed.generation, 2)
})
test('revocation clears data and prevents same-generation late source restoration', () => {
  const s = send(ready(), { type: 'REVOKED' })
  assert.equal(s.kind, 'unavailable')
  assert.equal('assignment' in s, false)
  assert.equal(send(s, { type: 'SOURCE', source }), s)
})
test('source from another assignment is ignored', () => {
  const s = ready()
  assert.equal(send(s, { type: 'SOURCE', source: { ...source, assignmentId: 'other' } }), s)
})
test('recorded outcome cannot accept a task-closing payload or unknown schema', () => {
  assert.equal(ReviewReceiptSchema.safeParse({ ...receipt, workflowEffect: 'complete' }).success, false)
  assert.equal(WorkSessionSchema.safeParse({ ...session, schemaVersion: 2 }).success, false)
  assert.equal(AssignedChangeSchema.safeParse({ ...assignment, secret: 'x' }).success, false)
  assert.equal(AssignedChangeSchema.safeParse({ ...assignment, title: 'x'.repeat(201) }).success, false)
})
test('JSON boundary rejects oversized bytes before schema validation', () => {
  assert.throws(() => parseWorkJson(' '.repeat(262145), WorkSessionSchema), /work_response_too_large/)
  assert.throws(() => parseWorkJson('"' + 'é'.repeat(131073) + '"', WorkSessionSchema), /work_response_too_large/)
  assert.deepEqual(parseWorkJson(JSON.stringify(session), WorkSessionSchema), session)
})

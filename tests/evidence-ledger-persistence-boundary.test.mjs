import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateLedgerPersistence,
  getLedgerPersistencePartition,
} from '../app/lib/governance/evidenceLedgerPersistenceBoundary.ts'

const sha = 'a'.repeat(64)

function event(overrides = {}) {
  return {
    eventId: 'evt-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-a4c-test',
    kind: 'PROBED',
    occurredAt: '2026-09-08T10:00:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'canonical-media-probe' },
    artifacts: [{ artifactId: 'echo-a4c-test-v1', sha256: sha }],
    policies: [{ policyId: 'automated-media-gate', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

test('new valid event is appendable and envelope stays SHA/policy/actor bound', () => {
  const result = evaluateLedgerPersistence({
    event: event(),
    recordedAt: '2026-09-08T10:01:00Z',
    existingRows: [],
  })

  assert.equal(result.decision, 'APPEND')
  assert.equal(result.envelope?.artifactSha256[0], sha)
  assert.equal(result.envelope?.actorId, 'canonical-media-probe')
  assert.deepEqual(result.envelope?.policyBindings, ['automated-media-gate@1.0.0'])
})

test('exact replay of an existing event is idempotent NOOP', () => {
  const existingEvent = event()
  const result = evaluateLedgerPersistence({
    event: existingEvent,
    recordedAt: '2026-09-08T10:02:00Z',
    existingRows: [{ eventId: existingEvent.eventId, product: 'CLINIVERSE', canonicalEvent: existingEvent }],
  })

  assert.equal(result.decision, 'NOOP')
  assert.deepEqual(result.blockers, [])
})

test('same event id with mutated canonical payload is held fail closed', () => {
  const existingEvent = event()
  const result = evaluateLedgerPersistence({
    event: event({ decision: 'HOLD' }),
    recordedAt: '2026-09-08T10:03:00Z',
    existingRows: [{ eventId: existingEvent.eventId, product: 'CLINIVERSE', canonicalEvent: existingEvent }],
  })

  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('append-only-event-mutation-forbidden'))
})

test('event ids cannot collide across Cliniverse and NeuraOps', () => {
  const result = evaluateLedgerPersistence({
    event: event({ product: 'NEURAOPS_CORE' }),
    recordedAt: '2026-09-08T10:04:00Z',
    existingRows: [{ eventId: 'evt-1', product: 'CLINIVERSE', canonicalEvent: event() }],
  })

  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('event-id-collision-across-products'))
})

test('direct PHI-shaped keys are forbidden inside persisted governance events', () => {
  const result = evaluateLedgerPersistence({
    event: event({ actor: { actorType: 'SYSTEM', actorId: 'system', patient_name: 'Jane Doe' } }),
    recordedAt: '2026-09-08T10:05:00Z',
    existingRows: [],
  })

  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.some(blocker => blocker.includes('direct-phi-key-forbidden')))
})

test('invalid ledger events never reach persistence', () => {
  const result = evaluateLedgerPersistence({
    event: event({ artifacts: [{ artifactId: 'x', sha256: 'bad' }] }),
    recordedAt: '2026-09-08T10:06:00Z',
    existingRows: [],
  })

  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.some(blocker => blocker.includes('event-invalid:artifact-sha256-invalid')))
})

test('logical partitions remain product separated', () => {
  assert.notEqual(
    getLedgerPersistencePartition('CLINIVERSE').logicalPartitionKey,
    getLedgerPersistencePartition('NEURAOPS_CORE').logicalPartitionKey,
  )
})

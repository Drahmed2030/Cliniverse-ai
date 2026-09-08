import test from 'node:test'
import assert from 'node:assert/strict'
import {
  envelopeToDatabaseRow,
  persistLedgerEvent,
  validateGovernanceLedgerDatabaseRow,
} from '../app/lib/governance/evidenceLedgerDatabaseAdapter.ts'

const sha = 'a'.repeat(64)

function event(overrides = {}) {
  return {
    eventId: 'evt-db-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-db-test',
    kind: 'PROBED',
    occurredAt: '2026-09-08T10:30:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'probe-runner' },
    artifacts: [{ artifactId: 'echo-db-test-v1', sha256: sha }],
    policies: [{ policyId: 'automated-media-gate', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

function memoryAdapter(seed = null) {
  let row = seed
  let appends = 0
  return {
    adapter: {
      async findByEventId(eventId) {
        return row?.event_id === eventId ? row : null
      },
      async append(next) {
        appends += 1
        row = next
      },
    },
    state() {
      return { row, appends }
    },
  }
}

test('maps validated ledger event to database row without changing semantics', () => {
  const row = envelopeToDatabaseRow(event(), '2026-09-08T10:31:00Z')
  assert.equal(row.event_id, 'evt-db-1')
  assert.equal(row.product, 'CLINIVERSE')
  assert.deepEqual(row.artifact_sha256, [sha])
  assert.equal(validateGovernanceLedgerDatabaseRow(row).length, 0)
})

test('first valid event appends exactly once', async () => {
  const db = memoryAdapter()
  const result = await persistLedgerEvent({
    event: event(),
    recordedAt: '2026-09-08T10:31:00Z',
    adapter: db.adapter,
  })
  assert.equal(result.decision, 'APPEND')
  assert.equal(db.state().appends, 1)
})

test('identical replay is idempotent and does not append again', async () => {
  const existing = envelopeToDatabaseRow(event(), '2026-09-08T10:31:00Z')
  const db = memoryAdapter(existing)
  const result = await persistLedgerEvent({
    event: event(),
    recordedAt: '2026-09-08T10:40:00Z',
    adapter: db.adapter,
  })
  assert.equal(result.decision, 'NOOP')
  assert.equal(db.state().appends, 0)
})

test('same event id with mutated canonical event holds fail closed', async () => {
  const existing = envelopeToDatabaseRow(event(), '2026-09-08T10:31:00Z')
  const db = memoryAdapter(existing)
  const result = await persistLedgerEvent({
    event: event({ subjectId: 'mutated-subject' }),
    recordedAt: '2026-09-08T10:40:00Z',
    adapter: db.adapter,
  })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('append-only-event-mutation-forbidden'))
  assert.equal(db.state().appends, 0)
})

test('cross-product event id collision holds and never appends', async () => {
  const existing = envelopeToDatabaseRow(event(), '2026-09-08T10:31:00Z')
  const db = memoryAdapter(existing)
  const result = await persistLedgerEvent({
    event: event({ product: 'NEURAOPS_CORE' }),
    recordedAt: '2026-09-08T10:40:00Z',
    adapter: db.adapter,
  })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('event-id-collision-across-products'))
  assert.equal(db.state().appends, 0)
})

test('database row validation detects denormalized-field drift', () => {
  const row = envelopeToDatabaseRow(event(), '2026-09-08T10:31:00Z')
  const blockers = validateGovernanceLedgerDatabaseRow({ ...row, actor_id: 'other-actor' })
  assert.ok(blockers.includes('actor-id-mismatch'))
})

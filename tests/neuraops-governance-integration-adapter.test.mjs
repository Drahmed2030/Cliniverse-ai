import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildNeuraOpsGovernanceEvidenceEvent,
  persistNeuraOpsGovernanceEvent,
} from '../app/lib/governance/neuraOpsGovernanceIntegrationAdapter.ts'
import { envelopeToDatabaseRow } from '../app/lib/governance/evidenceLedgerDatabaseAdapter.ts'

const sha = 'b'.repeat(64)

function seed(overrides = {}) {
  return buildNeuraOpsGovernanceEvidenceEvent({
    eventId: 'neuraops:policy-pack:ingested:v1',
    subjectId: 'neuraops-policy-pack-v1',
    artifactId: 'neuraops-policy-pack-v1:artifact',
    artifactSha256: sha,
    occurredAt: '2026-09-08T11:00:00Z',
    actorId: 'neuraops-governance-adapter',
    policyId: 'shared-governance-ingest',
    policyVersion: '1.0.0',
    evidenceRecordIds: ['neuraops/policy-pack/v1'],
    ...overrides,
  })
}

function memoryAdapter(existing = null) {
  let row = existing
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

test('builder emits NEURAOPS_CORE evidence without a parallel ledger model', () => {
  const event = seed()
  assert.equal(event.product, 'NEURAOPS_CORE')
  assert.equal(event.ledgerVersion, '1.0.0')
  assert.equal(event.kind, 'INGESTED')
  assert.deepEqual(event.artifacts.map(item => item.sha256), [sha])
})

test('first NeuraOps event persists through the shared database adapter', async () => {
  const db = memoryAdapter()
  const result = await persistNeuraOpsGovernanceEvent(
    { event: seed(), recordedAt: '2026-09-08T11:01:00Z' },
    db.adapter,
  )

  assert.equal(result.decision, 'APPEND')
  assert.equal(result.partition.product, 'NEURAOPS_CORE')
  assert.equal(result.partition.logicalPartitionKey, 'governance-ledger:neuraops_core')
  assert.equal(db.state().appends, 1)
  assert.equal(db.state().row.product, 'NEURAOPS_CORE')
})

test('identical NeuraOps replay remains idempotent', async () => {
  const event = seed()
  const existing = envelopeToDatabaseRow(event, '2026-09-08T11:01:00Z')
  const db = memoryAdapter(existing)

  const result = await persistNeuraOpsGovernanceEvent(
    { event, recordedAt: '2026-09-08T11:02:00Z' },
    db.adapter,
  )

  assert.equal(result.decision, 'NOOP')
  assert.equal(db.state().appends, 0)
})

test('mutated replay holds fail closed through the shared persistence boundary', async () => {
  const existingEvent = seed()
  const existing = envelopeToDatabaseRow(existingEvent, '2026-09-08T11:01:00Z')
  const db = memoryAdapter(existing)
  const mutated = { ...existingEvent, subjectId: 'mutated-neuraops-subject' }

  const result = await persistNeuraOpsGovernanceEvent(
    { event: mutated, recordedAt: '2026-09-08T11:02:00Z' },
    db.adapter,
  )

  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('append-only-event-mutation-forbidden'))
  assert.equal(db.state().appends, 0)
})

test('Cliniverse events cannot enter through the NeuraOps integration adapter', async () => {
  const db = memoryAdapter()
  const event = { ...seed(), product: 'CLINIVERSE' }

  await assert.rejects(
    persistNeuraOpsGovernanceEvent(
      { event, recordedAt: '2026-09-08T11:02:00Z' },
      db.adapter,
    ),
    /requires product NEURAOPS_CORE/,
  )
  assert.equal(db.state().appends, 0)
})

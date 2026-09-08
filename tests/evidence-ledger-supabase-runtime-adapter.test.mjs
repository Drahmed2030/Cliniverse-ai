import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createSupabaseGovernanceLedgerDatabaseAdapter,
  persistLedgerEventViaSupabase,
  readLedgerEventsBySubjectViaSupabase,
} from '../app/lib/governance/evidenceLedgerSupabaseRuntimeAdapter.ts'
import { envelopeToDatabaseRow } from '../app/lib/governance/evidenceLedgerDatabaseAdapter.ts'

const sha = 'a'.repeat(64)

function event(overrides = {}) {
  return {
    eventId: 'evt-runtime-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-runtime-test',
    kind: 'PROBED',
    occurredAt: '2026-09-08T11:30:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'probe-runner' },
    artifacts: [{ artifactId: 'echo-runtime-test-v1', sha256: sha }],
    policies: [{ policyId: 'automated-media-gate', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

function fakeClient(overrides = {}) {
  const state = { existing: null, inserts: [], subjectRows: [] }
  const client = {
    async findEvidenceLedgerEventById(eventId) {
      if (overrides.findEvidenceLedgerEventById) return overrides.findEvidenceLedgerEventById(eventId, state)
      return { data: state.existing?.event_id === eventId ? state.existing : null, error: null }
    },
    async insertEvidenceLedgerEvent(row) {
      if (overrides.insertEvidenceLedgerEvent) return overrides.insertEvidenceLedgerEvent(row, state)
      state.inserts.push(row)
      state.existing = row
      return { data: row, error: null }
    },
    async listEvidenceLedgerEventsBySubject(input) {
      if (overrides.listEvidenceLedgerEventsBySubject) return overrides.listEvidenceLedgerEventsBySubject(input, state)
      return {
        data: state.subjectRows.filter(row => row.product === input.product && row.subject_id === input.subjectId).slice(0, input.limit),
        error: null,
      }
    },
  }
  return { client, state }
}

function config(client, overrides = {}) {
  return {
    credentialKind: 'SERVICE_ROLE',
    schema: 'governance',
    table: 'evidence_ledger_events',
    client,
    ...overrides,
  }
}

test('runtime adapter requires explicit service-role boundary', () => {
  const db = fakeClient()
  assert.throws(
    () => createSupabaseGovernanceLedgerDatabaseAdapter(config(db.client, { credentialKind: 'ANON' })),
    /SERVICE_ROLE/,
  )
})

test('first valid event persists through Supabase adapter exactly once', async () => {
  const db = fakeClient()
  const result = await persistLedgerEventViaSupabase({
    event: event(),
    recordedAt: '2026-09-08T11:31:00Z',
    config: config(db.client),
  })
  assert.equal(result.decision, 'APPEND')
  assert.equal(db.state.inserts.length, 1)
})

test('identical replay remains idempotent and does not insert again', async () => {
  const db = fakeClient()
  db.state.existing = envelopeToDatabaseRow(event(), '2026-09-08T11:31:00Z')
  const result = await persistLedgerEventViaSupabase({
    event: event(),
    recordedAt: '2026-09-08T11:40:00Z',
    config: config(db.client),
  })
  assert.equal(result.decision, 'NOOP')
  assert.equal(db.state.inserts.length, 0)
})

test('read failure converts to structured HOLD instead of throwing', async () => {
  const db = fakeClient({
    async findEvidenceLedgerEventById() {
      return { data: null, error: { message: 'database unavailable', code: '08006' } }
    },
  })
  const result = await persistLedgerEventViaSupabase({
    event: event(),
    recordedAt: '2026-09-08T11:31:00Z',
    config: config(db.client),
  })
  assert.equal(result.decision, 'HOLD')
  assert.equal(result.error?.code, 'READ_FAILED')
  assert.ok(result.blockers.includes('supabase-runtime:read_failed'))
})

test('insert response identity drift fails closed', async () => {
  const db = fakeClient({
    async insertEvidenceLedgerEvent(row) {
      return { data: { ...row, event_id: 'wrong-id' }, error: null }
    },
  })
  const result = await persistLedgerEventViaSupabase({
    event: event(),
    recordedAt: '2026-09-08T11:31:00Z',
    config: config(db.client),
  })
  assert.equal(result.decision, 'HOLD')
  assert.equal(result.error?.code, 'ROW_INVALID')
})

test('subject reads enforce product and subject scope', async () => {
  const db = fakeClient()
  const row = envelopeToDatabaseRow(event(), '2026-09-08T11:31:00Z')
  db.state.subjectRows = [row]
  const result = await readLedgerEventsBySubjectViaSupabase({
    product: 'CLINIVERSE',
    subjectId: 'echo-runtime-test',
    config: config(db.client),
  })
  assert.equal(result.error, undefined)
  assert.equal(result.rows.length, 1)

  const leaking = fakeClient({
    async listEvidenceLedgerEventsBySubject() {
      return { data: [{ ...row, product: 'NEURAOPS_CORE' }], error: null }
    },
  })
  const leakResult = await readLedgerEventsBySubjectViaSupabase({
    product: 'CLINIVERSE',
    subjectId: 'echo-runtime-test',
    config: config(leaking.client),
  })
  assert.equal(leakResult.rows.length, 0)
  assert.equal(leakResult.error?.code, 'PRODUCT_SCOPE_VIOLATION')
})

test('subject read limit is bounded', async () => {
  const db = fakeClient()
  const result = await readLedgerEventsBySubjectViaSupabase({
    product: 'CLINIVERSE',
    subjectId: 'echo-runtime-test',
    limit: 501,
    config: config(db.client),
  })
  assert.equal(result.rows.length, 0)
  assert.equal(result.error?.code, 'CONFIGURATION_ERROR')
})

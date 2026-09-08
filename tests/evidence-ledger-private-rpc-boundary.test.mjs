import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createPrivateRpcGovernanceLedgerClient,
  describePrivateLedgerRpcBoundary,
  persistLedgerEventViaPrivateRpc,
  readLedgerEventsBySubjectViaPrivateRpc,
} from '../app/lib/governance/evidenceLedgerSupabasePrivateRpcBoundary.ts'
import { envelopeToDatabaseRow } from '../app/lib/governance/evidenceLedgerDatabaseAdapter.ts'

const sha = 'a'.repeat(64)

function event(overrides = {}) {
  return {
    eventId: 'evt-private-rpc-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-private-rpc-test',
    kind: 'PROBED',
    occurredAt: '2026-09-08T12:00:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'private-rpc-test' },
    artifacts: [{ artifactId: 'echo-private-rpc-test:v1', sha256: sha }],
    policies: [{ policyId: 'test-policy', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

function fakeTransport(seed = []) {
  const rows = [...seed]
  return {
    rows,
    transport: {
      async findByEventId(eventId) {
        return { data: rows.find(row => row.event_id === eventId) ?? null, error: null }
      },
      async appendEvent(row) {
        rows.push(row)
        return { data: row, error: null }
      },
      async listBySubject({ product, subjectId, limit }) {
        return {
          data: rows.filter(row => row.product === product && row.subject_id === subjectId).slice(0, limit),
          error: null,
        }
      },
    },
  }
}

function config(transport, overrides = {}) {
  return {
    credentialKind: 'SERVICE_ROLE',
    rpcSchema: 'api',
    transport,
    ...overrides,
  }
}

test('descriptor keeps storage private and exposes only narrow server RPC surface', () => {
  assert.deepEqual(describePrivateLedgerRpcBoundary(), {
    privateStorageSchema: 'governance',
    exposedRpcSchema: 'api',
    directTableExposureAllowed: false,
    clientCredentialAllowed: false,
    serviceRoleOnly: true,
    realtimeEnabled: false,
  })
})

test('private RPC client rejects non-service credential boundary', () => {
  const fake = fakeTransport()
  assert.throws(
    () => createPrivateRpcGovernanceLedgerClient(config(fake.transport, { credentialKind: 'ANON' })),
    /requires SERVICE_ROLE/,
  )
})

test('first event persists through narrow RPC transport', async () => {
  const fake = fakeTransport()
  const result = await persistLedgerEventViaPrivateRpc({
    event: event(),
    recordedAt: '2026-09-08T12:01:00Z',
    config: config(fake.transport),
  })
  assert.equal(result.decision, 'APPEND')
  assert.equal(fake.rows.length, 1)
})

test('identical replay remains idempotent through RPC boundary', async () => {
  const existing = envelopeToDatabaseRow(event(), '2026-09-08T12:01:00Z')
  const fake = fakeTransport([existing])
  const result = await persistLedgerEventViaPrivateRpc({
    event: event(),
    recordedAt: '2026-09-08T12:02:00Z',
    config: config(fake.transport),
  })
  assert.equal(result.decision, 'NOOP')
  assert.equal(fake.rows.length, 1)
})

test('subject reads preserve product scope and limit boundary', async () => {
  const existing = envelopeToDatabaseRow(event(), '2026-09-08T12:01:00Z')
  const fake = fakeTransport([existing])
  const result = await readLedgerEventsBySubjectViaPrivateRpc({
    product: 'CLINIVERSE',
    subjectId: 'echo-private-rpc-test',
    limit: 50,
    config: config(fake.transport),
  })
  assert.equal(result.error, undefined)
  assert.equal(result.rows.length, 1)
  assert.equal(result.rows[0].product, 'CLINIVERSE')
})

test('invalid read limit fails closed before transport use', async () => {
  const fake = fakeTransport()
  const result = await readLedgerEventsBySubjectViaPrivateRpc({
    product: 'CLINIVERSE',
    subjectId: 'echo-private-rpc-test',
    limit: 501,
    config: config(fake.transport),
  })
  assert.equal(result.rows.length, 0)
  assert.equal(result.error?.code, 'CONFIGURATION_ERROR')
})

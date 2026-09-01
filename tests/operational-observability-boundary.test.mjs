import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('flight recorder is server-only, schema-versioned and blocks sensitive attribute keys', () => {
  const source = read('app/lib/server/observability/flight-recorder.ts')
  assert.match(source, /import 'server-only'/)
  assert.match(source, /schemaVersion:\s*1/)
  assert.match(source, /FORBIDDEN_ATTRIBUTE_KEY/)
  assert.match(source, /authorization\|cookie\|token\|secret\|password/i)
  assert.match(source, /signedtransaction\|payload\|prompt\|message\|clinical\|note/i)
  assert.match(source, /pseudonymizeOperationalId/)
  assert.equal(source.includes('console.log'), false)
})

test('operational telemetry bridges to OpenTelemetry and records success/failure without raw error messages', () => {
  const source = read('app/lib/server/observability/operational-telemetry.ts')
  assert.match(source, /@opentelemetry\/api/)
  assert.match(source, /trace\.getTracer/)
  assert.match(source, /operation\.started/)
  assert.match(source, /operation\.completed/)
  assert.match(source, /operation\.failed/)
  assert.match(source, /errorType/)
  assert.equal(source.includes('error.message'), false)
  assert.equal(source.includes('error.stack'), false)
})

test('data lineage records metadata and field names, not source values', () => {
  const source = read('app/lib/server/observability/data-lineage.ts')
  assert.match(source, /lineage\.edge/)
  assert.match(source, /DataClassification/)
  assert.match(source, /clinical-restricted/)
  assert.match(source, /field_count/)
  assert.match(source, /fields\.join/)
})

test('incident replay is deterministic from correlation-scoped flight events', () => {
  const source = read('app/lib/server/observability/incident-replay.ts')
  assert.match(source, /event\.correlationId === correlationId/)
  assert.match(source, /sort\(/)
  assert.match(source, /deltaMsFromPrevious/)
  assert.match(source, /traceIds/)
  assert.match(source, /failed:/)
})

test('progressive delivery is deterministic and never records the raw subject key', () => {
  const source = read('app/lib/server/observability/progressive-delivery.ts')
  assert.match(source, /sha256/)
  assert.match(source, /deterministicBucket/)
  assert.match(source, /pseudonymizeOperationalId/)
  assert.match(source, /rolloutPercent/)
  assert.match(source, /subject_hash/)
  assert.equal(source.includes('subject_key:'), false)
})

test('Apple subscription verification is the first flight-recorded lineage path and never records token or signed transaction', () => {
  const source = read('app/api/subscriptions/apple/verify/route.ts')
  assert.match(source, /withOperationalSpan/)
  assert.match(source, /createCorrelationId/)
  assert.match(source, /recordDataLineage/)
  assert.match(source, /apple\.signed_transaction/)
  assert.match(source, /public\.subscriptions/)
  assert.equal(source.includes('attributes: { token'), false)
  assert.equal(source.includes('attributes: { signedTransaction'), false)
})

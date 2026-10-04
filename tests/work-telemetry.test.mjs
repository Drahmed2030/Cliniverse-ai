import test from 'node:test'
import assert from 'node:assert/strict'
import { workTelemetryAttributes } from '../app/lib/work/telemetry.ts'
test('only bounded operational metadata reaches telemetry', () => {
  assert.deepEqual(workTelemetryAttributes({ operation: 'review', outcome: 'uncertain', durationMs: 120, statusClass: '5xx', schemaVersion: 1, correlationId: '8d2aab7c-d1a6-4e99-861d-9bb14cfb7f68', patientId: 'SYNTHETIC_SECRET', document: 'SYNTHETIC_SECRET' }), {
    operation: 'review', outcome: 'uncertain', durationMs: 120, statusClass: '5xx', schemaVersion: 1, correlationId: '8d2aab7c-d1a6-4e99-861d-9bb14cfb7f68',
  })
})
test('sensitive strings disguised under allowed keys are discarded', () => {
  const result = workTelemetryAttributes({ operation: 'SYNTHETIC_SECRET', outcome: 'SYNTHETIC_SECRET', correlationId: 'SYNTHETIC_SECRET', statusClass: 'SYNTHETIC_SECRET', durationMs: Infinity, schemaVersion: 2 })
  assert.deepEqual(result, {})
  assert.equal(JSON.stringify(result).includes('SYNTHETIC_SECRET'), false)
})
test('unknown input is safe and duration is bounded', () => {
  assert.deepEqual(workTelemetryAttributes(null), {})
  assert.deepEqual(workTelemetryAttributes({ durationMs: -1 }), {})
  assert.deepEqual(workTelemetryAttributes({ durationMs: 60001 }), {})
})

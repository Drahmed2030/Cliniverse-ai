import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEvidenceLedgerIntegrityV2 } from '../app/lib/governance/evidenceLedgerIntegrityV2.ts'

const sha = 'a'.repeat(64)

function baseEvent(overrides = {}) {
  return {
    eventId: 'evt-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'subject-1',
    kind: 'PROBED',
    occurredAt: '2026-09-08T11:00:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'runner' },
    artifacts: [{ artifactId: 'artifact-v1', sha256: sha }],
    policies: [{ policyId: 'policy-a', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

function validPromotionChain() {
  return [
    baseEvent(),
    baseEvent({
      eventId: 'evt-privacy',
      kind: 'PRIVACY_ATTESTED',
      occurredAt: '2026-09-08T11:01:00Z',
      actor: { actorType: 'HUMAN', actorId: 'privacy-reviewer' },
      policies: [{ policyId: 'privacy-v2', policyVersion: '2.0.0' }],
      parentEventIds: ['evt-1'],
      humanAttestation: { scope: 'PRIVACY', attested: true },
      decision: 'PASS',
    }),
    baseEvent({
      eventId: 'evt-clinical',
      kind: 'CLINICAL_ATTESTED',
      occurredAt: '2026-09-08T11:02:00Z',
      actor: { actorType: 'HUMAN', actorId: 'clinical-reviewer' },
      policies: [{ policyId: 'clinical-review', policyVersion: '1.0.0' }],
      parentEventIds: ['evt-1'],
      humanAttestation: { scope: 'CLINICAL', attested: true },
      decision: 'PASS',
    }),
    baseEvent({
      eventId: 'evt-device',
      kind: 'DEVICE_BASELINE_BOUND',
      occurredAt: '2026-09-08T11:03:00Z',
      policies: [{ policyId: 'renderer-baseline', policyVersion: '1.0.0' }],
      parentEventIds: ['evt-1'],
      decision: 'PASS',
    }),
    baseEvent({
      eventId: 'evt-promote',
      kind: 'PROMOTION_DECIDED',
      occurredAt: '2026-09-08T11:04:00Z',
      actor: { actorType: 'HUMAN', actorId: 'promotion-authority' },
      policies: [{ policyId: 'promotion-policy', policyVersion: '1.0.0' }],
      parentEventIds: ['evt-privacy', 'evt-clinical', 'evt-device'],
      decision: 'PROMOTE',
    }),
  ]
}

test('valid same-subject same-product lineage with complete promotion prerequisites passes', () => {
  const result = validateEvidenceLedgerIntegrityV2(validPromotionChain())
  assert.equal(result.valid, true)
  assert.deepEqual(result.blockers, [])
})

test('cross-product parent is rejected', () => {
  const events = [
    baseEvent(),
    baseEvent({
      eventId: 'evt-child',
      product: 'NEURAOPS_CORE',
      parentEventIds: ['evt-1'],
    }),
  ]
  const result = validateEvidenceLedgerIntegrityV2(events)
  assert.ok(result.blockers.includes('parent-product-mismatch:evt-child:evt-1'))
})

test('cross-subject parent is rejected', () => {
  const events = [
    baseEvent(),
    baseEvent({ eventId: 'evt-child', subjectId: 'subject-2', parentEventIds: ['evt-1'] }),
  ]
  const result = validateEvidenceLedgerIntegrityV2(events)
  assert.ok(result.blockers.includes('parent-subject-mismatch:evt-child:evt-1'))
})

test('artifact lineage mismatch is rejected', () => {
  const events = [
    baseEvent(),
    baseEvent({
      eventId: 'evt-child',
      parentEventIds: ['evt-1'],
      artifacts: [{ artifactId: 'artifact-v2', sha256: 'b'.repeat(64) }],
    }),
  ]
  const result = validateEvidenceLedgerIntegrityV2(events)
  assert.ok(result.blockers.includes('parent-artifact-lineage-mismatch:evt-child:evt-1'))
})

test('child cannot occur before its parent', () => {
  const events = [
    baseEvent({ occurredAt: '2026-09-08T11:10:00Z' }),
    baseEvent({ eventId: 'evt-child', occurredAt: '2026-09-08T11:00:00Z', parentEventIds: ['evt-1'] }),
  ]
  const result = validateEvidenceLedgerIntegrityV2(events)
  assert.ok(result.blockers.includes('child-occurs-before-parent:evt-child:evt-1'))
})

test('promotion is rejected when any exact-SHA prerequisite is missing', () => {
  const events = validPromotionChain().filter(event => event.kind !== 'PRIVACY_ATTESTED')
  events[events.length - 1] = {
    ...events[events.length - 1],
    parentEventIds: ['evt-clinical', 'evt-device'],
  }
  const result = validateEvidenceLedgerIntegrityV2(events)
  assert.ok(result.blockers.some(blocker => blocker.startsWith('promotion-prerequisite-missing:evt-promote:PRIVACY_ATTESTED:')))
})

test('duplicate policy bindings and artifact ids fail closed', () => {
  const event = baseEvent({
    artifacts: [
      { artifactId: 'artifact-v1', sha256: sha },
      { artifactId: 'artifact-v1', sha256: sha },
    ],
    policies: [
      { policyId: 'policy-a', policyVersion: '1.0.0' },
      { policyId: 'policy-a', policyVersion: '1.0.0' },
    ],
  })
  const result = validateEvidenceLedgerIntegrityV2([event])
  assert.ok(result.blockers.includes('duplicate-policy-binding:evt-1'))
  assert.ok(result.blockers.includes('duplicate-artifact-id:evt-1'))
})

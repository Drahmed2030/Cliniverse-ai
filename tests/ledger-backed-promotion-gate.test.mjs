import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateLedgerBackedPromotion } from '../app/lib/governance/ledgerBackedPromotionGate.ts'

const sha = 'a'.repeat(64)

function event(kind, overrides = {}) {
  return {
    eventId: `evt-${kind.toLowerCase()}`,
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-test',
    kind,
    occurredAt: '2026-09-08T08:00:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'test-system' },
    artifacts: [{ artifactId: 'echo-test:v1', sha256: sha }],
    policies: [{ policyId: 'test-policy', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

function completeLedger() {
  const probed = event('PROBED')
  const privacy = event('PRIVACY_ATTESTED', {
    eventId: 'evt-privacy',
    actor: { actorType: 'HUMAN', actorId: 'privacy-reviewer' },
    humanAttestation: { scope: 'PRIVACY', attested: true },
    parentEventIds: [probed.eventId],
  })
  const clinical = event('CLINICAL_ATTESTED', {
    eventId: 'evt-clinical',
    actor: { actorType: 'HUMAN', actorId: 'clinical-reviewer' },
    humanAttestation: { scope: 'CLINICAL', attested: true },
    parentEventIds: [probed.eventId],
  })
  const device = event('DEVICE_BASELINE_BOUND', {
    eventId: 'evt-device',
    parentEventIds: [probed.eventId],
  })
  return [probed, privacy, clinical, device]
}

function evaluate(events, overrides = {}) {
  return evaluateLedgerBackedPromotion({
    product: 'CLINIVERSE',
    subjectId: 'echo-test',
    expectedArtifactSha256: sha,
    events,
    rightsStillValid: true,
    provenanceStillValid: true,
    ...overrides,
  })
}

test('complete SHA-bound ledger yields promotion candidate but never learner eligibility', () => {
  const result = evaluate(completeLedger())
  assert.equal(result.decision, 'PROMOTION_CANDIDATE')
  assert.equal(result.learnerEligible, false)
  assert.deepEqual(result.blockers, [])
})

test('missing human privacy attestation holds fail closed', () => {
  const events = completeLedger().filter(item => item.kind !== 'PRIVACY_ATTESTED')
  const result = evaluate(events)
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('required-pass-event-missing:PRIVACY_ATTESTED'))
})

test('wrong artifact SHA cannot satisfy governance evidence', () => {
  const result = evaluate(completeLedger(), { expectedArtifactSha256: 'b'.repeat(64) })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('expected-artifact-sha-not-bound-in-ledger'))
})

test('withdrawn rights or provenance rejects rather than holds', () => {
  assert.equal(evaluate(completeLedger(), { rightsStillValid: false }).decision, 'REJECT')
  assert.equal(evaluate(completeLedger(), { provenanceStillValid: false }).decision, 'REJECT')
})

test('retired or recalled evidence rejects promotion', () => {
  const retired = event('RETIRED', { eventId: 'evt-retired', decision: 'PASS' })
  const result = evaluate([...completeLedger(), retired])
  assert.equal(result.decision, 'REJECT')
  assert.ok(result.blockers.includes('rejected-recalled-or-retired-event-present'))
})

test('promotion authorization cannot be supplied by AI', () => {
  const promotion = event('PROMOTION_DECIDED', {
    eventId: 'evt-promotion',
    actor: { actorType: 'AI', actorId: 'promotion-model' },
    decision: 'PROMOTE',
  })
  const result = evaluate([...completeLedger(), promotion], { requirePromotionDecisionEvent: true })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.some(blocker => blocker.includes('ai-cannot-authorize-promotion')))
})

test('integrity v2 blocks cross-subject parent lineage even when pass events otherwise exist', () => {
  const foreignParent = event('PROBED', {
    eventId: 'evt-foreign-parent',
    subjectId: 'other-subject',
  })
  const events = completeLedger().map(item =>
    item.kind === 'PRIVACY_ATTESTED'
      ? { ...item, parentEventIds: [foreignParent.eventId] }
      : item,
  )
  const result = evaluate([foreignParent, ...events])
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.some(blocker => blocker.includes('ledger-integrity-v2:parent-subject-mismatch:evt-privacy:evt-foreign-parent')))
})

test('integrity v2 blocks temporal inversion before promotion candidacy', () => {
  const events = completeLedger().map(item =>
    item.kind === 'PRIVACY_ATTESTED'
      ? { ...item, occurredAt: '2026-09-08T07:59:59Z' }
      : item,
  )
  const result = evaluate(events)
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.some(blocker => blocker.includes('ledger-integrity-v2:child-occurs-before-parent:evt-privacy:evt-probed')))
})

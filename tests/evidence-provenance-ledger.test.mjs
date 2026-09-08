import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isHumanAttestationEvent,
  validateEvidenceLedgerChain,
  validateEvidenceLedgerEvent,
} from '../app/lib/governance/evidenceProvenanceLedger.ts'

const sha = 'a'.repeat(64)

function baseEvent(overrides = {}) {
  return {
    eventId: 'evt-1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'echo-a4c-test',
    kind: 'PROBED',
    occurredAt: '2026-09-08T07:45:00Z',
    actor: { actorType: 'SYSTEM', actorId: 'canonical-media-probe' },
    artifacts: [{ artifactId: 'echo-a4c-test-v1', sha256: sha }],
    policies: [{ policyId: 'clinical-media-governance', policyVersion: '1.0.0' }],
    decision: 'PASS',
    ...overrides,
  }
}

test('valid system evidence event passes', () => {
  assert.equal(validateEvidenceLedgerEvent(baseEvent()).valid, true)
})

test('invalid SHA fails closed', () => {
  const result = validateEvidenceLedgerEvent(baseEvent({ artifacts: [{ artifactId: 'a', sha256: 'bad' }] }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.some(blocker => blocker.startsWith('artifact-sha256-invalid')))
})

test('privacy attestation must be performed by a human', () => {
  const result = validateEvidenceLedgerEvent(baseEvent({
    kind: 'PRIVACY_ATTESTED',
    actor: { actorType: 'AI', actorId: 'privacy-model' },
    humanAttestation: { scope: 'PRIVACY', attested: true },
  }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('privacy-attestation-must-be-human'))
})

test('clinical attestation must be performed by a human', () => {
  const result = validateEvidenceLedgerEvent(baseEvent({
    kind: 'CLINICAL_ATTESTED',
    actor: { actorType: 'SYSTEM', actorId: 'clinical-engine' },
    humanAttestation: { scope: 'CLINICAL', attested: true },
  }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('clinical-attestation-must-be-human'))
})

test('AI cannot authorize promotion', () => {
  const result = validateEvidenceLedgerEvent(baseEvent({
    kind: 'PROMOTION_DECIDED',
    actor: { actorType: 'AI', actorId: 'promotion-model' },
    decision: 'PROMOTE',
  }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('ai-cannot-authorize-promotion'))
})

test('transformation requires explicit input/output lineage', () => {
  const result = validateEvidenceLedgerEvent(baseEvent({
    kind: 'TRANSFORMED',
    transform: {
      transformId: 'echo-derivative-recipe',
      transformVersion: '1.0.0',
      inputArtifactIds: [],
      outputArtifactIds: ['out'],
    },
  }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('transform-input-required'))
})

test('chain requires parents to appear before children and event ids to be unique', () => {
  const parent = baseEvent({ eventId: 'evt-parent' })
  const child = baseEvent({ eventId: 'evt-child', parentEventIds: ['evt-parent'] })
  assert.equal(validateEvidenceLedgerChain({ events: [parent, child] }).valid, true)

  const invalid = validateEvidenceLedgerChain({ events: [child, parent, parent] })
  assert.equal(invalid.valid, false)
  assert.ok(invalid.blockers.some(blocker => blocker.includes('parent-not-seen-before-child')))
  assert.ok(invalid.blockers.some(blocker => blocker.includes('duplicate-event-id')))
})

test('human attestation helper only recognizes real human attestation events', () => {
  const event = baseEvent({
    kind: 'PRIVACY_ATTESTED',
    actor: { actorType: 'HUMAN', actorId: 'privacy-reviewer-1' },
    humanAttestation: { scope: 'PRIVACY', attested: true },
  })
  assert.equal(isHumanAttestationEvent(event), true)
})

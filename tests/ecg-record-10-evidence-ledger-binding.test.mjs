import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_RECORD_10_EVIDENCE_EVENTS,
  ECG_RECORD_10_PRIMARY_SHA256,
  ECG_RECORD_10_LOW_RES_SHA256,
  evaluateEcgRecord10EvidenceBinding,
} from '../app/lib/clinicalIntelligence/ecgRecord10EvidenceLedgerBinding.ts'
import { validateEvidenceLedgerIntegrityV2 } from '../app/lib/governance/evidenceLedgerIntegrityV2.ts'

test('record 10 ledger chain is valid under Integrity v2', () => {
  const result = validateEvidenceLedgerIntegrityV2(ECG_RECORD_10_EVIDENCE_EVENTS)
  assert.equal(result.valid, true)
  assert.deepEqual(result.blockers, [])
})

test('clinical and privacy attestations remain human PASS events over the exact waveform hashes', () => {
  const attested = ECG_RECORD_10_EVIDENCE_EVENTS.filter(event =>
    event.kind === 'CLINICAL_ATTESTED' || event.kind === 'PRIVACY_ATTESTED',
  )
  assert.equal(attested.length, 2)

  for (const event of attested) {
    assert.equal(event.actor.actorType, 'HUMAN')
    assert.equal(event.decision, 'PASS')
    assert.equal(event.humanAttestation?.attested, true)
    const shas = new Set(event.artifacts.map(artifact => artifact.sha256))
    assert.equal(shas.has(ECG_RECORD_10_PRIMARY_SHA256), true)
    assert.equal(shas.has(ECG_RECORD_10_LOW_RES_SHA256), true)
  }
})

test('evidence binding stays HOLD until a device baseline is bound', () => {
  const result = evaluateEcgRecord10EvidenceBinding()
  assert.equal(result.integrityValid, true)
  assert.equal(result.evidenceLedgerBound, true)
  assert.equal(result.deviceBaselineBound, false)
  assert.equal(result.decision, 'HOLD')
})

test('record 10 cannot silently become learner-ready or promoted', () => {
  const result = evaluateEcgRecord10EvidenceBinding()
  assert.equal(result.learnerReady, false)
  assert.equal(result.promotionAuthorized, false)
  assert.equal(
    ECG_RECORD_10_EVIDENCE_EVENTS.some(event => event.kind === 'PROMOTION_DECIDED' && event.decision === 'PROMOTE'),
    false,
  )
})

test('technical caveat and publisher digest limitation remain in the ledger evidence', () => {
  const probe = ECG_RECORD_10_EVIDENCE_EVENTS.find(event => event.kind === 'PROBED')
  assert.ok(probe)
  assert.equal(probe.notes?.some(note => note.includes('106 ms')), true)
  assert.equal(probe.notes?.some(note => note.includes('not an independent publisher digest verification')), true)
})

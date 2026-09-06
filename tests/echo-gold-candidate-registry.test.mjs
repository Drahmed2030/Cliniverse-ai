import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_A4C_GOLD_CANDIDATES, validateEchoGoldCandidateRegistry } from '../app/lib/clinicalMedia/echoGoldCandidateRegistry.ts'

test('gold candidate registry validates', () => {
  assert.doesNotThrow(() => validateEchoGoldCandidateRegistry())
})

test('non-commercial datasets are rejected from gold use', () => {
  const echonet = ECHO_A4C_GOLD_CANDIDATES.find(item => item.candidateId === 'echonet-dynamic-normal-a4c')
  assert.equal(echonet?.commercialReuse, false)
  assert.equal(echonet?.disposition, 'reject')
})

test('pathology datasets cannot masquerade as normal references', () => {
  const cardiacNet = ECHO_A4C_GOLD_CANDIDATES.find(item => item.candidateId === 'cardiacnet-pah-asd-a4c')
  assert.equal(cardiacNet?.normalReferenceEligible, false)
  assert.equal(cardiacNet?.disposition, 'pathology-only')
})

test('permissive rights alone do not make a candidate gold', () => {
  const frontiers = ECHO_A4C_GOLD_CANDIDATES.find(item => item.candidateId === 'frontiers-image-perception-a4c-60fps-2022')
  assert.equal(frontiers?.commercialReuse, true)
  assert.equal(frontiers?.disposition, 'reject')
})

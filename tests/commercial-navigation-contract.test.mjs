import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMMERCIAL_PRIMARY_NAVIGATION_V1,
  describeCommercialPrimaryNavigationContractV1,
  evaluateCommercialPrimaryNavigationV1,
} from '../app/lib/commercial/commercialNavigationContract.ts'

test('commercial navigation is ready and bounded to five primary outcomes', () => {
  const result = evaluateCommercialPrimaryNavigationV1()
  assert.equal(result.decision, 'READY')
  assert.equal(COMMERCIAL_PRIMARY_NAVIGATION_V1.length, 5)
})

test('today is the single prominent default destination', () => {
  const prominent = COMMERCIAL_PRIMARY_NAVIGATION_V1.filter(item => item.role === 'PROMINENT')
  assert.equal(prominent.length, 1)
  assert.equal(prominent[0].id, 'today')
})

test('learn progress explore and me remain explicit primary destinations', () => {
  const ids = new Set(COMMERCIAL_PRIMARY_NAVIGATION_V1.map(item => item.id))
  for (const id of ['learn', 'progress', 'explore', 'me']) assert.equal(ids.has(id), true)
})

test('intelligence remains outside primary navigation and governance gated', () => {
  const contract = describeCommercialPrimaryNavigationContractV1()
  assert.equal(contract.intelligenceIsNotPrimaryNavigation, true)
  assert.equal(contract.clinicalIntelligenceRemainsGovernanceGated, true)
})

test('invalid duplicate or missing prominent structure fails closed', () => {
  const invalid = evaluateCommercialPrimaryNavigationV1([
    ...COMMERCIAL_PRIMARY_NAVIGATION_V1.slice(0, 4),
    { ...COMMERCIAL_PRIMARY_NAVIGATION_V1[3], id: 'explore' },
  ])
  assert.equal(invalid.decision, 'HOLD')
})

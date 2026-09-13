import { test } from 'node:test'
import assert from 'node:assert/strict'
import { preparationChecks, updatePreparation, prepareReview } from '../app/lib/ward/reviewPreparation.ts'
test('incomplete preparation cannot be marked prepared', () => {
  for (const omitted of preparationChecks) {
    const state = { checked: preparationChecks.filter(item => item.id !== omitted.id).map(item => item.id), prepared: false }
    assert.throws(() => prepareReview(state), /incomplete/)
  }
})
test('editing a prepared request invalidates preparation and preserves previous state', () => {
  const state = prepareReview({ checked: preparationChecks.map(item => item.id), prepared: false })
  const edited = updatePreparation(state, 'access', false)
  assert.equal(edited.prepared, false)
  assert.equal(state.prepared, true)
  assert.throws(() => prepareReview(edited), /incomplete/)
})
test('checks are unique and unknown checks rejected', () => {
  let state = { checked: [], prepared: false }
  state = updatePreparation(state, 'source', true)
  state = updatePreparation(state, 'source', true)
  assert.equal(state.checked.length, 1)
  assert.throws(() => updatePreparation(state, 'invented', true), /Unknown/)
})

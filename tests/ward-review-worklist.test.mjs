import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createReviewWorklist, changeRequest } from '../app/lib/ward/reviewWorklist.ts'
import { preparationChecks } from '../app/lib/ward/reviewPreparation.ts'
test('preparing ECG leaves Echo and original state untouched', () => {
  const initial = createReviewWorklist()
  let list = initial
  for (const check of preparationChecks) list = changeRequest(list, 'SIM-ECG-001', { kind: 'check', check: check.id, value: true })
  list = changeRequest(list, 'SIM-ECG-001', { kind: 'prepare' })
  assert.equal(list['SIM-ECG-001'].prepared, true)
  assert.deepEqual(list['SIM-ECHO-001'], { checked: [], prepared: false })
  assert.deepEqual(initial, createReviewWorklist())
  assert.throws(() => changeRequest(list, 'SIM-ECHO-001', { kind: 'prepare' }), /incomplete/)
})
test('reset and edit apply only to selected request', () => {
  let list = createReviewWorklist()
  for (const id of ['SIM-ECG-001','SIM-ECHO-001']) {
    for (const check of preparationChecks) list = changeRequest(list, id, { kind: 'check', check: check.id, value: true })
    list = changeRequest(list, id, { kind: 'prepare' })
  }
  list = changeRequest(list, 'SIM-ECG-001', { kind: 'reset' })
  assert.equal(list['SIM-ECHO-001'].prepared, true)
  list = changeRequest(list, 'SIM-ECHO-001', { kind: 'check', check: 'access', value: false })
  assert.equal(list['SIM-ECHO-001'].prepared, false)
  assert.deepEqual(list['SIM-ECG-001'].checked, [])
  assert.throws(() => changeRequest(list, 'unknown', { kind: 'reset' }), /Unknown/)
})

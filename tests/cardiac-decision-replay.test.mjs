import test from 'node:test'
import assert from 'node:assert/strict'
import { replayDecision } from '../app/lib/cardiology/decisionReplay.ts'
import { createNexusCase, getNextTransition, applyNexusEvent, createSyntheticTransitionEvent } from '../app/lib/cardiology/nexusCore.ts'
const at = '2026-09-13T08:00:00.000Z'
test('replay isolates the prior attempt and retains authorization rules', () => {
 const start = createNexusCase('SIM-REPLAY', 'SIM-REF', at)
 const rule = getNextTransition(start.state)
 const advanced = applyNexusEvent(start, createSyntheticTransitionEvent(start, rule, 'referring', at))
 assert.equal(advanced.ok, true)
 const branch = replayDecision(advanced.value, [start], 0)
 assert.equal(branch.current.state, 'draft')
 assert.equal(branch.previousAttempt.events.length, 1)
 assert.equal(branch.checkpoints.length, 0)
 branch.current.identifiers[0].value = 'SIM-CHANGED'
 assert.equal(start.identifiers[0].value, 'SIM-REF')
 assert.equal(branch.previousAttempt.identifiers[0].value, 'SIM-REF')
 const rejected = applyNexusEvent(branch.current, createSyntheticTransitionEvent(branch.current, rule, 'quality', at))
 assert.equal(rejected.ok, false)
 assert.equal(rejected.error.code, 'ROLE_NOT_ALLOWED')
})
test('replay rejects absent and non-integer checkpoints', () => {
 const start = createNexusCase('SIM-REPLAY', 'SIM-REF', at)
 for (const index of [-1, 0.5, 1, NaN]) assert.equal(replayDecision(start, [start], index), null)
 assert.equal(replayDecision(start, [], 0), null)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { teamPerspective } from '../app/lib/cardiology/teamPerspective.ts'
import { createNexusCase, getNextTransition, createSyntheticTransitionEvent, applyNexusEvent } from '../app/lib/cardiology/nexusCore.ts'
const at = '2026-09-13T08:00:00.000Z'
test('empty case never implies clinician or coordinator completion', () => {
 const c = createNexusCase('SIM-TEAM', 'SIM-REF', at)
 assert.deepEqual(teamPerspective(c).map(r => [r.recorded.length, r.pending.length]), [[0,2],[0,1]])
})
test('recorded review is attributed to clinician and does not complete coordination or acceptance', () => {
 let c = createNexusCase('SIM-TEAM', 'SIM-REF', at)
 for (const role of ['referring','cardiology']) {
  const rule = getNextTransition(c.state)
  const result = applyNexusEvent(c, createSyntheticTransitionEvent(c,rule,role,at))
  assert.equal(result.ok,true); c = result.value
 }
 const before = JSON.stringify(c)
 const [clinician, coordinator] = teamPerspective(c)
 assert.equal(clinician.recorded.length,1)
 assert.deepEqual(clinician.pending,['acceptance-recorded'])
 assert.equal(coordinator.recorded.length,0)
 assert.deepEqual(coordinator.pending,['identity-linked'])
 assert.equal(JSON.stringify(c),before)
})

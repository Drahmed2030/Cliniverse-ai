import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  appendIdentifier,
  applyNexusEvent,
  createNexusCase,
  createSyntheticClockEvent,
  createSyntheticTransitionEvent,
  getNextTransition,
} from '../app/lib/cardiology/nexusCore.ts'
import { validateReferenceIds } from '../app/lib/cardiology/nexusReferences.ts'

const createdAt = '2026-08-31T08:00:00.000Z'

test('Nexus Core starts before MRN and appends an authorized referral event', () => {
  const initial = createNexusCase('SIM-CASE-001', 'SIM-REF-001', createdAt)
  const rule = getNextTransition(initial.state)

  assert.equal(initial.state, 'draft')
  assert.deepEqual(initial.identifiers.map(item => item.kind), ['referral-case-id'])
  assert.ok(rule)

  const result = applyNexusEvent(initial, createSyntheticTransitionEvent(initial, rule, 'referring', createdAt))
  assert.equal(result.ok, true)
  if (!result.ok) return

  assert.equal(result.value.state, 'referral-received')
  assert.equal(result.value.events.length, 1)
  assert.equal(initial.events.length, 0, 'the input ledger remains unchanged')
})

test('Nexus Core rejects a transition from an unauthorized role', () => {
  const initial = createNexusCase('SIM-CASE-002', 'SIM-REF-002', createdAt)
  const rule = getNextTransition(initial.state)
  assert.ok(rule)

  const result = applyNexusEvent(initial, createSyntheticTransitionEvent(initial, rule, 'quality', createdAt))
  assert.equal(result.ok, false)
  if (result.ok) return

  assert.equal(result.error.code, 'ROLE_NOT_ALLOWED')
})

test('Nexus Core requires the MRN link before recording identity-linked', () => {
  let current = createNexusCase('SIM-CASE-003', 'SIM-REF-003', createdAt)

  for (const role of ['referring', 'cardiology', 'cardiology']) {
    const rule = getNextTransition(current.state)
    assert.ok(rule)
    const result = applyNexusEvent(current, createSyntheticTransitionEvent(current, rule, role, createdAt))
    assert.equal(result.ok, true)
    if (!result.ok) return
    current = result.value
  }

  const identityRule = getNextTransition(current.state)
  assert.ok(identityRule)
  const blocked = applyNexusEvent(current, createSyntheticTransitionEvent(current, identityRule, 'coordination', createdAt))
  assert.equal(blocked.ok, false)
  if (blocked.ok) return
  assert.equal(blocked.error.code, 'IDENTIFIER_REQUIRED')

  const linked = appendIdentifier(current, {
    kind: 'mrn',
    value: 'SIM-MRN-003',
    sourceSystem: 'cardio-nexus-simulation',
    linkedAt: createdAt,
  })
  assert.equal(linked.ok, true)
  if (!linked.ok) return

  const accepted = applyNexusEvent(linked.value, createSyntheticTransitionEvent(linked.value, identityRule, 'coordination', createdAt))
  assert.equal(accepted.ok, true)
  if (!accepted.ok) return
  assert.equal(accepted.value.state, 'identity-linked')
})

test('every transition reference resolves in the verified registry', () => {
  const source = readFileSync(new URL('../app/lib/cardiology/nexusCore.ts', import.meta.url), 'utf8')
  const referencedIds = [...source.matchAll(/referenceIds: \[([^\]]+)\]/g)]
    .flatMap(match => [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]))

  assert.deepEqual(validateReferenceIds(referencedIds), [])
})

test('clock events append without changing the journey state', () => {
  const initial = createNexusCase('SIM-CASE-004', 'SIM-REF-004', createdAt)
  const clock = createSyntheticClockEvent(initial, 'first-medical-contact', 'referring', createdAt)
  const result = applyNexusEvent(initial, clock)

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.value.state, 'draft')
  assert.equal(result.value.events[0].kind, 'clock')
})

test('database contract stays fail-closed and outside executable migrations', () => {
  const contract = readFileSync(new URL('../supabase/drafts/cardio_nexus_core_contract.sql', import.meta.url), 'utf8')

  assert.match(contract, /create schema if not exists cardio_nexus/)
  assert.match(contract, /create table cardio_nexus\.events/)
  assert.match(contract, /unique \(case_id, sequence\)/)
  assert.match(contract, /enable row level security/g)
  assert.match(contract, /revoke all on schema cardio_nexus from public, anon, authenticated/)
  assert.match(contract, /create trigger cardio_nexus_events_append_only/)
  assert.match(contract, /rollback;/)
})

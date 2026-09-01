import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = relativePath => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('Cardiology Operations exposes the QAPAS-DIRECT simulator', () => {
  const operations = read('app/components/ward/cardiology/CardiologyOperations.tsx')

  assert.match(operations, /QAPAS Direct/)
  assert.match(operations, /QapasDirectSimulation/)
  assert.match(operations, /activeModule === 'pathway'/)
})

test('QAPAS simulation models the pre-MRN identity chain and accountable roles', () => {
  const pathway = read('app/lib/cardiology/pathwaySimulation.ts')

  for (const token of ['Referral Case ID', 'Synthetic MRN', 'Encounter', 'Cath Episode']) {
    assert.match(pathway, new RegExp(token))
  }
  for (const role of ['Referring team', 'Medical Coordination', 'Accepting Cardiology', 'Cath Lab', 'Quality']) {
    assert.match(pathway, new RegExp(role))
  }
  assert.match(pathway, /ambulance driver never interacts while driving/)
})

test('QAPAS simulator preserves human authority and synthetic-only boundary', () => {
  const component = read('app/components/ward/cardiology/QapasDirectSimulation.tsx')
  const pathway = read('app/lib/cardiology/pathwaySimulation.ts')

  assert.match(component, /Every identifier and event below is fictional/)
  assert.match(component, /does not diagnose, interpret ECGs, accept referrals, activate the Cath Lab/)
  assert.match(component, /Every consequential action requires an authorized human/)
  assert.match(pathway, /Only the accepting clinician can accept, redirect, or decline/)
  assert.doesNotMatch(component, /supabase|fetch\(|axios|OpenAI/i)
})

test('KPI baseline is contextual and never presented as predicted improvement', () => {
  const component = read('app/components/ward/cardiology/QapasDirectSimulation.tsx')
  const pathway = read('app/lib/cardiology/pathwaySimulation.ts')

  for (const id of ['AHACAD2', 'AHACAD8', 'AHACAD9']) {
    assert.match(pathway, new RegExp(id))
  }
  assert.match(component, /not a forecast or claim of improvement/)
  assert.match(component, /future pilot must validate definitions, exclusions, clocks, and impact/)
})

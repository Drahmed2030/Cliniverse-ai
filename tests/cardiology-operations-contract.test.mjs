import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = relativePath => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

test('Care exposes Cardiology Operations while preserving Ward Simulation', () => {
  const source = read('app/components/ward/index.tsx')

  assert.match(source, /import CardiologyOperations from '\.\/cardiology'/)
  assert.match(source, /Cardiology Operations/)
  assert.match(source, /Ward Simulation/)
  assert.match(source, /aria-pressed=\{activeWorkspace === item\.id\}/)
  assert.match(source, /handleWorkspace\(item\.id, item\.premium\)/)
  assert.match(source, /openPaywall/)
  assert.match(source, /activeWorkspace === 'cardiology' && isPro/)
})

test('Cardiology Operations uses a versioned local simulation contract', () => {
  const source = read('app/lib/cardiology/simulationData.ts')

  assert.match(source, /cliniverse:cardiology-operations:simulation:v1/)
  assert.match(source, /schemaVersion: 1/)
  assert.match(source, /SIM-CARD-001/)
  assert.match(source, /value\.cases\.every\(isCardiologyCase\)/)
  assert.match(source, /value\.handovers\.every\(isHandoverRecord\)/)
})

test('Epic exposes all five operational modules and the simulation boundary', () => {
  const source = read('app/components/ward/cardiology/CardiologyOperations.tsx')

  for (const label of ['On-call', 'Census', 'Surgical', 'Notes & Orders', 'Handover']) {
    assert.match(source, new RegExp(label.replace('&', '\\&')))
  }
  assert.match(source, /Internal simulation only/)
  assert.match(source, /Do not enter real patient data/)
  assert.match(source, /does not provide diagnosis, treatment advice, order entry, or clinical decision support/)
})

test('Handover requires every readiness confirmation and remains local', () => {
  const source = read('app/components/ward/cardiology/StructuredHandover.tsx')

  assert.match(source, /note\.trim\(\)\.length > 0 && pendingReviewed && ownerConfirmed && simulationConfirmed/)
  assert.match(source, /No message is sent to a person, hospital, or external service/)
  assert.match(source, /No real patient information entered/)
})

test('Operational modules do not claim clinical authority', () => {
  const census = read('app/components/ward/cardiology/ChestPainCensus.tsx')
  const tasks = read('app/components/ward/cardiology/NotesOrdersTracker.tsx')

  assert.match(census, /does not diagnose, triage, recommend treatment, or calculate risk/)
  assert.match(tasks, /cannot place, alter, approve, or transmit a clinical order/)
})

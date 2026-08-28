import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Atlas capabilities expose honest interactive release status', () => {
  const source = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(source, /setSelectedCapability/)
  assert.match(source, /aria-live="polite"/)
  assert.match(source, /not enabled in this build/)
  assert.match(source, /remains gated until safety, authentication, and validation requirements pass/)
})

test('Me hub exposes privacy, terms, and support destinations', () => {
  const source = read('app/components/release/MeHub.tsx')
  assert.match(source, /href: '\/privacy'/)
  assert.match(source, /href: '\/terms'/)
  assert.match(source, /href: '\/support'/)
})

test('consult requests are explicit local simulation state', () => {
  const ward = read('app/components/ward/index.tsx')
  const journey = read('app/components/ward/PatientJourney.tsx')
  assert.match(ward, /consultedPatientIds/)
  assert.match(ward, /onRequestConsult={handleRequestConsult}/)
  assert.match(journey, /Consult Requested/)
  assert.match(journey, /No external message was sent/)
})

test('discharge save cannot silently run without a draft', () => {
  const source = read('app/components/ward/ClinicalPanelV2.tsx')
  assert.match(source, /disabled={!discharge}/)
  assert.match(source, /Generate a discharge draft before saving/)
  assert.match(source, /aria-live="polite"/)
})

test('release surfaces respect iOS safe areas', () => {
  const releaseApp = read('app/components/ReleaseApp.tsx')
  const journey = read('app/components/ward/PatientJourney.tsx')
  assert.match(releaseApp, /env\(safe-area-inset-top\)/)
  assert.match(journey, /env\(safe-area-inset-top\)/)
  assert.match(journey, /env\(safe-area-inset-bottom\)/)
})

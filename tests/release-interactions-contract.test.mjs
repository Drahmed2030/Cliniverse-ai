import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Atlas is an explicit non-interactive release-status catalog', () => {
  const source = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.doesNotMatch(source, /<button/)
  assert.doesNotMatch(source, /onClick=/)
  assert.match(source, /capability names are release-status labels, not launch controls/)
  assert.match(source, /Only completed and individually verified tools will become interactive/)
})

test('Me hub exposes privacy, terms, and support destinations', () => {
  const source = read('app/components/release/MeHub.tsx')
  assert.match(source, /href: '\/privacy'/)
  assert.match(source, /href: '\/terms'/)
  assert.match(source, /href: '\/support'/)
})

test('Me renders one account-session surface', () => {
  const releaseApp = read('app/components/ReleaseApp.tsx')
  const account = read('app/components/release/MeAccountSummary.tsx')
  assert.doesNotMatch(releaseApp, /AccountSessionActions/)
  assert.match(account, /AccountSessionActions/)
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
  const layout = read('app/layout.tsx')
  const releaseApp = read('app/components/ReleaseApp.tsx')
  const releaseNav = read('app/components/ReleaseNav.tsx')
  const auth = read('app/components/AuthScreen.tsx')
  const journey = read('app/components/ward/PatientJourney.tsx')
  assert.match(layout, /viewportFit:\s*["']cover["']/)
  assert.match(releaseApp, /env\(safe-area-inset-top,\s*0px\)/)
  assert.match(releaseApp, /env\(safe-area-inset-left,\s*0px\)/)
  assert.match(releaseNav, /env\(safe-area-inset-bottom,\s*0px\)/)
  assert.match(auth, /env\(safe-area-inset-top,\s*0px\)/)
  assert.match(journey, /env\(safe-area-inset-top\)/)
  assert.match(journey, /env\(safe-area-inset-bottom\)/)
})

test('disabled OAuth providers are absent from the Apple v1 sign-in surface', () => {
  const auth = read('app/components/AuthScreen.tsx')
  assert.match(auth, /appleEnabled\s*\?\s*<AuthButton/)
  assert.match(auth, /googleEnabled\s*\?\s*<AuthButton/)
  assert.equal(auth.includes('Not configured'), false)
  assert.equal(/unavailable\s*:/.test(auth), false)
})

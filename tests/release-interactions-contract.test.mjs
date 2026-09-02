import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Atlas is an interactive tour limited to verified release surfaces', () => {
  const source = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(source, /<button/)
  assert.match(source, /onNavigate\(path\.destination\)/)
  assert.match(source, /onOpenPlan/)
  assert.match(source, /CURRENT RELEASE TOUR/)
  assert.match(source, /Release boundary:/)
  assert.doesNotMatch(source, /Imaging analysis|Symptom interpretation|Prescription \/ dosing AI/)
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
  assert.match(releaseApp, /Capacitor\.isNativePlatform\(\)/)
  assert.match(releaseApp, /Capacitor\.getPlatform\(\) !== 'ios'/)
  assert.match(releaseApp, /window\.innerWidth >= 768 \? 24 : 34/)
  assert.match(releaseApp, /max\(\$\{nativeTopPadding\}px, calc\(10px \+ env\(safe-area-inset-top, 0px\)\)\)/)
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

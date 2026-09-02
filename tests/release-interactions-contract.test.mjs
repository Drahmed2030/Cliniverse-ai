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
  const safeArea = read('app/lib/nativeSafeArea.ts')
  const onboarding = read('app/components/OnboardingFunnel.tsx')
  const paywall = read('app/components/PaywallSheet.tsx')
  const globalCss = read('app/globals.css')
  assert.match(layout, /viewportFit:\s*["']cover["']/)
  assert.match(safeArea, /env\(safe-area-inset-top,\s*0px\)/)
  assert.match(safeArea, /--cliniverse-native-safe-area-top/)
  assert.match(safeArea, /--cliniverse-native-safe-area-bottom/)
  assert.match(releaseApp, /NATIVE_SAFE_AREA_TOP/)
  assert.match(releaseApp, /data-release-header-inner/)
  assert.match(releaseApp, /Capacitor\.getPlatform\(\) === 'ios'/)
  assert.match(releaseApp, /isCompactViewport/)
  assert.match(releaseApp, /isTouchTablet/)
  assert.match(releaseApp, /Macintosh/)
  assert.match(releaseApp, /window\.innerWidth >= 768 \? 34 : 69/)
  assert.match(releaseApp, /nativeHeaderTopPadding/)
  assert.match(releaseApp, /NATIVE_SAFE_AREA_LEFT/)
  assert.match(releaseNav, /NATIVE_SAFE_AREA_BOTTOM/)
  assert.match(auth, /NATIVE_SAFE_AREA_TOP/)
  assert.match(journey, /NATIVE_SAFE_AREA_TOP/)
  assert.match(journey, /NATIVE_SAFE_AREA_BOTTOM/)
  assert.match(journey, /data-patient-journey-top/)
  assert.match(onboarding, /NATIVE_SAFE_AREA_TOP/)
  assert.match(paywall, /NATIVE_SAFE_AREA_BOTTOM/)
  assert.doesNotMatch(globalCss, /@supports \(-webkit-touch-callout: none\)/)
  assert.match(globalCss, /\[data-release-header-inner\]/)
  assert.match(globalCss, /\[data-patient-journey-top\]/)
  assert.match(globalCss, /@media \(max-width: 767px\)/)
  assert.match(globalCss, /\(pointer: coarse\)/)
  assert.match(globalCss, /69px/)
  assert.match(globalCss, /34px/)
})

test('disabled OAuth providers are absent from the Apple v1 sign-in surface', () => {
  const auth = read('app/components/AuthScreen.tsx')
  assert.match(auth, /appleEnabled\s*\?\s*<AuthButton/)
  assert.match(auth, /googleEnabled\s*\?\s*<AuthButton/)
  assert.equal(auth.includes('Not configured'), false)
  assert.equal(/unavailable\s*:/.test(auth), false)
})

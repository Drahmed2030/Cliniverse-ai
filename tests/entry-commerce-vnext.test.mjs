import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('entry surfaces use the blue-led vNext identity without glass or marketing gold', () => {
  const auth = read('app/components/AuthScreen.tsx')
  const onboarding = read('app/components/release/OnboardingScreens.tsx')
  assert.match(auth, /data-auth-entry/)
  assert.match(auth, /var\(--cv-blue\)/)
  assert.doesNotMatch(auth, /backdropFilter|linear-gradient|radial-gradient/)
  assert.match(onboarding, /background: var\(--cv-blue\)/)
  assert.doesNotMatch(onboarding, /Golden Entry/)
})

test('paywall claims only current release-safe learner value', () => {
  const paywall = read('app/components/PaywallSheet.tsx')
  assert.match(paywall, /ECG · Echo · Ward/)
  assert.match(paywall, /Pathway · Reference/)
  assert.match(paywall, /Progress · Review/)
  assert.doesNotMatch(paywall, /Code Lab|BLS|ACLS|Resuscitation|Nexus Learning|Cardiology Operations/)
  assert.match(paywall, /Restore/)
  assert.match(paywall, /App Store confirms price/)
})

test('paywall keeps gold constrained to annual value semantics', () => {
  const paywall = read('app/components/PaywallSheet.tsx')
  assert.match(paywall, /cv-paywall-plan-badge/)
  assert.match(paywall, /var\(--cv-gold\)/)
  assert.match(paywall, /background:var\(--cv-blue\)/)
})

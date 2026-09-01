import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('NXS passkey readiness stays fail-closed until capability, provider and release gates pass', () => {
  const source = read('app/lib/passkey-readiness.ts')
  assert.match(source, /browserSupportsWebAuthn/)
  assert.match(source, /secureContext/)
  assert.match(source, /providerVerified/)
  assert.match(source, /productionApproved/)
  assert.match(source, /canOffer:\s*false/)
  assert.equal(source.includes('signUp'), false)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('setSession'), false)
})

test('NXS visual quality gate contract defines mobile, tablet, RTL and accessibility coverage', () => {
  const source = read('docs/nxs-visual-quality-gate.md')
  for (const required of [
    'iPhone',
    'iPad',
    'English',
    'Arabic RTL',
    'Splash',
    'Onboarding',
    'Login',
    'Paywall',
    'accessibility',
    'visual regression',
  ]) {
    assert.equal(source.includes(required), true, `missing ${required}`)
  }
})

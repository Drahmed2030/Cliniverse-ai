import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('splash is brief, branded and release-scoped', () => {
  const source = read('app/components/SplashScreen.tsx')
  assert.match(source, /duration = 700/)
  assert.match(source, /Cliniverse AI/)
  assert.match(source, /A NEURAOPS PRODUCT/)
  assert.match(source, /Human review/)
  assert.match(source, /No real patient data/)
  assert.equal(source.includes('images.unsplash.com'), false)
  assert.equal(source.includes('Clinical intelligence for real practice'), false)
})

test('onboarding has no remote image dependency or unapproved commercial and clinical claims', () => {
  const source = read('app/components/OnboardingFunnel.tsx')
  for (const banned of [
    'images.unsplash.com',
    'CLINIVERSE PRO',
    'advanced AI consensus',
    'MULTI-AI CLINICAL SUPPORT',
    'MRCP · USMLE · FRCP',
    'GLOBAL LEARNING NETWORK',
    'virtual hospital OS',
    'Afia',
  ]) {
    assert.equal(source.includes(banned), false)
  }
  assert.match(source, /Clinical learning and workflow/)
  assert.match(source, /No real patient data/)
  assert.match(source, /Advanced AI stays gated/)
  assert.match(source, /Continue to sign in/)
})

test('release startup path does not yet insert optional splash or onboarding layers', () => {
  const source = read('app/components/ReleaseApp.tsx')
  assert.equal(source.includes('SplashScreen'), false)
  assert.equal(source.includes('OnboardingFunnel'), false)
})

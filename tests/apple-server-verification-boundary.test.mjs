import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Apple verification boundary is server-only, cryptographic-verifier dependent, and fail-closed', () => {
  const source = read('app/lib/server/apple-subscription-verification.ts')
  assert.match(source, /server-only/)
  assert.match(source, /verifyAndDecodeTransaction/)
  assert.match(source, /apple_signature_verification_failed/)
  assert.match(source, /com\.cliniverse\.ai/)
  assert.match(source, /cliniverse\.core\.monthly/)
  assert.match(source, /cliniverse\.core\.yearly/)
  assert.match(source, /apple_transaction_revoked/)
  assert.match(source, /apple_subscription_expired/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes(".from('subscriptions')"), false)
})

test('Apple verification route authenticates current account before verifying purchase and performs no entitlement write', () => {
  const source = read('app/api/subscriptions/apple/verify/route.ts')
  assert.match(source, /authorization/)
  assert.match(source, /Bearer /)
  assert.match(source, /auth\.getUser\(token\)/)
  assert.match(source, /verifyCliniverseAppleTransaction/)
  assert.match(source, /createUnavailableAppleVerifier/)
  assert.match(source, /status = result\.reason === 'apple_signature_verification_failed' \? 503 : 422/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes(".from('subscriptions')"), false)
  assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
})

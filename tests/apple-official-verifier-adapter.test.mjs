import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('official Apple verifier adapter delegates cryptographic verification to SignedDataVerifier', () => {
  const source = read('app/lib/server/apple-official-verifier-adapter.ts')
  assert.match(source, /SignedDataVerifier/)
  assert.match(source, /verifyAndDecodeTransaction\(signedTransaction\)/)
  assert.match(source, /rootCertificates\.length === 0/)
  assert.match(source, /apple_app_id_required_for_production/)
  assert.match(source, /bundleId:\s*'com\.cliniverse\.ai'/)
})

test('official adapter normalizes only verified transaction fields and does not persist entitlement', () => {
  const source = read('app/lib/server/apple-official-verifier-adapter.ts')
  for (const field of ['transactionId', 'originalTransactionId', 'productId', 'bundleId', 'environment', 'purchaseDate', 'expiresDate', 'revocationDate']) {
    assert.equal(source.includes(field), true)
  }
  assert.equal(source.includes("from('subscriptions')"), false)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
})

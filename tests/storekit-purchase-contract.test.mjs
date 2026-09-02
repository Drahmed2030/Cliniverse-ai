import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('StoreKit purchase controller contract stays fail-closed and non-authoritative', () => {
  const source = read('app/lib/storekit-purchase-contract.ts')
  assert.match(source, /source:\s*'app-store'/)
  assert.match(source, /displayPrice/)
  assert.match(source, /signedTransaction/)
  assert.match(source, /originalTransactionId/)
  assert.match(source, /com\.cliniverse\.ai\.pro\.monthly/)
  assert.match(source, /com\.cliniverse\.ai\.pro\.yearly/)
  assert.match(source, /finish\(transactionId: string\)/)
  assert.match(source, /transactions: StoreVerifiedTransaction\[\]/)
  assert.match(source, /STOREKIT_NOT_CONFIGURED/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('subscriptions'), false)
  assert.equal(source.includes('Lemon Squeezy'), false)
})

test('Capacitor StoreKit controller maps only allowlisted Apple products and never grants entitlement locally', () => {
  const source = read('app/lib/capacitor-storekit-controller.ts')
  assert.match(source, /registerPlugin<CliniverseStoreKitPlugin>\('CliniverseStoreKit'\)/)
  assert.match(source, /Capacitor\.getPlatform\(\) === 'ios'/)
  assert.match(source, /APPLE_PRODUCT_IDS\[plan\]/)
  assert.match(source, /NativeStoreKit\.restore\(\)/)
  assert.match(source, /NativeStoreKit\.finish/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes(".from('subscriptions')"), false)
})

test('StoreKit contract distinguishes verified, pending, cancelled and failed purchase results', () => {
  const source = read('app/lib/storekit-purchase-contract.ts')
  for (const state of ["'verified'", "'pending'", "'cancelled'", "'failed'"]) {
    assert.equal(source.includes(state), true)
  }
})

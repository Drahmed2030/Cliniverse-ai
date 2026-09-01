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
  assert.match(source, /STOREKIT_NOT_CONFIGURED/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('subscriptions'), false)
  assert.equal(source.includes('Lemon Squeezy'), false)
})

test('StoreKit contract distinguishes verified, pending, cancelled and failed purchase results', () => {
  const source = read('app/lib/storekit-purchase-contract.ts')
  for (const state of ["'verified'", "'pending'", "'cancelled'", "'failed'"]) {
    assert.equal(source.includes(state), true)
  }
})

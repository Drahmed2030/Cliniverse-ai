import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('StoreKit verification client sends only verified purchase JWS through authenticated server boundary', () => {
  const source = read('app/lib/apple-purchase-verification-client.ts')
  assert.match(source, /purchase\.status !== 'verified'/)
  assert.match(source, /getCurrentSession/)
  assert.match(source, /access_token/)
  assert.match(source, /Authorization:\s*`Bearer \$\{accessToken\}`/)
  assert.match(source, /\/api\/subscriptions\/apple\/verify/)
  assert.match(source, /signedTransaction:\s*purchase\.signedTransaction/)
  assert.match(source, /result\.verified !== true/)
  assert.match(source, /result\.persisted !== true/)
  assert.match(source, /result\.entitlementRefreshRequired !== true/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
})

test('completed Apple purchase unlocks only after trusted entitlement re-read', () => {
  const source = read('app/lib/apple-purchase-verification-client.ts')
  assert.match(source, /completeStoreKitPurchase/)
  assert.match(source, /getOwnEntitlement\(\)/)
  assert.match(source, /!entitlement\.isPro/)
  assert.match(source, /entitlement\.product !== 'cliniverse\.core'/)
  assert.match(source, /apple_entitlement_refresh_not_active/)
  assert.equal(source.includes(".from('subscriptions')"), false)
})

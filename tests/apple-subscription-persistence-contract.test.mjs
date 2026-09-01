import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Apple subscription lineage migration enforces ownership, idempotency and server-only writes', () => {
  const migration = read('supabase/migrations/20260901080000_apple_subscription_lineage.sql')
  assert.match(migration, /subscriptions_apple_original_transaction_uidx/)
  assert.match(migration, /apple_subscription_transactions/)
  assert.match(migration, /transaction_id text primary key/)
  assert.match(migration, /pg_advisory_xact_lock/)
  assert.match(migration, /hashtextextended\(p_original_transaction_id, 0\)/)
  assert.match(migration, /apple_original_transaction_owned_by_other_user/)
  assert.match(migration, /apple_transaction_conflict/)
  assert.match(migration, /duplicate', true/)
  assert.match(migration, /p_purchase_at < v_subscription\.apple_latest_purchase_at/)
  assert.match(migration, /revoke all on function public\.persist_verified_apple_subscription/)
  assert.match(migration, /grant execute on function public\.persist_verified_apple_subscription[\s\S]*to service_role/)
  assert.match(migration, /grant select \(provider, apple_product_id, verified_at, revoked_at, updated_at\)/)
  assert.match(migration, /Apple transaction identifiers are client-readable/)
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.persist_verified_apple_subscription\([\s\S]*?\)\s+to authenticated;/,
  )
})

test('trusted Apple persistence hashes signed JWS and never grants PRO directly', () => {
  const service = read('app/lib/server/apple-subscription-persistence.ts')
  assert.match(service, /createHash\('sha256'\)/)
  assert.match(service, /originalTransactionId/)
  assert.match(service, /transactionId/)
  assert.match(service, /lifecycleState/)
  assert.equal(service.includes('activatePro'), false)
  assert.equal(service.includes("from('subscriptions')"), false)
})

test('Supabase Apple persistence adapter is server-only and uses the privileged RPC only', () => {
  const adapter = read('app/lib/server/supabase-apple-subscription-repository.ts')
  assert.match(adapter, /import 'server-only'/)
  assert.match(adapter, /SUPABASE_SERVICE_ROLE_KEY/)
  assert.match(adapter, /persist_verified_apple_subscription/)
  assert.equal(adapter.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'), false)
  assert.equal(adapter.includes('.from('), false)
})

test('Apple PRO entitlement is a read-only derived cliniverse.core authority and fails closed', () => {
  const source = read('app/lib/entitlements.ts')
  assert.match(source, /cliniverse\.core\.monthly/)
  assert.match(source, /cliniverse\.core\.yearly/)
  assert.match(source, /provider === 'apple'/)
  assert.match(source, /apple_product_id/)
  assert.match(source, /verified_at/)
  assert.match(source, /revoked_at/)
  assert.match(source, /status !== 'active'/)
  assert.match(source, /product: 'cliniverse\.core'/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('.insert('), false)
  assert.equal(source.includes('.update('), false)
})

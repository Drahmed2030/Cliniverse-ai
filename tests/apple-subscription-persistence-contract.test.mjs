import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function exists(path) {
  return existsSync(new URL(`../${path}`, import.meta.url))
}

test('Apple subscription authority migration separates event idempotency from transaction lineage', () => {
  const migration = read('supabase/migrations/20260902051748_apple_subscription_authority_v2.sql')
  assert.match(migration, /com\.cliniverse\.ai\.pro\.monthly/)
  assert.match(migration, /com\.cliniverse\.ai\.pro\.yearly/)
  assert.match(migration, /subscriptions_apple_original_transaction_uidx/)
  assert.match(migration, /apple_subscription_events/)
  assert.match(migration, /provider_event_id text not null unique/)
  assert.match(migration, /transaction_id text not null/)
  assert.doesNotMatch(migration, /transaction_id text primary key/)
  assert.match(migration, /pg_advisory_xact_lock\(hashtextextended\(p_provider_event_id, 1\)\)/)
  assert.match(migration, /pg_advisory_xact_lock\(hashtextextended\(p_original_transaction_id, 2\)\)/)
  assert.match(migration, /apple_subscription_owned_by_another_user/)
  assert.match(migration, /apple_event_replay_conflict/)
  assert.match(migration, /duplicate', true/)
  assert.match(migration, /p_event_at < v_subscription\.apple_last_event_at/)
  assert.match(migration, /stale_ignored/)
  assert.match(migration, /signed_payload_hash/)
  assert.match(migration, /to service_role/)
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.persist_verified_apple_subscription\([\s\S]*?\)\s+to authenticated;/,
  )
})

test('superseded transaction-primary-key Apple migration cannot return', () => {
  assert.equal(exists('supabase/migrations/20260901080000_apple_subscription_lineage.sql'), false)
})

test('Apple subscription event lineage has a covering foreign-key index', () => {
  const migration = read(
    'supabase/migrations/20260902051936_apple_subscription_events_fk_index.sql',
  )
  assert.match(migration, /apple_subscription_events_subscription_idx/)
  assert.match(migration, /apple_subscription_events \(subscription_id\)/)
})

test('trusted Apple persistence hashes signed JWS, creates deterministic StoreKit event identity and never grants PRO directly', () => {
  const service = read('app/lib/server/apple-subscription-persistence.ts')
  assert.match(service, /createHash\('sha256'\)/)
  assert.match(service, /storekit:transaction:\$\{transaction\.transactionId\}/)
  assert.match(service, /providerEventId/)
  assert.match(service, /originalTransactionId/)
  assert.match(service, /transactionId/)
  assert.match(service, /lifecycleState/)
  assert.match(service, /apple_initial_transaction_not_active/)
  assert.equal(service.includes('activatePro'), false)
  assert.equal(service.includes("from('subscriptions')"), false)
})

test('Supabase Apple persistence adapter is server-only and calls only the canonical RPC shape', () => {
  const adapter = read('app/lib/server/supabase-apple-subscription-repository.ts')
  assert.match(adapter, /import 'server-only'/)
  assert.match(adapter, /SUPABASE_SERVICE_ROLE_KEY/)
  assert.match(adapter, /persist_verified_apple_subscription/)
  assert.match(adapter, /p_provider_event_id/)
  assert.match(adapter, /p_event_at/)
  assert.match(adapter, /p_lifecycle_status/)
  assert.equal(adapter.includes('p_lifecycle_state'), false)
  assert.equal(adapter.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'), false)
  assert.equal(adapter.includes('.from('), false)
})

test('Apple PRO entitlement is read-only cliniverse.core authority and supports active/grace only', () => {
  const source = read('app/lib/entitlements.ts')
  assert.match(source, /com\.cliniverse\.ai\.pro\.monthly/)
  assert.match(source, /com\.cliniverse\.ai\.pro\.yearly/)
  assert.match(source, /provider === 'apple'/)
  assert.match(source, /apple_product_id/)
  assert.match(source, /verified_at/)
  assert.match(source, /revoked_at/)
  assert.match(source, /product: 'cliniverse\.core'/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('.insert('), false)
  assert.equal(source.includes('.update('), false)
})

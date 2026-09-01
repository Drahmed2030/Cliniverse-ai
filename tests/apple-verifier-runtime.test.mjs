import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Apple verifier runtime is server-only and requires explicit environment plus trusted roots', () => {
  const source = read('app/lib/server/apple-verifier-runtime.ts')
  assert.match(source, /import 'server-only'/)
  assert.match(source, /APPLE_IAP_ENVIRONMENT/)
  assert.match(source, /APPLE_ROOT_CERTIFICATES_BASE64_JSON/)
  assert.match(source, /APPLE_APP_ID/)
  assert.match(source, /APPLE_IAP_ONLINE_CHECKS/)
  assert.match(source, /environment === 'Production' && !appAppleId/)
  assert.match(source, /bundleId:\s*BUNDLE_ID/)
})

test('Apple verifier runtime stays unavailable until official library loader exists', () => {
  const source = read('app/lib/server/apple-verifier-runtime.ts')
  assert.match(source, /apple_verifier_runtime_not_configured/)
  assert.match(source, /apple_official_library_not_installed/)
  assert.match(source, /apple_official_library_load_failed/)
  assert.match(source, /createAppleOfficialVerifier/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
  assert.equal(source.includes("from('subscriptions')"), false)
})

test('runtime configuration accepts only Sandbox or Production and never trusts a client bundle id', () => {
  const source = read('app/lib/server/apple-verifier-runtime.ts')
  assert.match(source, /value === 'Sandbox' \|\| value === 'Production'/)
  assert.match(source, /const BUNDLE_ID = 'com\.cliniverse\.ai'/)
  assert.equal(source.includes('NEXT_PUBLIC_APPLE'), false)
})

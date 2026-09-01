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
  assert.match(source, /verified\.verified !== true/)
  assert.equal(source.includes('activatePro'), false)
  assert.equal(source.includes(".from('subscriptions')"), false)
  assert.equal(source.includes('SUPABASE_SERVICE_ROLE_KEY'), false)
})

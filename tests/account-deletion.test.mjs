import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { handleAccountDeletion } from '../app/api/account/delete/handler.mjs'
import { isDeletionConfirmed } from '../app/lib/account-deletion-confirmation.mjs'

function request({ token = 'synthetic-a-token', body = { confirmation: 'DELETE' }, query = '' } = {}) {
  return new Request('https://cliniverse.example/api/account/delete' + query, {
    method: 'POST',
    headers: token ? { authorization: 'Bearer ' + token } : {},
    body: JSON.stringify(body),
  })
}

function harness(options = {}) {
  const calls = []
  const dependencies = {
    async verify(token) {
      calls.push(['verify', token])
      return token === 'synthetic-a-token' ? 'synthetic-a' : null
    },
    async cleanupReady() {
      calls.push(['readiness'])
      return options.ready ?? true
    },
    async deleteUser(userId) {
      calls.push(['delete', userId])
      if (options.fail) throw new Error('sensitive internal detail')
    },
  }
  return { dependencies, calls }
}

test('verified account is hard-deleted using only the verified identity', async () => {
  const { dependencies, calls } = harness()
  const response = await handleAccountDeletion(request(), dependencies)
  assert.equal(response.status, 204)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(calls, [['verify', 'synthetic-a-token'], ['readiness'], ['delete', 'synthetic-a']])
})

test('an authenticated caller cannot target another account in body or query', async () => {
  for (const input of [
    { body: { confirmation: 'DELETE', user_id: 'synthetic-b' } },
    { query: '?user_id=synthetic-b' },
  ]) {
    const { dependencies, calls } = harness()
    const response = await handleAccountDeletion(request(input), dependencies)
    assert.equal(response.status, 403)
    assert.deepEqual(calls, [['verify', 'synthetic-a-token']])
  }
})

test('missing and invalid tokens are rejected without privileged writes', async () => {
  for (const token of ['', 'synthetic-invalid-token']) {
    const { dependencies, calls } = harness()
    const response = await handleAccountDeletion(request({ token }), dependencies)
    assert.equal(response.status, 401)
    assert.equal(calls.some(([action]) => action !== 'verify'), false)
  }
})

test('confirmation rejects empty, partial and differently cased words', async () => {
  for (const confirmation of ['', 'DELET', 'delete', 'DELETE ']) {
    assert.equal(isDeletionConfirmed(confirmation), false)
    const { dependencies, calls } = harness()
    const response = await handleAccountDeletion(request({ body: { confirmation } }), dependencies)
    assert.equal(response.status, 400)
    assert.deepEqual(calls, [['verify', 'synthetic-a-token']])
  }
  assert.equal(isDeletionConfirmed('DELETE'), true)
})

test('an unavailable cleanup trigger blocks hard deletion', async () => {
  const { dependencies, calls } = harness({ ready: false })
  const response = await handleAccountDeletion(request(), dependencies)
  assert.equal(response.status, 500)
  assert.deepEqual(calls, [['verify', 'synthetic-a-token'], ['readiness']])
})

test('a privileged operation failure returns a generic error', async () => {
  const { dependencies } = harness({ fail: true })
  const response = await handleAccountDeletion(request(), dependencies)
  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'Unable to delete your account. Please try again.' })
})

test('both account screens use the shared native dialog and gate submission on the confirm word', () => {
  const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
  const action = read('app/components/auth/DeleteAccountAction.tsx')
  assert.match(action, /showModal\(\)/)
  assert.match(action, /aria-labelledby=\{title\}/)
  assert.match(action, /aria-describedby=\{description\}/)
  assert.match(action, /type="submit" disabled=\{busy \|\| !isDeletionConfirmed\(confirmation\)\}/)
  assert.match(read('app/components/auth/AccountSessionActions.tsx'), /<DeleteAccountAction \/>/)
  assert.match(read('app/components/ProfilePage.tsx'), /<DeleteAccountAction \/>/)
})

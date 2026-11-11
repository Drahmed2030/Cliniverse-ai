import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
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
      return ({ 'synthetic-a-token': 'synthetic-a', 'synthetic-b-token': 'synthetic-b' })[token] ?? null
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
  for (const confirmation of ['', 'DELET', 'delete', 'DELETE ', 'حذ', 'حذف ']) {
    assert.equal(isDeletionConfirmed(confirmation), false)
    const { dependencies, calls } = harness()
    const response = await handleAccountDeletion(request({ body: { confirmation } }), dependencies)
    assert.equal(response.status, 400)
    assert.deepEqual(calls, [['verify', 'synthetic-a-token']])
  }
  assert.equal(isDeletionConfirmed('DELETE'), true)
})

test('Arabic confirmation deletes only the verified second account', async () => {
  const { dependencies, calls } = harness()
  assert.equal(isDeletionConfirmed('حذف'), true)
  const response = await handleAccountDeletion(request({
    token: 'synthetic-b-token', body: { confirmation: 'حذف' },
  }), dependencies)
  assert.equal(response.status, 204)
  assert.deepEqual(calls, [['verify', 'synthetic-b-token'], ['readiness'], ['delete', 'synthetic-b']])
})

test('an unavailable cleanup constraint blocks hard deletion', async () => {
  const { dependencies, calls } = harness({ ready: false })
  const response = await handleAccountDeletion(request(), dependencies)
  assert.equal(response.status, 503)
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
  assert.match(read('app/components/auth/AccountSessionActions.tsx'), /<DeleteAccountAction locale=\{locale\} \/>/)
  assert.match(read('app/components/ProfilePage.tsx'), /<DeleteAccountAction locale=\{locale\} \/>/)
})

test('dialog renders Arabic RTL and English text with confirmation initially disabled', () => {
  const path = '../app/components/auth/DeleteAccountAction.tsx'
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const exports = {}
  const require = createRequire(import.meta.url)
  const load = name => {
    if (name.endsWith('account-deletion-confirmation.mjs')) return { isDeletionConfirmed }
    if (name.endsWith('account-deletion-notice')) return { ACCOUNT_DELETED_NOTICE: 'synthetic-notice' }
    if (name.endsWith('identity')) return {}
    return require(name)
  }
  vm.runInNewContext(code, { exports, require: load })
  for (const locale of ['en', 'ar']) {
    const html = renderToStaticMarkup(React.createElement(exports.default, { locale }))
    assert.match(html, /<button type="submit" disabled=""/)
    assert.ok(html.includes('lang="' + locale + '"'))
    assert.ok(html.includes('dir="' + (locale === 'ar' ? 'rtl' : 'ltr') + '"'))
    assert.ok(html.includes(locale === 'ar' ? 'اكتب حذف للتأكيد' : 'Type DELETE to confirm'))
    assert.ok(html.includes(locale === 'ar' ? 'إلغاء' : 'Cancel'))
  }
})

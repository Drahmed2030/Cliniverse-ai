import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

const root = new URL('../', import.meta.url).pathname
const read = p => fs.readFileSync(path.join(root, p), 'utf8')

// Real passwordRecovery.ts, transpiled and run against fakes (the Supabase package and config are stubbed).
function loadRecovery(createClientSpy = () => ({})) {
  const code = ts.transpileModule(read('app/lib/passwordRecovery.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  const require = name => {
    if (name === '@supabase/supabase-js') return { createClient: createClientSpy }
    if (name === './supabaseConfig') return { supabaseUrl: 'https://project.example', supabaseAnonKey: 'anon' }
    throw new Error(`unexpected import ${name}`)
  }
  vm.runInNewContext(code, { exports, require, URLSearchParams, Error, Promise })
  return exports
}
const R = loadRecovery()

function fakeClient({ sessionUser = { email: 'jane.doe@clinic.test' }, setSessionError = null, updateError = null, signOutError = null, throwOn = null } = {}) {
  const calls = []
  return {
    calls,
    auth: {
      async setSession(tokens) { calls.push(['setSession', tokens]); if (throwOn === 'setSession') throw new Error('x'); return setSessionError ? { data: null, error: setSessionError } : { data: { user: sessionUser }, error: null } },
      async updateUser(attrs) { calls.push(['updateUser', attrs]); if (throwOn === 'updateUser') throw new Error('x'); return { data: null, error: updateError } },
      async signOut(opts) { calls.push(['signOut', opts]); return { error: signOutError } },
    },
  }
}

const GOOD = '#access_token=AT&refresh_token=RT&expires_in=3600&token_type=bearer&type=recovery'

test('hash parsing: only a genuine recovery link is accepted; every other shape is invalid', () => {
  assert.deepEqual({ ...R.parseRecoveryHash(GOOD) }, { kind: 'ready', accessToken: 'AT', refreshToken: 'RT' })
  assert.equal(R.parseRecoveryHash(GOOD.replace('type=recovery', 'type=signup')).reason, 'not_recovery')
  assert.equal(R.parseRecoveryHash(GOOD.replace('&type=recovery', '')).reason, 'not_recovery')
  assert.equal(R.parseRecoveryHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired').reason, 'expired')
  assert.equal(R.parseRecoveryHash('#error=access_denied&error_code=unexpected').reason, 'error')
  assert.equal(R.parseRecoveryHash('').reason, 'missing')
  assert.equal(R.parseRecoveryHash('#access_token=AT').reason, 'missing')
  // an error always wins, even if tokens are also present
  assert.equal(R.parseRecoveryHash(GOOD + '&error=x').kind, 'invalid')
})

test('password rules: 8+ characters and a matching confirmation', () => {
  assert.equal(R.checkNewPassword('', ''), 'empty')
  assert.equal(R.checkNewPassword('short', 'short'), 'too_short')
  assert.equal(R.checkNewPassword('long-enough', 'different-1'), 'mismatch')
  assert.equal(R.checkNewPassword('long-enough', 'long-enough'), 'ok')
  assert.equal(R.MIN_PASSWORD_LENGTH, 8)
})

test('recovery start: tokens go to the isolated client, the account is shown masked, invalid sessions are refused', async () => {
  const c = fakeClient()
  const started = await R.startRecovery(c.auth ? c : c, { kind: 'ready', accessToken: 'AT', refreshToken: 'RT' })
  assert.deepEqual({ ...started }, { status: 'ready', maskedEmail: 'j••••••@clinic.test' })
  assert.deepEqual(JSON.parse(JSON.stringify(c.calls)), [['setSession', { access_token: 'AT', refresh_token: 'RT' }]])
  assert.equal((await R.startRecovery(fakeClient({ setSessionError: new Error('bad') }), { kind: 'ready', accessToken: 'a', refreshToken: 'b' })).status, 'invalid')
  assert.equal((await R.startRecovery(fakeClient({ throwOn: 'setSession' }), { kind: 'ready', accessToken: 'a', refreshToken: 'b' })).status, 'invalid')
  assert.equal(R.maskEmail('a@x.test'), 'a•@x.test')
  assert.equal(R.maskEmail('not-an-email'), '')
})

test('completion: validates first, then updateUser, then a GLOBAL sign-out, in that order', async () => {
  const c = fakeClient()
  assert.equal((await R.completeRecovery(c, 'short', 'short')).reason, 'too_short')
  assert.equal((await R.completeRecovery(c, 'long-enough', 'nope-nope-1')).reason, 'mismatch')
  assert.deepEqual(c.calls, [], 'invalid input never reaches Supabase')
  const done = await R.completeRecovery(c, 'long-enough', 'long-enough')
  assert.deepEqual({ ...done }, { status: 'done', sessionsEnded: true })
  assert.deepEqual(JSON.parse(JSON.stringify(c.calls)), [['updateUser', { password: 'long-enough' }], ['signOut', { scope: 'global' }]])
})

test('completion never claims success when the password was not changed', async () => {
  const rejected = fakeClient({ updateError: new Error('weak') })
  assert.equal((await R.completeRecovery(rejected, 'long-enough', 'long-enough')).status, 'rejected')
  assert.equal(rejected.calls.some(call => call[0] === 'signOut'), false, 'no sign-out claim after a failed update')
  assert.equal((await R.completeRecovery(fakeClient({ throwOn: 'updateUser' }), 'long-enough', 'long-enough')).status, 'error')
})

test('a failed global sign-out is reported honestly after the password changed', async () => {
  const result = await R.completeRecovery(fakeClient({ signOutError: new Error('net') }), 'long-enough', 'long-enough')
  assert.deepEqual({ ...result }, { status: 'done', sessionsEnded: false })
})

test('isolation: the recovery client is in-memory, never reads the URL, never auto-refreshes, has its own storage key', () => {
  let seen
  const iso = loadRecovery((url, key, options) => { seen = { url, key, options }; return {} })
  iso.createRecoveryClient()
  assert.equal(seen.url, 'https://project.example')
  assert.deepEqual({ ...seen.options.auth }, { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'implicit', storageKey: 'cliniverse-password-recovery' })
})

test('reset request: fixed allow-listed redirect, neutral outcomes, one request per cooldown', () => {
  assert.equal(R.RESET_REDIRECT_URL, 'https://www.cliniverseai.com/reset-password')
  assert.equal(R.classifyResetRequest(null), 'sent')
  assert.equal(R.classifyResetRequest({ status: 429 }), 'rate_limited')
  assert.equal(R.classifyResetRequest({ status: 500 }), 'failed')
  assert.equal(R.classifyResetRequest(new Error('network')), 'failed')
  assert.equal(R.resetRequestAllowed(1000, 2000), false)
  assert.equal(R.resetRequestAllowed(2000, 2000), true)
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /resetPasswordForEmail\(email, \{ redirectTo: RESET_REDIRECT_URL \}\)/)
  assert.doesNotMatch(identity.slice(identity.indexOf('export async function requestPasswordReset')), /window\.location|location\.origin/)
})

test('AuthScreen: "Forgot password?" appears only in password sign-in; the sent message is the same for every address', () => {
  const screen = read('app/components/AuthScreen.tsx')
  assert.match(screen, /\{!isSignUp && !magicLinkMode \? <button onClick=\{\(\) => \{ setResetMode\(true\)/)
  assert.match(screen, /outcome === "rate_limited" \? t\.resetWait : t\.resetFailed/)
  assert.match(screen, /setNotice\(t\.resetSent\)/)
  assert.match(screen, /If an account exists for this email/)
  assert.doesNotMatch(screen, /no account|not found|does not exist/i)
})

// Walk the static import graph from an entry file (relative imports only).
function importGraph(entry) {
  const seen = new Set(); const stack = [entry]
  while (stack.length) {
    const file = stack.pop(); if (seen.has(file)) continue; seen.add(file)
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(/(?:import|export)[^'"]*?from\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)|^import\s+['"](\.[^'"]+)['"]/gm)) {
      const spec = match[1] || match[2] || match[3]
      const base = path.resolve(path.dirname(file), spec)
      const candidate = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].map(ext => base + ext).find(c => fs.existsSync(c) && fs.statSync(c).isFile())
      if (candidate && /\.(ts|tsx)$/.test(candidate)) stack.push(candidate)
    }
  }
  return [...seen].map(file => path.relative(root, file))
}

test('the reset page and the root layout can never create the shared Supabase client (which would consume the recovery tokens)', () => {
  const forbidden = ['app/supabase.ts', 'app/lib/identity.ts', 'app/components/auth/AuthGate.tsx', 'app/lib/profile.ts']
  for (const entry of ['app/reset-password/page.tsx', 'app/layout.tsx']) {
    const graph = importGraph(path.join(root, entry))
    for (const file of forbidden) assert.equal(graph.includes(file), false, `${entry} reaches ${file}`)
  }
  assert.ok(importGraph(path.join(root, 'app/reset-password/page.tsx')).includes('app/lib/passwordRecovery.ts'))
})

test('the reset page removes the tokens from the address bar before any network call, runs once, and never logs them', () => {
  const page = read('app/reset-password/ResetPasswordClient.tsx')
  assert.ok(page.indexOf('window.history.replaceState') < page.indexOf('createRecoveryClient()'))
  assert.ok(page.indexOf('parseRecoveryHash(window.location.hash)') < page.indexOf('window.history.replaceState'))
  assert.match(page, /if \(started\.current\) return/)
  assert.doesNotMatch(page, /console\.|localStorage|sessionStorage|document\.cookie/)
  assert.match(read('app/reset-password/page.tsx'), /robots: \{ index: false, follow: false \}/)
})

test('/reset-password is served without Referer leakage or caching', async () => {
  const config = (await import(path.join(root, 'next.config.js'))).default
  const rules = await config.headers()
  const rule = rules.find(r => r.source === '/reset-password')
  const headers = Object.fromEntries(rule.headers.map(h => [h.key, h.value]))
  assert.equal(headers['Referrer-Policy'], 'no-referrer')
  assert.match(headers['Cache-Control'], /no-store/)
  assert.match(headers['X-Robots-Tag'], /noindex/)
})

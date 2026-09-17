import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const APP_ROOT = fileURLToPath(new URL('../app', import.meta.url))

function walkAppFiles(dir, visit) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) { walkAppFiles(full, visit); continue }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    visit(full, readFileSync(full, 'utf8'))
  }
}

test('sign-in delegates to Supabase Auth and fails closed on any error, never marking a caller authenticated', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export async function signInWithPassword\(email: string, password: string\)/)
  assert.match(identity, /return supabase\.auth\.signInWithPassword\(\{ email, password \}\)/)
  assert.doesNotMatch(identity, /onComplete\(/)

  const screen = read('app/components/AuthScreen.tsx')
  const emailHandler = screen.slice(screen.indexOf('async function handleEmail'), screen.indexOf('return (', screen.indexOf('async function handleEmail')))
  assert.match(emailHandler, /if \(authError \|\| !data\.session \|\| !data\.user\)/)
  assert.match(emailHandler, /onComplete\(\{ method: "email", email: normalizedEmail \}\)/)
  // onComplete (which the gate treats as sign-in success) is called only after the
  // authError/session/user guard above — it does not appear before it in the handler.
  assert.ok(emailHandler.indexOf('if (authError || !data.session || !data.user)') < emailHandler.indexOf('onComplete({ method: "email"'))
})

test('invalid sign-in surfaces a controlled error and does not call onComplete', () => {
  const screen = read('app/components/AuthScreen.tsx')
  const emailHandler = screen.slice(screen.indexOf('async function handleEmail'), screen.indexOf('async function handleEmail') + 1200)
  assert.match(emailHandler, /setError\(authError\?\.message \|\| t\.genericError\)/)
  assert.match(emailHandler, /return;\s*\n\s*\}/)
})

test('requireCurrentUser fails closed on a missing session or a Supabase error', () => {
  const identity = read('app/lib/identity.ts')
  const section = identity.slice(identity.indexOf('export async function requireCurrentUser'))
  assert.match(section, /if \(error\) return \{ user: null, error \}/)
  assert.match(section, /if \(!data\.user\) return \{ user: null, error: new Error\('No authenticated user'\) \}/)
})

test('sign-out delegates to Supabase Auth and the UI surfaces failure without assuming success', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export async function signOut\(\)/)
  assert.match(identity, /return supabase\.auth\.signOut\(\)/)

  const actions = read('app/components/auth/AccountSessionActions.tsx')
  assert.match(actions, /const \{ error: signOutError \} = await signOut\(\)/)
  assert.match(actions, /if \(signOutError\)/)
  assert.match(actions, /Unable to sign out/)
})

test('session restore and refresh are delegated to the Supabase client, not re-implemented or read from a custom localStorage key', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export async function getCurrentSession\(\)[\s\S]{0,40}return supabase\.auth\.getSession\(\)/)
  assert.match(identity, /export function subscribeToAuthState[\s\S]{0,120}return supabase\.auth\.onAuthStateChange\(callback\)/)

  const client = read('app/supabase.ts')
  assert.match(client, /createClient\(supabaseUrl, supabaseAnonKey\)/)
  // No second/third argument disabling the SDK's default session persistence or
  // auto-refresh — Supabase-js defaults both to true, which is the intended
  // browser session-persistence/refresh mechanism. A custom options object here
  // would need explicit review, so guard against one appearing silently.
  assert.doesNotMatch(client, /createClient\(supabaseUrl, supabaseAnonKey,\s*\{/)
})

test('a missing session blocks the protected release shell and renders the sign-in screen, not guest or children', () => {
  const gate = read('app/components/auth/AuthGate.tsx')
  const signedOutBranch = gate.slice(gate.indexOf("state.status === 'signed_in'"))
  assert.match(signedOutBranch, /return <AuthScreen/)
  // The fallthrough after every earlier status check (loading/error/guest/signed_in)
  // is the sign-in screen — there is no path that reaches `children(...)` without
  // `status === 'signed_in'`, which itself requires a real Supabase session.
  assert.equal(gate.indexOf('children(state.user)') < gate.indexOf('return <AuthScreen'), true)
})

test('reviewer preview access is derived from the verified authenticated email, not a client-set flag, and only when explicitly enabled', () => {
  const release = read('app/components/ReleaseApp.tsx')
  assert.match(release, /showEcgReview=\{reviewPreview\s*&&\s*user\.email\?\.toLowerCase\(\)\s*===\s*'reviewer@cliniverseai\.com'\s*&&\s*Boolean\(user\.email_confirmed_at\)\}/)

  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  assert.match(provider, /fetch\('\/api\/reviewer-feature-access',\s*\{\s*cache:\s*'no-store',\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{data\.session\.access_token\}`/)
  assert.match(provider, /No administrator privileges/)
})

test('no PRO/premium/session access anywhere in the app is derived from a localStorage-read flag', () => {
  const offenders = []

  walkAppFiles(APP_ROOT, (full, source) => {
    if (!/localStorage/.test(source)) return
    if (/localStorage[\s\S]{0,80}(isPro|is_pro|premium|entitle)/i.test(source)) offenders.push(full)
    if (/(isPro|is_pro|premium|entitle)[\s\S]{0,80}localStorage/i.test(source)) offenders.push(full)
  })

  assert.deepEqual(offenders, [])
})

test('client-side entitlement authority (app/supabase.ts legacy helpers) stays unreferenced by any live component', () => {
  const legacyFns = ['saveCaseCompletion', 'saveMcqAnswer', 'saveProgress', 'updateXP', 'getUserProfile', 'getUserSubscription']
  const referencedBy = Object.fromEntries(legacyFns.map(fn => [fn, []]))

  walkAppFiles(APP_ROOT, (full, source) => {
    if (full.endsWith('/app/supabase.ts')) return
    for (const fn of legacyFns) {
      if (new RegExp(`\\b${fn}\\(`).test(source)) referencedBy[fn].push(full)
    }
  })

  for (const fn of legacyFns) assert.deepEqual(referencedBy[fn], [], `${fn} should remain unreferenced by any live component`)
})

test('entitlement authority reaching the release shell resolves only from the server-verified subscription record or reviewer check, never a client flag', () => {
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  assert.match(provider, /canAccessPremium:\s*Boolean\(entitlement\?\.isPro\)\s*\|\|\s*reviewerAccess/)
  assert.match(provider, /const nextEntitlement = await getOwnEntitlement\(\)/)
})

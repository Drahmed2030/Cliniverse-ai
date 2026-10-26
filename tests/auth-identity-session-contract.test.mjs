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

function signInSection() {
  const screen = read('app/components/AuthScreen.tsx')
  const handler = screen.slice(screen.indexOf('async function handleEmail'), screen.indexOf('return (', screen.indexOf('async function handleEmail')))
  // Password sign-in is the code after the self-service sign-up branch.
  return handler.slice(handler.indexOf('await signInWithPassword'))
}

test('sign-in delegates to Supabase Auth and fails closed on any error, never marking a caller authenticated', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export async function signInWithPassword\(email: string, password: string\)/)
  assert.match(identity, /return mutate\(\(\) => supabase\.auth\.signInWithPassword\(\{ email, password \}\), noSession\)/)
  // A refused (busy) mutation becomes an ordinary auth error result, never a thrown error and never a started request.
  assert.match(identity, /if \(isAuthMutationBusy\(error\)\) return refused\(error\)/)
  assert.doesNotMatch(identity, /onComplete\(/)

  const signIn = signInSection()
  assert.match(signIn, /if \(authError \|\| !data\.session \|\| !data\.user\)/)
  assert.match(signIn, /onComplete\(\{ method: "email", email: normalizedEmail \}\)/)
  // onComplete is reached only after the error/session/user guard AND the email-verification guard.
  const guard = signIn.indexOf('if (authError || !data.session || !data.user)')
  const verified = signIn.indexOf('!isVerifiedUser(data.user)')
  const complete = signIn.indexOf('onComplete({ method: "email"')
  assert.ok(guard >= 0 && guard < verified && verified < complete)
})

test('invalid sign-in surfaces a controlled error and does not call onComplete', () => {
  const signIn = signInSection()
  assert.match(signIn, /setError\(authError\?\.message \|\| t\.genericError\);\s*return;/)
  assert.match(signIn, /await signOutSession\(data\.user\.id\);\s*setError\(t\.verifyFirst\);\s*return;/)
  assert.match(signIn, /catch \{\s*setError\(t\.genericError\)/)
})

test('self-service sign-up never signs a user in before their email is confirmed', () => {
  const screen = read('app/components/AuthScreen.tsx')
  const handler = screen.slice(screen.indexOf('async function handleEmail'), screen.indexOf('return (', screen.indexOf('async function handleEmail')))
  const signUp = handler.slice(handler.indexOf('if (isSignUp)'), handler.indexOf('await signInWithPassword'))
  assert.match(signUp, /signUpWithPassword\(normalizedEmail, password, redirectTo\)/)
  assert.match(signUp, /if \(authError\) \{\s*setError\(authError\.message \|\| t\.genericError\);\s*return;/)
  // A session returned without a confirmed address is discarded and the user is told to confirm.
  assert.match(signUp, /if \(data\.session && data\.user && isVerifiedUser\(data\.user\)\) \{\s*onComplete/)
  assert.match(signUp, /if \(data\.session && data\.user\) await signOutSession\(data\.user\.id\);\s*setNotice\(t\.signupSent\)/)
  assert.ok(signUp.indexOf('isVerifiedUser') < signUp.indexOf('onComplete('))
  assert.match(screen, /signupSent: "Check your email to confirm your account/)
  // The password minimum applies to sign-up and sign-in alike.
  assert.match(handler, /password\.trim\(\)\.length < 8/)
})

test('the auth gate delegates to the race-safe controller and keeps the verification rule as defense in depth', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export \{ isVerifiedUser \} from '\.\/emailVerification'/)
  const rule = read('app/lib/emailVerification.ts')
  assert.match(rule, /return Boolean\(user\.email_confirmed_at\)/)
  // The comment must not claim the client check proves inbox ownership (it does not if Confirm email is OFF).
  assert.match(rule, /does NOT prove inbox ownership/)
  assert.doesNotMatch(rule, /backstop if/i)

  const gate = read('app/components/auth/AuthGate.tsx')
  assert.match(gate, /createAuthSessionController<User>\(/)
  assert.match(gate, /isVerifiedUser,/)
  assert.match(gate, /return \(\) => controller\.dispose\(\)/)
  // No direct Supabase/profile/signOut call remains in the gate component itself (behaviour: tests/auth-session-controller.test.mjs).
  const body = gate.slice(gate.indexOf('export default function AuthGate'), gate.indexOf("if (state.status === 'loading')"))
  assert.doesNotMatch(body, /await |ensureOwnProfile\(\)|signOut\(\)/)

  const controller = read('app/lib/authSessionController.ts')
  assert.doesNotMatch(controller, /import .*supabase/i)
  const callback = controller.slice(controller.indexOf('deps.subscribe('), controller.indexOf('void restore()'))
  assert.doesNotMatch(callback, /await |deps\.(getSession|ensureProfile|signOut)/)
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
  assert.match(identity, /return mutate\(\(\) => supabase\.auth\.signOut\(\), error => \(\{ error \}\) as never\)/)

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

  // Entitlement-adjacent reviewer access is decided server-side from the verified bearer token.
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  assert.match(provider, /fetch\('\/api\/reviewer-feature-access',\s*\{\s*cache:\s*'no-store',\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{data\.session\.access_token\}`/)
  assert.match(provider, /Access remains denied on failure/)
  const route = read('app/api/reviewer-feature-access/route.ts')
  assert.match(route, /supabase\.auth\.getUser\(token\)/)
  assert.match(route, /VERCEL_ENV !== 'preview' && process\.env\.VERCEL_ENV !== 'production'/)
  assert.match(route, /allowed: false\s*\}, \{ status: 401/)
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

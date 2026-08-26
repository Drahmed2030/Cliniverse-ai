import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('release branch does not contain public Supabase diagnostics endpoint', () => {
  assert.equal(existsSync(new URL('../app/api/debug-supabase/route.ts', import.meta.url)), false)
})

test('Vercel cron URLs do not contain committed secrets', () => {
  const vercel = read('vercel.json')
  assert.equal(vercel.includes('?secret='), false)
  assert.equal(vercel.includes('CRON_SECRET'), false)
})

test('cron routes require Bearer authorization and fail closed', () => {
  for (const path of ['app/api/cron-pulse/route.ts', 'app/api/cron-nexus/route.ts']) {
    const source = read(path)
    assert.match(source, /process\.env\.CRON_SECRET/)
    assert.match(source, /authorization/)
    assert.match(source, /Bearer \$\{expected\}/)
    assert.match(source, /status:\s*401/)
    assert.equal(source.includes("searchParams.get('secret')"), false)
    assert.equal(source.includes('error: String(err)'), false)
  }
})

test('client-side Pro activation stays fail-closed', () => {
  const source = read('app/supabase.ts')
  assert.match(source, /activatePro/)
  assert.match(source, /Client-side PRO activation is disabled/i)
  assert.equal(/\.from\(['"]profiles['"]\)[\s\S]{0,300}is_pro:\s*true/.test(source), false)
})

test('release auth gate keeps guest access closed', () => {
  const source = read('app/components/ReleaseApp.tsx')
  assert.match(source, /AuthGate/)
  assert.match(source, /allowGuest=\{false\}/)
})

test('auth gate bootstraps the authenticated profile before entering the release shell', () => {
  const source = read('app/components/auth/AuthGate.tsx')
  assert.match(source, /getCurrentSession/)
  assert.match(source, /subscribeToAuthState/)
  assert.match(source, /ensureOwnProfile/)
  assert.match(source, /status:\s*'signed_in'/)
})

test('profile reads, bootstrap and updates derive ownership from the authenticated user', () => {
  const source = read('app/lib/profile.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /\.eq\('id',\s*user\.id\)/)
  assert.match(source, /id:\s*user\.id/)
  assert.equal(/getOwnProfile\s*\([^)]*userId/.test(source), false)
  assert.equal(/ensureOwnProfile\s*\([^)]*userId/.test(source), false)
  assert.equal(/updateOwnProfile\s*\([^)]*userId/.test(source), false)
})

test('profile bootstrap matches the verified schema and neutralizes misleading legacy defaults', () => {
  const source = read('app/lib/profile.ts')
  const defaults = source.slice(source.indexOf('function profileDefaults'), source.indexOf('export async function getOwnProfile'))
  assert.match(defaults, /id:\s*user\.id/)
  assert.match(defaults, /name:\s*String\(fallbackName\)/)
  assert.match(defaults, /specialty:\s*null/)
  assert.match(defaults, /country:\s*null/)
  assert.match(defaults, /level:\s*null/)
  assert.match(defaults, /rank:\s*'Clinical Learner'/)
  for (const field of ['email', 'streak', 'mcq_correct', 'mcq_total', 'updated_at', 'is_pro', 'subscription_status']) {
    assert.equal(new RegExp(`${field}\\s*:`).test(defaults), false)
  }
})

test('first-login profile bootstrap is idempotent under overlapping auth events', () => {
  const source = read('app/lib/profile.ts')
  const ensureSection = source.slice(source.indexOf('export async function ensureOwnProfile'), source.indexOf('export async function updateOwnProfile'))
  assert.match(ensureSection, /created\.error\.code\s*===\s*'23505'/)
  assert.match(ensureSection, /\.eq\('id',\s*user\.id\)\.maybeSingle\(\)/)
})

test('profile update uses only verified editable columns', () => {
  const source = read('app/lib/profile.ts')
  const updateSection = source.slice(source.indexOf('export async function updateOwnProfile'))
  assert.match(updateSection, /name\.trim\(\)/)
  assert.match(updateSection, /specialty\.trim\(\)/)
  assert.match(updateSection, /country\.trim\(\)/)
  for (const field of ['updated_at', 'is_pro', 'subscription_status', 'rank', 'xp', 'cases_completed']) {
    assert.equal(new RegExp(`${field}\\s*:`).test(updateSection), false)
  }
})

test('account email is sourced from Supabase Auth, not the profiles row', () => {
  const source = read('app/components/release/MeAccountSummary.tsx')
  assert.match(source, /getCurrentUser/)
  assert.match(source, /userResult\.data\.user\?\.email/)
  assert.equal(/profileResult\.data\.email/.test(source), false)
})

test('release entitlement authority is the authenticated user subscription record only', () => {
  const source = read('app/lib/entitlements.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /\.from\('subscriptions'\)/)
  assert.match(source, /\.eq\('user_id',\s*user\.id\)/)
  assert.match(source, /source:\s*'subscription-record'/)
  assert.equal(/rpc\(['"]is_user_pro['"]/.test(source), false)
  assert.equal(/getOwnEntitlement\s*\([^)]*userId/.test(source), false)
})

test('release progress writes derive user_id from the authenticated session', () => {
  const source = read('app/lib/progress.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /user_id:\s*user\.id/)
  assert.match(source, /\.eq\('user_id',\s*user\.id\)/)
  assert.equal(/saveOwnCaseCompletion\s*\([^)]*userId/.test(source), false)
  assert.equal(/saveOwnMcqAnswer\s*\([^)]*userId/.test(source), false)
})

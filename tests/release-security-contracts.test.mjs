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

test('profile edits cannot write entitlement authority fields', () => {
  const source = read('app/lib/profile.ts')
  const updateSection = source.slice(source.indexOf('export async function updateOwnProfile'))
  assert.equal(/is_pro\s*:/.test(updateSection), false)
  assert.equal(/subscription_status\s*:/.test(updateSection), false)
})

test('entitlement reads derive identity from the authenticated user', () => {
  const source = read('app/lib/entitlements.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /uid:\s*user\.id/)
  assert.match(source, /\.eq\('user_id',\s*user\.id\)/)
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

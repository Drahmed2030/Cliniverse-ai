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

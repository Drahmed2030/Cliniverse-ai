import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('release branch does not contain public Supabase diagnostics endpoint', () => {
  assert.equal(existsSync(new URL('../app/api/debug-supabase/route.ts', import.meta.url)), false)
})

test('Supabase public client configuration is not accidentally truncated', () => {
  const source = read('app/supabase.ts')
  const match = source.match(/const supabaseAnonKey = '([^']+)'/)
  assert.ok(match)
  assert.equal(match[1].includes('...'), false)
  assert.equal(match[1].split('.').length, 3)
})

test('Vercel cron URLs do not contain committed secrets', () => {
  const vercel = read('vercel.json')
  assert.equal(vercel.includes('?secret='), false)
  assert.equal(vercel.includes('CRON_SECRET'), false)
})

test('cron routes require Bearer authorization and fail closed', () => {
  for (const path of [
    'app/api/cron-case/route.ts',
    'app/api/cron-nexus/route.ts',
    'app/api/cron-pubmed/route.ts',
    'app/api/cron-pulse/route.ts',
    'app/api/knowledge-graph/seed/route.ts',
  ]) {
    const source = read(path)
    assert.match(source, /process\.env\.CRON_SECRET/)
    assert.match(source, /authorization/)
    assert.match(source, /Bearer \$\{expected\}/)
    assert.match(source, /status:\s*401/)
    assert.equal(source.includes("searchParams.get('secret')"), false)
    assert.equal(source.includes('error: String(err)'), false)
    assert.equal(source.includes('error: e.message'), false)
  }
})

test('Apple v1 blocks deferred server APIs before route execution', () => {
  const source = read('proxy.ts')
  assert.match(source, /export function proxy/)
  assert.match(source, /matcher:\s*'\/api\/:path\*'/)
  assert.match(source, /status:\s*404/)
  assert.match(source, /X-Cliniverse-Release-Gate/)
  for (const path of [
    '/api/analyze-doc',
    '/api/cache',
    '/api/generate-case',
    '/api/ingest',
    '/api/intelligence',
    '/api/knowledge-graph',
    '/api/medical-ai',
    '/api/mood',
    '/api/storage',
    '/api/tts',
  ]) {
    assert.equal(source.includes(`'${path}'`), true)
  }
  for (const allowed of [
    '/api/release-contract',
    '/api/ward/case-evidence',
    '/api/cron-pulse',
    '/api/cron-nexus',
  ]) {
    assert.equal(source.includes(`'${allowed}'`), false)
  }
})

test('Care evidence accepts only fixed fictional simulation templates', () => {
  const route = read('app/api/ward/case-evidence/route.ts')
  assert.match(route, /const term = EVIDENCE_MAP\[templateId\]/)
  assert.match(route, /Never[\s\S]{0,120}arbitrary user-entered or patient-derived text/)
  assert.doesNotMatch(route, /searchParams\.get\(["']diagnosis["']\)/)
  assert.doesNotMatch(route, /\$\{diagnosis\} management guidelines/)
  assert.match(route, /status:\s*404/)
})

test('legacy client Pro helpers stay fail-closed', () => {
  const source = read('app/supabase.ts')
  assert.match(source, /activatePro/)
  assert.match(source, /Client-side PRO activation is disabled/i)
  assert.match(source, /checkIsPro\(_userId: string\): Promise<boolean>[\s\S]{0,120}return false/)
  assert.equal(/rpc\(['"]is_user_pro['"]/.test(source), false)
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

test('release entitlement rejects unsupported or expired subscription records', () => {
  const source = read('app/lib/entitlements.ts')
  assert.match(source, /allowedPlans/)
  assert.match(source, /pro_monthly/)
  assert.match(source, /pro_yearly/)
  assert.match(source, /institution/)
  assert.match(source, /Date\.parse\(expiresAt\)/)
  assert.match(source, /expiryTime\s*<=\s*Date\.now\(\)/)
})

test('prepared RC1 RLS migration closes client profile and subscription authority', () => {
  const path = 'supabase/migrations/20260827044500_apple_rc1_runtime_trust.sql'
  assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true)
  const migration = read(path)

  assert.match(migration, /PRODUCTION HOLD/)
  assert.match(migration, /alter table public\.profiles enable row level security/i)
  assert.match(migration, /alter table public\.subscriptions enable row level security/i)
  assert.match(migration, /revoke all privileges on table public\.profiles from anon, authenticated/i)
  assert.match(migration, /revoke all privileges on table public\.subscriptions from anon, authenticated/i)
  assert.match(migration, /create policy "profiles_select_own"[\s\S]*to authenticated[\s\S]*auth\.uid\(\)/i)
  assert.match(migration, /create policy "subscriptions_select_own"[\s\S]*to authenticated[\s\S]*auth\.uid\(\)/i)
  assert.equal(/create policy[\s\S]{0,120}subscriptions[\s\S]{0,180}for insert/i.test(migration), false)
  assert.match(migration, /revoke execute on function public\.is_user_pro\(uuid\) from PUBLIC, anon, authenticated/i)
  assert.match(migration, /revoke execute on function public\.handle_new_user\(\) from PUBLIC, anon, authenticated/i)
  assert.match(migration, /revoke execute on function public\.match_clinical_cases\(vector, real, integer\)[\s\S]*from PUBLIC, anon, authenticated/i)
})

test('RC1 RLS migration deny-lists deferred exposed tables and has a safe rollback', () => {
  const migration = read('supabase/migrations/20260827044500_apple_rc1_runtime_trust.sql')
  for (const table of ['cases', 'user_progress', 'leaderboard']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
    assert.match(migration, new RegExp(`revoke all privileges on table public\\.${table} from anon, authenticated`, 'i'))
  }

  const rollbackPath = 'supabase/rollback/20260827044500_apple_rc1_safe_hold.sql'
  assert.equal(existsSync(new URL(`../${rollbackPath}`, import.meta.url)), true)
  const rollback = read(rollbackPath)
  assert.match(rollback, /deny-all safe state/i)
  assert.match(rollback, /Table-level REVOKE does not remove column-level grants/i)
  assert.equal(rollback.includes('Public read'), false)
  assert.equal(rollback.includes('Public update'), false)
  assert.equal(rollback.includes('Service role can insert subscriptions'), false)

  const safeHoldAssertionsPath = 'supabase/tests/20260827044500_apple_rc1_safe_hold_assertions.sql'
  assert.equal(existsSync(new URL(`../${safeHoldAssertionsPath}`, import.meta.url)), true)
  const safeHoldAssertions = read(safeHoldAssertionsPath)
  assert.match(safeHoldAssertions, /Safe-hold retained client authority/)
  assert.match(safeHoldAssertions, /handle_new_user/)
  assert.match(safeHoldAssertions, /match_clinical_cases/)

  const assertionsPath = 'supabase/tests/20260827044500_apple_rc1_catalog_assertions.sql'
  assert.equal(existsSync(new URL(`../${assertionsPath}`, import.meta.url)), true)
  const assertions = read(assertionsPath)
  assert.match(assertions, /has_table_privilege\('authenticated', 'public\.subscriptions', 'INSERT'\)/)
  assert.match(assertions, /has_function_privilege\('authenticated', 'public\.is_user_pro\(uuid\)', 'EXECUTE'\)/)

  const twoUserPath = 'supabase/tests/20260827044500_apple_rc1_two_user_rls.sql'
  assert.equal(existsSync(new URL(`../${twoUserPath}`, import.meta.url)), true)
  const twoUser = read(twoUserPath)
  assert.match(twoUser, /set local role authenticated/i)
  assert.match(twoUser, /set local role anon/i)
  assert.match(twoUser, /set local role service_role/i)
  assert.match(twoUser, /request\.jwt\.claims/i)
  assert.match(twoUser, /rollback;/i)
  assert.match(twoUser, /User A inserted a subscription/)
  assert.match(twoUser, /User B read User A case completion/)
})

test('release progress writes derive user_id from the authenticated session', () => {
  const source = read('app/lib/progress.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /user_id:\s*user\.id/)
  assert.match(source, /\.eq\('user_id',\s*user\.id\)/)
  assert.equal(/saveOwnCaseCompletion\s*\([^)]*userId/.test(source), false)
  assert.equal(/saveOwnMcqAnswer\s*\([^)]*userId/.test(source), false)
})

test('public release metadata avoids unverified seniority, volume and social-proof claims', () => {
  const layout = read('app/layout.tsx')
  const manifest = read('public/manifest.json')
  for (const banned of ['Train Like a Consultant', 'Train like a consultant', '1,000+ physicians', '25+ cases', 'Surgical AI']) {
    assert.equal(layout.includes(banned), false)
    assert.equal(manifest.includes(banned), false)
  }
  assert.match(layout, /Clinical Learning & Workflow/)
  assert.match(manifest, /Clinical learning, simulation and workflow tools/)
})

test('release manifest does not advertise legacy navigation shortcuts', () => {
  const manifest = JSON.parse(read('public/manifest.json'))
  assert.equal(Array.isArray(manifest.shortcuts), false)
  assert.equal(manifest.start_url, '/')
})

test('sign-in surface has functional Terms and Privacy routes', () => {
  const source = read('app/components/AuthScreen.tsx')
  assert.equal(existsSync(new URL('../app/terms/page.tsx', import.meta.url)), true)
  assert.equal(existsSync(new URL('../app/privacy/page.tsx', import.meta.url)), true)
  assert.match(source, /href="\/terms"/)
  assert.match(source, /href="\/privacy"/)
  assert.equal(source.includes('onOpenTerms'), false)
  assert.equal(source.includes('onOpenPrivacy'), false)
})

test('privacy notice does not make unverified encryption, retention or universal-case claims', () => {
  const privacy = read('app/privacy/page.tsx')
  for (const claim of ['TLS 1.3', 'AES-256', 'never stored', 'entirely fictional and AI-generated']) {
    assert.equal(privacy.includes(claim), false)
  }
  assert.match(privacy, /do not submit real patient/i)
  assert.match(privacy, /\/support/)
})

test('legacy privacy URLs converge on the canonical release notice', () => {
  const config = read('next.config.js')
  assert.match(config, /source:\s*['"]\/privacy\.html['"][\s\S]*?destination:\s*['"]\/privacy['"]/)
  assert.match(config, /source:\s*['"]\/privacy-policy\.html['"][\s\S]*?destination:\s*['"]\/privacy['"]/)

  for (const path of ['public/privacy.html', 'public/privacy-policy.html']) {
    const legacy = read(path)
    assert.match(legacy, /https:\/\/www\.cliniverseai\.com\/privacy/)
    assert.match(legacy, /url=\/privacy/)
    for (const staleClaim of ['Ambient AI Scribe', 'Lemon Squeezy', 'Anthropic Claude', 'FHIR Integration']) {
      assert.equal(legacy.includes(staleClaim), false)
    }
  }
})

test('integration iOS workflow cannot automatically publish to Apple', () => {
  const codemagic = read('codemagic.yaml')
  assert.match(codemagic, /submit_to_testflight:\s*false/)
  assert.match(codemagic, /submit_to_app_store:\s*false/)
  assert.equal(/submit_to_app_store:\s*true/.test(codemagic), false)
})

test('native iOS release gate is documented before RC1', () => {
  assert.equal(existsSync(new URL('../docs/NATIVE_IOS_BUILD_GATE_V1.md', import.meta.url)), true)
  const gate = read('docs/NATIVE_IOS_BUILD_GATE_V1.md')
  assert.match(gate, /rm -rf ios/)
  assert.match(gate, /AppIcon/)
  assert.match(gate, /cold launch/i)
  assert.match(gate, /HOLD \/ NO APP STORE SUBMISSION/)
})

test('magic-link sign-in stays disabled by default and cannot implicitly create accounts', () => {
  const identity = read('app/lib/identity.ts')
  const auth = read('app/components/AuthScreen.tsx')
  assert.match(identity, /shouldCreateUser:\s*false/)
  assert.match(auth, /enableMagicLink\s*=\s*false/)
  assert.match(auth, /\{enableMagicLink\s*\?\s*<button/)
  assert.match(auth, /Account creation is not enabled in this release/)
})

test('third-party AI is gated out of the release shell until consent and claims review pass', () => {
  const release = read('app/components/ReleaseApp.tsx')
  assert.equal(release.includes("import('./oracle/OracleScreen')"), false)
  assert.match(release, /Clinical Intelligence is not enabled in this release build/)
  assert.match(release, /third-party AI providers/)
  assert.match(release, /Do not enter patient-identifiable information/)
})

test('active Care surfaces preserve the dark release identity', () => {
  for (const path of [
    'app/components/ward/index.tsx',
    'app/components/ward/WardHome.tsx',
    'app/components/ward/PatientJourney.tsx',
    'app/components/ward/RelatedEvidencePanel.tsx',
    'app/components/ward/ClinicalPanelV2.tsx',
  ]) {
    const source = read(path)
    assert.equal(/bg:\s*["']#F8FAFC["']/.test(source), false)
    assert.equal(/background:\s*["']#F8FAFC["']/.test(source), false)
    assert.equal(/white:\s*["']#FFFFFF["']/.test(source), false)
    assert.equal(/border:\s*["']#E2E8F0["']/.test(source), false)
  }

  const home = read('app/components/ward/WardHome.tsx')
  assert.match(home, /Care Workflow Simulation/)
  assert.match(home, /No real patient data/)
  assert.match(home, /#080C16/)
})

test('Oracle API fails closed by default in the Apple release lane', () => {
  const route = read('app/api/oracle/route.ts')
  assert.match(route, /RELEASE_ENABLE_ORACLE/)
  assert.match(route, /RELEASE_ORACLE_ENABLED/)
  assert.match(route, /status:\s*503/)
  assert.match(route, /disabled in this release pending AI consent and clinical-safety review/)
  assert.equal(route.includes('error: (r.reason as Error)?.message'), false)
})

test('deferred knowledge matching API fails closed by default', () => {
  const route = read('app/api/knowledge-graph/match/route.ts')
  assert.match(route, /RELEASE_ENABLE_KNOWLEDGE_MATCH/)
  assert.match(route, /RELEASE_KNOWLEDGE_MATCH_ENABLED/)
  assert.match(route, /status:\s*503/)
  assert.match(route, /disabled in this release pending AI consent and security review/)
})

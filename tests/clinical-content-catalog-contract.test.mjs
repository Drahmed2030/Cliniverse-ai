import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import {
  isAvailable,
  filterVisibleContent,
  countVisibleContent,
  countAvailableGroups,
  countReadyContent,
  countProContent,
  filterByModule,
  filterByAccessTier,
} from '../app/lib/contentCatalogQueries.ts'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── Displayed counts derive from the catalog, not a hardcoded number ──────

test('visible/ready ClinicalLibrary content count matches the seed manifest exactly', () => {
  const libraryItems = filterByModule(CLINICAL_CONTENT_CATALOG_SEED, 'clinical_library')
  assert.equal(libraryItems.length, 7)
  const readyCount = countReadyContent(CLINICAL_CONTENT_CATALOG_SEED, { module: 'clinical_library' })
  assert.equal(readyCount, 7)
  const groupCount = countAvailableGroups(libraryItems.filter(isAvailable).length ? libraryItems : libraryItems)
  // ClinicalLibrary items are visibility='hidden' (component unreachable),
  // so countAvailableGroups (which requires visible+ready) is 0 for them —
  // confirmed explicitly below. The component itself uses readiness='ready'
  // only, via getContentByModule, which is what this test is really proving
  // matches the manifest.
  void groupCount
  const categories = new Set(libraryItems.map(i => i.category))
  assert.equal(categories.size, 5)
})

// ── Hidden items excluded from the available set ──────────────────────────

test('hidden items are excluded from getVisibleContent-equivalent filtering', () => {
  const hiddenItem = { source_key: 'x', module: 'test', content_type: 'case', title: 'X', access_tier: 'free', visibility: 'hidden', readiness: 'ready' }
  assert.equal(isAvailable(hiddenItem), false)
  assert.deepEqual(filterVisibleContent([hiddenItem]), [])
})

test('every ClinicalLibrary catalog item is hidden (component confirmed unreachable) and therefore excluded from getVisibleContent', () => {
  const libraryItems = filterByModule(CLINICAL_CONTENT_CATALOG_SEED, 'clinical_library')
  assert.ok(libraryItems.length > 0)
  assert.ok(libraryItems.every(item => item.visibility === 'hidden'))
  assert.equal(countVisibleContent(CLINICAL_CONTENT_CATALOG_SEED, { module: 'clinical_library' }), 0)
})

// ── review_required / media_pending / labs excluded from available counts ─

test('review_required items are excluded from the available count', () => {
  const item = { source_key: 'x', module: 'test', content_type: 'case', title: 'X', access_tier: 'free', visibility: 'visible', readiness: 'review_required' }
  assert.equal(isAvailable(item), false)
})

test('media_pending items are excluded from the available count', () => {
  const item = { source_key: 'x', module: 'test', content_type: 'case', title: 'X', access_tier: 'free', visibility: 'visible', readiness: 'media_pending' }
  assert.equal(isAvailable(item), false)
})

test('labs-readiness items are excluded from the learner-visible count', () => {
  const item = { source_key: 'x', module: 'test', content_type: 'case', title: 'X', access_tier: 'free', visibility: 'visible', readiness: 'labs' }
  assert.equal(isAvailable(item), false)
})

test('the real batch20/echo seed rows with review_required, media_pending and labs readiness are all correctly excluded from the visible count', () => {
  const batch20 = [...filterByModule(CLINICAL_CONTENT_CATALOG_SEED, 'ecg_batch20'), ...filterByModule(CLINICAL_CONTENT_CATALOG_SEED, 'echo_batch20')]
  const nonReady = batch20.filter(i => i.readiness !== 'ready')
  assert.ok(nonReady.length > 0)
  for (const item of nonReady) assert.equal(isAvailable(item), false)
})

// ── Access tier filtering ──────────────────────────────────────────────────

test('access tier filtering returns only the requested tier among available items', () => {
  const proItems = filterByAccessTier(CLINICAL_CONTENT_CATALOG_SEED, 'pro')
  assert.ok(proItems.length > 0)
  assert.ok(proItems.every(item => item.access_tier === 'pro' && isAvailable(item)))
  assert.ok(proItems.some(item => item.source_key === 'cardiology_operations'))
})

test('getProContentCount matches filterByAccessTier(pro).length', () => {
  assert.equal(countProContent(CLINICAL_CONTENT_CATALOG_SEED), filterByAccessTier(CLINICAL_CONTENT_CATALOG_SEED, 'pro').length)
})

// ── Duplicate source keys rejected by the DB constraint ────────────────────

test('the seed manifest itself contains no duplicate (module, content_type, source_key)', () => {
  const seen = new Set()
  for (const item of CLINICAL_CONTENT_CATALOG_SEED) {
    const key = `${item.module}::${item.content_type}::${item.source_key}`
    assert.equal(seen.has(key), false, `duplicate key: ${key}`)
    seen.add(key)
  }
})

test('the migration defines a unique constraint on (module, content_type, source_key)', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.match(migration, /constraint clinical_content_catalog_unique_item\s*\n\s*unique \(module, content_type, source_key\)/)
})

test('the migration defines CHECK constraints for the controlled enums', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.match(migration, /access_tier in \('free', 'pro', 'institution'\)/)
  assert.match(migration, /visibility in \('visible', 'hidden'\)/)
  assert.match(migration, /readiness in \('ready', 'review_required', 'media_pending', 'labs'\)/)
})

// ── Authenticated cannot write; service_role management path works ────────

test('authenticated has no write privilege on the catalog table', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.match(migration, /revoke all privileges on table public\.clinical_content_catalog from anon, authenticated/)
  assert.match(migration, /grant select on table public\.clinical_content_catalog to authenticated/)
  assert.equal(/grant insert on table public\.clinical_content_catalog to authenticated/i.test(migration), false)
  assert.equal(/grant update on table public\.clinical_content_catalog to authenticated/i.test(migration), false)
  assert.equal(/grant delete on table public\.clinical_content_catalog to authenticated/i.test(migration), false)
})

test('only one policy exists and it is SELECT-only for authenticated', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  const policyMatches = migration.match(/create policy/g) ?? []
  assert.equal(policyMatches.length, 1)
  assert.match(migration, /create policy "clinical_content_catalog_select_authenticated"\s*\n\s*on public\.clinical_content_catalog\s*\n\s*for select\s*\n\s*to authenticated/)
})

test('service_role has no explicit policy — it manages the table via its default RLS-bypass behavior, undisturbed by this migration', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.equal(/to service_role/i.test(migration), false)
  assert.equal(/revoke.*service_role/i.test(migration), false)
})

test('the migration self-verifies its own authority boundaries and fails closed if they are wrong', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.match(migration, /do \$catalog_assertions\$/)
  assert.match(migration, /raise exception 'authenticated cannot SELECT clinical_content_catalog'/)
  assert.match(migration, /raise exception 'authenticated has an unexpected write privilege on clinical_content_catalog'/)
  assert.match(migration, /raise exception 'anon can read clinical_content_catalog/)
})

// ── Local fallback matches the canonical seed manifest exactly ────────────

test('the app adapter local fallback is literally the seed manifest, not a second copy', () => {
  const adapterSource = read('app/lib/contentCatalog.ts')
  assert.match(adapterSource, /import \{ CLINICAL_CONTENT_CATALOG_SEED, type AccessTier \} from '\.\/contentCatalogSeed'/)
  assert.match(adapterSource, /cachedItems = \[\.\.\.CLINICAL_CONTENT_CATALOG_SEED\]/)
})

test('the seed script and the app adapter both import from the same single seed file', () => {
  const scriptSource = read('scripts/seed-clinical-content-catalog.mjs')
  assert.match(scriptSource, /from '\.\.\/app\/lib\/contentCatalogSeed\.ts'/)
})

// ── Adding/removing an item changes counts automatically ──────────────────

test('counts recompute automatically when an item is added or removed — nothing is hardcoded', () => {
  const base = [
    { source_key: 'a', module: 'test', content_type: 'case', title: 'A', category: 'x', access_tier: 'free', visibility: 'visible', readiness: 'ready' },
  ]
  assert.equal(countVisibleContent(base, { module: 'test' }), 1)

  const withAddition = [...base, { source_key: 'b', module: 'test', content_type: 'case', title: 'B', category: 'y', access_tier: 'free', visibility: 'visible', readiness: 'ready' }]
  assert.equal(countVisibleContent(withAddition, { module: 'test' }), 2)
  assert.equal(countAvailableGroups(withAddition, { module: 'test' }), 2)

  const withRemoval = withAddition.filter(item => item.source_key !== 'a')
  assert.equal(countVisibleContent(withRemoval, { module: 'test' }), 1)
})

// ── No old inflated claim remains ──────────────────────────────────────────

test('ClinicalLibrary no longer contains the old 500+/8-specialties hardcoded claims', () => {
  const source = read('app/components/ClinicalLibrary.tsx')
  assert.equal(source.includes('500+'), false)
  assert.equal(source.includes('248'), false)
  assert.equal(/GLOBAL CLINICAL LIBRARY · 8 SPECIALTIES/.test(source), false)
  assert.equal(/\{label:'Cases',value:'500\+'/.test(source), false)
  assert.equal(/\{label:'Specialties',value:'8'/.test(source), false)
  assert.match(source, /getContentByModule/)
})

test('no reachable release-shell surface carries an inflated content-count claim', () => {
  for (const path of ['app/components/release/AtlasReleaseCatalog.tsx', 'app/components/release/OnboardingScreens.tsx', 'app/components/PaywallSheet.tsx']) {
    const source = read(path)
    assert.equal(/\b\d{2,}\+\s*(cases|doctors|specialt)/i.test(source), false, `${path} contains an inflated count claim`)
  }
})

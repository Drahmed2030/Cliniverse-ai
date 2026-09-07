import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Nexus is one internal Epic with four explicitly bounded modules', () => {
  const manifest = JSON.parse(read('app/lib/nexus-capability-manifest.json'))

  assert.equal(manifest.productEpic, 'Nexus')
  assert.equal(manifest.releaseState, 'release_candidate')
  assert.equal(manifest.releaseBoundary.dataMode, 'fictional_simulation_only')
  assert.equal(manifest.releaseBoundary.realPatientData, 'prohibited')
  assert.equal(manifest.releaseBoundary.clinicalDecisionSupport, 'prohibited')
  assert.equal(manifest.releaseBoundary.releaseCandidateEnabled, true)
  assert.equal(manifest.releaseBoundary.productionEnabled, false)

  assert.deepEqual(
    manifest.modules.map(capabilityModule => capabilityModule.id),
    ['case-huddle', 'nursing-lens', 'medication-safety', 'safety-review'],
  )

  for (const capabilityModule of manifest.modules) {
    assert.equal(capabilityModule.releaseState, 'release_candidate')
    assert.ok(capabilityModule.value.length > 20)
    assert.ok(capabilityModule.allowed.length >= 4)
    assert.ok(capabilityModule.prohibited.length >= 4)
  }
})

test('Nexus operating model preserves clinical, privacy and claims gates', () => {
  const path = 'docs/NEXUS_CAPABILITY_OPERATING_MODEL_V1.md'
  assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true)
  const document = read(path)

  for (const phrase of [
    'Case Huddle',
    'Nursing Lens',
    'Medication Safety',
    'Safety Review',
    'Clinical Safety Evaluation Suite v0.1',
    'Evidence Retrieval Index',
    'No real patient or institutional data',
    'No production database mutation in this phase',
  ]) {
    assert.match(document, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('deferred capability SQL draft is fail-closed and production-held', () => {
  const migrationPath = 'supabase/drafts/deferred_capabilities_safe_hold.sql'
  const rollbackPath = 'supabase/rollback/deferred_capabilities_safe_hold.sql'
  const assertionsPath = 'supabase/tests/deferred_capabilities_safe_hold_assertions.sql'

  for (const path of [migrationPath, rollbackPath, assertionsPath]) {
    assert.equal(existsSync(new URL(`../${path}`, import.meta.url)), true)
  }

  const migration = read(migrationPath)
  assert.match(migration, /PRODUCTION HOLD/)
  assert.match(migration, /not a committed Supabase migration/i)
  assert.match(migration, /revoke all privileges on table public\.%I from PUBLIC, anon, authenticated/i)
  assert.match(migration, /grant select, insert, update, delete on table public\.%I to service_role/i)
  assert.match(migration, /drop policy if exists %I on public\.%I/i)
  assert.match(migration, /match_clinical_cases/)

  for (const table of [
    'case_cache',
    'clinical_case_embeddings',
    'clinical_documents',
    'daily_cases',
    'evaluation_cases',
    'evaluation_runs',
    'generated_cases',
    'kg_edges',
    'kg_nodes',
    'mood_logs',
    'nexus_cases',
    'nexus_messages',
    'nexus_votes',
  ]) {
    assert.match(migration, new RegExp(`'${table}'`))
  }

  const rollback = read(rollbackPath)
  assert.match(rollback, /deny-all for clients/i)
  assert.equal(rollback.includes('public read documents'), false)
  assert.equal(rollback.includes('mood_logs_select'), false)

  const assertions = read(assertionsPath)
  assert.match(assertions, /retained client authority/)
  assert.match(assertions, /retained a policy/)
  assert.match(assertions, /service_role/)
})

test('legacy Nexus and advanced intelligence remain outside the Apple release shell', () => {
  const release = read('app/components/ReleaseApp.tsx')
  for (const legacySurface of [
    'ClinicalNexus',
    'NursingModule',
    'PharmacyModule',
    'ErrorAutopsy',
    'DocAnalyzer',
    'SymptomChecker',
    'MentalWellness',
  ]) {
    assert.equal(release.includes(legacySurface), false)
  }

  const proxy = read('proxy.ts')
  for (const deferredApi of [
    '/api/analyze-doc',
    '/api/knowledge-graph',
    '/api/medical-ai',
    '/api/mood',
    '/api/oracle',
    '/api/symptom-check',
  ]) {
    assert.match(proxy, new RegExp(deferredApi.replaceAll('/', '\\/')))
  }
})

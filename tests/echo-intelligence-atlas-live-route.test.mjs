import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

// Live-route contract for Batch 6's Echo Intelligence Atlas closeout: proves
// the Atlas is actually reachable from the current release surface, does not
// leak governed non-ready DCM/HCM content, does not introduce a second Echo
// player/navigation path, and that the spec doc referenced throughout Batch 6
// code now exists.

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Echo Intelligence Atlas panel is wired into the existing, already-gated Echo Preview page — no new route', () => {
  const preview = read('app/components/clinical-media/ClinicalMediaPreview.tsx')
  assert.match(preview, /import EchoIntelligenceAtlasPanel from '\.\/EchoIntelligenceAtlasPanel'/)
  const gatedBlock = preview.match(/capabilities\.assessment&&!dcmReview&&program==='echo-a4c-normal'\?<>[\s\S]*?<\/>:null}/)
  assert.ok(gatedBlock, 'expected the pre-existing learner-ready assessment gate to still exist')
  assert.match(gatedBlock[0], /<EchoA4cLesson[\s\S]*<EchoStudySummaryPanel[\s\S]*<EchoIntelligenceAtlasPanel\s*\/>/,
    'EchoIntelligenceAtlasPanel must render inside the SAME gate as the existing lesson/summary panel, not a separately-gated surface')
})

test('Echo Preview remains reachable from exactly one Explore/Atlas entry point — no second Echo navigation system was created', () => {
  const atlas = read('app/components/release/AtlasReleaseCatalog.tsx')
  const echoPreviewLinks = atlas.match(/href="\/labs\/echo-preview"/g) ?? []
  assert.equal(echoPreviewLinks.length, 1)
  assert.match(atlas, /Echo Preview/)
  // No competing labs route for the Atlas was introduced
  assert.equal(/href="\/labs\/echo-(intelligence|atlas)/.test(atlas), false)
})

test('no /labs/echo-intelligence-atlas or similar duplicate route directory exists', () => {
  assert.equal(existsSync(new URL('../app/labs/echo-intelligence-atlas', import.meta.url)), false)
  assert.equal(existsSync(new URL('../app/labs/echo-atlas', import.meta.url)), false)
})

test('the Atlas panel is additive quiz/text UI only — not a second Remotion Player instance', () => {
  const panel = read('app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx')
  assert.equal(/@remotion\/player/.test(panel), false)
  assert.equal(/<Player[\s>]/.test(panel), false)
  const preview = read('app/components/clinical-media/ClinicalMediaPreview.tsx')
  const playerInstances = preview.match(/<Player\s/g) ?? []
  assert.equal(playerInstances.length, 1, 'exactly one Player instance should exist on the Echo Preview page')
})

test('the Atlas panel never references DCM/HCM or any other governed non-ready phenotype — those stay hidden/reviewer-only', () => {
  const panel = read('app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx')
  assert.equal(/\bDCM\b|\bHCM\b|dilated cardiomyopathy|hypertrophic cardiomyopathy/i.test(panel), false)
})

test('the Atlas panel only renders the seeded next-best-evidence activity/task and never fabricates one if missing', () => {
  const panel = read('app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx')
  assert.match(panel, /ECHO_LEARNING_ACTIVITY_SEED\.find/)
  assert.match(panel, /if \(!ACTIVITY \|\| !TASK\) return null/)
  assert.match(panel, /assertNextBestEvidenceFraming/)
})

test('the existing Normal A4C lesson/assessment path is unmodified by this closeout', () => {
  const preview = read('app/components/clinical-media/ClinicalMediaPreview.tsx')
  assert.match(preview, /<EchoA4cLesson onAssessment=\{onAssessment\} reducedMotion=\{reducedMotion\}/)
  assert.match(preview, /<EchoStudySummaryPanel summary=\{echoSummary\} recommendation=\{null\}\/>/)
})

test('docs/ECHO_INTELLIGENCE_ATLAS_V1.md exists and documents the real Batch 6 implementation, not future marketing', () => {
  assert.ok(existsSync(new URL('../docs/ECHO_INTELLIGENCE_ATLAS_V1.md', import.meta.url)))
  const doc = read('docs/ECHO_INTELLIGENCE_ATLAS_V1.md')
  for (const required of [
    'no real patient data',
    'no ai diagnostic authority',
    'no vendor integration',
    'no production supabase change',
    'no fabricated ef',
  ]) {
    assert.ok(doc.toLowerCase().includes(required), `doc is missing required explicit statement: "${required}"`)
  }
  for (const section of [
    'EchoStudyRecord', 'EchoPhenotype', 'EchoFinding', 'EchoMeasurement', 'EchoEvidence',
    'DCM', 'HCM', 'Contrastive', 'next-best-evidence', 'Confidence calibration',
    'Institutional intake', 'Clinical Orbit', 'Catalog integration', 'UI exposure',
  ]) {
    assert.ok(doc.includes(section), `doc is missing expected content section: "${section}"`)
  }
})

test('no source file comment still references ECHO_INTELLIGENCE_ATLAS_V1.md as a missing/nonexistent document', () => {
  const referencingFiles = [
    'app/lib/contentCatalogSeed.ts',
    'app/lib/clinicalMedia/echoAiAdapter.ts',
    'app/lib/clinicalMedia/echoMeasurement.ts',
    'app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx',
  ]
  for (const path of referencingFiles) {
    assert.match(read(path), /ECHO_INTELLIGENCE_ATLAS_V1/, `${path} was expected to reference the spec doc`)
  }
  // The doc it references now actually exists (checked in the previous test) —
  // these comments are no longer dangling references.
  assert.ok(existsSync(new URL('../docs/ECHO_INTELLIGENCE_ATLAS_V1.md', import.meta.url)))
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BLS_LESSONS } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS } from '../app/lib/codelab/aclsLessons.ts'
import { CODE_LAB_CATALOG } from '../app/lib/codelab/trainingContent.ts'

test('Code Lab contains complete BLS and ACLS lesson sets', () => {
  assert.equal(BLS_LESSONS.length, 6)
  assert.equal(ACLS_LESSONS.length, 6)
  assert.equal(BLS_LESSONS.every(lesson => lesson.track === 'bls'), true)
  assert.equal(ACLS_LESSONS.every(lesson => lesson.track === 'acls'), true)
})

test('the hub exposes both tracks through one player and versioned progress', () => {
  const hub = readFileSync(new URL('../app/components/ward/CodeLabHub.tsx', import.meta.url), 'utf8')
  const contract = readFileSync(new URL('../app/lib/codelab/trainingContent.ts', import.meta.url), 'utf8')

  assert.match(hub, /TrainingLessonPlayer/)
  assert.match(hub, /Object\.keys\(TRAINING_TRACKS\)/)
  assert.match(hub, /cliniverse_codelab_progress_v1/)
  assert.match(contract, /BLS_LESSONS\.map\(normalizeBlsLesson\)/)
  assert.match(contract, /ACLS_LESSONS\.map\(normalizeAclsLesson\)/)
  assert.match(contract, /schemaVersion: 1/)
})

test('legacy BLS progress is migrated without granting ACLS progress', () => {
  const contract = readFileSync(new URL('../app/lib/codelab/trainingContent.ts', import.meta.url), 'utf8')
  assert.match(contract, /bls: uniqueStrings\(legacy\.completedIds\)/)
  assert.match(contract, /acls: \[\]/)
})

test('the Code Lab catalog exposes an honest draft and source-review boundary', () => {
  assert.equal(CODE_LAB_CATALOG.catalogVersion, '1.0.0-draft')
  assert.equal(CODE_LAB_CATALOG.intendedUse, 'education-only')
  assert.equal(CODE_LAB_CATALOG.reviewStatus, 'draft-human-review-required')
  assert.equal(CODE_LAB_CATALOG.sourceStatus, 'lesson-level-source-mapping-required')
  assert.equal(CODE_LAB_CATALOG.progressStorage, 'device-local')
})

test('the release shell exposes Code Lab through Care and Atlas with verified entitlement wiring', () => {
  const care = readFileSync(new URL('../app/components/ward/index.tsx', import.meta.url), 'utf8')
  const atlas = readFileSync(new URL('../app/components/release/AtlasReleaseCatalog.tsx', import.meta.url), 'utf8')
  const hub = readFileSync(new URL('../app/components/ward/CodeLabHub.tsx', import.meta.url), 'utf8')
  const player = readFileSync(new URL('../app/components/ward/TrainingLessonPlayer.tsx', import.meta.url), 'utf8')

  assert.match(care, /CareWorkspace = 'ward' \| 'learning' \| 'cardiology' \| 'nexus'/)
  assert.match(care, /<CodeLabHub/)
  assert.match(care, /isPro=\{isPro\}/)
  assert.match(care, /onUpgrade=\{openPaywall\}/)
  assert.match(atlas, /workspace: 'learning'/)
  assert.match(atlas, /Open Code Lab/)
  assert.doesNotMatch(hub, /<main/)
  assert.doesNotMatch(player, /<main/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BLS_LESSONS } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS } from '../app/lib/codelab/aclsLessons.ts'
import { CODE_LAB_CATALOG, parseCodeLabProgress } from '../app/lib/codelab/trainingContent.ts'
import {
  CODE_LAB_LESSON_SOURCE_BINDINGS,
  CODE_LAB_SOURCE_RECORDS,
  CODE_LAB_SOURCE_SNAPSHOT_ID,
} from '../app/lib/codelab/lessonGovernance.ts'
import { createCodeLabLessonReceipt, parseCodeLabLessonReceipt } from '../app/lib/codelab/lessonReceipt.ts'

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
  assert.match(hub, /cliniverse_codelab_progress_v2/)
  assert.match(hub, /cliniverse_codelab_progress_v1/)
  assert.match(contract, /BLS_LESSONS\.map\(normalizeBlsLesson\)/)
  assert.match(contract, /ACLS_LESSONS\.map\(normalizeAclsLesson\)/)
  assert.match(contract, /schemaVersion: 2/)
})

test('legacy BLS progress is migrated without granting ACLS progress', () => {
  const migrated = parseCodeLabProgress(null, null, JSON.stringify({ completedIds: ['bls_01_chain', 'unknown'] }))
  assert.deepEqual(migrated.completedByTrack, { bls: ['bls_01_chain'], acls: [] })
  assert.deepEqual(migrated.receiptsByLesson, {})
})

test('the Code Lab catalog exposes an honest draft and source-review boundary', () => {
  assert.equal(CODE_LAB_CATALOG.catalogVersion, '1.0.0-draft')
  assert.equal(CODE_LAB_CATALOG.intendedUse, 'education-only')
  assert.equal(CODE_LAB_CATALOG.reviewStatus, 'draft-human-review-required')
  assert.equal(CODE_LAB_CATALOG.sourceStatus, 'provisional-source-family-mapping-human-review-required')
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
  assert.match(player, /<details className=\{styles\.sourceDisclosure\}>/)
  assert.match(player, /Source ledger and review status/)
  assert.match(player, /Save receipt and return to Code Lab/)
})

test('every BLS and ACLS lesson has one provisional source-family binding', () => {
  const lessonIds = [...BLS_LESSONS, ...ACLS_LESSONS].map(lesson => lesson.id)
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.length, lessonIds.length)
  assert.deepEqual(new Set(CODE_LAB_LESSON_SOURCE_BINDINGS.map(binding => binding.lessonId)), new Set(lessonIds))
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.every(binding => binding.mappingStatus === 'provisional-source-family-only'), true)
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.every(binding => binding.clinicalReviewStatus === 'not-reviewed'), true)
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.every(binding => binding.humanReviewRequired), true)
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.every(binding => binding.assessmentItemCount > 0), true)

  const sourceIds = new Set(CODE_LAB_SOURCE_RECORDS.map(source => source.sourceId))
  assert.equal(CODE_LAB_LESSON_SOURCE_BINDINGS.every(binding => binding.sourceIds.every(sourceId => sourceIds.has(sourceId))), true)
  assert.equal(CODE_LAB_SOURCE_RECORDS.every(source => source.url.startsWith('https://cpr.heart.org/')), true)
})

test('lesson completion receipts are deterministic and reject tampering', () => {
  const input = { lessonId: 'bls_01_chain', track: 'bls', attempts: 2, score: 2, total: 2 }
  const receipt = createCodeLabLessonReceipt(input)
  assert.equal(receipt.receiptId, createCodeLabLessonReceipt(input).receiptId)
  assert.equal(receipt.source.ledgerSnapshotId, CODE_LAB_SOURCE_SNAPSHOT_ID)
  assert.equal(receipt.reviewStatus, 'draft-human-review-required')
  assert.equal(receipt.humanReviewRequired, true)
  assert.equal(parseCodeLabLessonReceipt(receipt)?.receiptId, receipt.receiptId)
  assert.equal(parseCodeLabLessonReceipt({ ...receipt, reviewStatus: 'approved' }), null)
  assert.throws(() => createCodeLabLessonReceipt({ ...input, score: 0 }))
  assert.throws(() => createCodeLabLessonReceipt({ ...input, total: 3 }))
})

test('v1 progress migration preserves IDs without fabricating receipts', () => {
  const previous = JSON.stringify({
    schemaVersion: 1,
    completedByTrack: { bls: ['bls_01_chain'], acls: ['acls_01_systematic'] },
  })
  const migrated = parseCodeLabProgress(null, previous)
  assert.deepEqual(migrated.completedByTrack, { bls: ['bls_01_chain'], acls: ['acls_01_systematic'] })
  assert.deepEqual(migrated.receiptsByLesson, {})
})

test('v2 progress drops tampered, unknown and orphaned receipt data', () => {
  const valid = createCodeLabLessonReceipt({ lessonId: 'bls_01_chain', track: 'bls', attempts: 1, score: 2, total: 2 })
  const parsed = parseCodeLabProgress(JSON.stringify({
    schemaVersion: 2,
    completedByTrack: { bls: ['bls_01_chain', 'unknown'], acls: [] },
    receiptsByLesson: {
      bls_01_chain: valid,
      bls_02_compressions: createCodeLabLessonReceipt({ lessonId: 'bls_02_compressions', track: 'bls', attempts: 1, score: 2, total: 2 }),
      corrupted: { ...valid, receiptId: 'changed' },
    },
  }))
  assert.deepEqual(parsed.completedByTrack, { bls: ['bls_01_chain'], acls: [] })
  assert.deepEqual(Object.keys(parsed.receiptsByLesson), ['bls_01_chain'])
})

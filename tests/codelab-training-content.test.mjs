import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BLS_LESSONS } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS } from '../app/lib/codelab/aclsLessons.ts'

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

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('content graph separates learner content from recoverable and institutional foundations', () => {
  const graph = read('app/lib/content/contentGraph.ts')
  assert.ok(graph.includes("publicationState: 'learner'"))
  assert.ok(graph.includes("publicationState: 'recoverable'"))
  assert.ok(graph.includes("publicationState: 'internal'"))
  for (const relation of ['practice-next','review-with','supports','institutional-extension']) {
    assert.ok(graph.includes(relation), relation)
  }
})

test('collections combine modalities instead of reviving old module silos', () => {
  const collections = read('app/lib/content/contentCollections.ts')
  for (const expected of ['Acute Care Foundations','Cardiology Practice','Resident Onboarding','ecg-record-10','echo-a4c-normal','ward-current-set','handover-practice']) {
    assert.ok(collections.includes(expected), expected)
  }
})

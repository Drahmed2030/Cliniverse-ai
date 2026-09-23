import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contentNode, contentNodeLearnerReady } from '../app/lib/content/contentGraph.ts'
import { CONTENT_COLLECTIONS, collectionNodes } from '../app/lib/content/contentCollections.ts'

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


test('catalog-gated learner nodes fail closed when required content is not ready', () => {
  const resuscitation = contentNode('resuscitation-hub')
  assert.ok(resuscitation)
  assert.equal(contentNodeLearnerReady(resuscitation), false)

  const acute = CONTENT_COLLECTIONS.find(collection => collection.id === 'acute-care-foundations')
  assert.ok(acute)
  assert.ok(acute.nodeIds.includes('resuscitation-hub'), 'the product definition is preserved')
  assert.equal(collectionNodes(acute).some(node => node.id === 'resuscitation-hub'), false, 'unready content is not projected as an active learner step')
})

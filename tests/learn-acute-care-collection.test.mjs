import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('Learn renders multiple connected practice collections through one reusable primitive', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  assert.match(learn, /LEARN_COLLECTION_IDS/)
  assert.match(learn, /cardiology-practice/)
  assert.match(learn, /acute-care-foundations/)
  assert.match(learn, /function ConnectedPractice\(\{collectionId,actorId,onOpenWorkspace\}/)
  assert.match(learn, /CONTENT_COLLECTIONS\.find\(item=>item\.id===collectionId\)/)
})

test('Acute Care Foundations maps to existing product destinations', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  for (const id of ['ecg-record-10','resuscitation-hub','code-lab-bls','ward-current-set','handover-practice']) {
    assert.ok(learn.includes(id), id)
  }
  assert.match(learn, /contentNodeLearnerReadyById\('resuscitation-hub'\)/)
  assert.match(learn, /available:contentNodeLearnerReadyById\('resuscitation-hub'\)/)
  assert.match(learn, /aria-disabled="true"/)
  assert.match(learn, /workspace:'codelab'/)
  assert.match(learn, /workspace:'handover'/)
})

test('connected collections preserve the shared visual system', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  const css = read('app/commercial-visual-system.css')
  assert.doesNotMatch(learn, /linear-gradient/)
  assert.doesNotMatch(learn, /fontFamily/)
  assert.match(css, /\.cv-learn-collections/)
  assert.match(css, /\.cv-learn-collection/)
})

test('Acute Care Foundations preserves the resuscitation product definition but filters it from active steps while catalog scenarios are not ready', async () => {
  const { CONTENT_COLLECTIONS, collectionNodes } = await import('../app/lib/content/contentCollections.ts')
  const acute = CONTENT_COLLECTIONS.find(collection => collection.id === 'acute-care-foundations')
  assert.ok(acute.nodeIds.includes('resuscitation-hub'))
  assert.equal(collectionNodes(acute).some(node => node.id === 'resuscitation-hub'), false)
})

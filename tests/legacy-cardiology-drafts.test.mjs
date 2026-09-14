import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cardiologyDrafts } from '../content/medical/cardiologyDrafts.ts'
import { extractDrafts, hashContent, parseCardiology, renderDrafts } from '../scripts/extract-legacy-cardiology.mjs'

test('all three drafts exactly preserve pinned historical content and provenance', () => {
  assert.deepEqual(cardiologyDrafts, extractDrafts())
  assert.equal(new Set(cardiologyDrafts.map(c => c.id)).size, 3)
  for (const draft of cardiologyDrafts) {
    assert.equal(hashContent(draft.legacyContent), draft.provenance.contentSha256)
    assert.equal(draft.provenance.legacyId, draft.legacyContent.id)
    assert.notEqual(hashContent({ ...draft.legacyContent, outcome: 'changed' }), draft.provenance.contentSha256)
  }
})

test('historical extraction cannot silently imply clinical review or matched media', () => {
  for (const draft of cardiologyDrafts) {
    assert.equal(draft.status, 'draft')
    assert.equal(draft.review.status, 'pending')
    assert.equal(draft.review.reviewer, null)
    assert.equal(draft.review.reviewedAt, null)
    assert.equal(draft.review.licenseStatus, 'unverified')
    assert.deepEqual(draft.references, [])
    assert.deepEqual(draft.mediaBindings, [])
    assert.ok(draft.review.blockers.length > 0)
  }
})

test('extractor rejects executable expressions, spreads and changed case inventory', () => {
  assert.throws(() => parseCardiology("const CASES = { cardiology: fetch('/api/medical-ai') }"), /Non-literal/)
  assert.throws(() => parseCardiology('const CASES = { cardiology: [{...external}] }'), /Unsupported/)
  assert.throws(() => parseCardiology("const CASES = { cardiology: [{id:'c1'}] }"), /Unexpected source/)
})

test('snapshot regeneration is deterministic and contains no hand-edited drift', () => {
  const saved = readFileSync(new URL('../content/medical/cardiologyDrafts.ts', import.meta.url), 'utf8')
  assert.equal(saved, renderDrafts(extractDrafts()))
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('Resident Onboarding is institutional and not surfaced in individual Learn collections', () => {
  const collections = read('app/lib/content/contentCollections.ts')
  const learn = read('app/components/release/LearnTracks.tsx')
  assert.match(collections, /id: 'resident-onboarding'/)
  assert.match(collections, /audience: 'institution'/)
  assert.doesNotMatch(learn, /resident-onboarding/)
  assert.match(learn, /LEARN_COLLECTION_IDS = \['cardiology-practice','acute-care-foundations'\]/)
})

test('institution assignments require a real institutional collection and cohort boundary', () => {
  const source = read('app/lib/institution/assignmentContract.ts')
  assert.match(source, /INSTITUTIONAL_COLLECTIONS/)
  assert.match(source, /Institutional collection required/)
  assert.match(source, /Organization and cohort are required/)
  assert.match(source, /resident-onboarding-template/)
  assert.match(source, /status: input\.status \?\? 'draft'/)
})

test('institution assignment events already exist in the shared event contract', () => {
  const events = read('app/lib/platform/events.ts')
  assert.match(events, /institution\.assignment\.opened/)
  assert.match(events, /institution\.assignment\.completed/)
})

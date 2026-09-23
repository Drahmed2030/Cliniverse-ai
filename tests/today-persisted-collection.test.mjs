import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
const app = read('app/components/ReleaseApp.tsx')
const learn = read('app/components/release/LearnTracks.tsx')
const events = read('app/lib/platform/events.ts')

test('collection opens persist account-scoped Event Contract activity', () => {
  assert.match(learn, /appendCliniverseEvent\(window\.localStorage, actorId/)
  assert.match(learn, /name:'collection\.started'/)
  assert.match(learn, /collectionId/)
  assert.match(learn, /contentId:node\.id/)
  assert.match(events, /'collection\.started': \['today','analytics','institution'\]/)
})

test('Today reads persisted collection activity through the projection contract', () => {
  assert.match(app, /readCliniverseEvents\(window\.localStorage, actorId\)/)
  assert.match(app, /collectionContinuation\(/)
  assert.match(app, /<TodaySurface actorId=\{accountId\}/)
  assert.match(app, /<LearnTracks actorId=\{accountId\}/)
})

test('account identity scopes collection activity without changing protected systems', () => {
  assert.match(app, /accountId=\{user\.id\}/)
  assert.doesNotMatch(app, /supabase\.from\(/)
  assert.doesNotMatch(learn, /resident-onboarding/)
})

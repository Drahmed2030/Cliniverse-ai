import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'

// Regression: TopicsIFollow's useSyncExternalStore snapshot used to return a newly
// allocated array on every read. React 19 treats that as a store that changes on
// every render, so the Me tab threw "Maximum update depth exceeded" (React #185).
// The component imports the engagement client (and transitively Supabase), so per
// this repo's two-tier pattern it is not imported; the store logic is extracted
// from the real source and executed against a fake localStorage instead.
const source = readFileSync(new URL('../app/components/release/TopicsIFollow.tsx', import.meta.url), 'utf8')

function loadStore(localStorage) {
  const start = source.indexOf('const TOPIC_OPTIONS')
  const end = source.indexOf('function subscribe')
  assert.ok(start !== -1 && end > start, 'TopicsIFollow store section moved; update this test')
  const body = stripTypeScriptTypes(source.slice(start, end))
  return new Function('localStorage', `${body}\nreturn { snapshot, setSession(value) { sessionSelection = value }, key }`)(localStorage)
}

function fakeStorage(initial) {
  const values = new Map(initial ? Object.entries(initial) : [])
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('snapshot is referentially stable when nothing changed and storage is empty', () => {
  const store = loadStore(fakeStorage())
  const first = store.snapshot()
  assert.deepEqual(first, [])
  assert.equal(store.snapshot(), first)
  assert.equal(store.snapshot(), first)
})

test('snapshot is referentially stable for stored topics and drops unknown ones', () => {
  const storage = fakeStorage()
  const store = loadStore(storage)
  storage.setItem(store.key, JSON.stringify(['ecg', 'not_a_topic', 'echo']))
  const first = store.snapshot()
  assert.deepEqual(first, ['ecg', 'echo'])
  assert.equal(store.snapshot(), first)
})

test('snapshot changes identity only when the stored value changes', () => {
  const storage = fakeStorage()
  const store = loadStore(storage)
  storage.setItem(store.key, JSON.stringify(['ecg']))
  const first = store.snapshot()
  storage.setItem(store.key, JSON.stringify(['ecg', 'heart_failure']))
  const second = store.snapshot()
  assert.notEqual(second, first)
  assert.deepEqual(second, ['ecg', 'heart_failure'])
  assert.equal(store.snapshot(), second)
})

test('snapshot is stable for malformed, non-array and unavailable storage', () => {
  const malformed = fakeStorage()
  const malformedStore = loadStore(malformed)
  malformed.setItem(malformedStore.key, '{not json')
  assert.deepEqual(malformedStore.snapshot(), [])
  assert.equal(malformedStore.snapshot(), malformedStore.snapshot())

  const notArray = fakeStorage()
  const notArrayStore = loadStore(notArray)
  notArray.setItem(notArrayStore.key, JSON.stringify({ topic: 'ecg' }))
  assert.deepEqual(notArrayStore.snapshot(), [])
  assert.equal(notArrayStore.snapshot(), notArrayStore.snapshot())

  const unavailable = loadStore({ getItem() { throw new Error('storage blocked') } })
  assert.deepEqual(unavailable.snapshot(), [])
  assert.equal(unavailable.snapshot(), unavailable.snapshot())
})

test('an in-session selection is returned as-is and stays stable', () => {
  const store = loadStore(fakeStorage())
  const chosen = ['arrhythmia']
  store.setSession(chosen)
  assert.equal(store.snapshot(), chosen)
  assert.equal(store.snapshot(), chosen)
})

test('the server snapshot handed to useSyncExternalStore is a stable reference', () => {
  assert.doesNotMatch(source, /useSyncExternalStore\(subscribe, snapshot, \(\) => \[\]/)
  assert.match(source, /useSyncExternalStore\(subscribe, snapshot, \(\) => EMPTY\)/)
})

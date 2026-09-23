import test from 'node:test'
import assert from 'node:assert/strict'
import { appendCliniverseEvent, readCliniverseEvents } from '../app/lib/platform/eventStore.ts'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
  }
}

const event = (actorId, id, name='collection.started') => ({
  id,
  name,
  actorId,
  collectionId: 'cardiology-practice',
  occurredAt: '2026-09-23T09:00:00.000Z',
  payload: {},
})

test('event store is account scoped and ignores cross-account writes', () => {
  const storage = memoryStorage()
  appendCliniverseEvent(storage, 'user-a', event('user-a', 'a1'))
  appendCliniverseEvent(storage, 'user-a', event('user-b', 'b1'))
  assert.deepEqual(readCliniverseEvents(storage, 'user-a').map(item => item.id), ['a1'])
  assert.deepEqual(readCliniverseEvents(storage, 'user-b'), [])
})

test('event store fails closed on malformed or unavailable persisted data', () => {
  const storage = memoryStorage()
  storage.setItem('cliniverse:event-log:v1:user-a', '{bad')
  assert.deepEqual(readCliniverseEvents(storage, 'user-a'), [])
  assert.deepEqual(readCliniverseEvents(storage, ''), [])
})

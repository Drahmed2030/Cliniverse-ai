import test from 'node:test'
import assert from 'node:assert/strict'
import { collectionContinuation } from '../app/lib/content/collectionContinuation.ts'

const event = (name, collectionId, occurredAt) => ({
  id: `${name}-${collectionId}-${occurredAt}`,
  name,
  collectionId,
  occurredAt,
  payload: {},
})

test('projects the most recent active individual collection from Event Contract records', () => {
  const continuation = collectionContinuation([
    event('collection.started', 'acute-care-foundations', '2026-09-22T09:00:00.000Z'),
    event('content.completed', 'cardiology-practice', '2026-09-23T09:00:00.000Z'),
  ])

  assert.deepEqual(continuation, {
    collectionId: 'cardiology-practice',
    title: 'Cardiology Practice',
    occurredAt: '2026-09-23T09:00:00.000Z',
  })
})

test('does not invent a continuation from missing, invalid, institutional, or completed activity', () => {
  assert.equal(collectionContinuation([]), null)
  assert.equal(collectionContinuation([event('collection.started', 'resident-onboarding', '2026-09-23T09:00:00.000Z')]), null)
  assert.equal(collectionContinuation([event('collection.started', 'cardiology-practice', 'not-a-date')]), null)
  assert.equal(collectionContinuation([
    event('collection.started', 'acute-care-foundations', '2026-09-22T09:00:00.000Z'),
    event('collection.completed', 'acute-care-foundations', '2026-09-23T09:00:00.000Z'),
  ]), null)
})
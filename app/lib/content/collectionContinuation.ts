import { CONTENT_COLLECTIONS, type ContentCollection } from './contentCollections.ts'
import type { CliniverseEvent } from '../platform/events.ts'

export interface CollectionContinuation {
  collectionId: string
  title: string
  occurredAt: string
}

function individualCollection(id: string | undefined): ContentCollection | null {
  if (!id) return null
  return CONTENT_COLLECTIONS.find(collection => collection.id === id && collection.audience === 'individual') ?? null
}

/**
 * Projects an existing event stream into one honest collection continuation.
 * Callers own event persistence and account scoping; this function only reads
 * Event Contract records and never infers collection activity from track data.
 */
export function collectionContinuation(events: readonly CliniverseEvent[]): CollectionContinuation | null {
  const latestByCollection = new Map<string, CliniverseEvent>()

  for (const event of events) {
    const collection = individualCollection(event.collectionId)
    if (!collection || Number.isNaN(Date.parse(event.occurredAt))) continue
    const current = latestByCollection.get(collection.id)
    if (!current || Date.parse(event.occurredAt) > Date.parse(current.occurredAt)) {
      latestByCollection.set(collection.id, event)
    }
  }

  const active = [...latestByCollection.values()]
    .filter(event => event.name !== 'collection.completed')
    .sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))[0]
  if (!active?.collectionId) return null

  const collection = individualCollection(active.collectionId)
  return collection ? { collectionId: collection.id, title: collection.title, occurredAt: active.occurredAt } : null
}
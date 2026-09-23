import type { CliniverseEvent } from './events.ts'

const EVENT_STORE_PREFIX = 'cliniverse:event-log:v1:'
const MAX_EVENTS = 200

function key(actorId: string) {
  return EVENT_STORE_PREFIX + actorId
}

function isEvent(value: unknown): value is CliniverseEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<CliniverseEvent>
  return typeof event.id === 'string'
    && typeof event.name === 'string'
    && typeof event.occurredAt === 'string'
    && typeof event.payload === 'object'
}

export function readCliniverseEvents(storage: Pick<Storage, 'getItem'>, actorId: string): CliniverseEvent[] {
  if (!actorId) return []
  try {
    const raw = storage.getItem(key(actorId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isEvent).filter(event => !event.actorId || event.actorId === actorId)
  } catch {
    return []
  }
}

export function appendCliniverseEvent(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  actorId: string,
  event: CliniverseEvent,
) {
  if (!actorId || event.actorId !== actorId) return
  const current = readCliniverseEvents(storage, actorId)
  const next = [...current, event].slice(-MAX_EVENTS)
  try {
    storage.setItem(key(actorId), JSON.stringify(next))
  } catch {
    // Persistence is best effort. Product behavior must remain usable when storage is unavailable.
  }
}

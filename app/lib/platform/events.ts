export type CliniverseEventName =
  | 'practice.started'
  | 'practice.completed'
  | 'answer.submitted'
  | 'review.scheduled'
  | 'review.completed'
  | 'content.opened'
  | 'content.completed'
  | 'collection.started'
  | 'collection.completed'
  | 'subscription.changed'
  | 'institution.assignment.opened'
  | 'institution.assignment.completed'

export interface CliniverseEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  name: CliniverseEventName
  occurredAt: string
  actorId?: string
  sessionId?: string
  contentId?: string
  collectionId?: string
  releaseSha?: string
  payload: TPayload
}

export type EventConsumer =
  | 'progress'
  | 'today'
  | 'review-scheduler'
  | 'analytics'
  | 'institution'
  | 'intelligence'

export const EVENT_CONSUMERS: Record<CliniverseEventName, readonly EventConsumer[]> = {
  'practice.started': ['analytics'],
  'practice.completed': ['progress','today','review-scheduler','analytics','intelligence'],
  'answer.submitted': ['progress','review-scheduler','analytics','intelligence'],
  'review.scheduled': ['today','analytics'],
  'review.completed': ['progress','today','review-scheduler','analytics','intelligence'],
  'content.opened': ['analytics'],
  'content.completed': ['progress','today','analytics','intelligence'],
  'collection.started': ['today','analytics','institution'],
  'collection.completed': ['progress','today','analytics','institution','intelligence'],
  'subscription.changed': ['analytics'],
  'institution.assignment.opened': ['analytics','institution'],
  'institution.assignment.completed': ['analytics','institution','progress'],
}

export function makeCliniverseEvent<TPayload extends Record<string, unknown>>(
  input: Omit<CliniverseEvent<TPayload>, 'id' | 'occurredAt'> & { id?: string; occurredAt?: string },
): CliniverseEvent<TPayload> {
  return {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  }
}

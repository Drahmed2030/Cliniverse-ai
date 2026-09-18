import type { PathwayEvent } from './pathwayEvent.ts'

// PathwayXapiAdapter — Batch 7 Section 10. A small, conceptual mapping
// boundary from a PathwayEvent to an xAPI-shaped statement (actor,
// verb/performed, object/activity, result, context, timestamp). This repo
// already has real xAPI export concepts elsewhere (see the ECG/Echo
// learning-export tests); this adapter follows the same conceptual shape
// so a future LRS integration touches only this file.
//
// NO external LRS is introduced in this batch and this adapter never sends
// anything over the network — mapPathwayEventToXapiStatement is a pure
// function. It exists so the mapping itself can be reviewed and tested
// before any transport is added.

export type XapiVerbId =
  | 'http://adlnet.gov/expapi/verbs/experienced' // pathway.opened, evidence.reviewed
  | 'http://adlnet.gov/expapi/verbs/attempted'   // drill.started, reassessment.started
  | 'http://adlnet.gov/expapi/verbs/completed'   // drill.submitted, reassessment.completed
  | 'http://adlnet.gov/expapi/verbs/responded'   // receipt.created
  | 'http://adlnet.gov/expapi/verbs/asked'       // closure.requested, review.pending
  | 'http://adlnet.gov/expapi/verbs/reviewed'    // review.completed

const VERB_BY_EVENT_TYPE: Record<PathwayEvent['eventType'], XapiVerbId> = {
  'pathway.opened': 'http://adlnet.gov/expapi/verbs/experienced',
  'evidence.reviewed': 'http://adlnet.gov/expapi/verbs/experienced',
  'drill.started': 'http://adlnet.gov/expapi/verbs/attempted',
  'drill.submitted': 'http://adlnet.gov/expapi/verbs/completed',
  'receipt.created': 'http://adlnet.gov/expapi/verbs/responded',
  'reassessment.started': 'http://adlnet.gov/expapi/verbs/attempted',
  'reassessment.completed': 'http://adlnet.gov/expapi/verbs/completed',
  'closure.requested': 'http://adlnet.gov/expapi/verbs/asked',
  'review.pending': 'http://adlnet.gov/expapi/verbs/asked',
  'review.completed': 'http://adlnet.gov/expapi/verbs/reviewed',
}

/** Conceptual xAPI statement shape — deliberately not the full xAPI spec type, just enough to prove the mapping and unblock a future adapter. No PII/patient identifiers ever appear here — actor is a session-scoped, non-identifying handle. */
export interface XapiPathwayStatement {
  actor: { objectType: 'Agent'; name: string /* sessionId-scoped, never a real identity */ }
  verb: { id: XapiVerbId; display: { 'en-US': string } }
  object: { objectType: 'Activity'; id: string; definition: { name: { 'en-US': string } } }
  result: { success: boolean | null; extensions: Record<string, unknown> }
  context: { registration: string; extensions: { stage: string; evidenceRefs: readonly string[] } }
  timestamp: string
}

export function mapPathwayEventToXapiStatement(event: PathwayEvent): XapiPathwayStatement {
  return {
    actor: { objectType: 'Agent', name: `pathway-session:${event.sessionId}` },
    verb: { id: VERB_BY_EVENT_TYPE[event.eventType], display: { 'en-US': event.eventType } },
    object: {
      objectType: 'Activity',
      id: `https://cliniverseai.com/xapi/activities/pathway-replay/${event.eventType}`,
      definition: { name: { 'en-US': event.eventType } },
    },
    result: {
      success: typeof event.payload.passed === 'boolean' ? event.payload.passed : null,
      extensions: { ...event.payload },
    },
    context: {
      registration: event.eventId,
      extensions: { stage: event.stage, evidenceRefs: event.evidenceRefs },
    },
    timestamp: event.occurredAt,
  }
}

export function mapPathwayEventHistoryToXapiStatements(history: readonly PathwayEvent[]): XapiPathwayStatement[] {
  return history.map(mapPathwayEventToXapiStatement)
}

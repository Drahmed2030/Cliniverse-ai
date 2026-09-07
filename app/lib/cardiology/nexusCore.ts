export type NexusRoleId = 'referring' | 'coordination' | 'cardiology' | 'cath-lab' | 'quality'

export type NexusCaseState =
  | 'draft'
  | 'referral-received'
  | 'reviewed'
  | 'accepted'
  | 'identity-linked'
  | 'in-transport'
  | 'cath-lab-activated'
  | 'arrived'
  | 'episode-recorded'
  | 'quality-validated'

export type NexusTransitionEventType =
  | 'referral-received'
  | 'review-completed'
  | 'acceptance-recorded'
  | 'identity-linked'
  | 'transport-departed'
  | 'cath-lab-activated'
  | 'arrival-recorded'
  | 'episode-recorded'
  | 'quality-validated'

export type NexusClockType =
  | 'first-medical-contact'
  | 'first-hospital-arrival'
  | 'receiving-hospital-arrival'
  | 'procedure-milestone'

export interface NexusEventSource {
  system: string
  recordId: string
}

export interface NexusTransitionEvent {
  kind: 'transition'
  eventId: string
  caseId: string
  sequence: number
  type: NexusTransitionEventType
  actorRole: NexusRoleId
  actorId: string
  occurredAt: string
  recordedAt: string
  source: NexusEventSource
  referenceIds: string[]
}

export interface NexusClockEvent {
  kind: 'clock'
  eventId: string
  caseId: string
  sequence: number
  type: 'clock-recorded'
  clockType: NexusClockType
  actorRole: NexusRoleId
  actorId: string
  occurredAt: string
  recordedAt: string
  source: NexusEventSource
  referenceIds: string[]
}

export type NexusEvent = NexusTransitionEvent | NexusClockEvent

export interface NexusIdentifier {
  kind: 'referral-case-id' | 'mrn' | 'encounter' | 'cath-episode'
  value: string
  sourceSystem: string
  linkedAt: string
}

export interface NexusCase {
  caseId: string
  state: NexusCaseState
  version: number
  identifiers: NexusIdentifier[]
  events: NexusEvent[]
}

export interface NexusTransitionRule {
  eventType: NexusTransitionEventType
  from: NexusCaseState
  to: NexusCaseState
  allowedRoles: NexusRoleId[]
  requiredIdentifier?: NexusIdentifier['kind']
  referenceIds: string[]
}

export interface NexusEngineError {
  code:
    | 'CASE_MISMATCH'
    | 'EVENT_ORDER_INVALID'
    | 'ROLE_NOT_ALLOWED'
    | 'TRANSITION_NOT_ALLOWED'
    | 'IDENTIFIER_REQUIRED'
    | 'INVALID_TIMESTAMP'
    | 'DUPLICATE_EVENT'
  message: string
}

export type NexusEngineResult =
  | { ok: true; value: NexusCase }
  | { ok: false; error: NexusEngineError }

export const NEXUS_TRANSITION_RULES: NexusTransitionRule[] = [
  { eventType: 'referral-received', from: 'draft', to: 'referral-received', allowedRoles: ['referring'], requiredIdentifier: 'referral-case-id', referenceIds: ['QAPAS-DIRECT-LOCAL'] },
  { eventType: 'review-completed', from: 'referral-received', to: 'reviewed', allowedRoles: ['cardiology'], referenceIds: ['QAPAS-DIRECT-LOCAL'] },
  { eventType: 'acceptance-recorded', from: 'reviewed', to: 'accepted', allowedRoles: ['cardiology'], referenceIds: ['QAPAS-DIRECT-LOCAL'] },
  { eventType: 'identity-linked', from: 'accepted', to: 'identity-linked', allowedRoles: ['coordination'], requiredIdentifier: 'mrn', referenceIds: ['QAPAS-DIRECT-LOCAL', 'HL7-FHIR-R5-PROVENANCE'] },
  { eventType: 'transport-departed', from: 'identity-linked', to: 'in-transport', allowedRoles: ['referring', 'coordination'], referenceIds: ['AHA-MISSION-LIFELINE'] },
  { eventType: 'cath-lab-activated', from: 'in-transport', to: 'cath-lab-activated', allowedRoles: ['cath-lab'], referenceIds: ['QAPAS-DIRECT-LOCAL'] },
  { eventType: 'arrival-recorded', from: 'cath-lab-activated', to: 'arrived', allowedRoles: ['cath-lab', 'coordination'], requiredIdentifier: 'encounter', referenceIds: ['QAPAS-DIRECT-LOCAL', 'HL7-FHIR-R5-AUDIT-EVENT'] },
  { eventType: 'episode-recorded', from: 'arrived', to: 'episode-recorded', allowedRoles: ['cath-lab'], requiredIdentifier: 'cath-episode', referenceIds: ['QAPAS-DIRECT-LOCAL'] },
  { eventType: 'quality-validated', from: 'episode-recorded', to: 'quality-validated', allowedRoles: ['quality'], referenceIds: ['AHA-MISSION-LIFELINE', 'AHA-KPI-LOCAL-AUDIT'] },
]

export function createNexusCase(caseId: string, referralCaseId: string, createdAt: string): NexusCase {
  return {
    caseId,
    state: 'draft',
    version: 0,
    identifiers: [{ kind: 'referral-case-id', value: referralCaseId, sourceSystem: 'cardio-nexus-simulation', linkedAt: createdAt }],
    events: [],
  }
}

export function getNextTransition(currentState: NexusCaseState): NexusTransitionRule | null {
  return NEXUS_TRANSITION_RULES.find(rule => rule.from === currentState) ?? null
}

export function appendIdentifier(current: NexusCase, identifier: NexusIdentifier): NexusEngineResult {
  if (!isIsoTimestamp(identifier.linkedAt)) {
    return failure('INVALID_TIMESTAMP', 'Identifier link time must be a valid ISO timestamp.')
  }

  const duplicate = current.identifiers.some(item => item.kind === identifier.kind && item.value === identifier.value)
  if (duplicate) {
    return { ok: true, value: current }
  }

  return {
    ok: true,
    value: { ...current, version: current.version + 1, identifiers: [...current.identifiers, identifier] },
  }
}

export function applyNexusEvent(current: NexusCase, event: NexusEvent): NexusEngineResult {
  if (event.caseId !== current.caseId) {
    return failure('CASE_MISMATCH', 'The event belongs to a different Nexus case.')
  }

  if (current.events.some(item => item.eventId === event.eventId)) {
    return failure('DUPLICATE_EVENT', 'The event ID already exists in this case ledger.')
  }

  if (event.sequence !== current.events.length + 1) {
    return failure('EVENT_ORDER_INVALID', 'The event sequence must append to the ledger without gaps.')
  }

  if (!isIsoTimestamp(event.occurredAt) || !isIsoTimestamp(event.recordedAt)) {
    return failure('INVALID_TIMESTAMP', 'Event times must be valid ISO timestamps.')
  }

  if (event.kind === 'clock') {
    return {
      ok: true,
      value: { ...current, version: current.version + 1, events: [...current.events, event] },
    }
  }

  const rule = NEXUS_TRANSITION_RULES.find(item => item.eventType === event.type && item.from === current.state)
  if (!rule) {
    return failure('TRANSITION_NOT_ALLOWED', `Event ${event.type} cannot follow state ${current.state}.`)
  }

  if (!rule.allowedRoles.includes(event.actorRole)) {
    return failure('ROLE_NOT_ALLOWED', `Role ${event.actorRole} cannot record event ${event.type}.`)
  }

  if (rule.requiredIdentifier && !current.identifiers.some(identifier => identifier.kind === rule.requiredIdentifier)) {
    return failure('IDENTIFIER_REQUIRED', `Identifier ${rule.requiredIdentifier} is required before ${event.type}.`)
  }

  return {
    ok: true,
    value: {
      ...current,
      state: rule.to,
      version: current.version + 1,
      events: [...current.events, event],
    },
  }
}

export function createSyntheticTransitionEvent(
  current: NexusCase,
  rule: NexusTransitionRule,
  actorRole: NexusRoleId,
  now: string,
): NexusTransitionEvent {
  return {
    kind: 'transition',
    eventId: `SIM-EVT-${String(current.events.length + 1).padStart(3, '0')}`,
    caseId: current.caseId,
    sequence: current.events.length + 1,
    type: rule.eventType,
    actorRole,
    actorId: `SIM-ACTOR-${actorRole.toUpperCase()}`,
    occurredAt: now,
    recordedAt: now,
    source: { system: 'cardio-nexus-simulation', recordId: `SIM-REC-${current.events.length + 1}` },
    referenceIds: rule.referenceIds,
  }
}

export function createSyntheticClockEvent(
  current: NexusCase,
  clockType: NexusClockType,
  actorRole: NexusRoleId,
  occurredAt: string,
): NexusClockEvent {
  return {
    kind: 'clock',
    eventId: `SIM-EVT-${String(current.events.length + 1).padStart(3, '0')}`,
    caseId: current.caseId,
    sequence: current.events.length + 1,
    type: 'clock-recorded',
    clockType,
    actorRole,
    actorId: `SIM-ACTOR-${actorRole.toUpperCase()}`,
    occurredAt,
    recordedAt: occurredAt,
    source: { system: 'cardio-nexus-simulation', recordId: `SIM-CLOCK-${clockType}` },
    referenceIds: ['AHA-KPI-LOCAL-AUDIT'],
  }
}

function isIsoTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value)) && value.includes('T')
}

function failure(code: NexusEngineError['code'], message: string): NexusEngineResult {
  return { ok: false, error: { code, message } }
}

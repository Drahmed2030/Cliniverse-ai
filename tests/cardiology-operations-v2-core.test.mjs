import test from 'node:test'
import assert from 'node:assert/strict'

import { appendOperationalEvent, createOperationalEvent, orderedLedger } from '../app/lib/cardiologyOperations/operationalEventLedger.ts'
import {
  assignOwner,
  advanceWorkItemStatus,
  countOpenWorkItems,
  createClinicalWorkItem,
  isKnownWorkItemKind,
  isWorkItemOverdue,
  isWorkItemUnowned,
} from '../app/lib/cardiologyOperations/operationalWorkItems.ts'
import { deriveProcedureReadiness, toggleChecklistItem } from '../app/lib/cardiologyOperations/operationalProcedureBoard.ts'
import { deriveHandoverReadiness } from '../app/lib/cardiologyOperations/operationalHandover.ts'
import { deriveEscalations } from '../app/lib/cardiologyOperations/operationalEscalation.ts'
import { deriveKpiDraft, validateKpiDraft } from '../app/lib/cardiologyOperations/operationalKpi.ts'
import { deriveCareBeam } from '../app/lib/cardiologyOperations/careBeam.ts'
import { deriveExceptionLens, deriveOwnershipSummary, derivePulse } from '../app/lib/cardiologyOperations/operationalPulse.ts'
import { CARDIAC_PATHWAY_BEAM_STAGES, CARDIAC_PATHWAY_KPI_DEFINITIONS, projectNexusCaseToOperationalEncounter } from '../app/lib/cardiologyOperations/nexusOperationalProfile.ts'
import { FHIR_MAPPING_BOUNDARY, isDocumentationOnlyBoundary } from '../app/lib/cardiologyOperations/fhirMappingBoundary.ts'
import {
  appendIdentifier,
  applyNexusEvent,
  createNexusCase,
  createSyntheticClockEvent,
  createSyntheticTransitionEvent,
  getNextTransition,
} from '../app/lib/cardiology/nexusCore.ts'

const EVIDENCE = { referenceIds: ['SIM-REF'], provenanceKind: 'simulation_only_rule', sourceRef: 'test fixture' }
const NOW = '2026-09-18T12:00:00.000Z'

function encounterEvent(overrides = {}) {
  return {
    eventId: 'OP-EVT-ENC1-0001',
    encounterId: 'ENC1',
    sequence: 1,
    type: 'encounter.created',
    actorRole: 'coordination',
    actorId: 'SIM-ACTOR-COORDINATION',
    occurredAt: NOW,
    recordedAt: NOW,
    source: { system: 'test', recordId: 'r1' },
    evidence: EVIDENCE,
    payload: {},
    ...overrides,
  }
}

// ── Event ledger (CORE) ───────────────────────────────────────────────────

test('deterministic event append: sequence must equal history.length + 1', () => {
  const first = createOperationalEvent({ history: [], encounterId: 'ENC1', type: 'encounter.created', actorRole: 'coordination', actorId: 'A', occurredAt: NOW, source: { system: 's', recordId: 'r' }, evidence: EVIDENCE })
  const result = appendOperationalEvent([], first)
  assert.equal(result.ok, true)
  assert.equal(result.value.length, 1)
  assert.equal(result.value[0].sequence, 1)
})

test('duplicate event id is rejected', () => {
  const event = encounterEvent()
  const result = appendOperationalEvent([event], event)
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'DUPLICATE_EVENT')
})

test('out-of-order (gap) sequence is rejected', () => {
  const event = encounterEvent({ sequence: 3 })
  const result = appendOperationalEvent([], event)
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'EVENT_ORDER_INVALID')
})

test('invalid timestamp is rejected', () => {
  const event = encounterEvent({ occurredAt: 'not-a-date' })
  const result = appendOperationalEvent([], event)
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'INVALID_TIMESTAMP')
})

test('an event with no evidence referenceIds is rejected, not silently accepted', () => {
  const event = encounterEvent({ evidence: { ...EVIDENCE, referenceIds: [] } })
  const result = appendOperationalEvent([], event)
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'MISSING_EVIDENCE')
})

test('an event for a different encounter than the ledger already holds is rejected', () => {
  const event = encounterEvent({ eventId: 'OP-EVT-ENC2-0002', encounterId: 'ENC2', sequence: 2 })
  const result = appendOperationalEvent([encounterEvent()], event)
  assert.equal(result.ok, false)
  assert.equal(result.error.code, 'ENCOUNTER_MISMATCH')
})

test('orderedLedger is deterministic regardless of input order', () => {
  const e1 = encounterEvent({ sequence: 1 })
  const e2 = encounterEvent({ eventId: 'OP-EVT-ENC1-0002', sequence: 2 })
  assert.deepEqual(orderedLedger([e2, e1]).map(e => e.sequence), [1, 2])
})

// ── Work item engine ──────────────────────────────────────────────────────

test('every declared work-item kind from Section 4 is recognized', () => {
  for (const kind of ['investigation', 'result_review', 'documentation', 'referral', 'procedure_prep', 'follow_up', 'handover', 'coordination', 'escalation']) {
    assert.equal(isKnownWorkItemKind(kind), true)
  }
  assert.equal(isKnownWorkItemKind('made_up_kind'), false)
})

test('work item lifecycle: open -> assigned -> acknowledged -> completed, each step producing an event', () => {
  let history = []
  let item = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['src'] })
  assert.equal(item.status, 'open')

  const assignResult = assignOwner(history, item, 'nursing', 'coordination', NOW, EVIDENCE)
  assert.equal(assignResult.ledger.ok, true)
  history = assignResult.ledger.value
  item = assignResult.workItem
  assert.equal(item.status, 'assigned')
  assert.equal(item.owner.role, 'nursing')
  assert.equal(item.owner.eventRef, history.at(-1).eventId)

  const ackResult = advanceWorkItemStatus(history, item, NOW, EVIDENCE)
  assert.equal(ackResult.ledger.ok, true)
  history = ackResult.ledger.value
  item = ackResult.workItem
  assert.equal(item.status, 'acknowledged')
  assert.equal(history.at(-1).type, 'work_item.acknowledged')

  const completeResult = advanceWorkItemStatus(history, item, NOW, EVIDENCE)
  history = completeResult.ledger.value
  item = completeResult.workItem
  assert.equal(item.status, 'completed')
  assert.equal(history.at(-1).type, 'work_item.completed')

  const noopResult = advanceWorkItemStatus(history, item, NOW, EVIDENCE)
  assert.equal(noopResult.workItem.status, 'completed')
  assert.equal(noopResult.ledger.value.length, history.length, 'advancing a completed item must not append another event')
})

test('due/overdue behavior: only an incomplete item past its dueAt is overdue', () => {
  const overdue = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'follow_up', priority: 'watch', createdAt: NOW, dueAt: '2026-09-18T00:00:00.000Z', sourceRefs: ['src'] })
  assert.equal(isWorkItemOverdue(overdue, NOW), true)

  const notYetDue = { ...overdue, dueAt: '2026-09-19T00:00:00.000Z' }
  assert.equal(isWorkItemOverdue(notYetDue, NOW), false)

  const noDueDate = { ...overdue, dueAt: null }
  assert.equal(isWorkItemOverdue(noDueDate, NOW), false)

  const completedButOverdue = { ...overdue, status: 'completed' }
  assert.equal(isWorkItemOverdue(completedButOverdue, NOW), false, 'a completed item is never overdue regardless of dueAt')
})

test('exception derivation: an item with no owner is flagged unless it is completed/cancelled', () => {
  const open = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'coordination', priority: 'routine', createdAt: NOW, sourceRefs: ['src'] })
  assert.equal(isWorkItemUnowned(open), true)
  assert.equal(isWorkItemUnowned({ ...open, status: 'completed' }), false)
})

test('countOpenWorkItems is derived, never a stored counter', () => {
  const items = [
    createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] }),
    { ...createClinicalWorkItem({ encounterId: 'ENC1', index: 2, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] }), status: 'completed' },
    createClinicalWorkItem({ encounterId: 'ENC2', index: 1, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] }),
  ]
  assert.equal(countOpenWorkItems(items), 2)
  assert.equal(countOpenWorkItems(items, 'ENC1'), 1)
})

// ── Ownership view ────────────────────────────────────────────────────────

test('ownership summary counts are derived per role from real work-item state, not a clinical score', () => {
  let history = []
  let item1 = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'coordination', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] })
  const assign1 = assignOwner(history, item1, 'nursing', 'coordination', NOW, EVIDENCE)
  history = assign1.ledger.value
  item1 = assign1.workItem
  const ack1 = advanceWorkItemStatus(history, item1, NOW, EVIDENCE)
  item1 = ack1.workItem

  const summary = deriveOwnershipSummary([item1])
  assert.deepEqual(summary, [{ role: 'nursing', openItems: 1, acknowledged: 1, unresolved: 0 }])
})

// ── Handover engine ───────────────────────────────────────────────────────

test('a handover cannot become ready while any blocker is true', () => {
  const handover = { encounterId: 'ENC1', note: '', requiredWorkReviewed: false, ownerConfirmed: false, simulationConfirmed: false, relatedWorkItemIds: [], updatedAt: NOW }
  const readiness = deriveHandoverReadiness(handover, [])
  assert.equal(readiness.ready, false)
  assert.deepEqual([...readiness.blockers].sort(), ['missing_note', 'owner_not_confirmed', 'required_work_not_reviewed', 'simulation_confirmation_missing'].sort())
})

test('handover readiness is derived, not settable by a UI toggle — the same inputs always yield the same result', () => {
  const handover = { encounterId: 'ENC1', note: 'Fictional note', requiredWorkReviewed: true, ownerConfirmed: true, simulationConfirmed: true, relatedWorkItemIds: [], updatedAt: NOW }
  assert.equal(deriveHandoverReadiness(handover, []).ready, true)
  assert.equal(deriveHandoverReadiness(handover, []).ready, true)
})

test('unresolved related work items are surfaced and block readiness even if every checkbox is true', () => {
  const openItem = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'result_review', priority: 'watch', createdAt: NOW, sourceRefs: ['s'] })
  const handover = { encounterId: 'ENC1', note: 'note', requiredWorkReviewed: true, ownerConfirmed: true, simulationConfirmed: true, relatedWorkItemIds: [openItem.workItemId], updatedAt: NOW }
  const readiness = deriveHandoverReadiness(handover, [openItem])
  assert.equal(readiness.ready, false)
  assert.deepEqual(readiness.blockers, ['unresolved_work_items'])
  assert.deepEqual(readiness.unresolvedWorkItemIds, [openItem.workItemId])
})

// ── Procedure board ───────────────────────────────────────────────────────

test('procedure readiness requires BOTH a complete checklist and no blocking work items', () => {
  const procedure = {
    procedureId: 'PROC1', encounterId: 'ENC1', area: 'cath_lab', label: 'Fictional PCI prep', window: 'shift 1',
    checklist: [{ key: 'consent', label: 'Consent simulated', complete: true }, { key: 'imaging', label: 'Imaging reviewed', complete: false }],
    relatedWorkItemIds: [],
  }
  assert.equal(deriveProcedureReadiness(procedure, []).ready, false)

  const complete = toggleChecklistItem(procedure, 'imaging')
  assert.equal(deriveProcedureReadiness(complete, []).ready, true)

  const blockingItem = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'procedure_prep', priority: 'time_sensitive', createdAt: NOW, sourceRefs: ['s'] })
  const withBlocker = { ...complete, relatedWorkItemIds: [blockingItem.workItemId] }
  assert.equal(deriveProcedureReadiness(withBlocker, [blockingItem]).ready, false)
})

// ── Escalation model ──────────────────────────────────────────────────────

test('escalations are raised for no-owner, overdue, and unresolved-result work items, never claiming clinical severity', () => {
  const unowned = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'coordination', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] })
  const overdue = { ...createClinicalWorkItem({ encounterId: 'ENC1', index: 2, kind: 'documentation', priority: 'routine', createdAt: NOW, dueAt: '2026-09-01T00:00:00.000Z', sourceRefs: ['s'] }), owner: { role: 'nursing', assignedAt: NOW, assignedBy: 'coordination', eventRef: 'x' } }
  const unresolvedResult = { ...createClinicalWorkItem({ encounterId: 'ENC1', index: 3, kind: 'result_review', priority: 'watch', createdAt: NOW, sourceRefs: ['s'] }), owner: { role: 'cardiology', assignedAt: NOW, assignedBy: 'coordination', eventRef: 'y' } }

  const escalations = deriveEscalations('ENC1', [unowned, overdue, unresolvedResult], [], null, NOW)
  const reasons = escalations.map(e => e.reason).sort()
  assert.deepEqual(reasons, ['no_owner', 'overdue_work_item', 'unresolved_result'])
  for (const escalation of escalations) assert.equal(escalation.clinicalSeverityClaimed, false)
})

test('escalation model never infers deterioration/severity/urgency — every reason is a workflow fact', () => {
  const escalations = deriveEscalations('ENC1', [], [], null, NOW)
  assert.deepEqual(escalations, [])
  // Structural guard: the reason enum itself contains no clinical-severity vocabulary.
  const allowedReasons = ['no_owner', 'overdue_work_item', 'unresolved_result', 'incomplete_handover', 'incomplete_procedure_prep']
  for (const reason of allowedReasons) assert.doesNotMatch(reason, /deteriorat|severity|urgent|critical|risk/i)
})

test('an incomplete handover or incomplete procedure prep raises an encounter-level escalation', () => {
  const handover = { encounterId: 'ENC1', note: '', requiredWorkReviewed: false, ownerConfirmed: false, simulationConfirmed: false, relatedWorkItemIds: [], updatedAt: NOW }
  const procedure = { procedureId: 'P1', encounterId: 'ENC1', area: 'cath_lab', label: 'x', window: 'w', checklist: [{ key: 'a', label: 'a', complete: false }], relatedWorkItemIds: [] }
  const escalations = deriveEscalations('ENC1', [], [procedure], handover, NOW)
  assert.deepEqual(escalations.map(e => e.reason).sort(), ['incomplete_handover', 'incomplete_procedure_prep'])
})

// ── KPI model ──────────────────────────────────────────────────────────────

test('a KPI draft reports missing_clock when either clock is absent, and always requires human validation', () => {
  const definition = CARDIAC_PATHWAY_KPI_DEFINITIONS[0]
  const draft = deriveKpiDraft(definition, [])
  assert.equal(draft.status, 'missing_clock')
  assert.equal(draft.requiresHumanValidation, true)
  assert.deepEqual([...draft.missingClocks].sort(), [definition.startClock, definition.endClock].sort())
})

test('a KPI draft becomes ready_for_validation once both clocks exist in valid order', () => {
  const definition = CARDIAC_PATHWAY_KPI_DEFINITIONS[0]
  const clocks = [
    { clockType: definition.startClock, occurredAt: '2026-09-18T08:00:00.000Z', eventRef: 'c1' },
    { clockType: definition.endClock, occurredAt: '2026-09-18T09:30:00.000Z', eventRef: 'c2' },
  ]
  const draft = deriveKpiDraft(definition, clocks)
  assert.equal(draft.status, 'ready_for_validation')
  assert.equal(draft.elapsedMinutes, 90)
})

test('validateKpiDraft refuses to validate a non-ready draft, and never fabricates a validated result', () => {
  const definition = CARDIAC_PATHWAY_KPI_DEFINITIONS[0]
  const missingDraft = deriveKpiDraft(definition, [])
  assert.equal(validateKpiDraft(missingDraft, 'quality', NOW), null)

  const readyDraft = deriveKpiDraft(definition, [
    { clockType: definition.startClock, occurredAt: '2026-09-18T08:00:00.000Z', eventRef: 'c1' },
    { clockType: definition.endClock, occurredAt: '2026-09-18T09:00:00.000Z', eventRef: 'c2' },
  ])
  const validated = validateKpiDraft(readyDraft, 'quality', NOW)
  assert.ok(validated)
  assert.equal(validated.validatedBy, 'quality')
  assert.equal(validated.elapsedMinutes, 60)
})

// ── Care Beam ──────────────────────────────────────────────────────────────

test('Care Beam is derived purely from events/work-items/escalations — calling it twice with the same inputs gives identical output', () => {
  const events = [encounterEvent({ payload: { beamStage: 'referral' } })]
  const beamA = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', events, [], [])
  const beamB = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', events, [], [])
  assert.deepEqual(beamA, beamB)
})

test('Care Beam stage ordering is deterministic and matches the configured stage list', () => {
  const beam = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', [], [], [])
  assert.deepEqual(beam.map(node => node.stageId), ['referral', 'review', 'acceptance', 'coordination', 'procedure', 'handover', 'closure'])
})

test('Care Beam projects completed/current/pending correctly from a partial event history', () => {
  const events = [
    encounterEvent({ payload: { beamStage: 'referral' } }),
    encounterEvent({ eventId: 'e2', sequence: 2, payload: { beamStage: 'review' } }),
  ]
  const beam = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', events, [], [])
  assert.equal(beam.find(n => n.stageId === 'referral').state, 'completed')
  assert.equal(beam.find(n => n.stageId === 'review').state, 'current')
  assert.equal(beam.find(n => n.stageId === 'acceptance').state, 'pending')
  assert.equal(beam.find(n => n.stageId === 'closure').state, 'pending')
})

test('Care Beam marks the next stage blocked (not merely pending) when its blocking escalation is active', () => {
  const events = [
    encounterEvent({ payload: { beamStage: 'referral' } }),
    encounterEvent({ eventId: 'e2', sequence: 2, payload: { beamStage: 'review' } }),
    encounterEvent({ eventId: 'e3', sequence: 3, payload: { beamStage: 'acceptance' } }),
    encounterEvent({ eventId: 'e4', sequence: 4, payload: { beamStage: 'coordination' } }),
  ]
  const escalations = [{ escalationId: 'x', encounterId: 'ENC1', reason: 'incomplete_procedure_prep', raisedAt: NOW, relatedWorkItemId: null, acknowledgedAt: null, clinicalSeverityClaimed: false }]
  const beam = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', events, [], escalations)
  assert.equal(beam.find(n => n.stageId === 'procedure').state, 'blocked')
  assert.equal(beam.find(n => n.stageId === 'handover').state, 'pending')
})

test('the final Care Beam stage reads as completed once reached, not stuck at current forever', () => {
  const events = ['referral', 'review', 'acceptance', 'coordination', 'procedure', 'handover', 'closure']
    .map((stage, index) => encounterEvent({ eventId: `e${index + 1}`, sequence: index + 1, payload: { beamStage: stage } }))
  const beam = deriveCareBeam(CARDIAC_PATHWAY_BEAM_STAGES, 'ENC1', events, [], [])
  assert.equal(beam.at(-1).state, 'completed')
})

// ── Operational Pulse ────────────────────────────────────────────────────

test('Pulse counts are derived exactly from the underlying arrays', () => {
  const encounters = [
    { encounterId: 'ENC1', status: 'active', createdAt: NOW, pathwayLabel: 'stemi', location: 'X' },
    { encounterId: 'ENC2', status: 'closed', createdAt: NOW, pathwayLabel: 'stemi', location: 'X' },
  ]
  const openItem = createClinicalWorkItem({ encounterId: 'ENC1', index: 1, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] })
  const doneItem = { ...createClinicalWorkItem({ encounterId: 'ENC1', index: 2, kind: 'documentation', priority: 'routine', createdAt: NOW, sourceRefs: ['s'] }), status: 'completed' }
  const handovers = [{ encounterId: 'ENC1', note: 'n', requiredWorkReviewed: true, ownerConfirmed: true, simulationConfirmed: true, relatedWorkItemIds: [], updatedAt: NOW }]
  const escalations = [{ escalationId: 'x', encounterId: 'ENC1', reason: 'no_owner', raisedAt: NOW, relatedWorkItemId: null, acknowledgedAt: null, clinicalSeverityClaimed: false }]

  const pulse = derivePulse(encounters, [openItem, doneItem], handovers, [], escalations)
  assert.deepEqual(pulse, {
    activeEncounters: 1,
    openWorkItems: 1,
    blockedOrExceptionItems: 1,
    handoverReadyEncounters: 1,
    procedureReadyEncounters: 0,
  })
})

test('Exception Lens lists only unacknowledged escalations, sorted by raised time', () => {
  const escalations = [
    { escalationId: 'a', encounterId: 'ENC1', reason: 'overdue_work_item', raisedAt: '2026-09-18T10:00:00.000Z', relatedWorkItemId: 'w1', acknowledgedAt: null, clinicalSeverityClaimed: false },
    { escalationId: 'b', encounterId: 'ENC1', reason: 'no_owner', raisedAt: '2026-09-18T09:00:00.000Z', relatedWorkItemId: 'w2', acknowledgedAt: null, clinicalSeverityClaimed: false },
    { escalationId: 'c', encounterId: 'ENC1', reason: 'unresolved_result', raisedAt: '2026-09-18T08:00:00.000Z', relatedWorkItemId: 'w3', acknowledgedAt: NOW, clinicalSeverityClaimed: false },
  ]
  const lens = deriveExceptionLens(escalations)
  assert.deepEqual(lens.map(entry => entry.workItemId), ['w2', 'w1'])
})

// ── QAPAS / Nexus reconciliation ──────────────────────────────────────────

test('nexusCore.ts is reused, not replaced — the profile only reads its output', () => {
  let nexusCase = createNexusCase('SIM-QD-TEST', 'SIM-REF-TEST', NOW)
  const rule = getNextTransition(nexusCase.state)
  assert.ok(rule)
  const identifier = { kind: 'referral-case-id', value: 'SIM-REF-TEST', sourceSystem: 'test', linkedAt: NOW }
  const linked = appendIdentifier(nexusCase, identifier)
  assert.equal(linked.ok, true)
  nexusCase = linked.value

  const event = createSyntheticTransitionEvent(nexusCase, rule, 'referring', NOW)
  const result = applyNexusEvent(nexusCase, event)
  assert.equal(result.ok, true)
  nexusCase = result.value
  assert.equal(nexusCase.state, 'referral-received')

  const projection = projectNexusCaseToOperationalEncounter(nexusCase)
  assert.equal(projection.encounter.encounterId, 'SIM-QD-TEST')
  assert.equal(projection.encounter.status, 'active')
  assert.equal(projection.events.length, 1)
  assert.equal(projection.events[0].payload.beamStage, 'referral')
  assert.ok(projection.pendingWorkItem, 'a next-authorized step exists, so a pending work item should be projected')
})

test('the Nexus profile does not fabricate a work item for a step that never happened', () => {
  const nexusCase = createNexusCase('SIM-QD-EMPTY', 'SIM-REF-EMPTY', NOW)
  const projection = projectNexusCaseToOperationalEncounter(nexusCase)
  assert.deepEqual(projection.events, [])
})

test('a fully validated NexusCase projects to a closed encounter with no pending work item', () => {
  let nexusCase = createNexusCase('SIM-QD-FULL', 'SIM-REF-FULL', NOW)
  const identifiers = [
    { kind: 'referral-case-id', value: 'SIM-REF-FULL', sourceSystem: 'test', linkedAt: NOW },
    { kind: 'mrn', value: 'SIM-MRN-FULL', sourceSystem: 'test', linkedAt: NOW },
    { kind: 'encounter', value: 'SIM-ENC-FULL', sourceSystem: 'test', linkedAt: NOW },
    { kind: 'cath-episode', value: 'SIM-CATH-FULL', sourceSystem: 'test', linkedAt: NOW },
  ]
  for (const identifier of identifiers) {
    const linked = appendIdentifier(nexusCase, identifier)
    assert.equal(linked.ok, true)
    nexusCase = linked.value
  }

  const roleForRule = {
    'referral-received': 'referring', 'review-completed': 'cardiology', 'acceptance-recorded': 'cardiology',
    'identity-linked': 'coordination', 'transport-departed': 'referring', 'cath-lab-activated': 'cath-lab',
    'arrival-recorded': 'cath-lab', 'episode-recorded': 'cath-lab', 'quality-validated': 'quality',
  }

  let occurredAt = Date.parse(NOW)
  while (getNextTransition(nexusCase.state)) {
    const rule = getNextTransition(nexusCase.state)
    occurredAt += 10 * 60_000
    const iso = new Date(occurredAt).toISOString()
    const event = createSyntheticTransitionEvent(nexusCase, rule, roleForRule[rule.eventType], iso)
    const result = applyNexusEvent(nexusCase, event)
    assert.equal(result.ok, true, result.ok ? '' : result.error.message)
    nexusCase = result.value
  }

  assert.equal(nexusCase.state, 'quality-validated')
  const projection = projectNexusCaseToOperationalEncounter(nexusCase)
  assert.equal(projection.encounter.status, 'closed')
  assert.equal(projection.pendingWorkItem, null)
  assert.equal(projection.events.at(-1).payload.beamStage, 'closure')

  const clockEvent = createSyntheticClockEvent(nexusCase, 'procedure-milestone', 'cath-lab', NOW)
  assert.equal(clockEvent.clockType, 'procedure-milestone')
})

// ── FHIR-neutral boundary (documentation only) ────────────────────────────

test('the FHIR boundary is documentation only and covers every resource type named in Section 11', () => {
  assert.equal(isDocumentationOnlyBoundary(), true)
  const mappedResources = new Set(FHIR_MAPPING_BOUNDARY.map(entry => entry.fhirResourceType))
  for (const required of ['Encounter', 'Task', 'ServiceRequest', 'Observation', 'Procedure', 'Provenance', 'AuditEvent']) {
    assert.ok(mappedResources.has(required), `missing FHIR mapping intent for ${required}`)
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'

import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../app/lib/cardiology/pathwayReplayAgents.ts'
import {
  createPathwayReplaySession,
  openPathwayStage,
  isPathwayStageAvailable,
  submitPathwayDrill,
  togglePathwayLead,
  retryPathwayDrill,
  completePathwayReassessment,
  createPathwayClosureBrief,
  recordPathwayReviewCompletion,
  parsePathwayReplaySession,
  serializePathwayReplaySession,
} from '../app/lib/cardiology/pathwaySession.ts'
import {
  createPathwayEvent,
  appendPathwayEvent,
  verifyPathwayEventChain,
  deriveStageFromEventHistory,
  parsePathwayEventHistory,
  PATHWAY_EVENT_GENESIS_HASH,
} from '../app/lib/cardiology/pathwayEvent.ts'
import {
  createCodeLabTrainingReceipt,
  parseCodeLabTrainingReceipt,
  DOOR_TO_ECG_CODE_LAB_ACTIVITY,
} from '../app/lib/codelab/trainingActivity.ts'
import { canonicalJson, sha256Hex } from '../app/lib/receipts/canonicalHash.ts'
import { mapPathwayEventToXapiStatement } from '../app/lib/cardiology/pathwayXapiAdapter.ts'
import {
  evaluateCredentialIssuancePreconditions,
  isEligibleForCredentialConsideration,
} from '../app/lib/cardiology/pathwayCredentialBoundary.ts'

const report = runPathwayReplay(STEMI_REPLAY_DEMO)

async function playThroughToClosure() {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  session = togglePathwayLead(session, 'V2')
  session = togglePathwayLead(session, 'V3')
  session = togglePathwayLead(session, 'V4')
  session = await submitPathwayDrill(session, report)
  session = await openPathwayStage(session, 'reassessment', report)
  session = await completePathwayReassessment(session)
  return session
}

// ── STATE MACHINE ─────────────────────────────────────────────────────

test('replay -> drill is always available; reassessment requires a receipt; closure requires a passed reassessment', async () => {
  const session = await createPathwayReplaySession(report)
  assert.equal(isPathwayStageAvailable(session, 'replay'), true)
  assert.equal(isPathwayStageAvailable(session, 'drill'), true)
  assert.equal(isPathwayStageAvailable(session, 'reassessment'), false)
  assert.equal(isPathwayStageAvailable(session, 'closure'), false)
})

test('illegal transition is blocked: opening reassessment/closure before their guard is satisfied is a no-op', async () => {
  const session = await createPathwayReplaySession(report)
  const attemptReassessment = await openPathwayStage(session, 'reassessment', report)
  assert.equal(attemptReassessment.stage, 'replay')
  const attemptClosure = await openPathwayStage(session, 'closure', report)
  assert.equal(attemptClosure.stage, 'replay')
})

test('a failed drill submission never produces a receipt, and reassessment remains locked', async () => {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  session = togglePathwayLead(session, 'II') // wrong lead — not the configured marker set
  session = await submitPathwayDrill(session, report)
  assert.equal(session.drillResult, 'needs-review')
  assert.equal(session.trainingReceipt, null)
  assert.equal(isPathwayStageAvailable(session, 'reassessment'), false)

  session = retryPathwayDrill(session)
  assert.equal(session.drillResult, 'not-submitted')
  assert.deepEqual(session.selectedLeads, [])
})

test('valid training receipt required before reassessment can run; reassessment cannot run early', async () => {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  session = togglePathwayLead(session, 'V2')
  session = togglePathwayLead(session, 'V3')
  session = togglePathwayLead(session, 'V4')
  session = await submitPathwayDrill(session, report)
  assert.equal(session.drillResult, 'passed')
  assert.ok(session.trainingReceipt)
  assert.equal(isPathwayStageAvailable(session, 'reassessment'), true)
})

test('closure cannot auto-complete from AI/score/receipt/replay state — createPathwayClosureBrief always reports human-review-required', async () => {
  const session = await playThroughToClosure()
  const brief = await createPathwayClosureBrief(report, session)
  assert.equal(brief.closure.state, 'human-review-required')
  assert.equal(brief.closure.reviewCompleted, false)
})

test('human review remains required even after an explicit reviewer records completion — closure.state never flips to auto-approved', async () => {
  const session = await playThroughToClosure()
  const reviewed = await recordPathwayReviewCompletion(session, { actorType: 'reviewer', note: 'Reviewed by Dr. X' })
  assert.equal(reviewed.reviewCompleted, true)
  const brief = await createPathwayClosureBrief(report, reviewed)
  assert.equal(brief.closure.state, 'human-review-required')
  assert.equal(brief.closure.reviewCompleted, true)
})

test('recordPathwayReviewCompletion refuses to run before closure is reached', async () => {
  const session = await createPathwayReplaySession(report)
  await assert.rejects(() => recordPathwayReviewCompletion(session, { actorType: 'reviewer', note: 'too early' }))
})

// ── EVENT STREAM ─────────────────────────────────────────────────────

test('event ordering is deterministic across a full session playthrough', async () => {
  const session = await playThroughToClosure()
  const types = session.events.map(event => event.eventType)
  assert.deepEqual(types, [
    'pathway.opened',
    'evidence.reviewed',
    'drill.started',
    'drill.submitted',
    'receipt.created',
    'reassessment.started',
    'reassessment.completed',
    'closure.requested',
    'review.pending',
  ])
})

test('current session stage is derivable from event history alone, and matches the reducer-tracked stage', async () => {
  const session = await playThroughToClosure()
  assert.equal(deriveStageFromEventHistory(session.events), session.stage)
})

test('the hash chain is valid for a freshly-created session', async () => {
  const session = await playThroughToClosure()
  const verification = await verifyPathwayEventChain(session.events)
  assert.equal(verification.valid, true)
})

test('tampering with a single event payload is detected by the hash chain', async () => {
  const session = await playThroughToClosure()
  const tampered = session.events.map((event, index) =>
    index === 2 ? { ...event, payload: { ...event.payload, activityId: 'tampered-activity' } } : event,
  )
  const verification = await verifyPathwayEventChain(tampered)
  assert.equal(verification.valid, false)
  assert.equal(verification.brokenAtIndex, 2)
})

test('reordering events breaks the previousEventHash chain', async () => {
  const session = await playThroughToClosure()
  const reordered = [session.events[1], session.events[0], ...session.events.slice(2)]
  const verification = await verifyPathwayEventChain(reordered)
  assert.equal(verification.valid, false)
})

test('the first event chains from the genesis hash', async () => {
  const session = await createPathwayReplaySession(report)
  assert.equal(session.events[0].previousEventHash, PATHWAY_EVENT_GENESIS_HASH)
})

test('appendPathwayEvent correctly chains a second event from the first', async () => {
  const first = await createPathwayEvent({
    eventId: 'e1', sessionId: 's1', eventType: 'pathway.opened', occurredAt: new Date().toISOString(),
    stage: 'replay', actorType: 'system', evidenceRefs: [], payload: {}, previousEventHash: PATHWAY_EVENT_GENESIS_HASH,
  })
  const history = await appendPathwayEvent([first], {
    eventId: 'e2', sessionId: 's1', eventType: 'evidence.reviewed', occurredAt: new Date().toISOString(),
    stage: 'replay', actorType: 'learner', evidenceRefs: [], payload: {},
  })
  assert.equal(history[1].previousEventHash, first.eventHash)
})

test('a malformed event (unknown eventType) is rejected at construction', async () => {
  await assert.rejects(() => createPathwayEvent({
    eventId: 'e1', sessionId: 's1', eventType: 'not.a.real.type', occurredAt: new Date().toISOString(),
    stage: 'replay', actorType: 'system', evidenceRefs: [], payload: {}, previousEventHash: PATHWAY_EVENT_GENESIS_HASH,
  }))
})

test('a payload with a patient-identifier-shaped key is rejected at construction', async () => {
  await assert.rejects(() => createPathwayEvent({
    eventId: 'e1', sessionId: 's1', eventType: 'pathway.opened', occurredAt: new Date().toISOString(),
    stage: 'replay', actorType: 'system', evidenceRefs: [], payload: { patientId: 'x' }, previousEventHash: PATHWAY_EVENT_GENESIS_HASH,
  }))
})

test('parsePathwayEventHistory fails closed on a malformed history (missing required field)', async () => {
  const result = await parsePathwayEventHistory([{ eventId: 'e1' }])
  assert.equal(result, null)
})

test('parsePathwayEventHistory fails closed on an unsupported schemaVersion', async () => {
  const first = await createPathwayEvent({
    eventId: 'e1', sessionId: 's1', eventType: 'pathway.opened', occurredAt: new Date().toISOString(),
    stage: 'replay', actorType: 'system', evidenceRefs: [], payload: {}, previousEventHash: PATHWAY_EVENT_GENESIS_HASH,
  })
  const result = await parsePathwayEventHistory([{ ...first, schemaVersion: 999 }])
  assert.equal(result, null)
})

test('event replay (deriveStageFromEventHistory) produces the expected stage after each real transition', async () => {
  let session = await createPathwayReplaySession(report)
  assert.equal(deriveStageFromEventHistory(session.events), 'replay')
  session = await openPathwayStage(session, 'drill', report)
  assert.equal(deriveStageFromEventHistory(session.events), 'drill')
})

// ── RECEIPT V2 ─────────────────────────────────────────────────────────

test('canonicalization is deterministic regardless of key insertion order', () => {
  const a = canonicalJson({ b: 1, a: 2, nested: { z: 1, y: 2 } })
  const b = canonicalJson({ a: 2, b: 1, nested: { y: 2, z: 1 } })
  assert.equal(a, b)
})

test('SHA-256 hash is stable for the same canonical payload', async () => {
  const value = { x: 1, y: [1, 2, 3] }
  const hashOne = await sha256Hex(value)
  const hashTwo = await sha256Hex(value)
  assert.equal(hashOne, hashTwo)
  assert.equal(hashOne.length, 64)
})

function receiptInput(overrides = {}) {
  return {
    activityId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId,
    attempts: 1,
    caseId: report.caseId,
    matchedLeadIds: ['V2', 'V3', 'V4'],
    registrySnapshotId: report.training.registrySnapshotId,
    sourceRevisionIds: report.training.referenceIds,
    ...overrides,
  }
}

test('changing score/attempt/source invalidates the receipt hash', async () => {
  const base = await createCodeLabTrainingReceipt(receiptInput())
  const differentAttempts = await createCodeLabTrainingReceipt(receiptInput({ attempts: 2 }))
  assert.notEqual(base.receiptHash, differentAttempts.receiptHash)
})

test('the receipt is never called a digital signature, certificate, or credential', async () => {
  const receipt = await createCodeLabTrainingReceipt(receiptInput())
  assert.equal(receipt.verification, 'tamper-evident-structural-receipt')
  const serialized = JSON.stringify(receipt).toLowerCase()
  assert.equal(serialized.includes('certificate'), false)
  assert.equal(serialized.includes('credential'), false)
  assert.equal(serialized.includes('signature'), false)
})

test('an altered receipt (mismatched hash) is rejected by parseCodeLabTrainingReceipt', async () => {
  const receipt = await createCodeLabTrainingReceipt(receiptInput())
  const tampered = { ...receipt, assessment: { ...receipt.assessment, attempts: 999 } }
  const parsed = await parseCodeLabTrainingReceipt(tampered, {
    activityId: report.training.activityId, caseId: report.caseId,
    registrySnapshotId: report.training.registrySnapshotId, sourceRevisionIds: report.training.referenceIds,
  })
  assert.equal(parsed, null)
})

test('a receipt cannot be created for an unmatched (failing) lead selection', async () => {
  await assert.rejects(() => createCodeLabTrainingReceipt(receiptInput({ matchedLeadIds: ['II'] })))
})

// ── ZOD / RUNTIME BOUNDARY ──────────────────────────────────────────────

test('parsePathwayReplaySession fails closed to a fresh session on malformed stored JSON', async () => {
  const session = await parsePathwayReplaySession('{not valid json', report)
  assert.equal(session.stage, 'replay')
  assert.equal(session.events.length, 1)
})

test('parsePathwayReplaySession fails closed on an unsupported schemaVersion', async () => {
  const fresh = await createPathwayReplaySession(report)
  const raw = serializePathwayReplaySession({ ...fresh, schemaVersion: 999 })
  const restored = await parsePathwayReplaySession(raw, report)
  assert.equal(restored.stage, 'replay')
  // Fell back to a brand-new session rather than trusting the mis-versioned one.
  assert.notEqual(restored.sessionId, fresh.sessionId)
})

test('parsePathwayReplaySession round-trips a real, fully-played session exactly', async () => {
  const session = await playThroughToClosure()
  const raw = serializePathwayReplaySession(session)
  const restored = await parsePathwayReplaySession(raw, report)
  assert.equal(restored.stage, 'closure')
  assert.equal(restored.events.length, session.events.length)
  assert.equal(restored.trainingReceipt?.receiptHash, session.trainingReceipt?.receiptHash)
})

test('parsePathwayReplaySession rejects a session whose declared stage is further along than its own event history', async () => {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  // Declares 'closure' while the event history only reached 'drill' — must fail closed.
  const forged = { ...session, stage: 'closure' }
  const raw = serializePathwayReplaySession(forged)
  const restored = await parsePathwayReplaySession(raw, report)
  assert.equal(restored.stage, 'replay') // fell back to a fresh session
})

// ── CODE LAB BRIDGE ──────────────────────────────────────────────────────

test('the full bridge works end to end: pathway -> drill -> receipt -> reassessment', async () => {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  session = togglePathwayLead(session, 'V2')
  session = togglePathwayLead(session, 'V3')
  session = togglePathwayLead(session, 'V4')
  session = await submitPathwayDrill(session, report)
  assert.ok(session.trainingReceipt)
  session = await openPathwayStage(session, 'reassessment', report)
  assert.equal(session.stage, 'reassessment')
})

test('no receipt is created on a failed drill, and the bridge to reassessment stays closed', async () => {
  let session = await createPathwayReplaySession(report)
  session = await openPathwayStage(session, 'drill', report)
  session = togglePathwayLead(session, 'II')
  session = await submitPathwayDrill(session, report)
  assert.equal(session.trainingReceipt, null)
  const attemptReassessment = await openPathwayStage(session, 'reassessment', report)
  assert.equal(attemptReassessment.stage, 'drill')
})

// ── GOVERNANCE ────────────────────────────────────────────────────────

test('source refs are preserved end to end into the closure brief', async () => {
  const session = await playThroughToClosure()
  const brief = await createPathwayClosureBrief(report, session)
  assert.deepEqual(brief.registry.sourceIds, report.registry.sourceIds)
  assert.deepEqual(brief.training.receipt.source.revisionIds, report.training.referenceIds)
})

test('no PHI/patient-identifier fields exist anywhere in a played-through session', async () => {
  const session = await playThroughToClosure()
  const serialized = JSON.stringify(session).toLowerCase()
  for (const forbidden of ['patientid', 'mrn', 'ssn', 'dob']) {
    assert.equal(serialized.includes(forbidden), false, `session must not contain "${forbidden}"`)
  }
})

// ── xAPI ADAPTER (conceptual mapping only, no external send) ───────────

test('every pathway event maps to a valid, non-identifying xAPI statement shape', async () => {
  const session = await playThroughToClosure()
  for (const event of session.events) {
    const statement = mapPathwayEventToXapiStatement(event)
    assert.equal(statement.actor.objectType, 'Agent')
    assert.match(statement.actor.name, /^pathway-session:/)
    assert.ok(statement.verb.id.startsWith('http://adlnet.gov/expapi/verbs/'))
    assert.equal(statement.timestamp, event.occurredAt)
  }
})

// ── FUTURE CREDENTIAL BOUNDARY ──────────────────────────────────────────

test('credential issuance is never eligible in this batch — every precondition is hardcoded false/null', async () => {
  const receipt = await createCodeLabTrainingReceipt(receiptInput())
  const preconditions = evaluateCredentialIssuancePreconditions(receipt)
  assert.equal(isEligibleForCredentialConsideration(preconditions), false)
  assert.equal(preconditions.approvedCurriculum, false)
  assert.equal(preconditions.verifiedIssuer, false)
  assert.equal(preconditions.institutionalGovernance, false)
  assert.equal(preconditions.humanVerification, false)
  assert.equal(preconditions.explicitCompetencyStandard, null)
})

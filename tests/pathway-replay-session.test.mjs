import test from 'node:test'
import assert from 'node:assert/strict'
import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../app/lib/cardiology/pathwayReplayAgents.ts'
import {
  completePathwayReassessment,
  createPathwayClosureBrief,
  createPathwayReplaySession,
  isPathwayStageAvailable,
  openPathwayStage,
  parsePathwayReplaySession,
  retryPathwayDrill,
  serializePathwayReplaySession,
  submitPathwayDrill,
  togglePathwayLead,
} from '../app/lib/cardiology/pathwaySession.ts'

const report = runPathwayReplay(STEMI_REPLAY_DEMO)

test('the pathway session gates later stages until training and reassessment pass', () => {
  const initial = createPathwayReplaySession(report)

  assert.equal(initial.stage, 'replay')
  assert.equal(isPathwayStageAvailable(initial, 'drill'), true)
  assert.equal(isPathwayStageAvailable(initial, 'reassessment'), false)
  assert.equal(isPathwayStageAvailable(initial, 'closure'), false)
  assert.deepEqual(openPathwayStage(initial, 'closure'), initial)
})

test('the deterministic drill records failed and successful attempts without provider calls', () => {
  let session = openPathwayStage(createPathwayReplaySession(report), 'drill')
  session = togglePathwayLead(session, 'II')
  session = submitPathwayDrill(session, report)

  assert.equal(session.attempts, 1)
  assert.equal(session.drillResult, 'needs-review')
  assert.equal(session.trainingReceipt, null)

  session = retryPathwayDrill(session)
  for (const lead of ['V2', 'V3', 'V4']) session = togglePathwayLead(session, lead)
  session = submitPathwayDrill(session, report)

  assert.equal(session.attempts, 2)
  assert.equal(session.drillResult, 'passed')
  assert.equal(session.trainingReceipt?.activityId, 'door-to-ecg-drill-v1')
  assert.equal(session.trainingReceipt?.assessment.attempts, 2)
  assert.equal(session.trainingReceipt?.source.registrySnapshotId, report.registry.snapshotId)
  assert.equal(isPathwayStageAvailable(session, 'reassessment'), true)
})

test('a completed reassessment compiles one reviewable closure brief while keeping closure human-owned', () => {
  let session = openPathwayStage(createPathwayReplaySession(report), 'drill')
  for (const lead of ['V2', 'V3', 'V4']) session = togglePathwayLead(session, lead)
  session = submitPathwayDrill(session, report)
  session = openPathwayStage(session, 'reassessment')
  session = completePathwayReassessment(session)
  const brief = createPathwayClosureBrief(report, session)

  assert.equal(session.stage, 'closure')
  assert.equal(brief.schemaVersion, '1.1')
  assert.equal(brief.caseId, 'SIM-REPLAY-001')
  assert.equal(brief.pathway.dataMode, 'fictional-simulation')
  assert.equal(brief.training.result, 'configured-marker-matched')
  assert.deepEqual(brief.training.matchedLeads, ['V2', 'V3', 'V4'])
  assert.equal(brief.training.receipt.receiptId, session.trainingReceipt.receiptId)
  assert.equal(brief.training.receipt.contentVersion, '1.0.0-draft')
  assert.equal(brief.reassessment.baselineMinutes, 12)
  assert.equal(brief.reassessment.illustrativeMinutes, 8)
  assert.equal(brief.registry.snapshotId, report.registry.snapshotId)
  assert.deepEqual(brief.registry.sourceIds, ['DEMO-PATHWAY-RULESET-V1'])
  assert.equal(brief.registry.clinicalExecution.state, 'blocked')
  assert.equal(brief.closure.state, 'human-review-required')
  assert.match(brief.closure.reasons.join(' '), /evidence gap/i)
})

test('session restore accepts only the matching, internally consistent synthetic contract', () => {
  let session = openPathwayStage(createPathwayReplaySession(report), 'drill')
  for (const lead of ['V2', 'V3', 'V4']) session = togglePathwayLead(session, lead)
  session = submitPathwayDrill(session, report)
  session = openPathwayStage(session, 'reassessment')

  assert.deepEqual(parsePathwayReplaySession(serializePathwayReplaySession(session), report), session)

  const wrongCase = { ...session, caseId: 'REAL-001' }
  assert.deepEqual(
    parsePathwayReplaySession(JSON.stringify(wrongCase), report),
    createPathwayReplaySession(report),
  )

  const impossibleClosure = {
    ...createPathwayReplaySession(report),
    stage: 'closure',
  }
  assert.deepEqual(
    parsePathwayReplaySession(JSON.stringify(impossibleClosure), report),
    createPathwayReplaySession(report),
  )

  const unknownLead = { ...session, selectedLeads: ['V2', 'V3', 'V4', 'X'] }
  assert.deepEqual(
    parsePathwayReplaySession(JSON.stringify(unknownLead), report),
    createPathwayReplaySession(report),
  )

  const tamperedReceipt = {
    ...session,
    trainingReceipt: {
      ...session.trainingReceipt,
      contentVersion: 'unreviewed-drift',
    },
  }
  assert.deepEqual(
    parsePathwayReplaySession(JSON.stringify(tamperedReceipt), report),
    createPathwayReplaySession(report),
  )
})

test('closure brief creation fails closed before the required learning loop completes', () => {
  assert.throws(
    () => createPathwayClosureBrief(report, createPathwayReplaySession(report)),
    /completed synthetic training and reassessment/i,
  )

  let completed = openPathwayStage(createPathwayReplaySession(report), 'drill')
  for (const lead of ['V2', 'V3', 'V4']) completed = togglePathwayLead(completed, lead)
  completed = submitPathwayDrill(completed, report)
  completed = completePathwayReassessment(completed)

  assert.throws(
    () => createPathwayClosureBrief(report, { ...completed, activityId: 'different-activity' }),
    /completed synthetic training and reassessment/i,
  )
})

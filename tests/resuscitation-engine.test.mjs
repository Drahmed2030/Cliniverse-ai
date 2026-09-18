import test from 'node:test'
import assert from 'node:assert/strict'

import { RESUSCITATION_SCENARIOS, validateResuscitationScenarios, NOT_PROMOTED_THIS_BATCH } from '../app/lib/resuscitation/scenarios/index.ts'
import { VF_PVT_SCENARIO } from '../app/lib/resuscitation/scenarios/vfPvtScenario.ts'
import { PEA_ASYSTOLE_SCENARIO } from '../app/lib/resuscitation/scenarios/peaAsystoleScenario.ts'
import { UNSTABLE_BRADYCARDIA_SCENARIO } from '../app/lib/resuscitation/scenarios/unstableBradycardiaScenario.ts'
import { validateResuscitationScenario } from '../app/lib/resuscitation/scenarioContract.ts'
import {
  applyResuscitationAction,
  checkResuscitationTimeouts,
  createResuscitationEngineState,
} from '../app/lib/resuscitation/scenarioEngine.ts'
import { presentRapidReplayFeedback, rewindToCheckpoint, hasResumedAfterRetry } from '../app/lib/resuscitation/rapidReplay.ts'
import {
  createResuscitationEvent,
  appendResuscitationEvent,
  verifyResuscitationEventChain,
  RESUSCITATION_EVENT_GENESIS_HASH,
} from '../app/lib/resuscitation/resuscitationEvent.ts'
import { deriveResuscitationPerformance, deriveOverallScore } from '../app/lib/resuscitation/performanceModel.ts'
import { RESUSCITATION_COMPETENCY_DOMAINS, UNSUPPORTED_RESUSCITATION_METRICS, isUnsupportedResuscitationMetric } from '../app/lib/resuscitation/competencyDomains.ts'
import { generateResuscitationDebrief } from '../app/lib/resuscitation/debriefEngine.ts'
import { recommendNextPractice } from '../app/lib/resuscitation/adaptiveNextPractice.ts'
import { findResuscitationDrillsForDomain } from '../app/lib/resuscitation/curriculumContract.ts'
import { createResuscitationEvidenceReceipt, receiptClaimsCertificationOrCredential } from '../app/lib/resuscitation/evidenceReceipt.ts'
import { readUnsupportedHardwareMetrics } from '../app/lib/resuscitation/hardwareAdapterBoundary.ts'
import { readUnassignedTeamRoles } from '../app/lib/resuscitation/teamModeBoundary.ts'

function playPath(scenario, actionIds) {
  let state = createResuscitationEngineState(scenario)
  for (const actionId of actionIds) state = applyResuscitationAction(scenario, state, actionId)
  return state
}

// ── SCENARIO ENGINE ───────────────────────────────────────────────────

test('exactly 3 governed scenarios exist, all pass manifest validation', () => {
  assert.doesNotThrow(() => validateResuscitationScenarios())
  assert.equal(RESUSCITATION_SCENARIOS.length, 3)
  assert.deepEqual(RESUSCITATION_SCENARIOS.map(s => s.scenarioId).sort(), [
    'resus_pea_asystole_v1', 'resus_unstable_bradycardia_v1', 'resus_vf_pvt_v1',
  ])
})

test('PE and Sepsis are NOT promoted as governed scenarios this batch', () => {
  const ids = RESUSCITATION_SCENARIOS.map(s => s.scenarioId)
  assert.equal(ids.includes('mega_pe_01'), false)
  assert.equal(ids.includes('mega_sepsis_01'), false)
  const titles = RESUSCITATION_SCENARIOS.map(s => s.title.toLowerCase())
  assert.equal(titles.some(title => title.includes('pulmonary embolism')), false)
  assert.equal(titles.some(title => title.includes('sepsis') || title.includes('septic')), false)
  assert.deepEqual([...NOT_PROMOTED_THIS_BATCH].sort(), ['mega_pe_01', 'mega_sepsis_01'])
})

test('manifest validation rejects a scenario with a dangling transition', () => {
  const broken = { ...VF_PVT_SCENARIO, phases: VF_PVT_SCENARIO.phases.map(p => p.phaseId === 'init' ? { ...p, actions: [{ ...p.actions[0], transitionTo: 'nonexistent_phase' }] } : p) }
  assert.throws(() => validateResuscitationScenario(broken))
})

test('manifest validation rejects a scenario with no checkpoint phase', () => {
  const broken = { ...VF_PVT_SCENARIO, phases: VF_PVT_SCENARIO.phases.map(p => ({ ...p, isCheckpoint: false })) }
  assert.throws(() => validateResuscitationScenario(broken))
})

test('illegal transitions are blocked: an unknown actionId throws', () => {
  const state = createResuscitationEngineState(VF_PVT_SCENARIO)
  assert.throws(() => applyResuscitationAction(VF_PVT_SCENARIO, state, 'not_a_real_action'))
})

test('illegal transitions are blocked: an action from a different phase cannot be applied out of order', () => {
  const state = createResuscitationEngineState(VF_PVT_SCENARIO) // in 'init'
  assert.throws(() => applyResuscitationAction(VF_PVT_SCENARIO, state, 'start_cpr')) // belongs to 'cpr'
})

test('illegal transitions are blocked: no action can be applied once the engine is completed', () => {
  const state = playPath(PEA_ASYSTOLE_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_pea_asystole', 'epi_early', 'identify_reversible_cause', 'continue_cpr_2min', 'rosc_achieved', 'abc_post'])
  assert.equal(state.status, 'completed')
  assert.throws(() => applyResuscitationAction(PEA_ASYSTOLE_SCENARIO, state, 'confirm_arrest'))
})

test('deterministic transitions: the same action sequence always produces the same resulting phase and status', () => {
  const path = ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock']
  const a = playPath(VF_PVT_SCENARIO, path)
  const b = playPath(VF_PVT_SCENARIO, path)
  assert.deepEqual(a.currentPhaseId, b.currentPhaseId)
  assert.deepEqual(a.status, b.status)
  assert.deepEqual(a.history, b.history)
})

test('timeout behavior: exceeding a timing window auto-transitions to the declared timeout phase', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock'])
  assert.equal(state.currentPhaseId, 'post_shock_cpr')
  const afterTimeout = checkResuscitationTimeouts(VF_PVT_SCENARIO, state, 130_000)
  assert.equal(afterTimeout.currentPhaseId, 'rhythm_recheck')
})

test('timeout behavior: staying under the window does nothing', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock'])
  const stillWaiting = checkResuscitationTimeouts(VF_PVT_SCENARIO, state, 10_000)
  assert.equal(stillWaiting.currentPhaseId, 'post_shock_cpr')
})

test('repeat-cycle behavior: the VF/pVT scenario can cycle back through shock_phase more than once', () => {
  let state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock', 'resume_cpr_2min', 'still_vf_shock_again'])
  assert.equal(state.currentPhaseId, 'shock_phase')
  state = applyResuscitationAction(VF_PVT_SCENARIO, state, 'charge_clear_shock')
  assert.equal(state.currentPhaseId, 'post_shock_cpr')
})

test('PEA/asystole never uses the defibrillation_sequence domain — a shock is never the correct action', () => {
  assert.equal(PEA_ASYSTOLE_SCENARIO.competencyDomains.includes('defibrillation_sequence'), false)
  // Matched on actionId, not label text — several correct actions'
  // labels legitimately contain the substring "shock" inside the word
  // "non-shockable" (e.g. "PEA/asystole confirmed (non-shockable)").
  const shockActions = PEA_ASYSTOLE_SCENARIO.phases.flatMap(p => p.actions).filter(a => a.actionId.startsWith('shock_'))
  assert.ok(shockActions.length > 0)
  for (const action of shockActions) assert.equal(action.correct, false)
})

test('unstable bradycardia never uses the post_rosc domain — no arrest occurs in this scenario', () => {
  assert.equal(UNSTABLE_BRADYCARDIA_SCENARIO.competencyDomains.includes('post_rosc'), false)
})

// ── RAPID-CYCLE DELIBERATE PRACTICE (RCDP) ───────────────────────────────

test('a critical error pauses the segment for feedback rather than ending the scenario', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'check_pulse_again'])
  assert.equal(state.status, 'paused_for_feedback')
})

test('focused, source-bound feedback appears for the specific error', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'check_pulse_again'])
  const feedback = presentRapidReplayFeedback(state)
  assert.ok(feedback)
  assert.match(feedback.feedback, /CPR should not be delayed/)
  assert.ok(feedback.sourceRefs.length > 0)
})

test('rewind returns to the correct checkpoint (the last checkpoint phase, not the failed action itself)', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock', 'resume_cpr_2min', 'atropine_vf'])
  assert.equal(state.status, 'paused_for_feedback')
  const rewound = rewindToCheckpoint(VF_PVT_SCENARIO, state)
  assert.equal(rewound.currentPhaseId, 'post_shock_cpr') // the nearest checkpoint, not 'init'
  assert.equal(rewound.criticalErrorsSinceCheckpoint, 0)
})

test('retry works: after rewind, the same or a corrected action can be resubmitted', () => {
  let state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'check_pulse_again'])
  state = rewindToCheckpoint(VF_PVT_SCENARIO, state)
  state = applyResuscitationAction(VF_PVT_SCENARIO, state, 'start_cpr')
  assert.equal(state.status, 'running')
  assert.equal(state.currentPhaseId, 'rhythm_check_phase')
})

test('mastery (successful retry) allows continuation past the checkpoint', () => {
  let state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'check_pulse_again'])
  state = rewindToCheckpoint(VF_PVT_SCENARIO, state)
  state = applyResuscitationAction(VF_PVT_SCENARIO, state, 'start_cpr')
  assert.equal(hasResumedAfterRetry(state), true)
})

test('rewind throws if the engine is not actually paused — cannot rewind an already-running or completed engine', () => {
  const running = createResuscitationEngineState(VF_PVT_SCENARIO)
  assert.throws(() => rewindToCheckpoint(VF_PVT_SCENARIO, running))
})

test('the scenario does not end after one error unless criticalErrorPolicy is explicitly end_scenario', () => {
  for (const scenario of RESUSCITATION_SCENARIOS) assert.equal(scenario.criticalErrorPolicy, 'pause_for_feedback')
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'check_pulse_again'])
  assert.notEqual(state.status, 'completed')
})

// ── COMPETENCY MODEL ──────────────────────────────────────────────────

test('performance metrics are derived only from measurable, actually-occurred events', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr'])
  const signals = deriveResuscitationPerformance(VF_PVT_SCENARIO, state)
  const recognitionSignal = signals.find(s => s.competencyDomain === 'recognition')
  assert.equal(recognitionSignal.score, 1)
  assert.equal(recognitionSignal.eventRefs.length, 1)
  const medicationSignal = signals.find(s => s.competencyDomain === 'medication_timing')
  assert.equal(medicationSignal.score, null) // no medication action occurred yet
})

test('unsupported hardware metrics (compression depth/rate, ventilation quality, recoil, hands-off time) remain explicitly unavailable', () => {
  const readings = readUnsupportedHardwareMetrics()
  assert.equal(readings.deviceConnected, false)
  assert.equal(readings.readings.length, UNSUPPORTED_RESUSCITATION_METRICS.length)
  for (const reading of readings.readings) assert.equal(reading.value, null)
  assert.equal(isUnsupportedResuscitationMetric('compressionDepth'), false) // camelCase isn't the declared snake_case id
  assert.equal(isUnsupportedResuscitationMetric('compression_depth'), true)
})

test('every competency domain in the shared vocabulary declares measurable:true with a real evidence basis — no domain silently claims unmeasured objectivity', () => {
  for (const domain of RESUSCITATION_COMPETENCY_DOMAINS) {
    assert.equal(domain.measurable, true)
    assert.ok(domain.evidenceBasis.length > 20)
  }
})

test('no fake objective score: deriveOverallScore returns null rather than a fabricated number when nothing is measured yet', () => {
  const overall = deriveOverallScore([])
  assert.equal(overall.totalScore, null)
})

test('deriveOverallScore never hides the component metrics — callers still have deriveResuscitationPerformance\'s full signal list available', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr'])
  const signals = deriveResuscitationPerformance(VF_PVT_SCENARIO, state)
  const overall = deriveOverallScore(signals)
  assert.equal(overall.componentCount, signals.length)
})

// ── DEBRIEF ENGINE ────────────────────────────────────────────────────

test('debrief output is deterministic and event-informed — same state produces the same debrief content', async () => {
  const state = playPath(PEA_ASYSTOLE_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_pea_asystole', 'epi_early', 'identify_reversible_cause', 'continue_cpr_2min', 'rosc_achieved', 'abc_post'])
  let events = await appendResuscitationEvent([], { eventId: 'e1', sessionId: 's1', eventType: 'simulation.started', occurredAt: new Date().toISOString(), scenarioId: PEA_ASYSTOLE_SCENARIO.scenarioId, actorType: 'learner', payload: {} })
  const debriefA = generateResuscitationDebrief(PEA_ASYSTOLE_SCENARIO, state, events)
  const debriefB = generateResuscitationDebrief(PEA_ASYSTOLE_SCENARIO, state, events)
  assert.equal(debriefA.description, debriefB.description)
  assert.deepEqual(debriefA.analysis, debriefB.analysis)
})

test('debrief has all five structured sections: reaction, description, analysis, summary, next practice', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock', 'resume_cpr_2min', 'rhythm_organized_rosc', 'abc_post'])
  const debrief = generateResuscitationDebrief(VF_PVT_SCENARIO, state, [])
  assert.ok(debrief.reaction.length > 0)
  assert.ok(debrief.description.length > 0)
  assert.ok(debrief.analysis.length > 0)
  assert.ok(debrief.summary.length > 0)
  assert.ok(Array.isArray(debrief.nextPractice))
})

test('debrief summary never claims certification or a competency declaration', () => {
  const state = playPath(VF_PVT_SCENARIO, ['confirm_arrest', 'start_cpr', 'confirm_vf', 'charge_clear_shock', 'resume_cpr_2min', 'rhythm_organized_rosc', 'abc_post'])
  const debrief = generateResuscitationDebrief(VF_PVT_SCENARIO, state, [])
  assert.match(debrief.summary, /not a certification or competency declaration/)
})

// ── RECEIPTS ──────────────────────────────────────────────────────────

test('event chain hashing: tampering with an event is detected', async () => {
  let events = await appendResuscitationEvent([], { eventId: 'e1', sessionId: 's1', eventType: 'simulation.started', occurredAt: new Date().toISOString(), scenarioId: 'x', actorType: 'learner', payload: {} })
  events = await appendResuscitationEvent(events, { eventId: 'e2', sessionId: 's1', eventType: 'action.selected', occurredAt: new Date().toISOString(), scenarioId: 'x', actorType: 'learner', payload: { actionId: 'a' } })
  const valid = await verifyResuscitationEventChain(events)
  assert.equal(valid.valid, true)
  const tampered = [events[0], { ...events[1], payload: { actionId: 'tampered' } }]
  const invalid = await verifyResuscitationEventChain(tampered)
  assert.equal(invalid.valid, false)
  assert.equal(invalid.brokenAtIndex, 1)
})

test('the first event chains from the genesis hash', async () => {
  const event = await createResuscitationEvent({ eventId: 'e1', sessionId: 's1', eventType: 'simulation.started', occurredAt: new Date().toISOString(), scenarioId: 'x', actorType: 'learner', payload: {}, previousEventHash: RESUSCITATION_EVENT_GENESIS_HASH })
  assert.equal(event.previousEventHash, RESUSCITATION_EVENT_GENESIS_HASH)
})

test('a simulation receipt uses the shared evidence layer (canonicalHash-based, tamper-evident) and requires real eventRefs', async () => {
  const receipt = await createResuscitationEvidenceReceipt({
    subtype: 'simulation', unitOrScenarioId: VF_PVT_SCENARIO.scenarioId, sourceRefs: VF_PVT_SCENARIO.sourceRefs,
    eventRefs: ['e1', 'e2'], payload: { passed: true },
  })
  assert.equal(receipt.verification, 'tamper-evident-structural-receipt')
  assert.equal(receipt.receiptHash.length, 64)
  await assert.rejects(() => createResuscitationEvidenceReceipt({ subtype: 'simulation', unitOrScenarioId: VF_PVT_SCENARIO.scenarioId, sourceRefs: VF_PVT_SCENARIO.sourceRefs, eventRefs: [], payload: {} }))
})

test('a receipt never claims certification, credential, or signature', async () => {
  const receipt = await createResuscitationEvidenceReceipt({
    subtype: 'lesson', unitOrScenarioId: 'bls_01_chain', sourceRefs: ['app/lib/codelab/blsLessons.ts'], eventRefs: ['e1'], payload: {},
  })
  assert.equal(receiptClaimsCertificationOrCredential(receipt), false)
})

test('receipt hash changes when the underlying payload changes — tampering with the score invalidates it', async () => {
  const base = { subtype: 'simulation', unitOrScenarioId: VF_PVT_SCENARIO.scenarioId, sourceRefs: VF_PVT_SCENARIO.sourceRefs, eventRefs: ['e1'] }
  const receiptA = await createResuscitationEvidenceReceipt({ ...base, payload: { passed: true } })
  const receiptB = await createResuscitationEvidenceReceipt({ ...base, payload: { passed: false } })
  assert.notEqual(receiptA.receiptHash, receiptB.receiptHash)
})

// ── ADAPTIVE NEXT PRACTICE ────────────────────────────────────────────

test('a weak competency domain maps only to a governed drill unit — never a generated one', () => {
  const signals = [
    { competencyDomain: 'medication_timing', measurable: true, score: 0.3, evidenceBasis: 'x', eventRefs: [], reviewStatus: 'pending_clinical_review' },
  ]
  const recommendations = recommendNextPractice(signals)
  assert.equal(recommendations.length, 1)
  const drills = findResuscitationDrillsForDomain('medication_timing')
  assert.ok(drills.some(drill => drill.unitId === recommendations[0].recommendedUnitId))
})

test('a domain above the mastery threshold produces no recommendation', () => {
  const signals = [{ competencyDomain: 'recognition', measurable: true, score: 0.95, evidenceBasis: 'x', eventRefs: [], reviewStatus: 'pending_clinical_review' }]
  assert.equal(recommendNextPractice(signals).length, 0)
})

test('a weak domain with no governed drill available recommends nothing rather than fabricating one', () => {
  const signals = [{ competencyDomain: 'closed_loop_communication', measurable: true, score: 0.1, evidenceBasis: 'x', eventRefs: [], reviewStatus: 'pending_clinical_review' }]
  const drills = findResuscitationDrillsForDomain('closed_loop_communication')
  const recommendations = recommendNextPractice(signals)
  assert.equal(recommendations.length, drills.length ? 1 : 0)
})

// ── FUTURE BOUNDARIES (architecture only) ────────────────────────────

test('team mode boundary: every role is unassigned — no real multiplayer session exists', () => {
  const roles = readUnassignedTeamRoles()
  assert.equal(roles.length, 5)
  for (const role of roles) assert.equal(role.assignedLearnerId, null)
})

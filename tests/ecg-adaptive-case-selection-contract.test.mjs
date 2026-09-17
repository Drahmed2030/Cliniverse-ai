import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgAdaptiveCaseSelectionContractV1,
  selectNextEcgCaseV1,
} from '../app/lib/clinicalIntelligence/ecgAdaptiveCaseSelectionContract.ts'

const now = '2026-09-09T18:30:00.000Z'

function input(overrides = {}) {
  return {
    selectionVersion: '1.0.0',
    learnerId: 'learner-1',
    now,
    skillStates: [
      {
        skillId: 'ecg.rhythm.sinus',
        mastery: 0.82,
        band: 'PROFICIENT',
        nextReviewAt: '2026-09-08T18:30:00.000Z',
      },
      {
        skillId: 'ecg.axis.frontal',
        mastery: 0.45,
        band: 'NOVICE',
        nextReviewAt: '2026-09-16T18:30:00.000Z',
      },
    ],
    candidates: [
      {
        caseId: 'case-due-review',
        learnerEligible: true,
        governedSkillIds: ['ecg.rhythm.sinus'],
        qualityScore: 0.95,
        lastSeenAt: '2026-09-05T18:30:00.000Z',
      },
      {
        caseId: 'case-weak-axis',
        learnerEligible: true,
        governedSkillIds: ['ecg.axis.frontal'],
        qualityScore: 0.9,
        lastSeenAt: '2026-09-07T18:30:00.000Z',
      },
    ],
    ...overrides,
  }
}

test('selects a due governed review deterministically', () => {
  const result = selectNextEcgCaseV1(input())
  assert.equal(result.decision, 'SELECTED')
  assert.equal(result.caseId, 'case-due-review')
  assert.equal(result.targetSkillId, 'ecg.rhythm.sinus')
  assert.equal(result.reason, 'DUE_REVIEW')
})

test('never selects a non learner-eligible case', () => {
  const candidate = {
    caseId: 'case-hold',
    learnerEligible: false,
    governedSkillIds: ['ecg.axis.frontal'],
    qualityScore: 1,
  }
  const result = selectNextEcgCaseV1(input({ candidates: [candidate] }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('no-learner-eligible-candidate'))
})

test('targets unseen skills before well-mastered spaced practice when no review is due', () => {
  const result = selectNextEcgCaseV1(input({
    skillStates: [{
      skillId: 'ecg.rhythm.sinus',
      mastery: 0.95,
      band: 'MASTERED',
      nextReviewAt: '2026-12-01T00:00:00.000Z',
    }],
    candidates: [
      {
        caseId: 'case-mastered',
        learnerEligible: true,
        governedSkillIds: ['ecg.rhythm.sinus'],
        qualityScore: 1,
        lastSeenAt: '2026-09-01T00:00:00.000Z',
      },
      {
        caseId: 'case-unseen',
        learnerEligible: true,
        governedSkillIds: ['ecg.qtc.assessment'],
        qualityScore: 0.8,
      },
    ],
  }))
  assert.equal(result.caseId, 'case-unseen')
  assert.equal(result.reason, 'UNSEEN_SKILL')
})

test('critical misses increase priority without mutating mastery input', () => {
  const skillStates = [
    {
      skillId: 'ecg.axis.frontal',
      mastery: 0.7,
      band: 'DEVELOPING',
      nextReviewAt: '2026-09-20T00:00:00.000Z',
      recentCriticalMiss: true,
    },
    {
      skillId: 'ecg.qtc.assessment',
      mastery: 0.7,
      band: 'DEVELOPING',
      nextReviewAt: '2026-09-20T00:00:00.000Z',
    },
  ]
  const before = structuredClone(skillStates)
  const result = selectNextEcgCaseV1(input({
    skillStates,
    candidates: [
      { caseId: 'axis', learnerEligible: true, governedSkillIds: ['ecg.axis.frontal'], qualityScore: 0.8 },
      { caseId: 'qtc', learnerEligible: true, governedSkillIds: ['ecg.qtc.assessment'], qualityScore: 0.8 },
    ],
  }))
  assert.equal(result.caseId, 'axis')
  assert.deepEqual(skillStates, before)
})

test('fails closed on malformed mastery, dates, quality, duplicates, or source-label selection', () => {
  const malformed = [
    input({ now: 'not-a-date' }),
    input({ skillStates: [{ skillId: 'x', mastery: Number.NaN, band: 'NOVICE' }] }),
    input({ candidates: [{ caseId: 'x', learnerEligible: true, governedSkillIds: ['s'], qualityScore: 2 }] }),
    input({ candidates: [
      { caseId: 'dup', learnerEligible: true, governedSkillIds: ['s1'], qualityScore: 0.5 },
      { caseId: 'dup', learnerEligible: true, governedSkillIds: ['s2'], qualityScore: 0.5 },
    ] }),
    input({ candidates: [{
      caseId: 'source-driven',
      learnerEligible: true,
      governedSkillIds: ['s'],
      qualityScore: 0.5,
      prohibitedSourceLabelSelection: true,
    }] }),
  ]
  for (const candidate of malformed) assert.equal(selectNextEcgCaseV1(candidate).decision, 'HOLD')
})

test('tie-breaking is deterministic by case then skill id', () => {
  const result = selectNextEcgCaseV1(input({
    skillStates: [],
    candidates: [
      { caseId: 'case-b', learnerEligible: true, governedSkillIds: ['skill-b'], qualityScore: 0.8 },
      { caseId: 'case-a', learnerEligible: true, governedSkillIds: ['skill-a'], qualityScore: 0.8 },
    ],
  }))
  assert.equal(result.caseId, 'case-a')
})

test('contract preserves governance and scoring boundaries', () => {
  const contract = describeEcgAdaptiveCaseSelectionContractV1()
  assert.equal(contract.learnerEligibleCasesOnly, true)
  assert.equal(contract.datasetLabelsNotSelectionAuthority, true)
  assert.equal(contract.casePromotionProducedHere, false)
  assert.equal(contract.scoringProducedHere, false)
  assert.equal(contract.masteryProducedHere, false)
})

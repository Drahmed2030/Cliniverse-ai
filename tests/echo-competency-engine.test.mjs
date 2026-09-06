import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_SKILL_GRAPH, validateEchoSkillGraph } from '../app/lib/competency/echoSkillGraph.ts'
import { scoreEchoAssessment } from '../app/lib/competency/echoAssessmentContract.ts'
import { deriveEchoSkillMastery, recommendNextEchoSkill, toMasteryEvidence } from '../app/lib/competency/echoMasteryEngine.ts'

const task = {
  id: 'echo-a4c-view-recognition-v1',
  caseId: 'echo-a4c-normal-cardionetworks-v1-en',
  skillId: 'echo.view.a4c-recognition',
  version: '1.0.0',
  type: 'single-best-answer',
  prompt: 'Which standard transthoracic view is shown?',
  options: [
    { id: 'a4c', label: 'Apical four-chamber' },
    { id: 'plax', label: 'Parasternal long-axis' },
    { id: 'psax', label: 'Parasternal short-axis' },
  ],
  answerKey: ['a4c'],
  rationale: 'The governed source is labelled as an apical four-chamber cine.',
  maxScore: 1,
  evidenceBoundary: 'View-recognition only; no diagnostic or quantitative inference.',
}

test('Echo skill graph is acyclic at the declared prerequisite level and measurable', () => {
  assert.doesNotThrow(() => validateEchoSkillGraph())
  assert.ok(ECHO_SKILL_GRAPH.length >= 5)
  assert.ok(ECHO_SKILL_GRAPH.every(skill => skill.measurableOutcome.length > 20))
})

test('assessment scoring is deterministic and preserves confidence and latency', () => {
  const result = scoreEchoAssessment(task, {
    taskId: task.id,
    selectedOptionIds: ['a4c'],
    confidence: 4,
    responseTimeMs: 6200,
    attemptedAt: '2026-09-06T10:00:00.000Z',
  })
  assert.equal(result.normalizedScore, 100)
  assert.equal(result.correct, true)
  assert.equal(result.confidence, 4)
  assert.equal(result.responseTimeMs, 6200)
})

test('mastery is interpretable, recency-weighted and produces a next-skill recommendation', () => {
  const first = scoreEchoAssessment(task, {
    taskId: task.id,
    selectedOptionIds: ['plax'],
    confidence: 4,
    responseTimeMs: 8500,
    attemptedAt: '2026-09-06T10:00:00.000Z',
  })
  const second = scoreEchoAssessment(task, {
    taskId: task.id,
    selectedOptionIds: ['a4c'],
    confidence: 5,
    responseTimeMs: 4300,
    attemptedAt: '2026-09-06T10:10:00.000Z',
  })

  const evidence = [
    toMasteryEvidence(first, '2026-09-06T10:00:00.000Z'),
    toMasteryEvidence(second, '2026-09-06T10:10:00.000Z'),
  ]
  const mastery = deriveEchoSkillMastery('echo.view.a4c-recognition', evidence)
  assert.equal(mastery.evidenceCount, 2)
  assert.equal(mastery.score, 67)
  assert.equal(mastery.band, 'developing')
  assert.equal(recommendNextEchoSkill([mastery]), 'echo.view.a4c-recognition')
})

import { getEchoSkill } from './echoSkillGraph.ts'

export type EchoAssessmentType = 'single-best-answer' | 'multi-select' | 'ordered-identification'
export type EchoConfidence = 1 | 2 | 3 | 4 | 5

export interface EchoAssessmentOption {
  id: string
  label: string
}

export interface EchoAssessmentTask {
  id: string
  caseId: string
  skillId: string
  version: string
  type: EchoAssessmentType
  prompt: string
  options: EchoAssessmentOption[]
  answerKey: string[]
  rationale: string
  maxScore: number
  evidenceBoundary: string
}

export interface EchoAssessmentResponse {
  taskId: string
  selectedOptionIds: string[]
  confidence: EchoConfidence
  responseTimeMs: number
  attemptedAt: string
}

export interface EchoAssessmentResult {
  selectedAnswer: string
  taskId: string
  skillId: string
  rawScore: number
  normalizedScore: number
  confidence: EchoConfidence
  responseTimeMs: number
  correct: boolean
}

export function validateEchoAssessmentTask(task: EchoAssessmentTask): void {
  getEchoSkill(task.skillId)
  if (!task.id || !task.caseId || !task.version) throw new Error('Echo assessment identity is required.')
  if (!task.prompt.trim() || !task.rationale.trim() || !task.evidenceBoundary.trim()) {
    throw new Error(`Echo assessment copy is incomplete: ${task.id}`)
  }
  if (task.options.length < 2) throw new Error(`Echo assessment must expose at least two options: ${task.id}`)
  const optionIds = new Set(task.options.map(option => option.id))
  if (optionIds.size !== task.options.length) throw new Error(`Duplicate option id in Echo assessment: ${task.id}`)
  if (!task.answerKey.length || task.answerKey.some(id => !optionIds.has(id))) {
    throw new Error(`Echo assessment answer key is invalid: ${task.id}`)
  }
  if (task.maxScore <= 0) throw new Error(`Echo assessment maxScore must be positive: ${task.id}`)
}

export function scoreEchoAssessment(
  task: EchoAssessmentTask,
  response: EchoAssessmentResponse,
): EchoAssessmentResult {
  validateEchoAssessmentTask(task)
  if (response.taskId !== task.id) throw new Error(`Response/task mismatch: ${response.taskId}`)
  if (response.responseTimeMs < 0) throw new Error('Echo assessment response time cannot be negative.')

  const expected = new Set(task.answerKey)
  const selected = new Set(response.selectedOptionIds)
  const intersection = [...selected].filter(id => expected.has(id)).length
  const falsePositives = [...selected].filter(id => !expected.has(id)).length
  const denominator = Math.max(expected.size, 1)
  const rawFraction = Math.max(0, Math.min(1, (intersection - falsePositives) / denominator))
  const rawScore = Number((rawFraction * task.maxScore).toFixed(2))
  const normalizedScore = Math.round(rawFraction * 100)
  const correct = selected.size === expected.size && [...selected].every(id => expected.has(id))

  return {
    taskId: task.id,
    skillId: task.skillId,
    selectedAnswer: JSON.stringify(response.selectedOptionIds),
    rawScore,
    normalizedScore,
    confidence: response.confidence,
    responseTimeMs: response.responseTimeMs,
    correct,
  }
}

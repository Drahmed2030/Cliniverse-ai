import type { EchoAssessmentResult } from './echoAssessmentContract.ts'
import { getEchoSkill } from './echoSkillGraph.ts'

export type EchoMasteryBand = 'novice' | 'developing' | 'proficient' | 'mastered'

export interface EchoMasteryEvidence {
  taskId: string
  skillId: string
  normalizedScore: number
  confidence: number
  responseTimeMs: number
  observedAt: string
}

export interface EchoSkillMastery {
  skillId: string
  evidenceCount: number
  score: number
  confidenceCalibration: number
  band: EchoMasteryBand
  lastObservedAt: string | null
}

const bandForScore = (score: number): EchoMasteryBand => {
  if (score >= 90) return 'mastered'
  if (score >= 75) return 'proficient'
  if (score >= 50) return 'developing'
  return 'novice'
}

export function toMasteryEvidence(result: EchoAssessmentResult, observedAt: string): EchoMasteryEvidence {
  getEchoSkill(result.skillId)
  return {
    taskId: result.taskId,
    skillId: result.skillId,
    normalizedScore: result.normalizedScore,
    confidence: result.confidence,
    responseTimeMs: result.responseTimeMs,
    observedAt,
  }
}

export function deriveEchoSkillMastery(
  skillId: string,
  evidence: readonly EchoMasteryEvidence[],
): EchoSkillMastery {
  getEchoSkill(skillId)
  const relevant = evidence
    .filter(item => item.skillId === skillId)
    .sort((a, b) => Date.parse(a.observedAt) - Date.parse(b.observedAt))

  if (!relevant.length) {
    return {
      skillId,
      evidenceCount: 0,
      score: 0,
      confidenceCalibration: 0,
      band: 'novice',
      lastObservedAt: null,
    }
  }

  // Recency-weighted evidence keeps the model interpretable while allowing improvement to matter.
  let weightedScore = 0
  let totalWeight = 0
  let calibrationTotal = 0
  relevant.forEach((item, index) => {
    const weight = index + 1
    weightedScore += item.normalizedScore * weight
    totalWeight += weight
    const expectedConfidence = item.normalizedScore / 20
    calibrationTotal += Math.max(0, 100 - Math.abs(item.confidence - expectedConfidence) * 25)
  })

  const score = Math.round(weightedScore / totalWeight)
  const confidenceCalibration = Math.round(calibrationTotal / relevant.length)

  return {
    skillId,
    evidenceCount: relevant.length,
    score,
    confidenceCalibration,
    band: bandForScore(score),
    lastObservedAt: relevant.at(-1)?.observedAt ?? null,
  }
}

export function recommendNextEchoSkill(masteries: readonly EchoSkillMastery[]): string {
  const byId = new Map(masteries.map(mastery => [mastery.skillId, mastery]))
  const candidateIds = [
    'echo.view.a4c-recognition',
    'echo.anatomy.a4c-landmarks',
    'echo.function.lv-global-visual',
    'echo.motion.regional-pattern',
    'echo.cardiomyopathy.pattern-recognition',
  ]

  for (const skillId of candidateIds) {
    const skill = getEchoSkill(skillId)
    const prerequisitesMet = skill.prerequisites.every(prerequisite => {
      const mastery = byId.get(prerequisite)
      return mastery && (mastery.band === 'proficient' || mastery.band === 'mastered')
    })
    if (!skill.prerequisites.length || prerequisitesMet) {
      const mastery = byId.get(skillId)
      if (!mastery || mastery.band === 'novice' || mastery.band === 'developing') return skillId
    }
  }

  return 'echo.cardiomyopathy.pattern-recognition'
}

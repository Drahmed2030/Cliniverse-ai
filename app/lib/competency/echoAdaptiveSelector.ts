import type { EchoBatchRecord } from '../clinicalMedia/echoBatchManifest.ts'
import type { EchoSkillMastery } from './echoMasteryEngine.ts'
import { getEchoSkill } from './echoSkillGraph.ts'

export interface EchoAdaptiveCandidate {
  caseId: string
  skillId: string
  difficulty: 'foundation' | 'developing' | 'proficient'
  qaState: EchoBatchRecord['qaState']
  qualityScore: number
  lastSeenAt?: string | null
}

export interface EchoAdaptiveSelection {
  caseId: string
  skillId: string
  reason: 'target-weak-skill' | 'unlock-next-skill' | 'spaced-review'
  priorityScore: number
}

const bandWeight: Record<EchoSkillMastery['band'], number> = {
  novice: 100,
  developing: 75,
  proficient: 35,
  mastered: 10,
}

export function selectNextEchoCase(params: {
  masteries: readonly EchoSkillMastery[]
  candidates: readonly EchoAdaptiveCandidate[]
  now: string
}): EchoAdaptiveSelection | null {
  const masteryBySkill = new Map(params.masteries.map(item => [item.skillId, item]))
  const nowMs = Date.parse(params.now)

  const scored = params.candidates
    .filter(candidate => candidate.qaState === 'learner-ready')
    .map(candidate => {
      const skill = getEchoSkill(candidate.skillId)
      const mastery = masteryBySkill.get(candidate.skillId)
      const prerequisitesMet = skill.prerequisites.every(prerequisite => {
        const prerequisiteMastery = masteryBySkill.get(prerequisite)
        return prerequisiteMastery && (prerequisiteMastery.band === 'proficient' || prerequisiteMastery.band === 'mastered')
      })
      if (!prerequisitesMet) return null

      const masteryPriority = mastery ? bandWeight[mastery.band] : 100
      const qualityBonus = Math.max(0, Math.min(100, candidate.qualityScore)) / 10
      const lastSeenMs = candidate.lastSeenAt ? Date.parse(candidate.lastSeenAt) : NaN
      const daysSinceSeen = Number.isNaN(lastSeenMs) ? 999 : Math.max(0, (nowMs - lastSeenMs) / 86_400_000)
      const spacingBonus = Math.min(30, daysSinceSeen)
      const priorityScore = Math.round(masteryPriority + qualityBonus + spacingBonus)

      const reason: EchoAdaptiveSelection['reason'] =
        !mastery || mastery.band === 'novice' || mastery.band === 'developing'
          ? 'target-weak-skill'
          : daysSinceSeen >= 14
            ? 'spaced-review'
            : 'unlock-next-skill'

      return { caseId: candidate.caseId, skillId: candidate.skillId, reason, priorityScore }
    })
    .filter((item): item is EchoAdaptiveSelection => Boolean(item))
    .sort((a, b) => b.priorityScore - a.priorityScore || a.caseId.localeCompare(b.caseId))

  return scored[0] ?? null
}

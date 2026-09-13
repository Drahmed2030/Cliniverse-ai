import type { EchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import type { EchoStudyCompetencyState } from './echoStudyCompetencyState.ts'
import { projectEchoStudyCompetencyProgress } from './echoStudyCompetencyState.ts'
import type { EchoStudySessionState } from './echoStudySessionController.ts'
import { projectEchoStudySession } from './echoStudySessionController.ts'
import type { EchoSkillMastery } from './echoMasteryEngine.ts'

export interface EchoStudySummary {
  studyId: string
  viewedPercent: number
  visitedPercent: number
  competencyCoveragePercent: number
  completedCompetencyTasks: number
  skillSignals: { skillId: string; band: EchoSkillMastery['band']; score: number }[]
  status: 'in-progress' | 'viewed-complete' | 'assessed-complete'
}

export function buildEchoStudySummary(params: {
  study: EchoStudy
  session: EchoStudySessionState
  competency?: EchoStudyCompetencyState | null
}): EchoStudySummary {
  const sessionProjection = projectEchoStudySession(params)
  const competencyProjection = params.competency
    ? projectEchoStudyCompetencyProgress(params.study, params.competency)
    : { coveragePercent: 0, completedTasks: 0 }

  const masteryBySkill = new Map<string, EchoSkillMastery>()
  for (const snapshot of Object.values(params.competency?.byClipId ?? {})) {
    for (const mastery of snapshot.masteries) {
      const current = masteryBySkill.get(mastery.skillId)
      if (!current || mastery.evidenceCount >= current.evidenceCount) masteryBySkill.set(mastery.skillId, mastery)
    }
  }

  const skillSignals = [...masteryBySkill.values()]
    .map(mastery => ({ skillId: mastery.skillId, band: mastery.band, score: mastery.score }))
    .sort((a, b) => a.skillId.localeCompare(b.skillId))

  const status: EchoStudySummary['status'] =
    competencyProjection.coveragePercent === 100
      ? 'assessed-complete'
      : sessionProjection.visitedPercent === 100
        ? 'viewed-complete'
        : 'in-progress'

  return {
    studyId: params.study.studyId,
    viewedPercent: sessionProjection.viewingProgressPercent,
    visitedPercent: sessionProjection.visitedPercent,
    competencyCoveragePercent: competencyProjection.coveragePercent,
    completedCompetencyTasks: competencyProjection.completedTasks,
    skillSignals,
    status,
  }
}

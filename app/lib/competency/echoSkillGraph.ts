export type EchoSkillDomain =
  | 'view-recognition'
  | 'chamber-anatomy'
  | 'global-function'
  | 'regional-wall-motion'
  | 'cardiomyopathy-patterns'
  | 'valve-recognition'

export type EchoSkillLevel = 'foundation' | 'developing' | 'proficient'

export interface EchoSkillNode {
  id: string
  domain: EchoSkillDomain
  label: string
  level: EchoSkillLevel
  prerequisites: string[]
  measurableOutcome: string
}

export const ECHO_SKILL_GRAPH: readonly EchoSkillNode[] = [
  {
    id: 'echo.view.a4c-recognition',
    domain: 'view-recognition',
    label: 'Recognize the apical four-chamber view',
    level: 'foundation',
    prerequisites: [],
    measurableOutcome: 'Correctly identifies an A4C cine from its chamber and valve configuration.',
  },
  {
    id: 'echo.anatomy.a4c-landmarks',
    domain: 'chamber-anatomy',
    label: 'Identify A4C landmarks',
    level: 'foundation',
    prerequisites: ['echo.view.a4c-recognition'],
    measurableOutcome: 'Correctly identifies both atria, both ventricles, atrioventricular valves and septa.',
  },
  {
    id: 'echo.function.lv-global-visual',
    domain: 'global-function',
    label: 'Recognize gross LV global-function patterns',
    level: 'developing',
    prerequisites: ['echo.view.a4c-recognition', 'echo.anatomy.a4c-landmarks'],
    measurableOutcome: 'Distinguishes broad source-supported LV global-function patterns without numerical EF estimation.',
  },
  {
    id: 'echo.motion.regional-pattern',
    domain: 'regional-wall-motion',
    label: 'Recognize regional wall-motion patterns',
    level: 'developing',
    prerequisites: ['echo.function.lv-global-visual'],
    measurableOutcome: 'Recognizes source-supported regional motion patterns from governed cine material.',
  },
  {
    id: 'echo.cardiomyopathy.pattern-recognition',
    domain: 'cardiomyopathy-patterns',
    label: 'Recognize high-yield cardiomyopathy patterns',
    level: 'proficient',
    prerequisites: ['echo.function.lv-global-visual'],
    measurableOutcome: 'Selects the best supported cardiomyopathy pattern from approved educational options.',
  },
] as const

const SKILL_BY_ID = new Map(ECHO_SKILL_GRAPH.map(skill => [skill.id, skill]))

export function getEchoSkill(skillId: string): EchoSkillNode {
  const skill = SKILL_BY_ID.get(skillId)
  if (!skill) throw new Error(`Unknown Echo skill: ${skillId}`)
  return skill
}

export function validateEchoSkillGraph(): void {
  const ids = new Set<string>()
  for (const skill of ECHO_SKILL_GRAPH) {
    if (ids.has(skill.id)) throw new Error(`Duplicate Echo skill id: ${skill.id}`)
    ids.add(skill.id)
    if (!skill.measurableOutcome.trim()) throw new Error(`Echo skill lacks measurable outcome: ${skill.id}`)
  }
  for (const skill of ECHO_SKILL_GRAPH) {
    for (const prerequisite of skill.prerequisites) {
      if (!ids.has(prerequisite)) throw new Error(`Unknown prerequisite ${prerequisite} for ${skill.id}`)
      if (prerequisite === skill.id) throw new Error(`Echo skill cannot depend on itself: ${skill.id}`)
    }
  }
}

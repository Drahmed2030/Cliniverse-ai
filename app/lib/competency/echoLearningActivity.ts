import type { EchoAssessmentTask } from './echoAssessmentContract.ts'
import type { EchoSkillDomain } from './echoSkillGraph.ts'
import { getEchoSkill } from './echoSkillGraph.ts'
import { validateEchoAssessmentTask } from './echoAssessmentContract.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../clinicalMedia/licensedEchoAsset.ts'

// EchoLearningActivity — Batch 6. A thin, typed wrapper that names WHICH
// underlying EchoAssessmentTask a study-level activity uses — it does not
// duplicate the scoring/evaluation contract (scoreEchoAssessment already
// owns that). 'next_best_evidence' is the new activity type this batch
// adds: an educational-reasoning prompt about what to inspect next to
// reduce interpretive uncertainty. It must never read as patient-management
// advice — assertNextBestEvidenceFraming enforces that on every task used
// this way, the same pattern echoQualityGate.ts already uses for its
// learner-safety disclaimer check.

export type EchoLearningActivityType = 'view_recognition' | 'landmark_identification' | 'pattern_discrimination' | 'next_best_evidence'

export interface EchoLearningActivity {
  activityKey: string
  studyKey: string
  type: EchoLearningActivityType
  competencyDomain: EchoSkillDomain
  /** The EchoAssessmentTask this activity evaluates against — resolved against whatever task pool the caller supplies, never invented inline. */
  taskId: string
  /** Batch 6 requires confidence capture on every major Echo interaction; this is always true today, kept as an explicit field rather than assumed. */
  confidenceCapture: true
}

const bannedManagementLanguage = /\b(diagnos(e|is)|treat(ment)?|prescri|patient (management|decision|care plan))\b/i
const hasEducationalFraming = (evidenceBoundary: string) => /educational|reasoning|interpretation/i.test(evidenceBoundary)

/** A next_best_evidence task's own evidenceBoundary copy must read as image-interpretation reasoning, never patient-management advice. */
export function assertNextBestEvidenceFraming(task: EchoAssessmentTask): void {
  if (bannedManagementLanguage.test(task.evidenceBoundary) || bannedManagementLanguage.test(task.prompt)) {
    throw new Error(`next_best_evidence task ${task.id} reads as patient-management advice, not educational reasoning.`)
  }
  if (!hasEducationalFraming(task.evidenceBoundary)) {
    throw new Error(`next_best_evidence task ${task.id} must explicitly frame itself as educational reasoning in evidenceBoundary.`)
  }
}

export const ECHO_NEXT_BEST_EVIDENCE_TASKS: readonly EchoAssessmentTask[] = [
  {
    id: 'echo-a4c-next-best-evidence-v1',
    caseId: A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId,
    skillId: 'echo.function.lv-global-visual',
    version: '1.0.0',
    type: 'single-best-answer',
    prompt: 'Having reviewed this A4C cine alone, what would you inspect next to reduce uncertainty about global LV function?',
    options: [
      { id: 'additional-view', label: 'Review an additional view, such as PLAX or PSAX' },
      { id: 'repeat-same-clip', label: 'Re-watch the same A4C clip from the same loop point' },
      { id: 'assume-normal', label: 'Conclude the finding from this one view alone' },
    ],
    answerKey: ['additional-view'],
    rationale: 'A single view cannot fully characterize global function; an independent second view materially reduces interpretive uncertainty before drawing any conclusion.',
    maxScore: 1,
    evidenceBoundary: 'Educational reasoning about image-interpretation strategy only — this task does not direct any real clinical workflow and is not patient-management advice.',
  },
] as const

export function validateEchoNextBestEvidenceTasks(): void {
  for (const task of ECHO_NEXT_BEST_EVIDENCE_TASKS) {
    validateEchoAssessmentTask(task)
    assertNextBestEvidenceFraming(task)
  }
}

export const ECHO_LEARNING_ACTIVITY_SEED: readonly EchoLearningActivity[] = [
  {
    activityKey: 'echo-activity:a4c-normal-next-best-evidence',
    studyKey: 'echo-a4c-governed-preview-v1',
    type: 'next_best_evidence',
    competencyDomain: 'global-function',
    taskId: 'echo-a4c-next-best-evidence-v1',
    confidenceCapture: true,
  },
] as const

export function validateEchoLearningActivitySeed(
  activities: readonly EchoLearningActivity[] = ECHO_LEARNING_ACTIVITY_SEED,
  taskPool: readonly EchoAssessmentTask[] = ECHO_NEXT_BEST_EVIDENCE_TASKS,
): void {
  const keys = new Set<string>()
  for (const activity of activities) {
    if (!activity.activityKey.trim() || !activity.studyKey.trim() || !activity.taskId.trim()) {
      throw new Error('Echo learning activity identity, study and task are required.')
    }
    if (keys.has(activity.activityKey)) throw new Error(`Duplicate Echo learning activity key: ${activity.activityKey}`)
    keys.add(activity.activityKey)
    const task = taskPool.find(candidate => candidate.id === activity.taskId)
    if (!task) throw new Error(`Echo learning activity ${activity.activityKey} references unknown task: ${activity.taskId}`)
    if (getEchoSkill(task.skillId).domain !== activity.competencyDomain) {
      throw new Error(`Echo learning activity ${activity.activityKey} competencyDomain does not match its task's skill domain.`)
    }
    if (activity.type === 'next_best_evidence') assertNextBestEvidenceFraming(task)
  }
}

import type { EchoAssessmentTask } from './echoAssessmentContract.ts'
import { validateEchoAssessmentTask } from './echoAssessmentContract.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../clinicalMedia/licensedEchoAsset.ts'

const caseId = A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId

export const ECHO_A4C_COMPETENCY_TASKS: readonly EchoAssessmentTask[] = [
  {
    id: 'echo-a4c-view-identity-v1',
    caseId,
    skillId: 'echo.view.a4c-recognition',
    version: '1.0.0',
    type: 'single-best-answer',
    prompt: 'Which view signature is demonstrated in the cine?',
    options: [
      { id: 'apical-four-chamber', label: 'Apical four-chamber (A4C)' },
      { id: 'parasternal-long-axis', label: 'Parasternal long-axis (PLAX)' },
      { id: 'subcostal-ivc', label: 'Subcostal IVC view' },
    ],
    answerKey: ['apical-four-chamber'],
    rationale: 'The source-labelled cine demonstrates the four chambers, atrioventricular valve planes and septa in an apical plane.',
    maxScore: 1,
    evidenceBoundary: 'View recognition only; this task does not validate measurements, ejection fraction or exclusion of pathology.',
  },
  {
    id: 'echo-a4c-landmarks-v1',
    caseId,
    skillId: 'echo.anatomy.a4c-landmarks',
    version: '1.0.0',
    type: 'single-best-answer',
    prompt: 'Which landmark set supports A4C recognition?',
    options: [
      { id: 'four-chambers-av-valves-septa', label: 'Four chambers, AV valve planes and septa' },
      { id: 'aortic-arch-only', label: 'Aortic arch only' },
      { id: 'coronary-arteries-only', label: 'Coronary arteries only' },
    ],
    answerKey: ['four-chambers-av-valves-septa'],
    rationale: 'The combined chamber, atrioventricular valve and septal configuration supports recognition of the A4C view.',
    maxScore: 1,
    evidenceBoundary: 'Anatomic landmark recognition only; no quantitative chamber assessment is inferred.',
  },
] as const

export function validateEchoA4cCompetencyTasks(): void {
  const ids = new Set<string>()
  for (const task of ECHO_A4C_COMPETENCY_TASKS) {
    validateEchoAssessmentTask(task)
    if (ids.has(task.id)) throw new Error(`Duplicate governed A4C competency task: ${task.id}`)
    ids.add(task.id)
    if (task.caseId !== caseId) throw new Error(`A4C competency task case mismatch: ${task.id}`)
  }
}

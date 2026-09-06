import { ECHO_A4C_TRAINING_ACTIVITY, type EchoA4cQuestionId, type EchoA4cAnswerId } from './echoA4cTrainingActivity.ts'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../clinicalMedia/licensedEchoAsset.ts'
import { ECHO_A4C_REVIEW_NOTES } from './echoA4cRemediation.ts'
import { assertCaseQuestionIntegrity } from './caseQuestionIntegrity.ts'

export interface EchoA4cQuestion {
  id: EchoA4cQuestionId
  prompt: string
  options: { id: EchoA4cAnswerId; label: string }[]
}

const questions: EchoA4cQuestion[] = [
  {
    id: 'view-identity',
    prompt: 'Which view signature is demonstrated in the cine?',
    options: [
      { id: 'apical-four-chamber', label: 'Apical four-chamber (A4C)' },
      { id: 'parasternal-long-axis', label: 'Parasternal long-axis (PLAX)' },
      { id: 'subcostal-ivc', label: 'Subcostal IVC view' },
    ],
  },
  {
    id: 'visible-landmarks',
    prompt: 'Which landmark set supports A4C recognition?',
    options: [
      { id: 'four-chambers-av-valves-septa', label: 'Four chambers, AV valve planes and septa' },
      { id: 'aortic-arch-only', label: 'Aortic arch only' },
      { id: 'coronary-arteries-only', label: 'Coronary arteries only' },
    ],
  },
  {
    id: 'safe-conclusion',
    prompt: 'What is the safe conclusion from this short learning loop?',
    options: [
      { id: 'source-labeled-view-recognition-only', label: 'Use the source-labelled normal cine for view recognition only' },
      { id: 'calculate-ejection-fraction', label: 'Calculate ejection fraction from this loop' },
      { id: 'exclude-all-pathology', label: 'Exclude all structural pathology' },
    ],
  },
]

assertCaseQuestionIntegrity(questions, ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers)

// First case-data extraction. The player and receipt engine remain A4C-specific.
// Inherited review status is not human approval of the lesson or answer key.
export const ECHO_A4C_CASE_PACK = {
  schemaVersion: 1,
  caseId: 'echo-a4c-normal-learning-v1',
  activity: ECHO_A4C_TRAINING_ACTIVITY,
  asset: A4C_NORMAL_CLINICAL_STUDIO_ASSET,
  clinicalReview: 'pending',
  title: 'Recognize the A4C view without over-interpreting a short loop',
  objective: 'Use the governed cine above to identify the complete view signature, observe cyclical motion and preserve the boundary between view recognition and diagnostic measurement.',
  notes: [
    { id: 'view-signature', label: 'Note 01 · View signature', title: 'Apical four-chamber', body: 'Both atria and ventricles appear in one apical plane with the atrioventricular valve planes and septa.' },
    { id: 'motion-task', label: 'Note 02 · Motion task', title: 'Observe before measuring', body: 'Track chamber and valve motion across the cine. Screen-side convention alone is not a reliable view identifier.' },
    { id: 'learning-scope', label: 'Note 03 · Learning scope', title: 'View recognition only', body: 'This 0.98-second source loop is not sufficient for EF, chamber measurements or exclusion of pathology.' },
  ],
  questions,
  reviewNotes: ECHO_A4C_REVIEW_NOTES,
} as const

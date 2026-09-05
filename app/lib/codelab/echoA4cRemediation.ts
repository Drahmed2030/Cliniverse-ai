import { ECHO_A4C_TRAINING_ACTIVITY, type EchoA4cAnswers, type EchoA4cQuestionId } from './echoA4cTrainingActivity.ts'

// Reuses the existing preview lesson notes; does not introduce a new clinical key.
export const ECHO_A4C_REVIEW_NOTES: Record<EchoA4cQuestionId, string> = {
  'view-identity': 'Review Note 01: identify the complete apical four-chamber view signature.',
  'visible-landmarks': 'Review Note 01: both atria and ventricles, AV valve planes and septa support recognition. Review Note 02: screen-side convention alone is not a reliable identifier.',
  'safe-conclusion': 'Review Note 03: this short source loop supports view recognition only, not EF measurement or exclusion of pathology.',
}

export function evaluateEchoA4cAttempt(answers: EchoA4cAnswers) {
  const key = ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers
  const missed = (Object.keys(key) as EchoA4cQuestionId[]).filter(id => answers[id] !== key[id])
  return { answers: { ...answers }, missed, correct: 3 - missed.length, answerKeyVersion: ECHO_A4C_TRAINING_ACTIVITY.assessment.answerKeyVersion }
}

export type EchoA4cAttempt = ReturnType<typeof evaluateEchoA4cAttempt>

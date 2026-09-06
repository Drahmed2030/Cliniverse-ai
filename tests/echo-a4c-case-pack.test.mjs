import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_A4C_CASE_PACK as pack } from '../app/lib/codelab/echoA4cCasePack.ts'
import { assertCaseQuestionIntegrity } from '../app/lib/codelab/caseQuestionIntegrity.ts'
import { ECHO_A4C_TRAINING_ACTIVITY, createEchoA4cCompletionReceipt } from '../app/lib/codelab/echoA4cTrainingActivity.ts'

test('case pack links existing asset, activity and every assessed skill without granting approval', () => {
  assertCaseQuestionIntegrity(pack.questions, pack.activity.assessment.correctAnswers)
  assert.equal(pack.activity, ECHO_A4C_TRAINING_ACTIVITY)
  assert.equal(pack.activity.contentAssetId, pack.asset.assetId)
  assert.equal(pack.activity.contentVersion, pack.asset.version)
  assert.equal(pack.activity.activityId, pack.asset.linkedActivityId)
  assert.equal(pack.activity.engineId, pack.asset.cine.engine)
  assert.equal(pack.activity.reviewStatus, pack.asset.reviewStatus)
  assert.equal(pack.asset.surfaceAccess, 'preview-only')
  assert.equal(pack.clinicalReview, 'pending')
  assert.deepEqual(pack.questions.map(q => q.id).sort(), Object.keys(pack.reviewNotes).sort())
  const receipt = createEchoA4cCompletionReceipt({ attempts: 1, answers: pack.activity.assessment.correctAnswers })
  assert.equal(receipt.contentAssetId, pack.asset.assetId)
  assert.equal(receipt.source.derivativeSha256, pack.asset.rights.derivativeSha256)
})

test('question integrity rejects missing questions, duplicate IDs and incorrect key coverage', () => {
  const key = pack.activity.assessment.correctAnswers
  assert.throws(() => assertCaseQuestionIntegrity([], {}))
  assert.throws(() => assertCaseQuestionIntegrity(pack.questions.slice(1), key))
  assert.throws(() => assertCaseQuestionIntegrity([...pack.questions, pack.questions[0]], key))
  assert.throws(() => assertCaseQuestionIntegrity(pack.questions, { ...key, 'safe-conclusion': 'absent-option' }))
  const duplicate = structuredClone(pack.questions)
  duplicate[0].options[1].id = duplicate[0].options[0].id
  assert.throws(() => assertCaseQuestionIntegrity(duplicate, key))
  const blank = structuredClone(pack.questions)
  blank[0].prompt = ' '
  assert.throws(() => assertCaseQuestionIntegrity(blank, key))
})

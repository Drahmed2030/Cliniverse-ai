/** Structural checks only; passing does not establish clinical correctness. */
export function assertCaseQuestionIntegrity(
  questions: readonly { id: string; prompt: string; options: readonly { id: string; label: string }[] }[],
  answerKey: Readonly<Record<string, string>>,
): void {
  const ids = questions.map(question => question.id)
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Missing or duplicate questions')
  if (Object.keys(answerKey).length !== ids.length || Object.keys(answerKey).some(id => !ids.includes(id))) {
    throw new Error('Answer key coverage mismatch')
  }
  for (const question of questions) {
    const options = question.options.map(option => option.id)
    if (!question.id.trim() || !question.prompt.trim() || options.length < 2
      || new Set(options).size !== options.length
      || question.options.some(option => !option.id.trim() || !option.label.trim())
      || !Object.hasOwn(answerKey, question.id) || !options.includes(answerKey[question.id])) {
      throw new Error(`Invalid question or keyed option: ${question.id}`)
    }
  }
}

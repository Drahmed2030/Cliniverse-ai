import type { SupabaseClient } from '@supabase/supabase-js'
import type { CasePreview } from '../../content/medical/batch20.ts'
import { createCompletionRepository, type LessonCompletion } from './lessonCompletion.ts'

type Sources = Record<string, { title: string; url: string; scope: string }>
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const keyPattern = /^microcase:[a-z0-9-]+:[a-f0-9]{64}$/

/** Text-exercise completion only: no media competency, certification or XP. */
export async function caseCompletionKey(item: CasePreview, sources: Sources): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(item.id) || item.clinicalReview !== 'user-confirmed' ||
      !Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) {
    throw Error('Invalid reviewed case')
  }
  const references = item.sourceIds.map(id => {
    const source = sources[id]
    if (!source) throw Error('Missing case reference')
    return [id, source.title, source.url, source.scope]
  })
  // Explicit field order makes the identity independent of object key order.
  // Source edits invalidate completion too; supplementary media is not assessed here.
  const payload = JSON.stringify(['microcase-text-v1', item.id, item.title, item.track,
    item.objective, item.scenario, item.question, item.options, item.answer,
    item.explanation, item.communication, item.clinicalReview, references])
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return `microcase:${item.id}:${hash}`
}

export function validateCaseCompletion(row: LessonCompletion, allowedKeys: ReadonlySet<string>) {
  if (!uuid.test(row.id) || !uuid.test(row.user_id) || !keyPattern.test(row.case_id) ||
      !allowedKeys.has(row.case_id) || (row.errors !== 0 && row.errors !== 1) ||
      row.xp_earned !== 0 || !Number.isFinite(Date.parse(row.completed_at))) {
    throw Error('Invalid current-case completion')
  }
}

export async function prepareCaseCompletion(item: CasePreview, sources: Sources, attempt: {
  id: string; owner: string; answer: number; explanationReviewed: boolean; completedAt: string
}): Promise<LessonCompletion> {
  // Call after explicit explanation acknowledgement, not on opening a case.
  if (attempt.explanationReviewed !== true || !Number.isInteger(attempt.answer) ||
      attempt.answer < 0 || attempt.answer >= item.options.length) throw Error('Case review incomplete')
  const key = await caseCompletionKey(item, sources)
  const row: LessonCompletion = { id: attempt.id, user_id: attempt.owner, case_id: key,
    errors: attempt.answer === item.answer ? 0 : 1, xp_earned: 0, completed_at: attempt.completedAt }
  validateCaseCompletion(row, new Set([key]))
  return row
}

export function createCaseCompletionRepository(client: SupabaseClient, currentKeys: readonly string[], timeoutMs = 15_000) {
  if (currentKeys.length > 20 || currentKeys.some(key => !keyPattern.test(key))) throw Error('Invalid case catalogue')
  const allowed = new Set(currentKeys)
  const repository = createCompletionRepository(client, row => validateCaseCompletion(row, allowed), timeoutMs)
  return {
    save: repository.save,
    load: (owner: string) => repository.load(owner, [...allowed]),
  }
}

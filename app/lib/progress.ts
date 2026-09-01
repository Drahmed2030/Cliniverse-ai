import { supabase } from '../supabase'
import { requireCurrentUser } from './identity'

export async function saveOwnCaseCompletion(
  caseId: string,
  xpEarned: number,
  errors: number,
) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  return supabase
    .from('case_completions')
    .insert({
      user_id: user.id,
      case_id: caseId,
      xp_earned: xpEarned,
      errors,
      completed_at: new Date().toISOString(),
    })
    .select('*')
    .single()
}

export async function saveOwnMcqAnswer(mcqId: string, correct: boolean) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  return supabase
    .from('mcq_answers')
    .insert({
      user_id: user.id,
      mcq_id: mcqId,
      correct,
      answered_at: new Date().toISOString(),
    })
    .select('*')
    .single()
}

export async function getOwnCaseCompletions(limit = 50) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  return supabase
    .from('case_completions')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(limit)
}

export async function getOwnMcqAnswers(limit = 100) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  return supabase
    .from('mcq_answers')
    .select('*')
    .eq('user_id', user.id)
    .order('answered_at', { ascending: false })
    .limit(limit)
}

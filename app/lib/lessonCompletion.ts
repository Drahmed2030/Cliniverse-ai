import type { SupabaseClient } from '@supabase/supabase-js'

// Completion evidence only: this is not a mastery score or an XP award.
export interface LessonCompletion {
  id: string
  user_id: string
  case_id: string
  errors: number
  xp_earned: 0
  completed_at: string
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function validateLessonCompletion(row: LessonCompletion) {
  if (!uuid.test(row.id) || !uuid.test(row.user_id) ||
      !/^codelab:[a-z0-9_]+:[a-f0-9]{64}$/.test(row.case_id) ||
      !Number.isInteger(row.errors) || row.errors < 0 || row.xp_earned !== 0 ||
      !Number.isFinite(Date.parse(row.completed_at))) throw new Error('Invalid lesson completion')
}

function sameCompletion(a: LessonCompletion, b: LessonCompletion) {
  return a.id === b.id && a.user_id === b.user_id && a.case_id === b.case_id &&
    a.errors === b.errors && a.xp_earned === b.xp_earned &&
    Date.parse(a.completed_at) === Date.parse(b.completed_at)
}

export function createLessonCompletionRepository(client: SupabaseClient, timeoutMs = 15_000) {
  async function bounded<T>(request: PromiseLike<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([Promise.resolve(request), new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('Progress request timed out; retry with the same completion identity')), timeoutMs)
      })])
    } finally { if (timer) clearTimeout(timer) }
  }
  async function requireOwner(owner: string) {
    const { data, error } = await bounded(client.auth.getUser())
    if (error || !data.user || data.user.id !== owner) throw new Error('Account changed or unavailable')
  }
  const columns = 'id,user_id,case_id,errors,xp_earned,completed_at'
  return {
    async load(owner: string, caseIds: string[]): Promise<LessonCompletion[]> {
      await requireOwner(owner)
      // One most-recent row per current lesson, avoiding a global history limit
      // which could hide an older completed lesson after many repeat attempts.
      const rows = await Promise.all(caseIds.map(async caseId => {
        const { data, error } = await bounded(client.from('case_completions').select(columns)
          .eq('user_id', owner).eq('case_id', caseId)
          .order('completed_at', { ascending: false }).limit(1).maybeSingle())
        if (error) throw error
        if (!data) return null
        validateLessonCompletion(data)
        if (data.user_id !== owner || data.case_id !== caseId) throw new Error('Completion owner mismatch')
        return data as LessonCompletion
      }))
      await requireOwner(owner)
      return rows.filter((row): row is LessonCompletion => row !== null)
    },
    async save(row: LessonCompletion): Promise<LessonCompletion> {
      validateLessonCompletion(row)
      await requireOwner(row.user_id)
      // INSERT only, matching the existing append-only RLS/grants. Keep the
      // UUID on retries; never upsert an existing learner's evidence.
      const inserted = await bounded(client.from('case_completions').insert(row).select(columns).single())
      if (inserted.error && inserted.error.code !== '23505') throw inserted.error
      let saved = inserted.data
      if (inserted.error?.code === '23505') {
        const result = await bounded(client.from('case_completions').select(columns)
          .eq('user_id', row.user_id).eq('id', row.id).single())
        if (result.error) throw result.error
        saved = result.data
      }
      await requireOwner(row.user_id)
      if (!saved || !sameCompletion(row, saved)) throw new Error('Completion acknowledgement mismatch')
      return saved
    },
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { validateEchoCompetencyEvent, type EchoCompetencyEvent } from './echoPersistenceContract.ts'

// Assessment evidence only. This repository never awards mastery, XP or eligibility.
const fields = {
  eventId: 'event_id', userId: 'user_id', caseId: 'case_id', taskId: 'task_id',
  taskVersion: 'task_version', skillId: 'skill_id', selectedAnswer: 'selected_answer',
  normalizedScore: 'normalized_score', confidence: 'confidence',
  responseTimeMs: 'response_time_ms', observedAt: 'observed_at',
} as const
const columns = 'event_id,user_id,case_id,task_id,task_version,skill_id,selected_answer,normalized_score,confidence,response_time_ms,observed_at'
const keys = Object.keys(fields) as (keyof EchoCompetencyEvent)[]
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateEchoAccountEvent(event: EchoCompetencyEvent) {
  validateEchoCompetencyEvent(event)
  if (!uuid.test(event.userId) || keys.some(key =>
    !['normalizedScore', 'confidence', 'responseTimeMs'].includes(key) &&
    (typeof event[key] !== 'string' || !(event[key] as string).trim())) ||
    !event.eventId || typeof event.selectedAnswer !== 'string' ||
    ![event.normalizedScore, event.confidence, event.responseTimeMs].every(Number.isInteger) ||
    event.responseTimeMs > 2147483647) throw new Error('Invalid Echo account evidence')
}
function decode(value: Record<string, unknown>): EchoCompetencyEvent {
  const event = Object.fromEntries(keys.map(key => [key, value[fields[key]]])) as unknown as EchoCompetencyEvent
  validateEchoAccountEvent(event)
  return event
}
function same(a: EchoCompetencyEvent, b: EchoCompetencyEvent) {
  return keys.every(key => key === 'observedAt'
    ? Date.parse(a[key]) === Date.parse(b[key]) : a[key] === b[key])
}
export class EchoStorageUnavailable extends Error {
  constructor() { super('Echo assessment storage is not provisioned'); this.name = 'EchoStorageUnavailable' }
}
function checkError(error: { code?: string } | null) {
  if (!error) return
  if (error.code === '42P01' || error.code === 'PGRST205') throw new EchoStorageUnavailable()
  throw error
}

export function createEchoAccountEventRepository(client: SupabaseClient, timeoutMs = 15_000) {
  async function bounded<T>(request: PromiseLike<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([Promise.resolve(request), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Echo request timed out; retry with the same event identity')), timeoutMs)
      })])
    } finally { if (timer) clearTimeout(timer) }
  }
  async function owner(userId: string) {
    if (!uuid.test(userId)) throw new Error('Invalid account identity')
    const result = await bounded(client.auth.getUser())
    if (result.error || result.data.user?.id !== userId) throw new Error('Account changed or unavailable')
  }
  return {
    // Retrieve a specific attempt after reload; avoids truncating mastery history.
    async load(userId: string, eventId: string): Promise<EchoCompetencyEvent | null> {
      if (!eventId.trim()) throw new Error('Missing event identity')
      await owner(userId)
      const result = await bounded(client.from('echo_competency_events').select(columns)
        .eq('user_id', userId).eq('event_id', eventId).maybeSingle())
      checkError(result.error)
      await owner(userId)
      if (!result.data) return null
      const event = decode(result.data)
      if (event.userId !== userId || event.eventId !== eventId) throw new Error('Echo evidence owner mismatch')
      return event
    },
    async loadLatest(userId: string, identity: { caseId: string; taskId: string; taskVersion: string }): Promise<EchoCompetencyEvent | null> {
      await owner(userId)
      const result = await bounded(client.from('echo_competency_events').select(columns)
        .eq('user_id', userId).eq('case_id', identity.caseId).eq('task_id', identity.taskId)
        .eq('task_version', identity.taskVersion).order('created_at', { ascending: false })
        .order('event_id', { ascending: false }).limit(1).maybeSingle())
      checkError(result.error)
      await owner(userId)
      if (!result.data) return null
      const event = decode(result.data)
      if (event.userId !== userId || event.caseId !== identity.caseId || event.taskId !== identity.taskId || event.taskVersion !== identity.taskVersion) {
        throw new Error('Echo assessment identity mismatch')
      }
      return event
    },
    async save(input: EchoCompetencyEvent): Promise<EchoCompetencyEvent> {
      // Snapshot before awaiting auth: caller mutation must not change attribution.
      const event = { ...input }
      validateEchoAccountEvent(event)
      await owner(event.userId)
      const row = Object.fromEntries(keys.map(key => [fields[key], event[key]]))
      const result = await bounded(client.from('echo_competency_events').insert(row).select(columns).single())
      let data = result.data
      if (result.error?.code === '23505') {
        const existing = await bounded(client.from('echo_competency_events').select(columns)
          .eq('user_id', event.userId).eq('event_id', event.eventId).single())
        checkError(existing.error)
        data = existing.data
      } else checkError(result.error)
      await owner(event.userId)
      if (!data) throw new Error('Missing Echo acknowledgement')
      const saved = decode(data)
      if (!same(event, saved)) throw new Error('Echo event identity conflict')
      return saved
    },
  }
}

import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { requireCurrentUser } from './identity'

export interface CliniverseProfileInput {
  name?: string
  specialty?: string
  country?: string
}

function profileDefaults(user: User) {
  const fallbackName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Cliniverse user'

  // Keep account identity minimal while explicitly neutralizing legacy
  // database defaults that could imply professional attributes the user
  // never supplied. Entitlement/progression authority remains elsewhere.
  return {
    id: user.id,
    name: String(fallbackName),
    specialty: null,
    country: null,
    level: null,
    institution: null,
    target_board: null,
    study_hours: null,
    preferred_tools: [],
    rank: 'Clinical Learner',
  }
}

export async function getOwnProfile() {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  return supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
}

export async function ensureOwnProfile() {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  const existing = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (existing.error) return existing
  if (existing.data) return existing

  const created = await supabase.from('profiles').insert(profileDefaults(user)).select('*').single()
  if (!created.error) return created

  // Supabase auth-state restoration and SIGNED_IN events can overlap on the
  // first authenticated launch. If another concurrent bootstrap won the race,
  // recover by reading the now-existing own row instead of surfacing a false
  // account failure.
  if (created.error.code === '23505') {
    return supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  }

  return created
}

export async function updateOwnProfile(input: CliniverseProfileInput) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  const updates = {
    ...(typeof input.name === 'string' ? { name: input.name.trim() } : {}),
    ...(typeof input.specialty === 'string' ? { specialty: input.specialty.trim() || null } : {}),
    ...(typeof input.country === 'string' ? { country: input.country.trim() || null } : {}),
  }

  return supabase.from('profiles').update(updates).eq('id', user.id).select('*').single()
}

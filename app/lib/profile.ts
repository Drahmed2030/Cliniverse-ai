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

  // Keep bootstrap intentionally minimal and let verified database defaults
  // own progression, rank and entitlement-related fields.
  return {
    id: user.id,
    name: String(fallbackName),
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

  return supabase.from('profiles').insert(profileDefaults(user)).select('*').single()
}

export async function updateOwnProfile(input: CliniverseProfileInput) {
  const { user, error: authError } = await requireCurrentUser()
  if (!user) return { data: null, error: authError }

  const updates = {
    ...(typeof input.name === 'string' ? { name: input.name.trim() } : {}),
    ...(typeof input.specialty === 'string' ? { specialty: input.specialty.trim() } : {}),
    ...(typeof input.country === 'string' ? { country: input.country.trim() } : {}),
  }

  return supabase.from('profiles').update(updates).eq('id', user.id).select('*').single()
}

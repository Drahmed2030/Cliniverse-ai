import { supabase } from '../supabase'

export type CliniverseAuthProvider = 'apple' | 'google'

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
}

export async function signInWithOAuth(provider: CliniverseAuthProvider, redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: redirectTo ? { redirectTo } : undefined,
  })
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
}

export async function signOut() {
  return supabase.auth.signOut()
}

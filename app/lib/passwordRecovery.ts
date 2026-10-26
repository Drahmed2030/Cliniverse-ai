// Password recovery, kept free of React and of the shared Supabase client so it can be tested and so it
// can never touch the app's own session.
//
// Flow (Supabase "password reset" guidance: send a reset link, the link returns to a page of ours, that page
// asks for a new password and calls updateUser):
//  1. The app asks Supabase to email a link whose redirect is the fixed RESET_REDIRECT_URL below.
//  2. The link opens a standalone page. That page parses the recovery tokens from the URL hash, removes
//     them from the address bar, and uses its OWN in-memory client (createRecoveryClient) — never the shared
//     client, never persisted storage — so an existing signed-in account is not replaced or affected.
//  3. updateUser({ password }) sets the new password, then a global sign-out ends every session of that account.
//
// Limit: a global sign-out revokes refresh tokens; access tokens already issued stay valid until they expire.

import { createClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from './supabaseConfig'

// Must be listed in Supabase Auth -> URL Configuration -> Redirect URLs by an authorized operator.
export const RESET_REDIRECT_URL = 'https://www.cliniverseai.com/reset-password'
export const MIN_PASSWORD_LENGTH = 8
export const RESET_REQUEST_COOLDOWN_MS = 60_000

export type ResetRequestOutcome = 'sent' | 'rate_limited' | 'failed'

// Supabase answers success for unknown addresses as well, so 'sent' reveals nothing about which accounts exist.
export function classifyResetRequest(error: unknown): ResetRequestOutcome {
  if (!error) return 'sent'
  return (error as { status?: number }).status === 429 ? 'rate_limited' : 'failed'
}

export function resetRequestAllowed(now: number, nextAllowedAt: number) {
  return now >= nextAllowedAt
}

export type RecoveryLink =
  | { kind: 'ready'; accessToken: string; refreshToken: string }
  | { kind: 'invalid'; reason: 'expired' | 'missing' | 'not_recovery' | 'error' }

export function parseRecoveryHash(hash: string): RecoveryLink {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return { kind: 'invalid', reason: 'missing' }
  const params = new URLSearchParams(raw)
  if (params.get('error') || params.get('error_code') || params.get('error_description')) {
    const code = params.get('error_code')
    return { kind: 'invalid', reason: code === 'otp_expired' ? 'expired' : 'error' }
  }
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) return { kind: 'invalid', reason: 'missing' }
  // Only genuine recovery links may reach the password form; a sign-in or confirmation link must not.
  if (params.get('type') !== 'recovery') return { kind: 'invalid', reason: 'not_recovery' }
  return { kind: 'ready', accessToken, refreshToken }
}

export type PasswordCheck = 'ok' | 'empty' | 'too_short' | 'mismatch'

export function checkNewPassword(password: string, confirmation: string): PasswordCheck {
  if (!password) return 'empty'
  if (password.length < MIN_PASSWORD_LENGTH) return 'too_short'
  if (password !== confirmation) return 'mismatch'
  return 'ok'
}

// Shown so a user who followed someone else's crafted link notices it is not their account.
export function maskEmail(email: string) {
  const [local = '', domain = ''] = email.split('@')
  if (!domain) return ''
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(1, Math.min(local.length - 1, 6)))}@${domain}`
}

type AuthResult = { data?: { user?: { email?: string | null } | null } | null; error: unknown }
export interface RecoveryClient {
  auth: {
    setSession: (tokens: { access_token: string; refresh_token: string }) => Promise<AuthResult>
    updateUser: (attributes: { password: string }) => Promise<AuthResult>
    signOut: (options: { scope: 'global' }) => Promise<{ error: unknown }>
  }
}

// In-memory, no URL detection, no auto refresh, own storage key: nothing is shared with the app session.
export function createRecoveryClient(create: typeof createClient = createClient): RecoveryClient {
  return create(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'implicit',
      storageKey: 'cliniverse-password-recovery',
    },
  }) as unknown as RecoveryClient
}

export type RecoveryStart = { status: 'ready'; maskedEmail: string } | { status: 'invalid' }

export async function startRecovery(client: RecoveryClient, link: Extract<RecoveryLink, { kind: 'ready' }>): Promise<RecoveryStart> {
  try {
    const { data, error } = await client.auth.setSession({ access_token: link.accessToken, refresh_token: link.refreshToken })
    if (error || !data?.user) return { status: 'invalid' }
    return { status: 'ready', maskedEmail: maskEmail(data.user.email ?? '') }
  } catch {
    return { status: 'invalid' }
  }
}

export type RecoveryComplete =
  | { status: 'done'; sessionsEnded: boolean }
  | { status: 'rejected' }
  | { status: 'error' }

export async function completeRecovery(client: RecoveryClient, password: string, confirmation: string): Promise<RecoveryComplete | { status: 'invalid_password'; reason: Exclude<PasswordCheck, 'ok'> }> {
  const check = checkNewPassword(password, confirmation)
  if (check !== 'ok') return { status: 'invalid_password', reason: check }
  try {
    const { error } = await client.auth.updateUser({ password })
    if (error) return { status: 'rejected' }
  } catch {
    return { status: 'error' }
  }
  // The password has changed; ending all sessions is best effort and reported honestly.
  let sessionsEnded = false
  try { sessionsEnded = !(await client.auth.signOut({ scope: 'global' })).error } catch { sessionsEnded = false }
  return { status: 'done', sessionsEnded }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbiujqxinvcxvuviuenx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXVqcXhpbnZjeHZ1dml1ZW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTEzOTYsImV4cCI6MjA5OTc2NzM5Nn0.7znHWJXnYNgQmTVyzouuxQDFXxDEvVk9F2I75ArA8d8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── TYPES ──
export interface UserProfile {
  id: string
  email: string
  name: string
  specialty: string
  xp: number
  streak: number
  cases_completed: number
  mcq_correct: number
  mcq_total: number
  rank: string
  is_pro: boolean
  pro_expires_at?: string
  subscription_status?: string
  country?: string
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  specialty: string
  xp: number
  rank: string
  cases_completed: number
  country: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'pro_monthly' | 'pro_yearly' | 'institution'
  status: 'active' | 'cancelled' | 'expired'
  amount: number
  currency: string
  started_at: string
  expires_at?: string
}

// ── LEGACY PROFILE / XP HELPERS ──
// Release surfaces should prefer app/lib/profile.ts and app/lib/progress.ts,
// which derive ownership from the authenticated Supabase user.
export async function updateXP(userId: string, xpToAdd: number) {
  const { data, error } = await supabase.rpc('increment_xp', {
    user_id: userId,
    xp_amount: xpToAdd
  })
  return { data, error }
}

export async function saveProgress(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
  return { data, error }
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, specialty, xp, rank, cases_completed, country')
    .order('xp', { ascending: false })
    .limit(50)
  return { data, error }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// ── PRO FUNCTIONS ──
export async function checkIsPro(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('is_user_pro', { uid: userId })
  if (error) return false
  return data === true
}

/**
 * Legacy compatibility export only.
 * Client-side entitlement activation is intentionally disabled.
 * Paid access must be granted by a verified server/payment path and then read
 * through app/lib/entitlements.ts.
 */
export async function activatePro(_userId: string, _subscriptionId: string, _plan: string, _expiresAt?: string) {
  return {
    data: null,
    error: new Error('Client-side PRO activation is disabled. Use the verified server entitlement path.'),
  }
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return { data, error }
}

// ── LEGACY CASE / MCQ HELPERS ──
// Retained temporarily for compatibility. New release code must use
// saveOwnCaseCompletion/saveOwnMcqAnswer from app/lib/progress.ts.
export async function saveCaseCompletion(userId: string, caseId: string, xpEarned: number, errors: number) {
  const { data, error } = await supabase
    .from('case_completions')
    .insert({
      user_id: userId,
      case_id: caseId,
      xp_earned: xpEarned,
      errors,
      completed_at: new Date().toISOString()
    })
  return { data, error }
}

export async function saveMcqAnswer(userId: string, mcqId: string, correct: boolean) {
  const { data, error } = await supabase
    .from('mcq_answers')
    .insert({
      user_id: userId,
      mcq_id: mcqId,
      correct,
      answered_at: new Date().toISOString()
    })
  return { data, error }
}

// ── LEMON SQUEEZY CHECKOUT ──
export const LEMON_LINKS = {
  pro_monthly:  'https://cliniverse.lemonsqueezy.com/checkout/buy/pro-monthly',
  pro_yearly:   'https://cliniverse.lemonsqueezy.com/checkout/buy/pro-yearly',
  institution:  'https://cliniverse.lemonsqueezy.com/checkout/buy/institution',
}

import { supabase } from '../supabase'
import { requireCurrentUser } from './identity'

export type EntitlementTier = 'free' | 'pro' | 'institution'

export interface CliniverseEntitlement {
  tier: EntitlementTier
  isPro: boolean
  status: 'active' | 'inactive' | 'unknown'
  expiresAt: string | null
  source: 'subscription-record' | 'none'
}

const FREE_ENTITLEMENT: CliniverseEntitlement = {
  tier: 'free',
  isPro: false,
  status: 'inactive',
  expiresAt: null,
  source: 'none',
}

export async function getOwnEntitlement(): Promise<CliniverseEntitlement> {
  const { user, error: authError } = await requireCurrentUser()
  if (!user || authError) {
    return { ...FREE_ENTITLEMENT, status: 'unknown' }
  }

  // Subscription rows are the only accepted release authority. The legacy
  // `is_user_pro(uid)` SECURITY DEFINER RPC reads a duplicate profile flag and
  // accepts an arbitrary uid, so it is intentionally excluded from this path.
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plan,status,expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) {
    return { ...FREE_ENTITLEMENT, status: 'unknown' }
  }

  if (!subscription) {
    return FREE_ENTITLEMENT
  }

  const allowedPlans = new Set(['pro_monthly', 'pro_yearly', 'institution'])
  const expiresAt = subscription.expires_at ?? null
  const expiryTime = expiresAt ? Date.parse(expiresAt) : null

  if (!allowedPlans.has(subscription.plan) || (expiryTime !== null && (!Number.isFinite(expiryTime) || expiryTime <= Date.now()))) {
    return FREE_ENTITLEMENT
  }

  return {
    tier: subscription.plan === 'institution' ? 'institution' : 'pro',
    isPro: true,
    status: 'active',
    expiresAt,
    source: 'subscription-record',
  }
}

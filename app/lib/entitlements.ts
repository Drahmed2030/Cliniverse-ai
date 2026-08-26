import { supabase } from '../supabase'
import { requireCurrentUser } from './identity'

export type EntitlementTier = 'free' | 'pro' | 'institution'

export interface CliniverseEntitlement {
  tier: EntitlementTier
  isPro: boolean
  status: 'active' | 'inactive' | 'unknown'
  expiresAt: string | null
  source: 'server-rpc' | 'subscription-record' | 'none'
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

  const { data: isPro, error: proError } = await supabase.rpc('is_user_pro', { uid: user.id })

  if (proError) {
    return { ...FREE_ENTITLEMENT, status: 'unknown' }
  }

  if (isPro !== true) {
    return { ...FREE_ENTITLEMENT, source: 'server-rpc' }
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plan,status,expires_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) {
    return {
      tier: 'pro',
      isPro: true,
      status: 'active',
      expiresAt: null,
      source: 'server-rpc',
    }
  }

  return {
    tier: subscription?.plan === 'institution' ? 'institution' : 'pro',
    isPro: true,
    status: 'active',
    expiresAt: subscription?.expires_at ?? null,
    source: subscription ? 'subscription-record' : 'server-rpc',
  }
}

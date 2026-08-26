import { supabase } from '../supabase'

export type EntitlementTier = 'free' | 'pro' | 'institution'

export interface CliniverseEntitlement {
  tier: EntitlementTier
  isPro: boolean
  status: 'active' | 'inactive' | 'unknown'
  expiresAt: string | null
  source: 'server-rpc' | 'subscription-record' | 'none'
}

export async function getEntitlement(userId: string): Promise<CliniverseEntitlement> {
  const { data: isPro, error: proError } = await supabase.rpc('is_user_pro', { uid: userId })

  if (!proError && isPro === true) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan,status,expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const tier: EntitlementTier = subscription?.plan === 'institution' ? 'institution' : 'pro'

    return {
      tier,
      isPro: true,
      status: 'active',
      expiresAt: subscription?.expires_at ?? null,
      source: subscription ? 'subscription-record' : 'server-rpc',
    }
  }

  if (proError) {
    return {
      tier: 'free',
      isPro: false,
      status: 'unknown',
      expiresAt: null,
      source: 'none',
    }
  }

  return {
    tier: 'free',
    isPro: false,
    status: 'inactive',
    expiresAt: null,
    source: 'server-rpc',
  }
}

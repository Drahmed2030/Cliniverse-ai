import { supabase } from '../supabase'
import { requireCurrentUser } from './identity'

export type EntitlementTier = 'free' | 'pro' | 'institution'
export type EntitlementStatus = 'active' | 'grace' | 'billing_retry' | 'inactive' | 'unknown'

export interface CliniverseEntitlement {
  tier: EntitlementTier
  isPro: boolean
  status: EntitlementStatus
  expiresAt: string | null
  source: 'apple-subscription-record' | 'subscription-record' | 'none'
  product: 'cliniverse.core' | 'institution' | null
}

const FREE_ENTITLEMENT: CliniverseEntitlement = {
  tier: 'free',
  isPro: false,
  status: 'inactive',
  expiresAt: null,
  source: 'none',
  product: null,
}

const APPLE_CORE_PRODUCTS = new Set([
  'cliniverse.core.monthly',
  'cliniverse.core.yearly',
])

const LEGACY_PRO_PLANS = new Set(['pro_monthly', 'pro_yearly'])

export async function getOwnEntitlement(): Promise<CliniverseEntitlement> {
  const { user, error: authError } = await requireCurrentUser()
  if (!user || authError) {
    return { ...FREE_ENTITLEMENT, status: 'unknown' }
  }

  // Current subscription rows are the only release authority. The browser can
  // read its own derived state but cannot write subscription records or inspect
  // Apple transaction identifiers/evidence.
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plan,status,expires_at,provider,apple_product_id,verified_at,revoked_at,updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) {
    return { ...FREE_ENTITLEMENT, status: 'unknown' }
  }

  if (!subscription) {
    return FREE_ENTITLEMENT
  }

  const expiresAt = subscription.expires_at ?? null
  const expiryTime = expiresAt ? Date.parse(expiresAt) : null
  const expiryIsValid = expiryTime === null || (Number.isFinite(expiryTime) && expiryTime > Date.now())

  if (subscription.provider === 'apple') {
    const productId = subscription.apple_product_id
    const status = subscription.status
    const verifiedAt = subscription.verified_at

    if (
      typeof productId !== 'string'
      || !APPLE_CORE_PRODUCTS.has(productId)
      || !verifiedAt
      || subscription.revoked_at
    ) {
      return FREE_ENTITLEMENT
    }

    // Purchase verification may establish active state. Grace/billing-retry are
    // lifecycle states that will be accepted only once Server Notifications V2
    // writes a separately bounded entitlement window; until then they fail closed.
    if (status !== 'active' || !expiryIsValid) {
      return FREE_ENTITLEMENT
    }

    return {
      tier: 'pro',
      isPro: true,
      status: 'active',
      expiresAt,
      source: 'apple-subscription-record',
      product: 'cliniverse.core',
    }
  }

  // Preserve the existing non-Apple release behavior while the migration is
  // additive. Legacy rows still require an allowed plan, active status and a
  // non-expired entitlement window.
  if (subscription.status !== 'active' || !expiryIsValid) {
    return FREE_ENTITLEMENT
  }

  if (subscription.plan === 'institution') {
    return {
      tier: 'institution',
      isPro: true,
      status: 'active',
      expiresAt,
      source: 'subscription-record',
      product: 'institution',
    }
  }

  if (!LEGACY_PRO_PLANS.has(subscription.plan)) {
    return FREE_ENTITLEMENT
  }

  return {
    tier: 'pro',
    isPro: true,
    status: 'active',
    expiresAt,
    source: 'subscription-record',
    product: null,
  }
}

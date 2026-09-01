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

// Apple grants access in active state and while a bounded Billing Grace Period
// remains valid. Billing retry without grace, expiry, refund and revocation do
// not unlock Cliniverse.
const APPLE_ACCESS_STATUSES = new Set(['active', 'grace'])

// Kept as the additive legacy plan allowlist while Apple moves to product-ID
// authority. No unsupported plan can become PRO through this fallback path.
const allowedPlans = new Set(['pro_monthly', 'pro_yearly', 'institution'])

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
  const expiryIsInvalid = expiryTime !== null && (!Number.isFinite(expiryTime) || expiryTime <= Date.now())

  if (subscription.provider === 'apple') {
    const productId = subscription.apple_product_id
    const status = subscription.status
    const verifiedAt = subscription.verified_at

    if (
      typeof productId !== 'string'
      || !APPLE_CORE_PRODUCTS.has(productId)
      || !verifiedAt
      || subscription.revoked_at
      || !APPLE_ACCESS_STATUSES.has(status)
      || expiryIsInvalid
    ) {
      return FREE_ENTITLEMENT
    }

    return {
      tier: 'pro',
      isPro: true,
      status: status as 'active' | 'grace',
      expiresAt,
      source: 'apple-subscription-record',
      product: 'cliniverse.core',
    }
  }

  // Preserve the existing non-Apple release behavior while the migration is
  // additive. Legacy rows still require an allowed plan, active status and a
  // non-expired entitlement window.
  if (!allowedPlans.has(subscription.plan) || subscription.status !== 'active' || expiryIsInvalid) {
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

  return {
    tier: 'pro',
    isPro: true,
    status: 'active',
    expiresAt,
    source: 'subscription-record',
    product: null,
  }
}

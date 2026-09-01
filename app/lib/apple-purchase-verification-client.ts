import { getCurrentSession } from './identity'
import { getOwnEntitlement, type CliniverseEntitlement } from './entitlements'
import type { CliniversePlan, StorePurchaseResult } from './storekit-purchase-contract'

export type VerifiedApplePurchase = {
  persisted: true
  duplicate: boolean
  stale: boolean
  transaction: {
    transactionId: string
    originalTransactionId: string
    productId: string
    environment: 'Sandbox' | 'Production'
    purchaseDate: string
    expiresDate: string | null
  }
}

export type ApplePurchaseVerificationResult =
  | { ok: true; verified: VerifiedApplePurchase }
  | { ok: false; reason: string }

export type CompletedApplePurchaseResult =
  | { ok: true; entitlement: CliniverseEntitlement; verified: VerifiedApplePurchase }
  | { ok: false; reason: string }

export async function verifyStoreKitPurchaseResult(
  plan: CliniversePlan,
  purchase: StorePurchaseResult,
): Promise<ApplePurchaseVerificationResult> {
  if (purchase.status !== 'verified') {
    return { ok: false, reason: `storekit_${purchase.status}` }
  }

  const { data, error } = await getCurrentSession()
  const accessToken = data.session?.access_token
  if (error || !accessToken) {
    return { ok: false, reason: 'auth_session_unavailable' }
  }

  let response: Response
  try {
    response = await fetch('/api/subscriptions/apple/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan,
        signedTransaction: purchase.signedTransaction,
      }),
    })
  } catch {
    return { ok: false, reason: 'apple_verification_network_error' }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { ok: false, reason: 'apple_verification_invalid_response' }
  }

  if (!response.ok) {
    const reason = typeof (body as { reason?: unknown }).reason === 'string'
      ? String((body as { reason: string }).reason)
      : `apple_verification_http_${response.status}`
    return { ok: false, reason }
  }

  const result = body as {
    verified?: unknown
    persisted?: unknown
    duplicate?: unknown
    stale?: unknown
    entitlementRefreshRequired?: unknown
    transaction?: unknown
  }

  if (
    result.verified !== true
    || result.persisted !== true
    || result.entitlementRefreshRequired !== true
    || !result.transaction
  ) {
    return { ok: false, reason: 'apple_verification_untrusted_response' }
  }

  return {
    ok: true,
    verified: {
      persisted: true,
      duplicate: result.duplicate === true,
      stale: result.stale === true,
      transaction: result.transaction as VerifiedApplePurchase['transaction'],
    },
  }
}

/**
 * End-to-end client completion boundary. Even a verified and persisted Apple
 * transaction does not unlock PRO optimistically; the authoritative own-user
 * entitlement is read again from Supabase after persistence.
 */
export async function completeStoreKitPurchase(
  plan: CliniversePlan,
  purchase: StorePurchaseResult,
): Promise<CompletedApplePurchaseResult> {
  const verification = await verifyStoreKitPurchaseResult(plan, purchase)
  if (!verification.ok) return verification

  const entitlement = await getOwnEntitlement()
  if (!entitlement.isPro || entitlement.product !== 'cliniverse.core') {
    return { ok: false, reason: 'apple_entitlement_refresh_not_active' }
  }

  return {
    ok: true,
    entitlement,
    verified: verification.verified,
  }
}

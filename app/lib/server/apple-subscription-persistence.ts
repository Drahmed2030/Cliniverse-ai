import 'server-only'
import { createHash } from 'node:crypto'
import type { AppleVerifiedTransaction } from './apple-subscription-verification'

export type AppleLifecycleState =
  | 'active'
  | 'grace'
  | 'billing_retry'
  | 'expired'
  | 'revoked'
  | 'refunded'

export type PersistVerifiedAppleInput = {
  userId: string
  providerEventId: string
  transactionId: string
  originalTransactionId: string
  productId: string
  environment: 'Sandbox' | 'Production'
  lifecycleState: AppleLifecycleState
  eventAt: string
  purchaseAt: string
  expiresAt: string | null
  revokedAt: string | null
  signedPayloadHash: string
  verifiedAt: string
}

export type PersistVerifiedAppleResult = {
  ok: true
  duplicate: boolean
  stale: boolean
  subscriptionId: string
  status: string
  expiresAt: string | null
  originalTransactionId: string
}

export interface TrustedAppleSubscriptionPersistence {
  persist(input: PersistVerifiedAppleInput): Promise<PersistVerifiedAppleResult>
}

export function hashSignedApplePayload(signedTransaction: string) {
  return createHash('sha256')
    .update(signedTransaction, 'utf8')
    .digest('hex')
}

function deriveInitialLifecycleState(
  transaction: AppleVerifiedTransaction,
  verifiedAt: Date,
): AppleLifecycleState {
  if (transaction.revocationDate) return 'revoked'
  if (transaction.expiresDate) {
    const expiresAt = Date.parse(transaction.expiresDate)
    if (!Number.isFinite(expiresAt) || expiresAt <= verifiedAt.getTime()) return 'expired'
  }
  return 'active'
}

/**
 * Persists a transaction that already passed Apple's cryptographic verifier and
 * Cliniverse bundle/product checks. This function never grants UI access itself;
 * the app must re-read the authenticated entitlement after persistence.
 *
 * Initial StoreKit verification uses a deterministic provider event identity.
 * App Store Server Notifications V2 will supply notificationUUID instead.
 */
export async function persistVerifiedAppleTransaction(input: {
  userId: string
  transaction: AppleVerifiedTransaction
  repository: TrustedAppleSubscriptionPersistence
  verifiedAt?: Date
  providerEventId?: string
  eventAt?: Date
}): Promise<PersistVerifiedAppleResult> {
  if (!input.userId) throw new Error('apple_persistence_user_required')

  const transaction = input.transaction
  if (!transaction.transactionId || !transaction.originalTransactionId) {
    throw new Error('apple_persistence_transaction_identity_required')
  }
  if (!transaction.signedTransaction || transaction.signedTransaction.split('.').length !== 3) {
    throw new Error('apple_persistence_requires_verified_signed_transaction')
  }

  const verifiedAt = input.verifiedAt ?? new Date()
  const eventAt = input.eventAt ?? verifiedAt
  const lifecycleState = deriveInitialLifecycleState(transaction, verifiedAt)

  // The normal purchase verification path must never activate an already
  // revoked/expired transaction. Those lifecycle changes are handled by the
  // notification path and the same persistence authority.
  if (lifecycleState !== 'active') {
    throw new Error(`apple_initial_transaction_not_active:${lifecycleState}`)
  }

  const providerEventId = input.providerEventId || `storekit:transaction:${transaction.transactionId}`

  return input.repository.persist({
    userId: input.userId,
    providerEventId,
    transactionId: transaction.transactionId,
    originalTransactionId: transaction.originalTransactionId,
    productId: transaction.productId,
    environment: transaction.environment,
    lifecycleState,
    eventAt: eventAt.toISOString(),
    purchaseAt: transaction.purchaseDate,
    expiresAt: transaction.expiresDate,
    revokedAt: transaction.revocationDate,
    signedPayloadHash: hashSignedApplePayload(transaction.signedTransaction),
    verifiedAt: verifiedAt.toISOString(),
  })
}

import 'server-only'
import { createHash } from 'node:crypto'
import type { AppleVerifiedTransaction } from './apple-subscription-verification'

export type AppleLifecycleState = 'active' | 'expired' | 'revoked'

export type PersistVerifiedAppleInput = {
  userId: string
  transactionId: string
  originalTransactionId: string
  productId: string
  environment: 'Sandbox' | 'Production'
  purchaseAt: string
  expiresAt: string | null
  revokedAt: string | null
  lifecycleState: AppleLifecycleState
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

function deriveLifecycleState(transaction: AppleVerifiedTransaction, now: Date): AppleLifecycleState {
  if (transaction.revocationDate) return 'revoked'
  if (transaction.expiresDate) {
    const expiresAt = Date.parse(transaction.expiresDate)
    if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) return 'expired'
  }
  return 'active'
}

export async function persistVerifiedAppleTransaction(input: {
  userId: string
  transaction: AppleVerifiedTransaction
  repository: TrustedAppleSubscriptionPersistence
  verifiedAt?: Date
}): Promise<PersistVerifiedAppleResult> {
  if (!input.userId) throw new Error('apple_persistence_user_required')

  const transaction = input.transaction
  if (!transaction.signedTransaction || transaction.signedTransaction.split('.').length !== 3) {
    throw new Error('apple_persistence_requires_verified_signed_transaction')
  }

  const verifiedAt = input.verifiedAt ?? new Date()
  const signedPayloadHash = createHash('sha256')
    .update(transaction.signedTransaction, 'utf8')
    .digest('hex')

  return input.repository.persist({
    userId: input.userId,
    transactionId: transaction.transactionId,
    originalTransactionId: transaction.originalTransactionId,
    productId: transaction.productId,
    environment: transaction.environment,
    purchaseAt: transaction.purchaseDate,
    expiresAt: transaction.expiresDate,
    revokedAt: transaction.revocationDate,
    lifecycleState: deriveLifecycleState(transaction, verifiedAt),
    signedPayloadHash,
    verifiedAt: verifiedAt.toISOString(),
  })
}

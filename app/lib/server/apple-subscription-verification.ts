import 'server-only'

export type ApplePlan = 'monthly' | 'yearly'

export type AppleVerifiedTransaction = {
  transactionId: string
  originalTransactionId: string
  productId: string
  bundleId: string
  environment: 'Sandbox' | 'Production'
  purchaseDate: string
  expiresDate: string | null
  revocationDate: string | null
  signedTransaction: string
}

export type AppleVerificationResult =
  | { ok: true; transaction: AppleVerifiedTransaction }
  | { ok: false; reason: string }

export interface AppleSignedTransactionVerifier {
  verifyAndDecodeTransaction(signedTransaction: string): Promise<AppleVerifiedTransaction>
}

const EXPECTED_BUNDLE_ID = 'com.cliniverse.ai'
const PRODUCT_IDS: Record<ApplePlan, string> = {
  monthly: 'cliniverse.core.monthly',
  yearly: 'cliniverse.core.yearly',
}

export function expectedAppleProductId(plan: ApplePlan) {
  return PRODUCT_IDS[plan]
}

export async function verifyCliniverseAppleTransaction(input: {
  plan: ApplePlan
  signedTransaction: string
  verifier: AppleSignedTransactionVerifier
}): Promise<AppleVerificationResult> {
  if (!input.signedTransaction || input.signedTransaction.split('.').length !== 3) {
    return { ok: false, reason: 'invalid_signed_transaction_shape' }
  }

  let transaction: AppleVerifiedTransaction
  try {
    transaction = await input.verifier.verifyAndDecodeTransaction(input.signedTransaction)
  } catch {
    return { ok: false, reason: 'apple_signature_verification_failed' }
  }

  if (transaction.bundleId !== EXPECTED_BUNDLE_ID) {
    return { ok: false, reason: 'apple_bundle_mismatch' }
  }

  if (transaction.productId !== PRODUCT_IDS[input.plan]) {
    return { ok: false, reason: 'apple_product_mismatch' }
  }

  if (!transaction.transactionId || !transaction.originalTransactionId) {
    return { ok: false, reason: 'apple_transaction_identity_missing' }
  }

  if (transaction.revocationDate) {
    return { ok: false, reason: 'apple_transaction_revoked' }
  }

  if (transaction.expiresDate && Date.parse(transaction.expiresDate) <= Date.now()) {
    return { ok: false, reason: 'apple_subscription_expired' }
  }

  return { ok: true, transaction }
}

export function createUnavailableAppleVerifier(): AppleSignedTransactionVerifier {
  return {
    async verifyAndDecodeTransaction() {
      throw new Error('Apple App Store Server Library verifier is not configured')
    },
  }
}

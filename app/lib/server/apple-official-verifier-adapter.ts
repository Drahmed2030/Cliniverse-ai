import type {
  AppleVerifiedTransaction,
  AppleSignedTransactionVerifier,
} from './apple-subscription-verification'

export type AppleVerifierRuntimeConfig = {
  bundleId: 'com.cliniverse.ai'
  environment: 'Sandbox' | 'Production'
  appAppleId?: number
  enableOnlineChecks: boolean
  rootCertificates: Buffer[]
}

export type AppleLibraryModule = {
  Environment: { SANDBOX: unknown; PRODUCTION: unknown }
  SignedDataVerifier: new (
    roots: Buffer[],
    enableOnlineChecks: boolean,
    environment: unknown,
    bundleId: string,
    appAppleId?: number,
  ) => {
    verifyAndDecodeTransaction(signedTransaction: string): Promise<Record<string, unknown>>
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`apple_missing_${field}`)
  return value
}

function isoFromAppleMillis(value: unknown, field: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`apple_missing_${field}`)
  return new Date(value).toISOString()
}

/**
 * Builds the runtime verifier around Apple's official App Store Server Library.
 * The module is injected so package installation/configuration can be verified
 * independently from the security-sensitive normalization logic.
 */
export function createAppleOfficialVerifier(
  library: AppleLibraryModule,
  config: AppleVerifierRuntimeConfig,
): AppleSignedTransactionVerifier {
  if (config.environment === 'Production' && !config.appAppleId) {
    throw new Error('apple_app_id_required_for_production')
  }
  if (config.rootCertificates.length === 0) throw new Error('apple_root_certificates_required')

  const environment = config.environment === 'Sandbox'
    ? library.Environment.SANDBOX
    : library.Environment.PRODUCTION

  const verifier = new library.SignedDataVerifier(
    config.rootCertificates,
    config.enableOnlineChecks,
    environment,
    config.bundleId,
    config.appAppleId,
  )

  return {
    async verifyAndDecodeTransaction(signedTransaction: string): Promise<AppleVerifiedTransaction> {
      const decoded = await verifier.verifyAndDecodeTransaction(signedTransaction)
      return {
        transactionId: requireString(decoded.transactionId, 'transaction_id'),
        originalTransactionId: requireString(decoded.originalTransactionId, 'original_transaction_id'),
        productId: requireString(decoded.productId, 'product_id'),
        bundleId: requireString(decoded.bundleId, 'bundle_id'),
        environment: requireString(decoded.environment, 'environment') as 'Sandbox' | 'Production',
        purchaseDate: isoFromAppleMillis(decoded.purchaseDate, 'purchase_date'),
        expiresDate: decoded.expiresDate == null ? null : isoFromAppleMillis(decoded.expiresDate, 'expires_date'),
        revocationDate: decoded.revocationDate == null ? null : isoFromAppleMillis(decoded.revocationDate, 'revocation_date'),
        signedTransaction,
      }
    },
  }
}

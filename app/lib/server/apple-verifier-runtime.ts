import 'server-only'
import type { AppleSignedTransactionVerifier } from './apple-subscription-verification'
import {
  createAppleOfficialVerifier,
  type AppleLibraryModule,
  type AppleVerifierRuntimeConfig,
} from './apple-official-verifier-adapter'

const BUNDLE_ID = 'com.cliniverse.ai' as const

export type AppleLibraryLoader = () => Promise<AppleLibraryModule>

const loadOfficialAppleLibrary: AppleLibraryLoader = async () => {
  const library = await import('@apple/app-store-server-library')
  return library as unknown as AppleLibraryModule
}

function unavailable(reason: string): AppleSignedTransactionVerifier {
  return {
    async verifyAndDecodeTransaction() {
      throw new Error(reason)
    },
  }
}

function parseEnvironment(value: string | undefined): 'Sandbox' | 'Production' | null {
  if (value === 'Sandbox' || value === 'Production') return value
  return null
}

function parseAppAppleId(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

function parseRootCertificates(value: string | undefined): Buffer[] | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const certificates = parsed.map((item) => {
      if (typeof item !== 'string' || item.length === 0) throw new Error('invalid_certificate')
      return Buffer.from(item, 'base64')
    })
    if (certificates.some((certificate) => certificate.length === 0)) return null
    return certificates
  } catch {
    return null
  }
}

export function readAppleVerifierRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppleVerifierRuntimeConfig | null {
  const environment = parseEnvironment(env.APPLE_IAP_ENVIRONMENT)
  const rootCertificates = parseRootCertificates(env.APPLE_ROOT_CERTIFICATES_BASE64_JSON)
  if (!environment || !rootCertificates) return null

  const appAppleId = parseAppAppleId(env.APPLE_APP_ID)
  if (environment === 'Production' && !appAppleId) return null

  return {
    bundleId: BUNDLE_ID,
    environment,
    appAppleId,
    enableOnlineChecks: env.APPLE_IAP_ONLINE_CHECKS === 'true',
    rootCertificates,
  }
}

/**
 * Stable server-only runtime boundary for Apple's official verifier. Missing
 * or invalid configuration fails closed before a transaction can persist.
 * Tests may inject a deterministic loader; production uses the locked Apple
 * App Store Server Library package.
 */
export async function createConfiguredAppleVerifier(input?: {
  env?: NodeJS.ProcessEnv
  loadLibrary?: AppleLibraryLoader
}): Promise<AppleSignedTransactionVerifier> {
  const config = readAppleVerifierRuntimeConfig(input?.env)
  if (!config) return unavailable('apple_verifier_runtime_not_configured')

  const loadLibrary = input?.loadLibrary ?? loadOfficialAppleLibrary

  try {
    const library = await loadLibrary()
    return createAppleOfficialVerifier(library, config)
  } catch {
    return unavailable('apple_official_library_load_failed')
  }
}

export type PasskeyReadinessState =
  | 'disabled'
  | 'unsupported'
  | 'preview-only'
  | 'ready'

export type PasskeyReadiness = {
  state: PasskeyReadinessState
  canOffer: boolean
  reason: string
}

/**
 * Passkeys are an optional 2026 auth capability, not an entitlement or session
 * authority. The release stays fail-closed until all readiness gates pass.
 */
export function getPasskeyReadiness(input: {
  featureEnabled: boolean
  browserSupportsWebAuthn: boolean
  secureContext: boolean
  providerVerified: boolean
  releaseLane: 'preview' | 'production'
  productionApproved: boolean
}): PasskeyReadiness {
  if (!input.featureEnabled) {
    return { state: 'disabled', canOffer: false, reason: 'feature_disabled' }
  }
  if (!input.browserSupportsWebAuthn || !input.secureContext) {
    return { state: 'unsupported', canOffer: false, reason: 'webauthn_unavailable' }
  }
  if (!input.providerVerified) {
    return { state: 'disabled', canOffer: false, reason: 'provider_not_verified' }
  }
  if (input.releaseLane === 'production' && !input.productionApproved) {
    return { state: 'preview-only', canOffer: false, reason: 'production_not_approved' }
  }
  return { state: 'ready', canOffer: true, reason: 'ready' }
}

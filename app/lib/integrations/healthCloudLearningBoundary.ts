export const HEALTH_CLOUD_DIAGNOSTIC_DOMAINS = [
  'labs',
  'echo-report',
  'source-study',
] as const

export type HealthCloudDiagnosticDomain =
  (typeof HEALTH_CLOUD_DIAGNOSTIC_DOMAINS)[number]

export interface HealthCloudDomainCapability {
  enabled: boolean
  capabilityId: string
}

export interface HealthCloudLearningConfiguration {
  provider: 'health-cloud'
  institutionId: string
  tenantContextId: string
  domains: Partial<
    Record<HealthCloudDiagnosticDomain, HealthCloudDomainCapability>
  >
}

export type HealthCloudLearningAccess =
  | {
      state: 'deferred'
      domain: HealthCloudDiagnosticDomain
      reason: 'health-cloud-configuration-required'
    }
  | {
      state: 'unavailable'
      domain: HealthCloudDiagnosticDomain
      reason: 'domain-not-configured' | 'domain-disabled'
    }
  | {
      state: 'configured'
      domain: HealthCloudDiagnosticDomain
      provider: 'health-cloud'
      capabilityId: string
      institutionId: string
      tenantContextId: string
    }

const ROOT_KEYS = new Set([
  'provider',
  'institutionId',
  'tenantContextId',
  'domains',
])
const DOMAIN_KEYS = new Set(['enabled', 'capabilityId'])

export function isSafeHealthCloudLearningConfiguration(
  value: unknown,
): value is HealthCloudLearningConfiguration {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const root = value as Record<string, unknown>
  if (Object.keys(root).some(key => !ROOT_KEYS.has(key))) return false
  if (root.provider !== 'health-cloud') return false
  if (typeof root.institutionId !== 'string' || !root.institutionId.trim()) {
    return false
  }
  if (
    typeof root.tenantContextId !== 'string' ||
    !root.tenantContextId.trim()
  ) {
    return false
  }
  if (!root.domains || typeof root.domains !== 'object' || Array.isArray(root.domains)) {
    return false
  }

  for (const [domain, rawCapability] of Object.entries(
    root.domains as Record<string, unknown>,
  )) {
    if (
      !HEALTH_CLOUD_DIAGNOSTIC_DOMAINS.includes(
        domain as HealthCloudDiagnosticDomain,
      )
    ) {
      return false
    }
    if (
      !rawCapability ||
      typeof rawCapability !== 'object' ||
      Array.isArray(rawCapability)
    ) {
      return false
    }
    const capability = rawCapability as Record<string, unknown>
    if (Object.keys(capability).some(key => !DOMAIN_KEYS.has(key))) return false
    if (typeof capability.enabled !== 'boolean') return false
    if (
      typeof capability.capabilityId !== 'string' ||
      !capability.capabilityId.trim()
    ) {
      return false
    }
  }

  return true
}

export function resolveHealthCloudLearningAccess(
  domain: HealthCloudDiagnosticDomain,
  config?: HealthCloudLearningConfiguration | null,
): HealthCloudLearningAccess {
  if (!config || !isSafeHealthCloudLearningConfiguration(config)) {
    return {
      state: 'deferred',
      domain,
      reason: 'health-cloud-configuration-required',
    }
  }

  const capability = config.domains[domain]
  if (!capability) {
    return {
      state: 'unavailable',
      domain,
      reason: 'domain-not-configured',
    }
  }

  if (!capability.enabled) {
    return {
      state: 'unavailable',
      domain,
      reason: 'domain-disabled',
    }
  }

  return {
    state: 'configured',
    domain,
    provider: 'health-cloud',
    capabilityId: capability.capabilityId.trim(),
    institutionId: config.institutionId.trim(),
    tenantContextId: config.tenantContextId.trim(),
  }
}

export const HEALTH_CLOUD_LEARNING_BOUNDARY = Object.freeze({
  cliniverseOwns: [
    'learning-experience',
    'reasoning-flow',
    'learner-provenance-display',
  ],
  healthCloudOwns: [
    'institution-connection',
    'live-lab-context',
    'live-echo-report-context',
    'source-study-access-context',
  ],
  sourceSystemRemainsAuthoritative: true,
  livePhiInCliniverseFoundation: false,
  directHospitalApiInCliniverseFoundation: false,
} as const)

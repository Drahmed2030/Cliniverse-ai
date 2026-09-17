// Web-first canonical URL contract for internal content. Deliberately just a
// plain HTTPS-path builder — no Apple Universal Links / Associated Domains
// entitlement exists yet (do not enable that here; see
// docs/ENGAGEMENT_PRIVACY_BOUNDARY_V1.md's note on future Universal Link
// requirements before any native deep-link work begins).

export type EngagementDeepLinkKind = 'evidence' | 'reference' | 'ecg_case' | 'echo_study' | 'ward_case'

const VALID_ID = /^[a-zA-Z0-9_-]+$/

const PATH_BUILDERS: Record<EngagementDeepLinkKind, (id: string) => string> = {
  evidence: id => `/evidence/${id}`,
  reference: id => `/reference/${id}`,
  ecg_case: id => `/learn/ecg/${id}`,
  echo_study: id => `/learn/echo/${id}`,
  ward_case: id => `/learn/ward/${id}`,
}

export function buildEngagementDeepLinkPath(kind: EngagementDeepLinkKind, id: string): string {
  if (!VALID_ID.test(id)) throw new Error(`buildEngagementDeepLinkPath: invalid id "${id}"`)
  return PATH_BUILDERS[kind](id)
}

export function buildEngagementDeepLinkUrl(origin: string, kind: EngagementDeepLinkKind, id: string): string {
  return `${origin.replace(/\/$/, '')}${buildEngagementDeepLinkPath(kind, id)}`
}

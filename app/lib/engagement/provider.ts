import type { EngagementIdentity } from './identity'
import type { EngagementEventInput } from './events'
import type { ClinicianInterestSignal } from './interests'
import type { EvidenceDigest } from './evidenceDigest'

export type EngagementStubResult = { sent: false; reason: string }

export interface EngagementProvider {
  readonly name: string
  identify(identity: EngagementIdentity): Promise<void>
  track(event: EngagementEventInput): Promise<void>
  updatePreferences(userId: string, signals: ClinicianInterestSignal[]): Promise<void>
  /** Stub only in this release — must never send a real email. */
  sendEvidenceDigest(digest: EvidenceDigest): Promise<EngagementStubResult>
  /** Stub only in this release — must never send a real push notification. */
  sendPush(userId: string, payload: { title: string; body: string; appPath?: string }): Promise<EngagementStubResult>
}

const NOT_IMPLEMENTED: EngagementStubResult = { sent: false, reason: 'not_implemented_in_this_release' }

export class NoopEngagementProvider implements EngagementProvider {
  readonly name = 'noop'
  async identify(): Promise<void> {}
  async track(): Promise<void> {}
  async updatePreferences(): Promise<void> {}
  async sendEvidenceDigest(): Promise<EngagementStubResult> { return NOT_IMPLEMENTED }
  async sendPush(): Promise<EngagementStubResult> { return NOT_IMPLEMENTED }
}

function redactUserId(userId: string) {
  return userId.length > 8 ? `${userId.slice(0, 4)}…${userId.slice(-4)}` : 'redacted'
}

/**
 * Dev-only visibility: logs calls with sensitive values redacted and never
 * transmits anywhere. Never select this provider outside development.
 */
export class DevLoggerEngagementProvider implements EngagementProvider {
  readonly name = 'dev-logger'

  async identify(identity: EngagementIdentity): Promise<void> {
    console.log('[engagement:identify]', {
      userId: redactUserId(identity.userId),
      hasEmail: Boolean(identity.email),
      hasDisplayName: Boolean(identity.displayName),
      tier: identity.entitlement.tier,
      locale: identity.locale,
    })
  }

  async track(event: EngagementEventInput): Promise<void> {
    console.log('[engagement:track]', {
      type: event.type,
      hasUser: Boolean(event.userId),
      occurredAt: event.occurredAt,
      properties: event.properties ?? {},
    })
  }

  async updatePreferences(userId: string, signals: ClinicianInterestSignal[]): Promise<void> {
    console.log('[engagement:updatePreferences]', { userId: redactUserId(userId), topics: signals.map(s => s.topic) })
  }

  async sendEvidenceDigest(digest: EvidenceDigest): Promise<EngagementStubResult> {
    console.log('[engagement:sendEvidenceDigest:stub]', { userId: redactUserId(digest.userId), itemCount: digest.items.length })
    return NOT_IMPLEMENTED
  }

  async sendPush(userId: string, payload: { title: string; body: string; appPath?: string }): Promise<EngagementStubResult> {
    console.log('[engagement:sendPush:stub]', { userId: redactUserId(userId), appPath: payload.appPath })
    return NOT_IMPLEMENTED
  }
}

/**
 * Environment-driven, fail-closed selection. Any unset, unknown, or
 * production-disallowed value resolves to Noop. No vendor SDK (Customer.io,
 * PostHog, Braze, OneSignal, or otherwise) is wired in this release.
 */
export function selectEngagementProvider(
  env: string | undefined = process.env.NEXT_PUBLIC_ENGAGEMENT_PROVIDER,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): EngagementProvider {
  if (env === 'dev-logger' && nodeEnv !== 'production') return new DevLoggerEngagementProvider()
  return new NoopEngagementProvider()
}

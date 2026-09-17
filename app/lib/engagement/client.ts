import { resolveEngagementIdentity } from './identity.ts'
import { validateEngagementEvent, type EngagementEventProperties, type EngagementEventType } from './events.ts'
import { validateInterestSignal, type ClinicianInterestSignal } from './interests.ts'
import { selectEngagementProvider, type EngagementProvider } from './provider.ts'
import { callProviderSafely } from './safeProviderCall.ts'

let cachedProvider: EngagementProvider | null = null
function getProvider(): EngagementProvider {
  if (!cachedProvider) cachedProvider = selectEngagementProvider()
  return cachedProvider
}

export async function identifyCurrentUser(): Promise<void> {
  const result = await resolveEngagementIdentity()
  if (result.status !== 'identified') return
  await callProviderSafely('identify', getProvider(), provider => provider.identify(result.identity))
}

/**
 * Anonymous callers are accepted here only for event types that don't
 * require identity (see IDENTITY_REQUIRED_EVENT_TYPES) — everything else is
 * rejected by validateEngagementEvent before it ever reaches a provider.
 */
export async function trackEngagementEvent(
  type: EngagementEventType,
  properties?: EngagementEventProperties,
): Promise<{ tracked: boolean; blockers?: string[] }> {
  const identity = await resolveEngagementIdentity()
  const userId = identity.status === 'identified' ? identity.identity.userId : null
  const validation = validateEngagementEvent({ type, userId, properties: properties as Record<string, unknown> | undefined, occurredAt: new Date().toISOString() })
  if (!validation.ok) return { tracked: false, blockers: validation.blockers }
  await callProviderSafely('track', getProvider(), provider => provider.track(validation.event))
  return { tracked: true }
}

export async function updateInterestPreferences(
  selections: Array<{ topic: string; source?: 'explicit' | 'behavioral'; confidence?: number }>,
): Promise<{ updated: boolean; blockers?: string[]; signals?: ClinicianInterestSignal[] }> {
  const identity = await resolveEngagementIdentity()
  if (identity.status !== 'identified') return { updated: false, blockers: ['authenticated-user-id-required'] }

  const now = new Date().toISOString()
  const signals: ClinicianInterestSignal[] = []
  const blockers: string[] = []
  for (const selection of selections) {
    const validation = validateInterestSignal({
      topic: selection.topic,
      source: selection.source ?? 'explicit',
      confidence: selection.confidence,
      updatedAt: now,
    })
    if (!validation.ok) { blockers.push(...validation.blockers); continue }
    signals.push(validation.signal)
  }
  if (blockers.length) return { updated: false, blockers }

  await callProviderSafely('updatePreferences', getProvider(), provider => provider.updatePreferences(identity.identity.userId, signals))
  return { updated: true, signals }
}

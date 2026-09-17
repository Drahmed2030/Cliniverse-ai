import { requireCurrentUser } from '../identity.ts'
import { getOwnProfile } from '../profile.ts'
import { getOwnEntitlement, type CliniverseEntitlement } from '../entitlements.ts'

export interface EngagementIdentity {
  userId: string
  email: string | null
  displayName: string | null
  /** Read-only derived context — this module never grants or infers entitlement itself. */
  entitlement: CliniverseEntitlement
  locale: string | null
}

export type EngagementIdentityResult =
  | { status: 'identified'; identity: EngagementIdentity }
  | { status: 'anonymous' }
  | { status: 'error'; message: string }

/**
 * Supabase Auth is the only identity authority for engagement. Every field
 * below is derived from the authenticated session (or its owned profile/
 * entitlement rows) — nothing here accepts a caller-supplied userId, a
 * device identifier, or a client-set entitlement flag.
 */
export async function resolveEngagementIdentity(): Promise<EngagementIdentityResult> {
  const { user, error } = await requireCurrentUser()
  if (error) return { status: 'error', message: 'Unable to resolve the authenticated session.' }
  if (!user) return { status: 'anonymous' }

  const [profileResult, entitlement] = await Promise.all([
    getOwnProfile(),
    getOwnEntitlement(),
  ])

  const displayName = typeof profileResult.data?.name === 'string' ? profileResult.data.name : null
  const locale = typeof user.user_metadata?.locale === 'string' ? user.user_metadata.locale : null

  return {
    status: 'identified',
    identity: {
      userId: user.id,
      email: user.email ?? null,
      displayName,
      entitlement,
      locale,
    },
  }
}

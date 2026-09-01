import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type {
  PersistVerifiedAppleInput,
  PersistVerifiedAppleResult,
  TrustedAppleSubscriptionPersistence,
} from './apple-subscription-persistence'

function requireServerConfig() {
  const url = process.env.CLINIVERSE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('apple_persistence_server_config_missing')
  return { url, serviceRoleKey }
}

export function createSupabaseAppleSubscriptionRepository(): TrustedAppleSubscriptionPersistence {
  const { url, serviceRoleKey } = requireServerConfig()
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return {
    async persist(input: PersistVerifiedAppleInput): Promise<PersistVerifiedAppleResult> {
      const { data, error } = await supabase.rpc('persist_verified_apple_subscription', {
        p_user_id: input.userId,
        p_provider_event_id: input.providerEventId,
        p_transaction_id: input.transactionId,
        p_original_transaction_id: input.originalTransactionId,
        p_product_id: input.productId,
        p_environment: input.environment,
        p_lifecycle_status: input.lifecycleState,
        p_event_at: input.eventAt,
        p_purchase_at: input.purchaseAt,
        p_expires_at: input.expiresAt,
        p_revoked_at: input.revokedAt,
        p_verified_at: input.verifiedAt,
        p_signed_payload_hash: input.signedPayloadHash,
      })

      if (error) {
        const code = error.code || 'unknown'
        throw new Error(`apple_persistence_failed:${code}:${error.message || 'rpc_error'}`)
      }
      if (!data || typeof data !== 'object') {
        throw new Error('apple_persistence_invalid_result')
      }

      const result = data as Record<string, unknown>
      if (result.ok !== true || typeof result.subscriptionId !== 'string') {
        throw new Error('apple_persistence_rejected')
      }

      return {
        ok: true,
        duplicate: result.duplicate === true,
        stale: result.stale === true,
        subscriptionId: result.subscriptionId,
        status: typeof result.status === 'string' ? result.status : 'unknown',
        expiresAt: typeof result.expiresAt === 'string' ? result.expiresAt : null,
        originalTransactionId: input.originalTransactionId,
      }
    },
  }
}

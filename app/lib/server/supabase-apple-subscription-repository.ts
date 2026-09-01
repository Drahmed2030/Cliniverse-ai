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
        p_transaction_id: input.transactionId,
        p_original_transaction_id: input.originalTransactionId,
        p_product_id: input.productId,
        p_environment: input.environment,
        p_purchase_at: input.purchaseAt,
        p_expires_at: input.expiresAt,
        p_revoked_at: input.revokedAt,
        p_lifecycle_state: input.lifecycleState,
        p_signed_payload_hash: input.signedPayloadHash,
        p_verified_at: input.verifiedAt,
      })

      if (error) throw new Error(`apple_persistence_failed:${error.code || 'unknown'}`)
      if (!data || data.ok !== true || typeof data.subscriptionId !== 'string') {
        throw new Error('apple_persistence_invalid_result')
      }

      return {
        ok: true,
        duplicate: data.duplicate === true,
        stale: data.stale === true,
        subscriptionId: data.subscriptionId,
        status: String(data.status || 'unknown'),
        expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : null,
        originalTransactionId: String(data.originalTransactionId || ''),
      }
    },
  }
}

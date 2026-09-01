import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  verifyCliniverseAppleTransaction,
  type ApplePlan,
} from '../../../../lib/server/apple-subscription-verification'
import { createConfiguredAppleVerifier } from '../../../../lib/server/apple-verifier-runtime'
import { persistVerifiedAppleTransaction } from '../../../../lib/server/apple-subscription-persistence'
import { createSupabaseAppleSubscriptionRepository } from '../../../../lib/server/supabase-apple-subscription-repository'
import { createServerFlightRecorder } from '../../../../lib/server/observability/flight-recorder'
import { recordDataLineage } from '../../../../lib/server/observability/data-lineage'
import {
  createCorrelationId,
  withOperationalSpan,
} from '../../../../lib/server/observability/operational-telemetry'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zbiujqxinvcxvuviuenx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

function isPlan(value: unknown): value is ApplePlan {
  return value === 'monthly' || value === 'yearly'
}

export async function POST(request: NextRequest) {
  const recorder = createServerFlightRecorder()
  const correlationId = createCorrelationId(request.headers.get('x-request-id'))

  return withOperationalSpan({
    operation: 'subscriptions.apple.verify',
    correlationId,
    recorder,
    attributes: {
      http_method: 'POST',
      route: '/api/subscriptions/apple/verify',
    },
    run: async (operationalContext) => {
      const authorization = request.headers.get('authorization') || ''
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      })
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      await recordDataLineage({
        recorder,
        context: operationalContext,
        operation: 'subscriptions.apple.verify',
        edge: {
          source: 'supabase.auth.jwt',
          transform: 'supabase.auth.getUser',
          sink: 'authenticated_request_context',
          classification: 'account',
          fields: ['user_id'],
          outcome: 'success',
        },
      })

      let body: unknown
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }

      const payload = body as { plan?: unknown; signedTransaction?: unknown }
      if (!isPlan(payload.plan) || typeof payload.signedTransaction !== 'string') {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }

      const verifier = await createConfiguredAppleVerifier()
      const result = await verifyCliniverseAppleTransaction({
        plan: payload.plan,
        signedTransaction: payload.signedTransaction,
        verifier,
      })

      if (!result.ok) {
        const status = result.reason === 'apple_signature_verification_failed' ? 503 : 422
        return NextResponse.json({ verified: false, persisted: false, reason: result.reason }, { status })
      }

      await recordDataLineage({
        recorder,
        context: operationalContext,
        operation: 'subscriptions.apple.verify',
        edge: {
          source: 'apple.signed_transaction',
          transform: 'apple.signed_data_verifier',
          sink: 'verified_subscription_transaction',
          classification: 'account',
          fields: [
            'transaction_id',
            'original_transaction_id',
            'product_id',
            'environment',
            'purchase_date',
            'expires_date',
            'revocation_date',
          ],
          outcome: 'success',
        },
      })

      let persisted
      try {
        const repository = createSupabaseAppleSubscriptionRepository()
        persisted = await persistVerifiedAppleTransaction({
          userId: data.user.id,
          transaction: result.transaction,
          repository,
        })
      } catch {
        await recordDataLineage({
          recorder,
          context: operationalContext,
          operation: 'subscriptions.apple.verify',
          edge: {
            source: 'verified_subscription_transaction',
            transform: 'subscription_authority.persist_verified_apple_transaction',
            sink: 'public.subscriptions',
            classification: 'account',
            fields: ['user_id', 'product_id', 'original_transaction_id', 'expires_at', 'status'],
            outcome: 'failure',
          },
        })
        return NextResponse.json(
          { verified: true, persisted: false, reason: 'apple_subscription_persistence_failed' },
          { status: 503 },
        )
      }

      await recordDataLineage({
        recorder,
        context: operationalContext,
        operation: 'subscriptions.apple.verify',
        edge: {
          source: 'verified_subscription_transaction',
          transform: 'subscription_authority.persist_verified_apple_transaction',
          sink: 'public.subscriptions',
          classification: 'account',
          fields: ['user_id', 'product_id', 'original_transaction_id', 'expires_at', 'status'],
          outcome: 'success',
        },
      })

      return NextResponse.json({
        verified: true,
        persisted: true,
        duplicate: persisted.duplicate,
        stale: persisted.stale,
        entitlementRefreshRequired: true,
        correlationId,
        transaction: {
          transactionId: result.transaction.transactionId,
          originalTransactionId: result.transaction.originalTransactionId,
          productId: result.transaction.productId,
          environment: result.transaction.environment,
          purchaseDate: result.transaction.purchaseDate,
          expiresDate: result.transaction.expiresDate,
        },
      })
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createUnavailableAppleVerifier,
  verifyCliniverseAppleTransaction,
  type ApplePlan,
} from '../../../../lib/server/apple-subscription-verification'

const supabaseUrl = 'https://zbiujqxinvcxvuviuenx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InpiaXVqcXhpbnZjeHZ1dml1ZW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTEzOTYsImV4cCI6MjA5OTc2NzM5Nn0.7znHWJXnYNgQmTVyzouuxQDFXxDEvVk9F2I75ArA8d8'

function isPlan(value: unknown): value is ApplePlan {
  return value === 'monthly' || value === 'yearly'
}

export async function POST(request: NextRequest) {
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

  const verifier = createUnavailableAppleVerifier()
  const result = await verifyCliniverseAppleTransaction({
    plan: payload.plan,
    signedTransaction: payload.signedTransaction,
    verifier,
  })

  if (!result.ok) {
    const status = result.reason === 'apple_signature_verification_failed' ? 503 : 422
    return NextResponse.json({ verified: false, reason: result.reason }, { status })
  }

  return NextResponse.json({
    verified: true,
    userId: data.user.id,
    transaction: {
      transactionId: result.transaction.transactionId,
      originalTransactionId: result.transaction.originalTransactionId,
      productId: result.transaction.productId,
      environment: result.transaction.environment,
      purchaseDate: result.transaction.purchaseDate,
      expiresDate: result.transaction.expiresDate,
    },
  })
}

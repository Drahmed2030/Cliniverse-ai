import { NextRequest, NextResponse } from 'next/server'
import {
  authorizeNeuraOpsDiagnostic,
  getNeuraOpsGatewayReadiness,
  runGeminiSyntheticProbe,
} from '@/app/lib/server/neuraops/gateway'
import {
  createNeuraOpsTrustReceipt,
  recordNeuraOpsTrustReceipt,
} from '@/app/lib/server/neuraops/trust-receipt'
import { createServerFlightRecorder } from '@/app/lib/server/observability/flight-recorder'
import {
  createCorrelationId,
  withOperationalSpan,
} from '@/app/lib/server/observability/operational-telemetry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getNeuraOpsGatewayReadiness(), {
    headers: { 'cache-control': 'no-store' },
  })
}

export async function POST(request: NextRequest) {
  const readiness = getNeuraOpsGatewayReadiness()

  if (!readiness.environmentAllowed) {
    return NextResponse.json({ ...readiness, code: 'production-blocked' }, { status: 403 })
  }
  if (!readiness.enabled) {
    return NextResponse.json({ ...readiness, code: 'disabled' }, { status: 503 })
  }
  if (!readiness.configured) {
    return NextResponse.json({ ...readiness, code: 'not-configured' }, { status: 503 })
  }

  const authorization = request.headers.get('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : null
  if (!authorizeNeuraOpsDiagnostic(token, process.env.NEURAOPS_DIAGNOSTIC_TOKEN)) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 })
  }

  const correlationId = createCorrelationId(request.headers.get('x-correlation-id'))
  const recorder = createServerFlightRecorder()
  const response = await withOperationalSpan({
    operation: 'neuraops.gemini.synthetic_probe',
    correlationId,
    recorder,
    attributes: {
      provider: readiness.provider,
      model: readiness.model,
      data_mode: readiness.dataMode,
      environment: process.env.VERCEL_ENV ?? 'local',
    },
    run: async context => {
      const result = await runGeminiSyntheticProbe({ apiKey: process.env.GEMINI_API_KEY! })
      const receipt = createNeuraOpsTrustReceipt({ context, result })
      await recordNeuraOpsTrustReceipt({ recorder, context, receipt })
      return { result, receipt }
    },
  })

  return NextResponse.json(response, {
    status: response.result.ok ? 200 : 502,
    headers: { 'cache-control': 'no-store' },
  })
}

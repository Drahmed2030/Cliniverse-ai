import { NextRequest, NextResponse } from 'next/server'
import {
  authorizeNeuraOpsDiagnostic,
  getNeuraOpsGatewayReadiness,
  runGeminiSyntheticProbe,
} from '@/app/lib/server/neuraops/gateway'

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

  const result = await runGeminiSyntheticProbe({ apiKey: process.env.GEMINI_API_KEY! })
  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { 'cache-control': 'no-store' },
  })
}

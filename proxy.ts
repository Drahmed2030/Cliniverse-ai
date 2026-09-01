import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Source for deferred modules remains in the repository, but Apple v1 must not
// expose their server-side APIs merely because Next.js discovers route files.
const DEFERRED_API_PREFIXES = [
  '/api/analyze-doc',
  '/api/cache',
  '/api/cron-case',
  '/api/cron-pubmed',
  '/api/exam',
  '/api/generate-case',
  '/api/ingest',
  '/api/intelligence',
  '/api/knowledge-graph',
  '/api/life-insight',
  '/api/medfeed',
  '/api/medical-ai',
  '/api/monitor',
  '/api/mood',
  '/api/neuraops',
  '/api/oracle',
  '/api/storage',
  '/api/symptom-check',
  '/api/tts',
] as const

function isDeferredApi(pathname: string) {
  return DEFERRED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function proxy(request: NextRequest) {
  if (isDeferredApi(request.nextUrl.pathname)) {
    return NextResponse.json(
      { error: 'Not found' },
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Cliniverse-Release-Gate': 'apple-v1-deferred',
        },
      },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

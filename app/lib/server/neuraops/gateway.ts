import { timingSafeEqual } from 'node:crypto'

export const NEURAOPS_GEMINI_MODEL = 'gemini-3.8-flash' as const
export const NEURAOPS_GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions' as const
export const NEURAOPS_PROBE_MARKER = 'NEURAOPS_GEMINI_OK' as const

export type NeuraOpsDataMode = 'fictional-simulation' | 'real-patient'
export type NeuraOpsProbeCode =
  | 'ready'
  | 'disabled'
  | 'not-configured'
  | 'production-blocked'
  | 'unauthorized'
  | 'authentication-failed'
  | 'model-not-found'
  | 'rate-limited'
  | 'provider-error'
  | 'invalid-response'
  | 'timeout'

type Environment = Record<string, string | undefined>
type FetchLike = typeof fetch

export type NeuraOpsGatewayReadiness = {
  provider: 'google-gemini'
  model: typeof NEURAOPS_GEMINI_MODEL
  configured: boolean
  enabled: boolean
  environmentAllowed: boolean
  dataMode: 'fictional-simulation'
  probe: 'not-run'
}

export type NeuraOpsProbeResult = {
  ok: boolean
  code: NeuraOpsProbeCode
  provider: 'google-gemini'
  model: typeof NEURAOPS_GEMINI_MODEL
  dataMode: 'fictional-simulation'
  latencyMs: number
  markerMatched: boolean
  providerStatus?: number
}

function isNonProductionEnvironment(env: Environment): boolean {
  if (env.VERCEL_ENV) return env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development'
  return env.NODE_ENV !== 'production'
}

export function getNeuraOpsGatewayReadiness(env: Environment = process.env): NeuraOpsGatewayReadiness {
  return {
    provider: 'google-gemini',
    model: NEURAOPS_GEMINI_MODEL,
    configured: Boolean(env.GEMINI_API_KEY?.trim() && env.NEURAOPS_DIAGNOSTIC_TOKEN?.trim()),
    enabled: env.NEURAOPS_GEMINI_LAB_ENABLED === 'true',
    environmentAllowed: isNonProductionEnvironment(env),
    dataMode: 'fictional-simulation',
    probe: 'not-run',
  }
}

export function authorizeNeuraOpsDiagnostic(requestToken: string | null, expectedToken: string | undefined): boolean {
  if (!requestToken || !expectedToken) return false

  const supplied = Buffer.from(requestToken)
  const expected = Buffer.from(expectedToken)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

function collectText(value: unknown, output: string[] = []): string[] {
  if (typeof value === 'string') output.push(value)
  else if (Array.isArray(value)) value.forEach(item => collectText(item, output))
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectText(item, output))
  return output
}

function codeForProviderStatus(status: number): NeuraOpsProbeCode {
  if (status === 401 || status === 403) return 'authentication-failed'
  if (status === 404) return 'model-not-found'
  if (status === 429) return 'rate-limited'
  return 'provider-error'
}

export async function runGeminiSyntheticProbe(options: {
  apiKey: string
  dataMode?: NeuraOpsDataMode
  fetchImpl?: FetchLike
  timeoutMs?: number
}): Promise<NeuraOpsProbeResult> {
  if ((options.dataMode ?? 'fictional-simulation') !== 'fictional-simulation') {
    throw new Error('NeuraOps Gateway v0 accepts fictional simulation data only.')
  }
  if (!options.apiKey.trim()) {
    throw new Error('NeuraOps Gateway v0 requires a server-side Gemini API key.')
  }

  const startedAt = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000)

  try {
    const response = await (options.fetchImpl ?? fetch)(NEURAOPS_GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': options.apiKey,
      },
      body: JSON.stringify({
        model: NEURAOPS_GEMINI_MODEL,
        input: `This is a non-clinical infrastructure check using no patient data. Return exactly: ${NEURAOPS_PROBE_MARKER}`,
        generation_config: { thinking_level: 'low', temperature: 0 },
      }),
      cache: 'no-store',
      signal: controller.signal,
    })

    const latencyMs = Date.now() - startedAt
    if (!response.ok) {
      return {
        ok: false,
        code: codeForProviderStatus(response.status),
        provider: 'google-gemini',
        model: NEURAOPS_GEMINI_MODEL,
        dataMode: 'fictional-simulation',
        latencyMs,
        markerMatched: false,
        providerStatus: response.status,
      }
    }

    const payload: unknown = await response.json()
    const markerMatched = collectText(payload).some(value => value.includes(NEURAOPS_PROBE_MARKER))
    return {
      ok: markerMatched,
      code: markerMatched ? 'ready' : 'invalid-response',
      provider: 'google-gemini',
      model: NEURAOPS_GEMINI_MODEL,
      dataMode: 'fictional-simulation',
      latencyMs,
      markerMatched,
      providerStatus: response.status,
    }
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'AbortError'
    return {
      ok: false,
      code: timedOut ? 'timeout' : 'provider-error',
      provider: 'google-gemini',
      model: NEURAOPS_GEMINI_MODEL,
      dataMode: 'fictional-simulation',
      latencyMs: Date.now() - startedAt,
      markerMatched: false,
    }
  } finally {
    clearTimeout(timer)
  }
}

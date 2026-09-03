import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  NEURAOPS_GEMINI_ENDPOINT,
  NEURAOPS_GEMINI_MODEL,
  authorizeNeuraOpsDiagnostic,
  getNeuraOpsGatewayReadiness,
  runGeminiSyntheticProbe,
} from '../app/lib/server/neuraops/gateway.ts'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('gateway readiness fails closed and exposes no secret values', () => {
  const readiness = getNeuraOpsGatewayReadiness({
    NODE_ENV: 'development',
    GEMINI_API_KEY: 'secret-api-key',
    NEURAOPS_DIAGNOSTIC_TOKEN: 'secret-diagnostic-token',
    NEURAOPS_GEMINI_LAB_ENABLED: 'false',
  })

  assert.equal(readiness.configured, true)
  assert.equal(readiness.enabled, false)
  assert.equal(JSON.stringify(readiness).includes('secret-api-key'), false)
  assert.equal(JSON.stringify(readiness).includes('secret-diagnostic-token'), false)

  const missing = getNeuraOpsGatewayReadiness({ NODE_ENV: 'development' })
  assert.equal(missing.configured, false)
  assert.equal(missing.enabled, false)
})

test('gateway blocks production and validates the diagnostic token', () => {
  assert.equal(getNeuraOpsGatewayReadiness({ VERCEL_ENV: 'production' }).environmentAllowed, false)
  assert.equal(getNeuraOpsGatewayReadiness({ VERCEL_ENV: 'preview' }).environmentAllowed, true)
  assert.equal(authorizeNeuraOpsDiagnostic('correct-token', 'correct-token'), true)
  assert.equal(authorizeNeuraOpsDiagnostic('wrong-token', 'correct-token'), false)
  assert.equal(authorizeNeuraOpsDiagnostic(null, 'correct-token'), false)
})

test('synthetic probe uses the official Gemini interaction contract without putting the key in the URL', async () => {
  let captured
  const result = await runGeminiSyntheticProbe({
    apiKey: 'private-key',
    fetchImpl: async (url, init) => {
      captured = { url, init }
      return new Response(JSON.stringify({ outputs: [{ text: 'NEURAOPS_GEMINI_OK' }] }), { status: 200 })
    },
  })

  assert.equal(result.ok, true)
  assert.equal(result.code, 'ready')
  assert.equal(captured.url, NEURAOPS_GEMINI_ENDPOINT)
  assert.equal(captured.url.includes('private-key'), false)
  assert.equal(captured.init.headers['x-goog-api-key'], 'private-key')
  assert.equal(JSON.parse(captured.init.body).model, NEURAOPS_GEMINI_MODEL)
  assert.match(JSON.parse(captured.init.body).input, /no patient data/i)
})

test('synthetic probe rejects patient mode and classifies model-not-found diagnostics', async () => {
  await assert.rejects(
    runGeminiSyntheticProbe({ apiKey: 'private-key', dataMode: 'real-patient' }),
    /fictional simulation data only/i,
  )

  const result = await runGeminiSyntheticProbe({
    apiKey: 'private-key',
    fetchImpl: async () => new Response('{}', { status: 404 }),
  })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'model-not-found')
  assert.equal(result.providerStatus, 404)
})

test('missing API key fails before any network request', async () => {
  let networkCalls = 0
  await assert.rejects(
    runGeminiSyntheticProbe({
      apiKey: '   ',
      fetchImpl: async () => {
        networkCalls += 1
        return new Response('{}', { status: 200 })
      },
    }),
    /server-side Gemini API key/i,
  )
  assert.equal(networkCalls, 0)
})

test('route and environment contract keep diagnostics private and non-production', () => {
  const route = read('app/api/labs/gemini/health/route.ts')
  const envExample = read('.env.example')

  assert.match(route, /production-blocked/)
  assert.match(route, /Bearer /)
  assert.equal(route.includes('request.json()'), false)
  assert.equal(envExample.includes('NEXT_PUBLIC_GEMINI'), false)
  assert.match(envExample, /GEMINI_API_KEY=\n/)
  assert.match(envExample, /NEURAOPS_DIAGNOSTIC_TOKEN=\n/)
})

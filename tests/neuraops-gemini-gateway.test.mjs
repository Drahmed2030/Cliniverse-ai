import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  NEURAOPS_GEMINI_ENDPOINT,
  NEURAOPS_GEMINI_MODEL,
  authorizeNeuraOpsDiagnostic,
  getNeuraOpsGatewayReadiness,
  resolveGeminiApiKey,
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

test('gateway accepts the existing Google key alias without exposing which secret is configured', () => {
  const env = {
    NODE_ENV: 'development',
    GOOGLE_AI_API_KEY: 'existing-google-key',
    NEURAOPS_DIAGNOSTIC_TOKEN: 'diagnostic-token',
    NEURAOPS_GEMINI_LAB_ENABLED: 'true',
  }

  assert.equal(resolveGeminiApiKey(env), 'existing-google-key')
  assert.equal(getNeuraOpsGatewayReadiness(env).configured, true)
  assert.equal(JSON.stringify(getNeuraOpsGatewayReadiness(env)).includes('existing-google-key'), false)
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
  const requestBody = JSON.parse(captured.init.body)
  assert.equal(requestBody.model, NEURAOPS_GEMINI_MODEL)
  assert.equal(requestBody.store, false)
  assert.match(requestBody.input, /no patient data/i)
  assert.deepEqual(Object.keys(requestBody).sort(), ['input', 'model', 'store'])
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

  const invalid = await runGeminiSyntheticProbe({
    apiKey: 'private-key',
    fetchImpl: async () => new Response(JSON.stringify({
      error: { code: 400, status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' },
    }), { status: 400 }),
  })
  assert.equal(invalid.code, 'authentication-failed')
  assert.equal(invalid.providerStatus, 400)
  assert.equal(invalid.diagnosticReason, 'invalid-api-key')
  assert.equal(JSON.stringify(invalid).includes('Please pass a valid API key'), false)
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
  assert.match(route, /withOperationalSpan/)
  assert.match(route, /createNeuraOpsTrustReceipt/)
  assert.match(route, /recordNeuraOpsTrustReceipt/)
  assert.equal(route.includes('request.json()'), false)
  assert.equal(envExample.includes('NEXT_PUBLIC_GEMINI'), false)
  assert.match(envExample, /GEMINI_API_KEY=\n/)
  assert.match(envExample, /GOOGLE_AI_API_KEY=\n/)
  assert.match(envExample, /NEURAOPS_DIAGNOSTIC_TOKEN=\n/)
})

test('diagnostic console is preview-only and keeps the token ephemeral', () => {
  const page = read('app/labs/gemini-diagnostic/page.tsx')
  const console = read('app/labs/gemini-diagnostic/DiagnosticConsole.tsx')

  assert.match(page, /process\.env\.VERCEL_ENV === 'production'/)
  assert.match(page, /notFound\(\)/)
  assert.match(page, /robots: \{ index: false, follow: false \}/)
  assert.match(console, /type="password"/)
  assert.match(console, /setToken\(''\)/)
  assert.doesNotMatch(console, /localStorage|sessionStorage|document\.cookie/)
  assert.doesNotMatch(console, /<textarea|name=["'](?:patient|mrn)|medicalRecord/i)
  assert.match(console, /fixed-synthetic-probe/)
  assert.match(console, /humanReviewRequired/)
  assert.match(console, /if \(isProbeResponse\(payload\)\)/)
  assert.match(console, /Google HTTP/)
})

test('Trust Receipt is versioned, hashed and never records raw AI or sensitive values', () => {
  const receipt = read('app/lib/server/neuraops/trust-receipt.ts')
  const recorder = read('app/lib/server/observability/flight-recorder.ts')

  assert.match(receipt, /import 'server-only'/)
  assert.match(receipt, /schemaVersion:\s*1/)
  assert.match(receipt, /NEURAOPS_AI_POLICY_VERSION/)
  assert.match(receipt, /NEURAOPS_PROBE_TEMPLATE_VERSION/)
  assert.match(receipt, /gemini-connectivity-probe-v4-stateless/)
  assert.match(receipt, /diagnosticReason/)
  assert.match(receipt, /inputContractHash/)
  assert.match(receipt, /endpointContractHash/)
  assert.match(receipt, /humanReviewRequired:\s*true/)
  assert.match(receipt, /dataClassification:\s*'synthetic-non-clinical'/)
  assert.match(receipt, /providerStorage/)
  assert.match(receipt, /store=false/)
  assert.match(receipt, /kind:\s*'ai\.receipt'/)
  assert.match(recorder, /'ai\.receipt'/)

  for (const prohibited of ['apiKey', 'authorization:', 'rawResponse', 'responseText', 'patientId']) {
    assert.equal(receipt.includes(prohibited), false)
  }
})

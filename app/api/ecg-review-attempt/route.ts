import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../../supabase'
import { submitApprovedRecord10Answers } from '../../lib/competency/ecgRecord10ApprovedRubric'
import { getRecord10ReviewedPdfSnapshot } from '../../lib/clinicalIntelligence/ecgRecord10ReviewedPdfBinding'
import { RECORD10_REVIEW_PDF } from '../../lib/clinicalIntelligence/ecgReviewedPdfIdentity'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store' }
const reply = (value: unknown, status = 200) => Response.json(value, { status, headers })
async function context(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') return null
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } })
  const identity = await client.auth.getUser(token)
  if (identity.error || identity.data.user?.email !== 'reviewer@cliniverseai.com' || !identity.data.user.email_confirmed_at) return null
  return { client, user: identity.data.user, auth: { getUser: () => client.auth.getUser(token) } }
}
export async function GET(request: Request) {
  const c = await context(request)
  if (!c) return reply({ error: 'Review access required' }, 403)
  const result = await c.client.from('ecg_competency_attempts').select('event_id,created_at,evidence').eq('user_id', c.user.id).eq('case_id', 'ecg-governed-case-001').order('created_at', { ascending: false }).limit(20)
  if (result.error) return reply({ error: 'History unavailable' }, 503)
  return reply({ attempts: result.data.map(row => ({ eventId: row.event_id, createdAt: row.created_at, score: row.evidence?.result?.overallScore })) })
}
export async function POST(request: Request) {
  const c = await context(request)
  if (!c) return reply({ error: 'Review access required' }, 403)
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Same-origin request required' }, 403)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return reply({ error: 'Account saving is unavailable' }, 503)
  try {
    const text = await request.text()
    if (text.length > 8192) return reply({ error: 'Request too large' }, 413)
    const body = JSON.parse(text)
    if (!body || Object.keys(body).some(k => !['submission','reviewedPdfSha256','reviewContext'].includes(k)) ||
      body.reviewedPdfSha256 !== RECORD10_REVIEW_PDF.sha256 || body.reviewContext !== 'confirmed-external-iphone-xs-max-ios-18.7.10') return reply({ error: 'Confirmed reviewed-file and device context required' }, 422)
    // Context is an explicit human report, not browser/hardware attestation.
    const service = createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const writer = { async rpc(name: string, args: Record<string, unknown>) {
      const result = await service.rpc(name, args)
      if (result.error) console.error('ecg-save-rpc', { code: result.error.code, reason: ['eligibility-changed', 'case-not-eligible', 'invalid-prepared-evidence', 'attempt-identity-conflict'].includes(result.error.message) ? result.error.message : 'database-error' })
      return result
    } }
    const submit = async () => {
      const id = body.submission?.attemptId
      if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) throw Error('Invalid attempt')
      const prior = await c.client.from('ecg_competency_attempts').select('evidence').eq('user_id', c.user.id).eq('event_id', id).maybeSingle()
      if (prior.error) throw Error('History unavailable')
      const observedAt = prior.data?.evidence?.observedAt ?? new Date().toISOString()
      return submitApprovedRecord10Answers(c.auth, writer, body.submission, getRecord10ReviewedPdfSnapshot(), observedAt)
    }
    // A concurrent identical insert can win between read and write. Re-read once;
    // the existing RPC still rejects changed answers or a stale registry receipt.
    let result
    try { result = await submit() } catch { result = await submit() }
    return reply(result, result.state === 'saved' ? 200 : 409)
  } catch (error) { console.error('ecg-save-rejected', { reason: error instanceof Error && ['Unbound ECG answer rubric','Stale ECG rubric reference','History unavailable','Invalid ECG save acknowledgement'].includes(error.message) ? error.message : 'submission-rejected' }); return reply({ error: 'Save not confirmed. Retry the unchanged attempt or reload the saved history.' }, 409) }
}

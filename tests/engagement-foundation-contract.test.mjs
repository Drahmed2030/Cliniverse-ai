import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  CLINICIAN_INTEREST_TOPICS,
  isClinicianInterestTopic,
  validateInterestSignal,
} from '../app/lib/engagement/interests.ts'
import {
  ENGAGEMENT_EVENT_TYPES,
  IDENTITY_REQUIRED_EVENT_TYPES,
  isEngagementEventType,
  validateEngagementEvent,
} from '../app/lib/engagement/events.ts'
import {
  NoopEngagementProvider,
  DevLoggerEngagementProvider,
  selectEngagementProvider,
} from '../app/lib/engagement/provider.ts'
import { validateEvidenceDigestItem } from '../app/lib/engagement/evidenceDigest.ts'
import {
  buildEngagementDeepLinkPath,
  buildEngagementDeepLinkUrl,
} from '../app/lib/engagement/deepLinks.ts'
import { callProviderSafely } from '../app/lib/engagement/safeProviderCall.ts'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── Identity comes only from the authenticated session ──────────────────
// Executed as a source contract (matching this repo's established pattern
// for Supabase-boundary modules — see tests/release-security-contracts.test.mjs)
// rather than by invoking resolveEngagementIdentity() at runtime, since doing
// so would require a real network call to Supabase Auth with no mocking
// harness available to node:test in this repo (Playwright's visual suite is
// the only place that mocks Supabase network responses).

test('engagement identity is derived only from the authenticated Supabase session', () => {
  const source = read('app/lib/engagement/identity.ts')
  assert.match(source, /requireCurrentUser/)
  assert.match(source, /getOwnProfile\(\)/)
  assert.match(source, /getOwnEntitlement\(\)/)
  assert.match(source, /userId:\s*user\.id/)
  // No function in this module accepts a caller-supplied identity parameter.
  assert.equal(/resolveEngagementIdentity\s*\([^)]*userId/.test(source), false)
  assert.equal(/resolveEngagementIdentity\s*\([^)]*deviceId/i.test(source), false)
  assert.match(source, /status:\s*'anonymous'/)
})

test('engagement identity never creates client-side PRO authority — entitlement is read-only derived context', () => {
  const source = read('app/lib/engagement/identity.ts')
  assert.match(source, /entitlement:\s*CliniverseEntitlement/)
  assert.equal(/entitlement\s*[:=]\s*\{[^}]*isPro:\s*true/.test(source), false)
  assert.equal(/isPro\s*=\s*true/.test(source), false)
})

// ── Event taxonomy ────────────────────────────────────────────────────────

test('event taxonomy accepts only the 16 approved event types', () => {
  assert.deepEqual([...ENGAGEMENT_EVENT_TYPES].sort(), [
    'app_opened', 'clinical_trial_opened', 'drug_reference_opened', 'ecg_case_completed',
    'ecg_case_opened', 'echo_study_completed', 'echo_study_opened', 'evidence_article_opened',
    'guideline_opened', 'onboarding_completed', 'reference_opened', 'restore_purchases_requested',
    'subscription_paywall_viewed', 'subscription_started', 'ward_case_completed', 'ward_case_opened',
  ].sort())
  assert.equal(isEngagementEventType('app_opened'), true)
  assert.equal(isEngagementEventType('user_deleted_account'), false)
})

test('no PHI-shaped fields are accepted anywhere in the event contract', () => {
  for (const key of ['diagnosis', 'symptoms', 'medicalHistory', 'patientName', 'mrn', 'ssn', 'password', 'accessToken']) {
    const result = validateEngagementEvent({
      type: 'reference_opened', userId: 'u1', occurredAt: new Date().toISOString(),
      properties: { [key]: 'anything' },
    })
    assert.equal(result.ok, false, `expected ${key} to be rejected`)
    assert.ok(result.blockers.some(b => b.startsWith('disallowed-property')))
  }
})

test('sensitive free-text values are rejected even under an allowed key', () => {
  const result = validateEngagementEvent({
    type: 'ward_case_opened', userId: 'u1', occurredAt: new Date().toISOString(),
    properties: { appPath: 'the patient was diagnosed with heart failure last week' },
  })
  assert.equal(result.ok, false)
  assert.ok(result.blockers.some(b => b.startsWith('sensitive-text-pattern')))
})

test('anonymous callers are rejected for identity-required event types, accepted for others', () => {
  for (const type of IDENTITY_REQUIRED_EVENT_TYPES) {
    const result = validateEngagementEvent({ type, userId: null, occurredAt: new Date().toISOString() })
    assert.equal(result.ok, false)
    assert.ok(result.blockers.includes('authenticated-user-id-required-for-this-event-type'))
  }
  const openEvent = validateEngagementEvent({ type: 'app_opened', userId: null, occurredAt: new Date().toISOString() })
  assert.equal(openEvent.ok, true)
})

test('an unknown event type is rejected', () => {
  const result = validateEngagementEvent({ type: 'user_profile_deleted', userId: 'u1', occurredAt: new Date().toISOString() })
  assert.equal(result.ok, false)
  assert.ok(result.blockers.includes('event-type-not-in-taxonomy'))
})

// ── Interest taxonomy ─────────────────────────────────────────────────────

test('interest taxonomy accepts only the approved clinician-learning topics', () => {
  assert.equal(isClinicianInterestTopic('ecg'), true)
  assert.equal(isClinicianInterestTopic('heart_failure'), true)
  for (const rejected of ['depression', 'political_affiliation', 'religion', 'patient_diagnosis', 'anxiety']) {
    assert.equal(isClinicianInterestTopic(rejected), false)
  }
  assert.ok(CLINICIAN_INTEREST_TOPICS.length > 0)
})

test('interest signal validation rejects out-of-taxonomy topics and requires confidence for behavioral signals', () => {
  const bad = validateInterestSignal({ topic: 'depression', source: 'explicit', updatedAt: new Date().toISOString() })
  assert.equal(bad.ok, false)
  assert.ok(bad.blockers.includes('topic-not-in-approved-taxonomy'))

  const missingConfidence = validateInterestSignal({ topic: 'ecg', source: 'behavioral', updatedAt: new Date().toISOString() })
  assert.equal(missingConfidence.ok, false)
  assert.ok(missingConfidence.blockers.includes('behavioral-signal-requires-confidence'))

  const good = validateInterestSignal({ topic: 'ecg', source: 'behavioral', confidence: 0.6, updatedAt: new Date().toISOString() })
  assert.equal(good.ok, true)
})

// ── Provider ────────────────────────────────────────────────────────────

test('NoopEngagementProvider is the default when no provider is configured', () => {
  const provider = selectEngagementProvider(undefined, 'development')
  assert.equal(provider.name, 'noop')
  assert.ok(provider instanceof NoopEngagementProvider)
})

test('an unknown provider name fails closed to Noop', () => {
  const provider = selectEngagementProvider('some-vendor-nobody-approved', 'development')
  assert.equal(provider.name, 'noop')
})

test('dev-logger provider is blocked in production regardless of the env var', () => {
  const provider = selectEngagementProvider('dev-logger', 'production')
  assert.equal(provider.name, 'noop')
  assert.equal(provider instanceof DevLoggerEngagementProvider, false)
})

test('dev-logger provider is selectable outside production and its send methods are stubs only', async () => {
  const provider = selectEngagementProvider('dev-logger', 'development')
  assert.ok(provider instanceof DevLoggerEngagementProvider)
  const digestResult = await provider.sendEvidenceDigest({ userId: 'u1', topics: [], items: [], generatedAt: new Date().toISOString(), frequency: 'weekly' })
  assert.equal(digestResult.sent, false)
  const pushResult = await provider.sendPush('u1', { title: 't', body: 'b' })
  assert.equal(pushResult.sent, false)
})

test('provider failures never break the app — callProviderSafely swallows a thrown error', async () => {
  const throwingProvider = {
    name: 'throws',
    identify: async () => { throw new Error('boom') },
    track: async () => { throw new Error('boom') },
    updatePreferences: async () => { throw new Error('boom') },
    sendEvidenceDigest: async () => { throw new Error('boom') },
    sendPush: async () => { throw new Error('boom') },
  }
  await assert.doesNotReject(callProviderSafely('identify', throwingProvider, p => p.identify()))
  await assert.doesNotReject(callProviderSafely('track', throwingProvider, p => p.track()))
})

test('engagement layer cannot grant PRO — provider interface has no entitlement-granting method', () => {
  const source = read('app/lib/engagement/provider.ts')
  assert.equal(/grantPro|activatePro|setEntitlement|isPro\s*=\s*true/i.test(source), false)
  const clientSource = read('app/lib/engagement/client.ts')
  assert.equal(/grantPro|activatePro|setEntitlement/i.test(clientSource), false)
})

// ── Evidence digest domain model ──────────────────────────────────────────

test('evidence digest items require an https source and a root-relative app path', () => {
  const base = {
    id: 'a1', title: 'Title', topic: 'ecg', sourceName: 'Journal', publishedAt: new Date().toISOString(),
    evidenceType: 'guideline', shortSummary: 'summary', whyItMatters: 'why', appPath: '/evidence/a1',
  }
  assert.equal(validateEvidenceDigestItem({ ...base, sourceUrl: 'https://example.org/a' }).ok, true)
  assert.equal(validateEvidenceDigestItem({ ...base, sourceUrl: 'http://example.org/a' }).ok, false)
  assert.equal(validateEvidenceDigestItem({ ...base, appPath: 'evidence/a1' }).ok, false)
})

// ── Deep-link URL contract ─────────────────────────────────────────────────

test('canonical evidence URLs are deterministic and match the documented path contract', () => {
  assert.equal(buildEngagementDeepLinkPath('evidence', 'abc-123'), '/evidence/abc-123')
  assert.equal(buildEngagementDeepLinkPath('reference', 'xyz'), '/reference/xyz')
  assert.equal(buildEngagementDeepLinkPath('ecg_case', 'stemi_anterior'), '/learn/ecg/stemi_anterior')
  assert.equal(buildEngagementDeepLinkPath('echo_study', 'a4c-normal'), '/learn/echo/a4c-normal')
  assert.equal(buildEngagementDeepLinkPath('ward_case', 'dka'), '/learn/ward/dka')
  // Deterministic: same input always produces the same output.
  assert.equal(buildEngagementDeepLinkPath('evidence', 'abc-123'), buildEngagementDeepLinkPath('evidence', 'abc-123'))
  assert.equal(buildEngagementDeepLinkUrl('https://www.cliniverseai.com/', 'evidence', 'abc-123'), 'https://www.cliniverseai.com/evidence/abc-123')
})

test('deep-link ids are validated — no path traversal or injection through the id segment', () => {
  assert.throws(() => buildEngagementDeepLinkPath('evidence', '../../etc/passwd'))
  assert.throws(() => buildEngagementDeepLinkPath('evidence', 'a/b'))
  assert.throws(() => buildEngagementDeepLinkPath('evidence', '<script>'))
})

// ── No Universal Links / Associated Domains enabled yet ────────────────────

test('no Apple Universal Links or Associated Domains entitlement is introduced by this batch', () => {
  const source = read('app/lib/engagement/deepLinks.ts')
  // The module documents that Universal Links/Associated Domains are
  // deliberately NOT enabled yet — it must say so, not configure them.
  assert.match(source, /do not enable/i)
  assert.equal(existsSyncCheck('public/.well-known/apple-app-site-association'), false)
})

function existsSyncCheck(path) {
  try { readFileSync(new URL(`../${path}`, import.meta.url)); return true } catch { return false }
}

// ── Privacy/governance doc exists with the required boundaries ─────────────

test('the engagement privacy boundary document states every required boundary', () => {
  const doc = read('docs/ENGAGEMENT_PRIVACY_BOUNDARY_V1.md')
  for (const phrase of [
    /No PHI/i,
    /No patient targeting/i,
    /No inference of the user's own medical conditions/i,
    /No sensitive-trait inference/i,
    /Professional-learning personalization only/i,
    /Explicit opt-out required/i,
    /must be approved before integration/i,
    /Unsubscribe controls/i,
    /auditable/i,
    /No advertiser access/i,
  ]) {
    assert.match(doc, phrase)
  }
})

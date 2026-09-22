import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('account creation is available without changing magic-link create-user policy', () => {
  const identity = read('app/lib/identity.ts')
  const auth = read('app/components/AuthScreen.tsx')
  assert.match(identity, /signUpWithPassword/)
  assert.match(identity, /supabase\.auth\.signUp/)
  assert.match(identity, /shouldCreateUser:\s*false/)
  assert.match(auth, /Create account/)
  assert.doesNotMatch(auth, /Account creation is not enabled/)
})

test('paywall does not invent a free trial and presents one connected product', () => {
  const source = read('app/components/PaywallSheet.tsx')
  assert.doesNotMatch(source, /7 days free|free for 7 days|Start my free trial/i)
  for (const label of ['Core practice','Advanced practice','Clinical systems','Progress and review']) assert.ok(source.includes(label))
  for (const capability of ['ECG','Echo','Ward','Resuscitation','Code Lab','Pathway Replay','Clinical Reference','Cardiology Operations','Nexus Learning']) assert.ok(source.includes(capability))
  assert.match(source, /offerCopy = trialLabel/)
})

test('Learn keeps every product capability reachable in a unified hierarchy', () => {
  const source = read('app/components/release/LearnTracks.tsx')
  for (const heading of ['Core practice','Advanced practice','Clinical systems']) assert.ok(source.includes(heading))
  for (const capability of ['ECG','Echo','Ward','Resuscitation','Code Lab','Pathway Replay','Clinical Reference','Cardiology Operations','Nexus Learning']) assert.ok(source.includes(capability))
})

test('Today is concise and reviewer tooling is not injected into normal reviewer experience', () => {
  const app = read('app/components/ReleaseApp.tsx')
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  const today = app.slice(app.indexOf('function TodaySurface('), app.indexOf('// Layout and control styling lives in commercial-visual-system.css under [data-commercial-surface="progress"]'))
  assert.match(today, /Continue your practice/)
  assert.match(today, /Pick up where you left off\./)
  assert.doesNotMatch(today, /AccountLearningSummary/)
  assert.match(app, /reviewTools/)
  assert.doesNotMatch(provider, /Reviewer access · No administrator privileges/)
})

test('unified Learn opens Ward-family workspaces without a second mandatory switcher', () => {
  const release = read('app/components/ReleaseApp.tsx')
  const ward = read('app/components/ward/index.tsx')
  assert.match(release, /showWorkspaceNav=\{false\}/)
  assert.match(ward, /showWorkspaceNav = true/)
  assert.match(ward, /showWorkspaceNav \? <nav/)
})

test('learner-facing Ward copy avoids internal human-review wording', () => {
  const ward = read('app/components/ward/WardHome.tsx')
  assert.match(ward, /Guided reasoning/)
  assert.doesNotMatch(ward, /Human review/)
})

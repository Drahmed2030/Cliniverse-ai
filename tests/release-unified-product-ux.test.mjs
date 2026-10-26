import test from 'node:test'
import assert from 'node:assert/strict'
import fs, { readFileSync } from 'node:fs'
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

function sourceFiles(path) {
  const root = new URL(`../${path}`, import.meta.url)
  const out = []
  const walk = url => {
    for (const entry of fs.readdirSync(url, { withFileTypes: true })) {
      const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url)
      if (entry.isDirectory()) walk(child)
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push([child.pathname, fs.readFileSync(child, 'utf8')])
    }
  }
  const stat = fs.statSync(root)
  if (stat.isDirectory()) walk(new URL(path.replace(/\/?$/, '/'), new URL('../', import.meta.url)))
  else out.push([root.pathname, fs.readFileSync(root, 'utf8')])
  return out
}
const GATE = /useCliniverseSubscription|canAccessPremium|entitlement|\bisPro\b|premium|paywall|openPaywall/i

test('paywall does not invent a free trial and presents one connected product', () => {
  const source = read('app/components/PaywallSheet.tsx')
  assert.doesNotMatch(source, /7 days free|free for 7 days|Start my free trial/i)
  assert.match(source, /offerCopy = trialLabel/)
})

test('paywall benefits match the real access gates (source-level evidence); free features are listed only as free', () => {
  const source = read('app/components/PaywallSheet.tsx')
  const groups = [...source.matchAll(/groups: \[([\s\S]*?)\] as CapabilityGroup\[\]/g)].map(match => match[1]).join('\n')
  const freeNotes = [...source.matchAll(/freeNote: "([^"]+)"/g)].map(match => match[1])
  assert.equal(freeNotes.length, 2, 'EN and AR')

  // PRO benefits: each one has a gate in the code.
  const ward = read('app/components/ward/index.tsx')
  assert.match(read('app/components/ward/WardHome.tsx'), /const caseUnlocked = isPro \|\| patient\.id === 'w1'/)
  assert.match(ward, /<WardHome onSelectPatient=\{handleSelectPatient\} isPro=\{isPro\}/)
  assert.match(read('app/components/ward/RelatedEvidencePanel.tsx'), /if \(isPro\) \{\s*setExpanded\(true\)/)
  assert.match(read('app/components/ward/CodeLabHub.tsx'), /if \(isPro\) return true;\s*return lessonOrder <= 2;/)
  assert.match(ward, /label: 'Cardiology Operations',[\s\S]*?premium: true/)
  assert.match(ward, /label: 'Nexus Learning',[\s\S]*?premium: true/)
  assert.match(ward, /if \(premium && !isPro\) \{\s*setPendingWorkspace\(nextWorkspace\)\s*openPaywall\(\)/)
  for (const benefit of ['every simulated case', 'PubMed', 'all BLS and ACLS lessons', 'Cardiology Operations', 'Nexus Learning']) assert.ok(groups.includes(benefit), benefit)
  for (const arabic of ['جميع الحالات المحاكاة', 'جميع دروس BLS وACLS']) assert.ok(source.includes(arabic), arabic)

  // Features with NO entitlement gate anywhere in their routes/components must never be listed as PRO benefits.
  const free = {
    'ECG': ['app/learn/ecg'], 'Echo': ['app/learn/echo'], 'Resuscitation': ['app/labs/resuscitation-hub'],
    'Pathway Replay': ['app/labs/pathway-replay'], 'Clinical Reference': ['app/labs/clinical-reference'],
    'Handover Practice': ['app/components/ward/WardHandoverSession.tsx'],
  }
  for (const [name, paths] of Object.entries(free)) {
    for (const path of paths) for (const [file, text] of sourceFiles(path)) assert.doesNotMatch(text, GATE, `${name} has an access gate in ${file}`)
    assert.ok(freeNotes.every(note => note.includes(name)), `${name} is declared free in EN and AR`)
    assert.ok(!new RegExp(`${name} —`).test(groups), `${name} is not a PRO benefit`)
  }
  assert.match(ward, /label: 'Handover Practice',[\s\S]*?premium: false/)
  assert.match(source, /<div className="cv-paywall-status">\{t\.freeNote\}<\/div>/)
  // The free allowances named in the PRO groups are exactly the ones the gates enforce (first case, lessons 1-2).
  assert.ok(groups.includes('the first case is free') && groups.includes('lessons 1–2 are free'))
})

test('Learn keeps every product capability reachable in a unified hierarchy', () => {
  const source = read('app/components/release/LearnTracks.tsx')
  for (const heading of ['Core practice','Advanced practice','Clinical systems']) assert.ok(source.includes(heading))
  for (const capability of ['ECG','Echo','Ward','Handover Practice','Resuscitation','Code Lab','Pathway Replay','Clinical Reference','Cardiology Operations','Nexus Learning']) assert.ok(source.includes(capability))
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


test('Handover is a first-class Learn capability and does not float over Explore', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  const release = read('app/components/ReleaseApp.tsx')
  const ward = read('app/components/ward/index.tsx')
  assert.match(learn, /title:'Handover Practice'[\s\S]*?workspace:'handover'/)
  assert.match(ward, /activeWorkspace === 'handover'/)
  assert.match(ward, /<WardHandoverSession caseLibraryPreview \/>/)
  assert.doesNotMatch(release, /<AtlasReleaseCatalog[^>]*caseLibraryPreview/)
})

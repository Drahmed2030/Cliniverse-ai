import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const tracks = read('app/components/release/LearnTracks.tsx')
const app = read('app/components/ReleaseApp.tsx')
const ward = read('app/components/ward/index.tsx')
const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
const css = read('app/commercial-visual-system.css')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const trackSource = stripComments(tracks)
// The Learn block runs until the Progress block begins (Progress has its own scoping test).
const learnCss = stripComments(css.slice(css.lastIndexOf('/*', css.indexOf('Learn — practice-track landing')), css.lastIndexOf('/*', css.indexOf('Progress — evidence-led trajectory'))))
const trackEntries = [...tracks.matchAll(/\{ id:'([^']+)', verb:'([^']+)', title:'([^']+)', description:'([^']+)', accent:'([^']+)', (?:href:'([^']+)'|workspace:'([^']+)') \}/g)]
  .map(([, id, verb, title, description, accent, href, workspace]) => ({ id, verb, title, description, accent, href: href ?? null, workspace: workspace ?? null }))

test('Learn landing lists the three core tracks first, then advanced practice and clinical systems, in order', () => {
  assert.deepEqual(trackEntries.map(entry => entry.id), ['ecg', 'echo', 'ward', 'resuscitation', 'handover', 'codelab', 'pathway', 'reference', 'cardiology', 'nexus'])
  assert.deepEqual(trackEntries.slice(0, 3), [
    { id: 'ecg', verb: 'INTERPRET', title: 'ECG', description: 'ECG practice is being prepared.', accent: 'var(--cv-teal)', href: '/learn/ecg', workspace: null },
    { id: 'echo', verb: 'OBSERVE', title: 'Echo', description: 'One introductory study: start with the cine, organize findings, then assign meaning.', accent: 'var(--cv-violet)', href: '/learn/echo', workspace: null },
    { id: 'ward', verb: 'DECIDE', title: 'Ward', description: 'Follow a changing patient state and work through the next clinical decision.', accent: 'var(--cv-blue)', href: null, workspace: 'ward' },
  ])
  assert.deepEqual([...tracks.matchAll(/<TrackGroup title="([^"]+)"/g)].map(match => match[1]), ['Core practice', 'Advanced practice', 'Clinical systems'])
  // Every entry is either a route or an in-place workspace, never both.
  for (const entry of trackEntries) assert.ok(Boolean(entry.href) !== Boolean(entry.workspace), entry.id)
})

test('ECG opens the governed ECG workspace and Echo its learner workspace (Learn owns their entry); Ward opens in place', () => {
  // ECG v2: the legacy quiz route still exists but is no longer any track's destination (see tests/ecg-learner-workspace.test.mjs).
  assert.ok(existsSync(new URL('../app/learn/ecg/page.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/labs/ecg-challenge/page.tsx', import.meta.url)))
  // Echo v2: the studio preview route still exists (QA and governance) but is no longer any track's destination.
  assert.ok(existsSync(new URL('../app/learn/echo/page.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/labs/echo-preview/page.tsx', import.meta.url)))
  assert.ok(!tracks.includes('/labs/ecg-challenge') && !tracks.includes('/labs/echo-preview'))
  for (const href of trackEntries.map(entry => entry.href).filter(Boolean)) {
    const route = href.replace(/^\//, '')
    assert.ok(existsSync(new URL(`../app/${route}/page.tsx`, import.meta.url)), `${href} has a page`)
  }
  // Explore v2 no longer lists them, so each has exactly one in-app entry: this track.
  for (const href of ['/learn/ecg', '/learn/echo']) {
    assert.equal(tracks.split(`href:'${href}'`).length - 1, 1, `Learn lists ${href} once`)
    assert.ok(!explore.includes(href), `Explore no longer lists ${href}`)
  }
  assert.match(trackSource, /<button type="button" className="cv-learn-track" onClick=\{\(\)=>entry\.workspace&&onOpenWorkspace\(entry\.workspace\)\}/)
  assert.match(app, /<LearnTracks onOpenWorkspace=\{openWorkspace\} \/>/)
  // The reviewer-only ECG account-review route is not a learner track destination.
  assert.doesNotMatch(trackSource, /ecg-account-review|echo-account-review/)
})

test('Learn tracks are static catalogue entries and no user data is invented', () => {
  for (const entry of trackEntries) assert.doesNotMatch(`${entry.verb} ${entry.title} ${entry.description}`, /\d/, `${entry.id} shows no invented counts`)
  assert.doesNotMatch(trackSource, /Resume (your|where)|review due|cases?\b.*\b\d|localStorage|sessionStorage|supabase|fetch\(|useEffect|useState/i)
  assert.deepEqual([...trackSource.matchAll(/^import .* from '([^']+)'/gm)].map(match => match[1]), ['next/link', 'react'])
})

test('untargeted Learn shows the landing; every explicit workspace deep link still works', () => {
  assert.match(app, /useState<CareWorkspace \| null>\(null\)/)
  assert.match(app, /careWorkspace === null \? \(\s*<LearnTracks/)
  assert.match(app, /const goTab = \(next: ReleaseTab\) => \{ if \(next === 'learn'\) setCareWorkspace\(null\); setTab\(next\) \}/)
  for (const wiring of [
    /const openCodeLab = \(\) => \{ setCareWorkspace\('codelab'\); setTab\('learn'\) \}/,
    /const openWorkspace = \(workspace: CareWorkspace\) => \{ setCareWorkspace\(workspace\); setCardiologyModule\('overview'\); setTab\('learn'\) \}/,
    /if \(destination\.workspace\) \{ setCareWorkspace\(destination\.workspace\)/,
    /onOpenWard=\{\(\) => \{ setCareWorkspace\('ward'\); setTab\('learn'\) \}/,
  ]) assert.match(app, wiring)
  assert.match(app, /<ReleaseNav active=\{tab\} onChange=\{goTab\} \/>/)
  assert.match(app, /← Practice tracks/)
  assert.match(app, /learn: \{ title: 'Learn', sub: learnLanding \? 'Practice, simulate and apply clinical reasoning\.'/)
})

test('legacy engines and PRO gating in WardIndex are untouched and still reachable', () => {
  for (const id of ["'codelab'", "'ward'", "'cardiology'", "'nexus'"]) assert.ok(ward.includes(`id: ${id}`))
  assert.match(ward, /label: 'Cardiology Operations',[\s\S]*?premium: true/)
  assert.match(ward, /label: 'Nexus Learning',[\s\S]*?premium: true/)
  assert.match(ward, /if \(premium && !isPro\) \{\s*setPendingWorkspace\(nextWorkspace\)\s*openPaywall\(\)\s*return\s*\}/)
  assert.match(ward, /activeWorkspace === 'cardiology' && isPro/)
  assert.match(ward, /activeWorkspace === 'nexus' && isPro/)
  // Explore v2 lists only Cardiology Operations of these; the others stay reachable in the workspace switcher above.
  for (const label of ['Code Lab', 'Ward Simulation', 'Cardiology Operations', 'Nexus Learning']) assert.ok(ward.includes(`label: '${label}'`))
  assert.ok(explore.includes("title: 'Cardiology Operations'"))
  for (const label of ['Code Lab', 'Ward Simulation', 'Nexus Learning']) assert.ok(!stripComments(explore).includes(label))
})

test('Learn styling is scoped, token-only and restrained', () => {
  assert.doesNotMatch(learnCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(learnCss, /gradient|box-shadow|position:\s*absolute|text-shadow|filter:\s*blur/)
  const selectors = [...learnCss.matchAll(/^([^\s@/}][^{]*)\{/gm)].map(match => match[1].trim())
  assert.ok(selectors.length > 5)
  for (const selector of selectors) assert.match(selector, /^\[data-commercial-surface="learn"\]/, `unscoped selector: ${selector}`)
  assert.match(learnCss, /min-height: 96px/)
  assert.match(learnCss, /@media \(min-width: 700px\)/)
})

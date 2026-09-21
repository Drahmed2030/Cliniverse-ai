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
const trackEntries = [...tracks.matchAll(/verb: '([^']+)',\s*title: '([^']+)',\s*description: '([^']+)',\s*accent: '([^']+)',\s*href: (?:'([^']+)'|null)/g)]
  .map(([, verb, title, description, accent, href]) => ({ verb, title, description, accent, href: href ?? null }))

test('Learn landing has exactly the three approved practice tracks, in order', () => {
  assert.deepEqual(trackEntries, [
    { verb: 'INTERPRET', title: 'ECG', description: 'Read the full tracing, commit an interpretation, then review the reasoning.', accent: 'var(--cv-teal)', href: '/labs/ecg-challenge' },
    { verb: 'OBSERVE', title: 'Echo', description: 'Start with the cine, organize findings, then assign meaning.', accent: 'var(--cv-violet)', href: '/labs/echo-preview' },
    { verb: 'DECIDE', title: 'Ward', description: 'Follow a changing patient state and see the consequence of each decision.', accent: 'var(--cv-blue)', href: null },
  ])
})

test('ECG and Echo open existing learner-facing routes (Learn owns their entry now); Ward opens in place', () => {
  assert.ok(existsSync(new URL('../app/labs/ecg-challenge/page.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/labs/echo-preview/page.tsx', import.meta.url)))
  // Explore v2 no longer lists them, so each has exactly one in-app entry: this track.
  for (const href of ['/labs/ecg-challenge', '/labs/echo-preview']) {
    assert.equal(tracks.split(`href: '${href}'`).length - 1, 1, `Learn lists ${href} once`)
    assert.ok(!explore.includes(href), `Explore no longer lists ${href}`)
  }
  assert.match(trackSource, /<button type="button" className="cv-learn-track" onClick=\{onOpenWard\}/)
  assert.match(app, /<LearnTracks onOpenWard=\{\(\) => setCareWorkspace\('ward'\)\} \/>/)
  // The reviewer-only ECG account-review route is not a learner track destination.
  assert.doesNotMatch(trackSource, /ecg-account-review|echo-account-review/)
})

test('legacy workspaces are not presented as Learn tracks, and no user data is invented', () => {
  assert.doesNotMatch(trackSource, /Code Lab|Cardiology|Nexus/)
  assert.doesNotMatch(trackSource, /\d/)
  assert.doesNotMatch(trackSource, /Resume|review due|cases?\b.*\b\d|localStorage|sessionStorage|supabase|fetch\(|useEffect|useState/i)
  assert.deepEqual([...trackSource.matchAll(/^import .* from '([^']+)'/gm)].map(match => match[1]), ['next/link', 'react'])
})

test('untargeted Learn shows the landing; every explicit workspace deep link still works', () => {
  assert.match(app, /useState<CareWorkspace \| null>\(null\)/)
  assert.match(app, /careWorkspace === null \? \(\s*<LearnTracks/)
  assert.match(app, /const goTab = \(next: ReleaseTab\) => \{ if \(next === 'learn'\) setCareWorkspace\(null\); setTab\(next\) \}/)
  for (const wiring of [
    /const openCodeLab = \(\) => \{ setCareWorkspace\('codelab'\); setTab\('learn'\) \}/,
    /if \(destination\.workspace\) \{ setCareWorkspace\(destination\.workspace\)/,
    /onWard=\{\(\) => \{ setCareWorkspace\('ward'\); setTab\('learn'\) \}/,
    /setCareWorkspace\('cardiology'\); setTab\('learn'\)/,
  ]) assert.match(app, wiring)
  assert.match(app, /<ReleaseNav active=\{tab\} onChange=\{goTab\} \/>/)
  assert.match(app, /← Practice tracks/)
  assert.match(app, /learn: \{ title: 'Learn', sub: learnLanding \? 'Choose a practice track\. Your progress stays connected\./)
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

import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { CLINICAL_CONTENT_CATALOG_SEED as catalog } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable } from '../app/lib/contentCatalogQueries.ts'

const require = createRequire(import.meta.url)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const explorePath = 'app/components/release/AtlasReleaseCatalog.tsx'
const explore = read(explorePath)
const exploreSource = stripComments(explore)
const app = read('app/components/ReleaseApp.tsx')
const css = read('app/commercial-visual-system.css')
// The Explore block runs until the Me block begins (Me has its own scoping test).
const exploreCss = stripComments(css.slice(css.lastIndexOf('/*', css.indexOf('Explore — curated discovery')), css.lastIndexOf('/*', css.indexOf('Me — account, plan and preferences'))))
const header = app.slice(app.indexOf('function ReleaseHeader'), app.indexOf('function TodaySurface'))

const rows = [...explore.matchAll(/id: '([^']+)',\s*title: '([^']+)',\s*status: '([^']+)',\s*description: '([^']+)',\s*href: (?:'([^']+)'|null),\s*destination: (null|\{[^}]+\})/g)]
  .map(([, id, title, status, description, href, destination]) => ({ id, title, status, description, href: href ?? null, destination }))

function render(props) {
  const code = ts.transpileModule(explore, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => name === '../ward/WardCaseConnections' ? { default: 'WardCaseConnections' } : require(name) })
  return exports.default(props)
}
const nodes = n => !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)]
const text = n => typeof n === 'string' ? n : Array.isArray(n) ? n.map(text).join('') : text(n?.props?.children ?? '')

// ── the curated list ──────────────────────────────────────────────────────────

test('Explore lists exactly the four curated destinations, in the approved order', () => {
  assert.deepEqual(rows.map(row => row.title), ['Clinical Reference', 'Cardiology Operations', 'Resuscitation', 'Pathway Replay'])
  assert.deepEqual(rows.map(row => row.status), ['Available', 'PRO', 'Coming later', 'Available'])
  assert.equal(rows.length, 4)
})

test('every row is one interactive target routed through an existing destination', () => {
  assert.deepEqual(rows.map(row => row.href), ['/labs/clinical-reference', null, null, '/labs/pathway-replay'])
  const cardiology = rows.find(row => row.id === 'cardiology')
  assert.match(cardiology.destination, /tab: 'care', workspace: 'cardiology'/)
  for (const row of rows.filter(row => row.href)) assert.ok(existsSync(new URL(`../app${row.href}/page.tsx`, import.meta.url)), `${row.href} route exists`)
  // Rendered: two links, one button and one truthful non-interactive unavailable row.
  const destinations = []
  const tree = nodes(render({ onNavigate: destination => destinations.push(destination) }))
  const links = tree.filter(n => n.props?.className === 'cv-explore-row' && n.props.href)
  const buttons = tree.filter(n => n.type === 'button')
  assert.deepEqual(links.map(link => link.props.href), ['/labs/clinical-reference', '/labs/pathway-replay'])
  assert.equal(buttons.length, 1)
  assert.match(text(buttons[0]), /^Cardiology Operations/)
  buttons[0].props.onClick()
  // Serialised because the component ran in a separate vm realm.
  assert.deepEqual(JSON.parse(JSON.stringify(destinations)), [{ tab: 'care', workspace: 'cardiology' }])
  for (const row of [...links, ...buttons]) assert.equal(nodes(row.props.children).filter(n => n.type === 'button' || n.type === 'a').length, 0)
})

test('Cardiology Operations keeps the existing entitlement path: the workspace switcher decides, Explore does not bypass it', () => {
  assert.doesNotMatch(exploreSource, /openPaywall|onOpenPlan|canAccessPremium|isPro|useCliniverseSubscription/)
  assert.match(app, /if \(destination\.workspace\) \{ setCareWorkspace\(destination\.workspace\); setCardiologyModule\('overview'\) \}/)
  const ward = read('app/components/ward/index.tsx')
  assert.match(ward, /label: 'Cardiology Operations',[\s\S]*?premium: true/)
  assert.match(ward, /if \(premium && !isPro\) \{\s*setPendingWorkspace\(nextWorkspace\)\s*openPaywall\(\)\s*return\s*\}/)
  assert.match(ward, /activeWorkspace === 'cardiology' && isPro/)
})

// ── status truth ──────────────────────────────────────────────────────────────

test('every status claim equals what the content catalog says, so nothing is marked Available that is not', () => {
  const byKey = key => catalog.find(item => item.source_key === key)
  const derived = {
    // The workspace shell is review_required, but the two lookup tools it lists are ready.
    reference: ['rxnorm', 'dailymed'].some(key => isAvailable(byKey(key))) ? 'Available' : 'In review',
    cardiology: byKey('cardiology_operations').access_tier === 'pro' && isAvailable(byKey('cardiology_operations')) ? 'PRO' : 'In review',
    // Simulations and drills are the learner-facing content; the engine, debrief and map alone are not the curriculum.
    resuscitation: catalog.filter(item => item.module === 'resuscitation' && ['scenario', 'drill'].includes(item.content_type)).every(isAvailable) ? 'Available' : 'Coming later',
    pathway: catalog.filter(item => item.module === 'pathway' && item.visibility === 'visible').every(isAvailable) ? 'Available' : 'In review',
  }
  assert.deepEqual(Object.fromEntries(rows.map(row => [row.id, row.status])), derived)
  // Pin the facts that currently force the two non-obvious labels.
  assert.ok(catalog.filter(item => item.module === 'resuscitation' && ['scenario', 'drill'].includes(item.content_type)).length >= 4)
  assert.ok(!isAvailable(byKey('resus_vf_pvt_v1')) && !isAvailable(byKey('resuscitation_codelab_drills')))
})

test('Clinical Reference describes only released capability and states the review boundary for the rest', () => {
  const reference = rows.find(row => row.id === 'reference')
  assert.match(reference.description, /lookups/)
  assert.match(reference.description, /Calculators, dosing and interactions appear as they clear clinical review\./)
  // Explore never reaches into the reference registries; the workspace's own catalog gate decides what is shown.
  assert.doesNotMatch(exploreSource, /clinicalReference\/|CLINICAL_CALCULATOR_REGISTRY|renalDosing|drugInteraction/)
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /CLINICAL_CALCULATOR_REGISTRY\.filter\(def => isReferenceItemLearnerReady\(def\.calculatorId\)\)/)
  assert.match(workspace, /if \(!drugIdentityReady\) return \[\]/)
})

test('Resuscitation stays in the product but Explore does not advertise unreleased scenarios as an available destination', () => {
  const resuscitation = rows.find(row => row.id === 'resuscitation')
  assert.equal(resuscitation.status, 'Coming later')
  assert.equal(resuscitation.href, null)
  assert.equal(resuscitation.description, 'Resuscitation practice will appear here when learner-ready scenarios are released.')
  assert.doesNotMatch(resuscitation.description, /\bfree\b|certif|complete/i)
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /catalogReviewStatusFor\(scenario\.scenarioId\) === 'reviewed'/)
  assert.match(hub, /disabled=\{!learnerReady\}/)
  assert.match(hub, /Under clinical review — not yet available/)
  const rendered = nodes(render({ onNavigate() {} }))
  const unavailable = rendered.find(n => n.props?.className === 'cv-explore-row' && n.props?.['aria-disabled'] === 'true')
  assert.ok(unavailable)
  assert.match(text(unavailable), /^ResuscitationComing later/)
})

test('Pathway Replay keeps its fictional framing and its single route', () => {
  const pathway = rows.find(row => row.id === 'pathway')
  assert.match(pathway.description, /fictional/)
  assert.ok(existsSync(new URL('../app/labs/pathway-replay/page.tsx', import.meta.url)))
  assert.match(exploreSource, /Designed for learning and simulation\. Not for diagnosis, prescribing or managing real patient care\./)
  assert.equal(exploreSource.match(/Designed for learning and simulation/g).length, 1)
})

// ── what left the primary surface, and where it still lives ──────────────────

test('legacy destinations are no longer Explore rows, and no plan block, chip cluster or count claim remains', () => {
  for (const legacy of ['Code Lab', 'Ward Simulation', 'Nexus', 'Account and subscription', 'ECG Challenge', 'Echo Preview', 'Clinical Orbit', 'Review Cliniverse PRO', 'View plan', 'APP STORE PLAN', 'StoreKit price', 'Restore purchases', 'FIND YOUR NEXT PRACTICE']) {
    assert.ok(!exploreSource.includes(legacy), `Explore still mentions ${legacy}`)
  }
  // The old page title "Atlas" is gone as user-visible text (the component identifier keeps its name).
  assert.doesNotMatch(exploreSource, />\s*Atlas\s*<|'Atlas'|"Atlas"/)
  for (const href of ['/labs/ecg-challenge', '/labs/echo-preview', '/labs/clinical-orbit']) assert.ok(!exploreSource.includes(href), `Explore still links ${href}`)
  assert.doesNotMatch(exploreSource, /details:|included capabilities|onOpenPlan/)
  assert.equal(/\b\d{2,}\+?\s*(cases|lessons|modules|tools)/i.test(exploreSource), false)
})

test('the engines and routes that left Explore are all still present and reachable from their owning surface', () => {
  // Routes and components are intact.
  for (const path of ['app/labs/ecg-challenge/page.tsx', 'app/labs/echo-preview/page.tsx', 'app/labs/clinical-orbit/page.tsx', 'app/components/release/ClinicalOrbit.tsx', 'app/components/ward/CodeLabHub.tsx', 'app/components/ward/cardiology/useCardiologyOperations.ts']) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} still exists`)
  }
  // Learn owns ECG, Echo and Ward entry.
  const learn = read('app/components/release/LearnTracks.tsx')
  assert.equal(learn.match(/href: '\/learn\/ecg'/g).length, 1)
  assert.equal(learn.match(/href: '\/learn\/echo'/g).length, 1)
  assert.match(learn, /onClick=\{onOpenWard\}/)
  // Code Lab and Nexus remain in the Learn workspace switcher, with their plan gates.
  const ward = read('app/components/ward/index.tsx')
  assert.match(ward, /label: 'Code Lab',[\s\S]*?premium: false/)
  assert.match(ward, /label: 'Nexus Learning',[\s\S]*?premium: true/)
  // Code Lab is also reachable from Progress's saved records; Today keeps its lesson summary.
  assert.match(app, /<AccountLearningSummary view="summary" isPro=\{false\} onUpgrade=\{onOpenCodeLab\} onBack=\{onOpenCodeLab\} onOpen=\{onOpenCodeLab\} \/>/)
  // Me owns the plan: the paywall, restore and Apple subscription management.
  const me = read('app/components/release/MeAccountSummary.tsx')
  assert.match(me, /onClick=\{openPaywall\}/)
  assert.match(me, /Upgrade to Cliniverse PRO/)
  assert.match(me, /Manage Apple subscription/)
  assert.match(me, /restore an existing purchase/)
})

// ── shell wiring, navigation, accessibility ───────────────────────────────────

test('Explore owns its page heading and support line in the shared header; navigation is unchanged', () => {
  assert.match(header, /explore: \{ title: 'Explore', sub: 'Reference, operations and advanced practice — when you need them\.' \}/)
  assert.match(header, /active === 'progress' \|\| active === 'explore' \|\| active === 'me' \? <h1 id=\{`\$\{active\}-title`\}/)
  assert.match(explore, /<section aria-labelledby="explore-title" data-commercial-surface="explore" data-commercial-explore-surface>/)
  assert.doesNotMatch(exploreSource, /<h1|<h2/)
  assert.match(app, /<AtlasReleaseCatalog onNavigate=\{handleAtlasNavigate\} \/>/)
  assert.doesNotMatch(app, /<AtlasReleaseCatalog[^>]*caseLibraryPreview=/)
  const nav = read('app/components/ReleaseNav.tsx')
  assert.deepEqual([...nav.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Today', 'Learn', 'Progress', 'Explore', 'Me'])
  assert.doesNotMatch(nav, /Intelligence/)
})

test('the reviewer-only case connections still render in Explore and only when enabled', () => {
  for (const enabled of [false, true]) {
    const all = nodes(render({ onNavigate() {}, caseLibraryPreview: enabled }))
    assert.equal(all.filter(n => n.type === 'WardCaseConnections').length, enabled ? 1 : 0)
  }
})

test('Explore styling is scoped, token-only and restrained', () => {
  assert.doesNotMatch(exploreCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(exploreCss, /gradient|box-shadow|text-shadow|filter:\s*blur|position:\s*absolute|animation|@keyframes|transition/)
  const selectors = [...exploreCss.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  assert.ok(selectors.length >= 10)
  for (const selector of selectors) assert.match(selector, /^\[data-commercial-surface="explore"\]/, `unscoped selector: ${selector}`)
  assert.match(exploreCss, /min-height: 72px/)
  assert.match(exploreCss, /max-width: 680px/)
  assert.match(exploreCss, /@media \(min-width: 700px\)/)
  assert.match(exploreCss, /\.cv-explore-row-status \{[^}]*white-space: nowrap/)
  assert.match(exploreCss, /var\(--cv-blue\)/)
  // No grid of feature cards: the list is a single column.
  assert.doesNotMatch(exploreCss, /repeat\(auto-fit|repeat\(\d/)
})

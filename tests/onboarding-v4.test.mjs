import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const path = 'app/components/release/OnboardingScreens.tsx'
const raw = read(path)
const source = stripComments(raw)
const app = read('app/components/ReleaseApp.tsx')
const css = raw.slice(raw.indexOf('const CSS = `'))

// ── a minimal hook runtime, so the component's own step logic runs (no DOM, no network) ──

function mount(onComplete) {
  const code = ts.transpileModule(raw, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const slots = [], deps = []
  let focusCalls = 0
  let index = 0, pending = []
  const react = {
    useState(initial) {
      const at = index++
      if (!(at in slots)) slots[at] = initial
      return [slots[at], value => { slots[at] = value; render() }]
    },
    useRef(initial) {
      const at = index++
      if (!(at in slots)) slots[at] = { current: initial }
      return slots[at]
    },
    useEffect(effect, list) {
      const at = index++
      const changed = !deps[at] || !list || list.some((value, i) => value !== deps[at][i])
      deps[at] = list
      if (changed) pending.push(effect)
    },
  }
  const exports = {}
  const modules = {
    react,
    './AppearanceSettings': { useAppearance: () => 'light' },
    '../../lib/nativeSafeArea': { NATIVE_SAFE_AREA_TOP: '0px', NATIVE_SAFE_AREA_LEFT: '0px', NATIVE_SAFE_AREA_RIGHT: '0px', NATIVE_SAFE_AREA_BOTTOM: '0px' },
  }
  vm.runInNewContext(code, { exports, require: name => modules[name] ?? require(name) })
  let tree
  function render() {
    index = 0
    pending = []
    tree = exports.default({ onComplete })
    // Emulate React attaching the heading ref on commit, then run this render's effects.
    const heading = nodes(tree).find(n => n.type === 'h1')
    if (heading?.props.ref) heading.props.ref.current = { focus: () => { focusCalls++ } }
    for (const effect of pending) effect()
  }
  render()
  return { tree: () => tree, focusCalls: () => focusCalls }
}
const nodes = n => !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)]
const text = n => typeof n === 'string' ? n : typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : n && typeof n === 'object' ? text(n.props?.children ?? '') : ''
const button = (tree, label) => nodes(tree).find(n => n.type === 'button' && text(n) === label)
const labels = tree => nodes(tree).filter(n => n.type === 'button').map(text)

// ── Golden Entry ──────────────────────────────────────────────────────────────

test('the first screen is the Golden Entry: wordmark, Skip, hero, the Observe → Commit → Refine proof and one Continue', () => {
  const { tree } = mount(() => {})
  const all = text(tree())
  for (const copy of [
    'CLINIVERSE',
    'CLINICAL LEARNING · ONE SYSTEM',
    'See the case.', 'Read the signal.', 'Make the decision.',
    'ECG, Echo and clinical reasoning — brought into one focused workflow built for deliberate practice.',
    '01', 'Observe', 'Start with the tracing, cine or case — before the label.',
    '02', 'Commit', 'Choose the interpretation or next clinical step.',
    '03', 'Refine', 'Use reasoning and evidence to sharpen the next attempt.',
    'Built for deliberate clinical practice.',
  ]) assert.ok(all.includes(copy), `missing: ${copy}`)
  assert.deepEqual(labels(tree()), ['Skip', 'Continue'])
  assert.equal(nodes(tree()).filter(n => n.type === 'h1').length, 1)
  assert.equal(nodes(tree()).find(n => n.type === 'h1').props.id, 'onboarding-title')
  assert.equal(nodes(tree()).find(n => n.type === 'main').props['aria-labelledby'], 'onboarding-title')
})

test('Skip enters the app without a trial; the component itself stores nothing and grants nothing', () => {
  const calls = []
  const { tree } = mount(value => calls.push(value))
  button(tree(), 'Skip').props.onClick()
  assert.deepEqual(calls, [false])
  assert.doesNotMatch(source, /localStorage|sessionStorage|supabase|entitlement|isPro|useCliniverseSubscription|openPaywall|activatePro/)
})

test('Continue reaches the ready step, which offers Enter (no trial), the plan options (trial flag) and Back', () => {
  const calls = []
  const view = mount(value => calls.push(value))
  button(view.tree(), 'Continue').props.onClick()
  const next = view.tree()
  assert.deepEqual(labels(next), ['Back', 'Enter Cliniverse', 'See Cliniverse PRO options'])
  assert.match(text(next), /Start with your next step\./)
  assert.doesNotMatch(text(next), /See the case\./)
  // The dominant action is Enter; the plan option is the quiet secondary.
  assert.equal(button(next, 'Enter Cliniverse').props.className, 'cv-onboarding-cta')
  assert.equal(button(next, 'See Cliniverse PRO options').props.className, 'cv-onboarding-secondary')
  button(next, 'Enter Cliniverse').props.onClick()
  button(view.tree(), 'See Cliniverse PRO options').props.onClick()
  assert.deepEqual(calls, [false, true])
  button(view.tree(), 'Back').props.onClick()
  assert.deepEqual(labels(view.tree()), ['Skip', 'Continue'])
})

test('the step affordance is a text-labelled group whose active step differs by more than colour', () => {
  const view = mount(() => {})
  const group = () => nodes(view.tree()).find(n => n.props?.role === 'group')
  assert.equal(group().props['aria-label'], 'Step 1 of 2')
  button(view.tree(), 'Continue').props.onClick()
  assert.equal(group().props['aria-label'], 'Step 2 of 2')
  assert.match(css, /\.cv-onboarding-progress > span\[data-active="true"\] \{ width: 40px; background: var\(--cv-teal\); \}/)
  assert.match(css, /\.cv-onboarding-progress > span \{[^}]*width: 16px/)
})

// ── behaviour that must not move ──────────────────────────────────────────────

test('completion persistence, deep-link bypass and the paywall hand-off still live in ReleaseApp, unchanged', () => {
  assert.match(app, /const ONBOARDING_SEEN_KEY = 'cliniverse:onboarding:seen'/)
  assert.match(app, /hasSeen = localStorage\.getItem\(ONBOARDING_SEEN_KEY\) === 'true'/)
  assert.match(app, /const hasDeepLink = new URLSearchParams\(window\.location\.search\)\.has\('view'\)/)
  assert.match(app, /setShowOnboarding\(!hasSeen && !hasDeepLink\)/)
  assert.match(app, /function complete\(startTrial: boolean\) \{\s*try \{ localStorage\.setItem\(ONBOARDING_SEEN_KEY, 'true'\) \} catch/)
  assert.match(app, /setShowOnboarding\(false\)\s*if \(startTrial\) openPaywall\(\)/)
  assert.match(app, /if \(showOnboarding\) return <OnboardingScreens onComplete=\{complete\} \/>/)
  assert.match(read('app/labs/onboarding-preview/page.tsx'), /<OnboardingScreens onComplete=\{\(\) => \{\}\} \/>/)
})

test('the write-only interests step is gone and no preference or progress is fabricated on completion', () => {
  assert.doesNotMatch(source, /interests|INTERESTS|aria-pressed|Choose your interests|PERSONALIZE/i)
  // The key was written here and read nowhere; it must not reappear as a write.
  for (const file of ['app/components/ReleaseApp.tsx', 'app/components/release/MeHub.tsx', 'app/components/release/TopicsIFollow.tsx']) {
    assert.equal(read(file).includes('cliniverse:onboarding:interests'), false, file)
  }
  // The real preference surface is still there, in Me.
  assert.match(read('app/components/release/TopicsIFollow.tsx'), /Topics I follow/)
})

// ── what left, and what is not claimed ────────────────────────────────────────

test('no feature tour, promotional visual composition or unsupported claim remains', () => {
  for (const legacy of ['Code Lab', 'Ward simulation', 'Studio', 'Operations', 'Reference', 'Resuscitation', 'Cardiology Operations', 'WHAT YOU CAN DO', 'HOW THE SYSTEM WORKS', 'governed', 'sourced', 'Everything above is live', 'live console', 'Connected Diagnostics', 'NeuraOps', 'hospital', 'Apple Health', 'diagnos']) {
    assert.equal(source.toLowerCase().includes(legacy.toLowerCase()), false, `onboarding still mentions ${legacy}`)
  }
  assert.equal(/\b\d{2,}\+?\s*(cases|lessons|modules|tools|specialt)/i.test(source), false)
  // No trial length, price or PRO promise is asserted here; the paywall shows what StoreKit actually offers.
  assert.doesNotMatch(source, /free trial|\d+[- ]day|\$\d|£\d|€\d|Start my free/i)
  assert.match(source, /See Cliniverse PRO options/)
  // Only the three approved product areas are named.
  assert.match(source, /ECG, Echo and clinical reasoning/)
  assert.match(source, /Learn holds your ECG, Echo and Ward practice/)
  assert.equal(existsSync(new URL('../app/components/release/OnboardingVisuals.tsx', import.meta.url)), false)
  assert.doesNotMatch(source, /OnboardingVisuals|FeatureFlow|CapabilityBeam|AnchorFrame|EditorialMark|SelectionSummary|framer-motion|lucide-react/)
})

// ── styling and motion ────────────────────────────────────────────────────────

test('styling is token-only and restrained: no glow, glass, shadow or ambient animation, one editorial column', () => {
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(css, /gradient|box-shadow|text-shadow|backdrop-filter|filter:|blur\(|glow|scale\(|position:\s*absolute/i)
  assert.equal(css.match(/@keyframes/g).length, 1)
  assert.match(css, /max-width: 560px/)
  assert.doesNotMatch(css, /flex: 1 1 \d+%|grid-template-columns: (repeat|1fr 1fr)/)
  assert.doesNotMatch(raw, /cv-onboarding-glow|cv-onboarding-card|cv-onboarding-anchor|cv-onboarding-icon|cv-onboarding-chip/)
  assert.match(css, /\.cv-onboarding-cta \{[^}]*min-height: 52px[^}]*background: var\(--cv-teal\)[^}]*color: var\(--cv-learning-on-teal\)/)
  assert.match(css, /\.cv-onboarding-quiet \{[^}]*min-height: 44px/)
  assert.match(css, /\.cv-onboarding-secondary \{[^}]*min-height: 44px/)
  // Type scales with text size: rem or tokens, never pixel font sizes.
  assert.doesNotMatch(css, /font-size: \d+px/)
})

test('motion is the step transition only, and it is off under prefers-reduced-motion', () => {
  assert.match(css, /@keyframes cvOnboardingStepIn \{[^}]*from \{ opacity: 0; transform: translateX\(/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.cv-onboarding-step \{ animation: none; \}\s*\}/)
  assert.match(css, /\.cv-onboarding-step\[data-direction="none"\] \{ animation: none; \}/)
  // No swipe or drag path exists, so there is no gesture without a tap equivalent.
  assert.doesNotMatch(source, /drag|onDragEnd|PanInfo|useReducedMotion|AnimatePresence/)
})

test('the surface keeps the shell tokens, safe areas, one h1 and focus on the new step', () => {
  assert.match(raw, /<main\s+data-commercial-shell\s+data-appearance=\{appearance\}\s+data-commercial-onboarding\s+aria-labelledby="onboarding-title"/)
  assert.match(raw, /overflowY: 'auto'/)
  // The pinned action bar carries the bottom safe area, and only pins when the screen is tall enough to keep the copy readable.
  assert.match(raw, /<footer className="cv-onboarding-foot" style=\{\{ paddingBottom: `max\(20px, \$\{NATIVE_SAFE_AREA_BOTTOM\}\)` \}\}>/)
  assert.match(css, /@media \(min-height: 600px\) \{\s*\.cv-onboarding-foot \{ position: sticky; bottom: 0; background: var\(--cv-bg\); \}/)
  for (const edge of ['TOP', 'RIGHT', 'BOTTOM', 'LEFT']) assert.match(raw, new RegExp(`NATIVE_SAFE_AREA_${edge}`))
  assert.match(raw, /ref=\{headingRef\} tabIndex=\{-1\}/)
  assert.match(raw, /headingRef\.current\?\.focus\(\)/)
  // Focus moves to the new heading after each step change, and never on first paint.
  const view = mount(() => {})
  assert.equal(view.focusCalls(), 0)
  button(view.tree(), 'Continue').props.onClick()
  assert.equal(view.focusCalls(), 1)
  button(view.tree(), 'Back').props.onClick()
  assert.equal(view.focusCalls(), 2)
})

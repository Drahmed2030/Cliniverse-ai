import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const app = read('app/components/ReleaseApp.tsx')
const summary = read('app/components/ward/LessonProgressSummary.tsx')
const accountLab = read('app/components/ward/AccountCodeLab.tsx')
const css = read('app/commercial-visual-system.css')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
const today = stripComments(app.slice(app.indexOf('function TodaySurface'), app.indexOf('function ProgressSurface')))
const header = app.slice(app.indexOf('function ReleaseHeader'), app.indexOf('// Layout and control styling'))

test('Today header reads title, account affordance and support line; the h1 text stays its own element', () => {
  assert.match(header, /today: \{ title: 'Today'/)
  assert.match(header, /active === 'today' \? \(/)
  assert.match(header, /<h1 id="today-title">One clear next step\.<\/h1>/)
  assert.match(header, /<p>Everything else can wait\.<\/p>/)
  // One header system: the support line is not repeated in the Today body.
  assert.doesNotMatch(today, /<h1/)
  assert.doesNotMatch(today, /Everything else can wait/)
  assert.match(today, /aria-labelledby="today-title"/)
  assert.match(read('native/screenshot/CliniverseScreenshotTests.swift'), /waitForText\("One clear next step\."\)/)
})

test('Today has exactly one primary action and one review item, routed to existing tabs', () => {
  assert.equal((today.match(/className="cv-today-cta"/g) ?? []).length, 1)
  assert.match(today, /className="cv-today-cta" onClick=\{\(\) => onNavigate\('learn'\)\}/)
  assert.equal((today.match(/className="cv-today-row"/g) ?? []).length, 1)
  assert.match(today, /onNavigate\('progress'\)/)
  assert.match(today, /NEXT ACTION/)
  assert.match(today, /REVIEW/)
})

test('Today does not hardcode user progress, review counts or study/case examples', () => {
  assert.doesNotMatch(today, /\b\d+\s+(cases?|studies|review)/i)
  assert.doesNotMatch(today, /Case 0\d/)
  assert.doesNotMatch(today, /\bdue\b/i)
  // Metrics come from the real account lesson data through the existing summary component.
  assert.match(today, /<AccountLearningSummary compact view="summary"/)
  assert.match(summary, /completedIds\.includes\(lesson\.id\)/)
  assert.doesNotMatch(summary.slice(summary.indexOf('if (compact)'), summary.indexOf('return <section data-learning-summary aria-label')), /\b(?:2|3|7)\b\s*(?:cases|studies)/i)
})

test('Today carries no extra content outside the approved contract', () => {
  const compact = summary.slice(summary.indexOf('if (compact)'), summary.indexOf('return <section data-learning-summary aria-label'))
  assert.doesNotMatch(today, /data-commercial-safety-note|Keep real patient information/)
  assert.doesNotMatch(compact, /Last completed|latestTitle/)
  assert.doesNotMatch(compact, /Code Lab →|onClick=\{onOpen\}/)
  assert.doesNotMatch(css.slice(css.lastIndexOf('/*', css.indexOf('Today — Golden Surface'))), /data-commercial-safety-note/)
})

test('compact learning summary keeps loading, failure, retry and governance copy', () => {
  const compact = summary.slice(summary.indexOf('if (compact)'), summary.indexOf('return <section data-learning-summary aria-label'))
  assert.match(compact, /Loading saved lessons…/)
  assert.match(compact, /We couldn’t load your saved lessons/)
  assert.match(compact, /onClick=\{onRetry\}/)
  assert.match(compact, /not clinical certification/)
  assert.match(accountLab, /compact=\{props\.compact\}/)
  // Progress and Me still render the full summary: they never pass `compact`.
  assert.equal(/view="summary"[^>]*compact/.test(app.replace(today, '')), false)
})

test('Today header adds only an account affordance, wired to Me, on Today only', () => {
  assert.match(header, /active === 'today' && \(/)
  assert.match(header, /aria-label="Account and plan"/)
  assert.match(app, /onOpenAccount=\{\(\) => setTab\('me'\)\}/)
  assert.match(css, /\.cv-today-account \{[^}]*width: 44px;[^}]*height: 44px;/s)
})

test('primary navigation is unchanged: Today, Learn, Progress, Explore, Me — no Intelligence', () => {
  const nav = read('app/components/ReleaseNav.tsx')
  assert.match(nav, /'today' \| 'learn' \| 'progress' \| 'explore' \| 'me'/)
  const labels = [...nav.matchAll(/label: '([^']+)'/g)].map(match => match[1])
  assert.deepEqual(labels, ['Today', 'Learn', 'Progress', 'Explore', 'Me'])
  assert.doesNotMatch(nav, /Intelligence/)
})

test('Today styling uses existing tokens only and stays scoped to the Today surface', () => {
  // The Today block runs until the Learn block begins (Learn has its own scoping test).
  const block = stripComments(css.slice(css.lastIndexOf('/*', css.indexOf('Today — Golden Surface')), css.lastIndexOf('/*', css.indexOf('Learn — practice-track landing'))))
  assert.doesNotMatch(block, /#[0-9a-fA-F]{3,8}\b/)
  assert.doesNotMatch(block, /\brgba?\(/)
  const rules = [...block.matchAll(/^([^\s@/}][^{]*)\{/gm)].map(match => match[1].trim())
  for (const selector of rules) {
    assert.ok(/^\[data-commercial-surface="today"\]/.test(selector) || /^\[data-release-header\] \.cv-today-(account|lead)/.test(selector), `unscoped selector: ${selector}`)
  }
  assert.match(block, /@media \(min-width: 700px\)/)
  assert.doesNotMatch(block, /position:\s*absolute/)
})

test('primary navigation labels adapt to large text instead of truncating', () => {
  const nav = read('app/components/ReleaseNav.tsx')
  assert.match(nav, /fontSize: 'min\(0\.75rem, 3\.4vw\)'/)
  assert.match(css, /\[data-commercial-navigation\] button \{[^}]*font-size: min\(0\.75rem, 12px\) !important;/)
  // Still five labels, still no horizontal-scroll strip.
  assert.doesNotMatch(nav, /overflowX|overflow-x|scrollSnap/)
})

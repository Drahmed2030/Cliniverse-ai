import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  projectEcg, projectEcho, projectWard, summarize, WARD_STAGES, SCORED_TRACKS, TRACK_IDS,
} from '../app/lib/progressTrajectory.ts'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const lib = stripComments(read('app/lib/progressTrajectory.ts'))
const component = read('app/components/release/ProgressTrajectory.tsx')
const componentSource = stripComments(component)
const app = read('app/components/ReleaseApp.tsx')
const css = read('app/commercial-visual-system.css')
const learn = read('app/components/release/LearnTracks.tsx')
const wardSaved = read('app/components/ward/WardSavedPractice.tsx')
const ecgHistory = read('app/components/release/EcgSavedHistory.tsx')
const progressSurface = stripComments(app.slice(app.indexOf('function ProgressSurface'), app.indexOf('function ReleaseIntelligenceGate')))
const header = app.slice(app.indexOf('function ReleaseHeader'), app.indexOf('function TodaySurface'))
// The Progress block runs until the Explore block begins (Explore has its own scoping test).
const progressCss = stripComments(css.slice(css.lastIndexOf('/*', css.indexOf('Progress — evidence-led trajectory')), css.lastIndexOf('/*', css.indexOf('Explore — curated discovery'))))

const ready = data => ({ state: 'ready', data })
const all = ({ ecg = ready({ count: 0, latestAt: null }), echo = ready({ count: 0, hasMore: false, latestAt: null }), ward = ready(null) } = {}) =>
  [projectEcg(ecg), projectEcho(echo), projectWard(ward)]

test('a record that has not loaded is never shown as empty or as an error', () => {
  const loading = { state: 'loading' }
  for (const row of [projectEcg(loading), projectEcho(loading), projectWard(loading)]) {
    assert.equal(row.evidence, 'loading')
    assert.doesNotMatch(row.detail, /No saved|isn’t saved/)
  }
  const failed = { state: 'error' }
  for (const row of [projectEcg(failed), projectEcho(failed), projectWard(failed)]) {
    assert.equal(row.evidence, 'unavailable')
    assert.match(row.detail, /couldn’t be loaded/)
    assert.equal(row.latestAt, null)
  }
})

test('ECG and Echo report saved scored attempts as assessment evidence, never as competency or a percentage', () => {
  const ecg = projectEcg(ready({ count: 3, latestAt: '2026-09-18T10:00:00Z' }))
  assert.equal(ecg.evidence, 'scored')
  assert.equal(ecg.status, 'Scored attempts saved')
  assert.equal(ecg.detail, '3 recent saved answers')
  assert.equal(ecg.latestAt, '2026-09-18T10:00:00Z')
  assert.equal(projectEcg(ready({ count: 1, latestAt: 'x' })).detail, '1 recent saved answer')
  const echo = projectEcho(ready({ count: 4, hasMore: false, latestAt: '2026-09-19T10:00:00Z' }))
  assert.equal(echo.evidence, 'scored')
  assert.equal(echo.detail, '4 saved attempts')
  assert.equal(projectEcho(ready({ count: 1, hasMore: false, latestAt: 'x' })).detail, '1 saved attempt')
  // A full first page means the total is unknown, so the count says so.
  assert.equal(projectEcho(ready({ count: 20, hasMore: true, latestAt: 'x' })).detail, '20+ saved attempts')
  for (const row of [ecg, echo]) {
    assert.equal(row.stage, null)
    assert.doesNotMatch(`${row.status} ${row.detail}`, /%|mastery|competen|improv|consistent|building|proficien/i)
  }
})

test('with no records, ECG and Echo give a neutral state and a legitimate action', () => {
  const [ecg, echo] = all()
  for (const row of [ecg, echo]) {
    assert.equal(row.evidence, 'none')
    assert.equal(row.status, 'No saved activity')
    assert.equal(row.latestAt, null)
    assert.match(row.detail, /^Start an /)
  }
  assert.equal(ecg.action, 'Practice ECG')
  assert.equal(echo.action, 'Practice Echo')
})

test('Ward reports the position inside the latest saved practice only, and never a score', () => {
  assert.deepEqual([...WARD_STAGES], ['brief', 'review', 'gaps', 'handover', 'complete'])
  const inProgress = projectWard(ready({ stage: 'gaps', title: 'Current status', actionCount: 2 }))
  assert.equal(inProgress.evidence, 'activity')
  assert.equal(inProgress.status, 'Practice in progress')
  assert.equal(inProgress.detail, 'Current status · 2 recorded actions')
  assert.deepEqual(inProgress.stage, { step: 3, of: 5, label: 'Check the gaps' })
  assert.equal(inProgress.action, 'Open Ward practice')
  const done = projectWard(ready({ stage: 'complete', title: 'Current status', actionCount: 1 }))
  assert.equal(done.status, 'Practice completed')
  assert.equal(done.detail, 'Current status · 1 recorded action')
  assert.deepEqual(done.stage, { step: 5, of: 5, label: 'Practice completed' })
  assert.equal(done.action, 'Review Ward practice')
  assert.doesNotMatch(`${inProgress.status} ${inProgress.detail} ${done.status} ${done.detail}`, /%|score|mastery|competen/i)
})

test('Ward with no saved practice, and Ward that cannot be saved for this account, are different honest states', () => {
  const none = projectWard(ready(null))
  assert.equal(none.evidence, 'none')
  assert.equal(none.status, 'No saved activity')
  const unsupported = projectWard({ state: 'unsupported' })
  assert.equal(unsupported.evidence, 'not-recorded')
  assert.equal(unsupported.status, 'Not recorded')
  assert.match(unsupported.detail, /isn’t saved to your account/)
  assert.equal(unsupported.stage, null)
})

test('summary counts are deterministic from resolved records and never invent a zero for a failed load', () => {
  assert.deepEqual(TRACK_IDS, ['ecg', 'echo', 'ward'])
  assert.deepEqual(SCORED_TRACKS, ['ecg', 'echo'])
  const empty = summarize(all())
  assert.deepEqual(empty, { status: 'ready', activityTracks: 0, activityOf: 3, scoredTracks: 0, scoredOf: 2 })
  const mixed = summarize(all({
    ecg: ready({ count: 2, latestAt: 'x' }),
    ward: ready({ stage: 'review', title: 'Current status', actionCount: 1 }),
  }))
  // Ward activity counts as activity but can never count as a scored attempt.
  assert.deepEqual(mixed, { status: 'ready', activityTracks: 2, activityOf: 3, scoredTracks: 1, scoredOf: 2 })
  assert.equal(summarize(all({ ecg: { state: 'loading' } })).status, 'loading')
  assert.equal(summarize(all({ echo: { state: 'error' } })).status, 'unavailable')
  // Loading wins only while something is still loading; an error is not masked by a zero.
  assert.equal(summarize(all({ ecg: { state: 'loading' }, echo: { state: 'error' } })).status, 'loading')
  assert.equal(summarize(all({ ward: { state: 'unsupported' } })).status, 'ready')
  assert.equal(summarize(all({ ward: { state: 'unsupported' } })).activityTracks, 0)
})

test('no Figma example value or unsupported claim is hardcoded anywhere in the Progress implementation', () => {
  const surface = `${lib}\n${componentSource}\n${progressSurface}`
  for (const example of [
    'Territory recognition', 'Revisit axis', 'Repeat A4C', 'Current-state decisions are consistent',
    'A4C observation', '5 completed', '2 review due', '3 active', 'Building', 'improving', 'Review due',
  ]) assert.ok(!surface.includes(example), `example value leaked: ${example}`)
  assert.doesNotMatch(surface, /\bmastery\b|\bmastered\b|\bproficien|\bstreak\b|\bleaderboard\b|\bXP\b/i)
  assert.doesNotMatch(componentSource, /width:\s*['"`]?\d+%|\$\{[^}]*\}%/)
  // Only the neutral, clearly-scoped "not a competency level" note may use the word.
  const uses = [...surface.matchAll(/competen\w*/gi)].map(match => match[0])
  assert.ok(uses.length >= 1 && uses.length <= 4, `unexpected competency wording (${uses.length})`)
})

test('no review is invented: the next-review section states that none is scheduled and routes to Learn', () => {
  assert.match(componentSource, /NEXT REVIEW/)
  assert.match(componentSource, /No review scheduled/)
  assert.match(componentSource, /onClick=\{onOpenLearn\}/)
  assert.doesNotMatch(componentSource, /due at|dueAt|due_at|scheduledFor|nextReviewAt|reviewDue/i)
  assert.match(progressSurface, /onOpenLearn=\{\(\) => onNavigate\('learn'\)\}/)
})

test('the trajectory reads through existing repositories only and never writes or scores', () => {
  assert.match(componentSource, /createEchoAccountEventRepository\(supabase\)/)
  assert.match(componentSource, /echoRepository\.historyPage\(owner\)/)
  assert.match(componentSource, /handoverAccountRepository\(supabase\)/)
  assert.match(componentSource, /wardRepository\.latest\(owner\)/)
  assert.match(componentSource, /loadEcgSavedAnswers\(owner\)/)
  assert.doesNotMatch(componentSource, /\.insert\(|\.upsert\(|\.update\(|\.delete\(|\.save\(|supabase\.from\(/)
  assert.doesNotMatch(`${componentSource}\n${lib}`, /echoMasteryEngine|ecgLongitudinalMastery|ecgScoringCompetency|unifiedCompetencyTelemetry|echoStudySummary|reviewWorklist|localStorage/)
  // Ward practice is saved only for review sessions; other accounts get the honest unsupported state, not a query.
  assert.match(componentSource, /useTrackLoad\(owner, includeWard \? loadWard : null\)/)
  assert.match(componentSource, /loader \? state : \{ state: 'unsupported' \}/)
})

test('the ECG history reader is a single shared function and keeps the learner-eligibility gate', () => {
  assert.match(ecgHistory, /export async function loadEcgSavedAnswers\(owner: string\)/)
  assert.equal(ecgHistory.match(/LEARNER_ELIGIBLE/g).length, 1)
  assert.equal(ecgHistory.match(/from\('ecg_competency_attempts'\)/g).length, 1)
  assert.match(ecgHistory, /\.eq\('user_id', owner\)\.eq\('case_id', 'ecg-governed-case-001'\)/)
  assert.match(ecgHistory, /loadEcgSavedAnswers\(owner\)\.then/)
  assert.doesNotMatch(ecgHistory, /\.insert\(|\.update\(|\.upsert\(/)
})

test('Progress shows ECG, Echo and Ward as the canonical tracks, with the same destinations and accents as Learn', () => {
  const learnEntries = Object.fromEntries([...learn.matchAll(/id: '([^']+)',[\s\S]*?accent: '([^']+)',\s*href: (?:'([^']+)'|null)/g)].map(([, id, accent, href]) => [id, { accent, href: href ?? null }]))
  const ui = Object.fromEntries([...component.matchAll(/(ecg|echo|ward): \{ accent: '([^']+)', href: (?:'([^']+)'|null) \}/g)].map(([, id, accent, href]) => [id, { accent, href: href ?? null }]))
  assert.deepEqual(Object.keys(ui), ['ecg', 'echo', 'ward'])
  assert.deepEqual(ui, learnEntries)
  assert.deepEqual(ui.ecg, { accent: 'var(--cv-teal)', href: '/labs/ecg-challenge' })
  assert.deepEqual(ui.echo, { accent: 'var(--cv-violet)', href: '/labs/echo-preview' })
  assert.deepEqual(ui.ward, { accent: 'var(--cv-blue)', href: null })
  for (const legacy of ['Code Lab', 'Cardiology Operations', 'Nexus']) assert.ok(!componentSource.includes(legacy), `${legacy} is not a Progress track`)
})

test('Ward stage labels match the labels the saved-practice list already shows', () => {
  const saved = wardSaved.match(/const stages = \{([^}]+)\}/)[1]
  const stages = Object.fromEntries([...saved.matchAll(/(\w+): '([^']+)'/g)].map(([, key, label]) => [key, label]))
  const projected = Object.fromEntries(WARD_STAGES.map(stage => [stage, projectWard(ready({ stage, title: 't', actionCount: 0 })).stage.label]))
  assert.deepEqual(projected, stages)
})

test('every legitimate saved-record surface stays reachable, unchanged, and loads only when opened', () => {
  assert.match(progressSurface, /<ProgressTrajectory includeWard=\{showWardPractice\}/)
  assert.match(progressSurface, /<details className="cv-progress-records" onToggle=\{event => setRecordsOpen\(event\.currentTarget\.open\)\}>/)
  assert.match(progressSurface, /\{recordsOpen && \(/)
  const opened = progressSurface.slice(progressSurface.indexOf('{recordsOpen && ('))
  assert.match(opened, /<AssessmentHistory \/>/)
  assert.match(opened, /\{showWardPractice && <WardSavedPractice onOpen=\{onOpenWard\} \/>\}/)
  assert.match(opened, /<AccountLearningSummary view="summary" isPro=\{false\} onUpgrade=\{onOpenCodeLab\} onBack=\{onOpenCodeLab\} onOpen=\{onOpenCodeLab\} \/>/)
  const before = progressSurface.slice(0, progressSurface.indexOf('{recordsOpen && ('))
  for (const name of ['AssessmentHistory', 'WardSavedPractice', 'AccountLearningSummary']) assert.ok(!before.includes(`<${name}`), `${name} must not mount before the disclosure opens`)
  // The old stacked competency card is replaced by the trajectory hierarchy.
  assert.doesNotMatch(progressSurface, /Clinical competency|Go to Learn/)
  assert.match(app, /onOpenWard=\{\(\) => \{ setCareWorkspace\('ward'\); setTab\('learn'\) \}\}/)
})

test('Progress owns the page heading and support line in the shared header; navigation is unchanged', () => {
  assert.match(header, /progress: \{ title: 'Progress', sub: 'See what is strengthening, what needs another pass, and where to go next\.' \}/)
  assert.match(header, /active === 'progress' \|\| active === 'explore' \|\| active === 'me' \? <h1 id=\{`\$\{active\}-title`\}/)
  assert.match(app, /<section aria-labelledby="progress-title" data-commercial-surface="progress">/)
  assert.doesNotMatch(progressSurface, /<h1/)
  const nav = read('app/components/ReleaseNav.tsx')
  assert.deepEqual([...nav.matchAll(/label: '([^']+)'/g)].map(match => match[1]), ['Today', 'Learn', 'Progress', 'Explore', 'Me'])
  assert.doesNotMatch(nav, /Intelligence/)
})

test('Progress styling is scoped, token-only and restrained', () => {
  assert.doesNotMatch(progressCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(progressCss, /gradient|box-shadow|text-shadow|filter:\s*blur|animation|@keyframes/)
  // Every rule head (top level or inside @media), split into its comma-separated selectors.
  const selectors = [...progressCss.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  assert.ok(selectors.length > 25)
  for (const selector of selectors) assert.match(selector, /^\[data-commercial-surface="progress"\]/, `unscoped selector: ${selector}`)
  // Only the visually-hidden helper may be positioned.
  const positioned = [...progressCss.matchAll(/([^{}]+)\{[^}]*position:\s*absolute[^}]*\}/g)].map(match => match[1].trim())
  assert.deepEqual(positioned, ['[data-commercial-surface="progress"] .cv-progress-sr'])
  assert.match(progressCss, /min-height: 44px/)
  assert.match(progressCss, /max-width: 680px/)
  assert.match(progressCss, /@media \(min-width: 700px\)/)
})

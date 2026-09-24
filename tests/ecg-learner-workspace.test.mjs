import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import {
  evaluateEcgLearnerAvailability, ECG_LEARNER_ARTIFACT_SOURCE, ECG_LEARNER_DELIVERY_ROUTE, ECG_LEARNER_CASE_ID,
} from '../app/lib/competency/ecgLearnerAvailability.ts'
import { evaluateRecord10ReviewedPdfBinding, getRecord10ReviewedPdfSnapshot } from '../app/lib/clinicalIntelligence/ecgRecord10ReviewedPdfBinding.ts'
import { ECG_RECORD10_RUBRIC_APPROVAL_SHA256, getApprovedRecord10Rubric } from '../app/lib/competency/ecgRecord10ApprovedRubric.ts'
import { ecgRubricDigest } from '../app/lib/competency/ecgAnswerSubmission.ts'
import { ECG_RECORD10_QUESTION } from '../app/lib/competency/ecgRecord10Question.ts'
import { RECORD10_REVIEW_PDF } from '../app/lib/clinicalIntelligence/ecgReviewedPdfIdentity.ts'

const require = createRequire(import.meta.url)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const workspacePath = 'app/learn/ecg/EcgLearnerWorkspace.tsx'
const workspaceRaw = read(workspacePath)
const workspace = stripComments(workspaceRaw)
const availabilitySource = stripComments(read('app/lib/competency/ecgLearnerAvailability.ts'))
const css = stripComments(read('app/learn/ecg/ecg-workspace.css'))
const page = read('app/learn/ecg/page.tsx')
const ownRoute = getRecord10ReviewedPdfSnapshot().target.platformFamily

// ── the runtime decision ──────────────────────────────────────────────────────

test('today the workspace is held: the evidence does not cover the in-app display route and no governed artifact source exists', () => {
  const availability = evaluateEcgLearnerAvailability()
  assert.equal(availability.state, 'held')
  assert.deepEqual(availability.blockers, ['governed-artifact-source-unavailable', 'platform-family-mismatch'])
  assert.equal(availability.decision.learnerReady, false)
  assert.equal(availability.caseId, 'ecg-governed-case-001')
  assert.equal(ECG_LEARNER_ARTIFACT_SOURCE, null)
  assert.notEqual(ECG_LEARNER_DELIVERY_ROUTE, ownRoute)
})

test('the hold comes from the display route and the missing artifact source, not from a broken evidence snapshot', () => {
  // The retained PDF on its own reported route is eligible under the existing evaluator...
  assert.equal(evaluateRecord10ReviewedPdfBinding().learnerReady, true)
  // ...and that decision is not inherited by any other route.
  const routeOnly = evaluateEcgLearnerAvailability({ artifactSource: { url: 'test-double' } })
  assert.equal(routeOnly.state, 'held')
  assert.deepEqual(routeOnly.blockers, ['platform-family-mismatch'])
  const sourceOnly = evaluateEcgLearnerAvailability({ deliveryRoute: ownRoute })
  assert.equal(sourceOnly.state, 'held')
  assert.deepEqual(sourceOnly.blockers, ['governed-artifact-source-unavailable'])
})

test('ready requires BOTH a covered display route and a governed artifact source (test doubles, not production state)', () => {
  const ready = evaluateEcgLearnerAvailability({ deliveryRoute: ownRoute, artifactSource: { url: 'test-double' } })
  assert.equal(ready.state, 'ready')
  assert.deepEqual(ready.blockers, [])
  assert.equal(ready.decision.learnerReady, true)
  assert.equal(ready.artifact.url, 'test-double')
  assert.deepEqual(ready.options, ECG_RECORD10_QUESTION.options)
  // The reference answer comes from the frozen approved rubric, never from the component or the legacy quiz.
  assert.equal(ready.review.correctOptionId, getApprovedRecord10Rubric().questions[0].correctOptionId)
  assert.equal(ready.review.statement, 'The existing human review identifies sinus rhythm.')
})

test('evidence that is revoked, missing or for another case fails closed even when route and source are present', () => {
  const open = snapshot => evaluateEcgLearnerAvailability({ snapshot, deliveryRoute: ownRoute, artifactSource: { url: 'test-double' } })
  assert.equal(open(getRecord10ReviewedPdfSnapshot()).state, 'ready')
  const revoked = getRecord10ReviewedPdfSnapshot(); revoked.authorizedPromotionActorIds = []
  assert.equal(open(revoked).state, 'held')
  assert.ok(open(revoked).blockers.includes('current-authorized-promotion-required'))
  const noDevice = getRecord10ReviewedPdfSnapshot(); noDevice.deviceBinding = undefined
  assert.equal(open(noDevice).state, 'held')
  const noTarget = getRecord10ReviewedPdfSnapshot(); noTarget.target = undefined
  assert.equal(open(noTarget).state, 'held')
  const otherCase = getRecord10ReviewedPdfSnapshot(); otherCase.caseId = 'some-other-case'
  assert.equal(open(otherCase).state, 'held')
  const truncated = getRecord10ReviewedPdfSnapshot(); truncated.events = truncated.events.slice(0, 3)
  assert.equal(open(truncated).state, 'held')
})

test('a held payload carries no artifact source, no options, no reference answer and no reviewer notes', () => {
  const held = evaluateEcgLearnerAvailability()
  const json = JSON.stringify(held)
  for (const key of ['artifact', 'review', 'options', 'correctOptionId', 'skillId', 'notes', 'evidenceRecordIds', 'humanAttestation']) assert.equal(key in held || json.includes(`"${key}"`), false, `held payload leaks ${key}`)
  assert.doesNotMatch(json, /sinus/i)
  assert.deepEqual(Object.keys(held.question).sort(), ['approvalSha256', 'id', 'prompt', 'version'])
  assert.deepEqual(new Set(held.evidence.flatMap(row => Object.keys(row))), new Set(['kind', 'decision', 'actorType', 'occurredAt']))
})

test('the approved question and rubric are preserved exactly', () => {
  const held = evaluateEcgLearnerAvailability()
  assert.equal(ECG_RECORD10_RUBRIC_APPROVAL_SHA256, 'af98fc721119f470afd3679a26bcf9dcda3914288506aca39430012108edd0af')
  assert.equal(ecgRubricDigest(getApprovedRecord10Rubric()), ECG_RECORD10_RUBRIC_APPROVAL_SHA256)
  assert.equal(held.question.approvalSha256, ECG_RECORD10_RUBRIC_APPROVAL_SHA256)
  assert.deepEqual({ id: held.question.id, version: held.question.version, prompt: held.question.prompt }, { id: 'record10-rhythm-v1', version: '1.0.0', prompt: 'What rhythm is shown?' })
  assert.deepEqual(ECG_RECORD10_QUESTION.options.map(option => option.label), ['Sinus rhythm', 'Atrial fibrillation', 'Atrial flutter', 'Unable to determine'])
  assert.deepEqual(held.reviewedFile, { filename: RECORD10_REVIEW_PDF.filename, bytes: 557798, sha256: '237865bfb5092573904802afabf10d4b51f2c21af85ef27a49d5c8a839962fc5' })
  assert.equal(ECG_LEARNER_CASE_ID, 'ecg-governed-case-001')
})

test('the decision is derived from the existing evaluator at request time, never from a static JSON or a constant', () => {
  assert.match(availabilitySource, /evaluateEcgEligibility\(routed\)/)
  assert.match(availabilitySource, /getRecord10ReviewedPdfSnapshot\(\)/)
  assert.doesNotMatch(availabilitySource, /readFileSync|\.json'|docs\/|learnerReady: true|LEARNER_ELIGIBLE|EcgChallenge|ecgChallengeProgress/)
  assert.match(page, /export const dynamic = 'force-dynamic'/)
  assert.match(page, /availability=\{evaluateEcgLearnerAvailability\(\)\}/)
})

// ── the held workspace, rendered ──────────────────────────────────────────────

const expand = node => {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(expand)
  if (typeof node.type === 'function') return expand(node.type(node.props))
  return { ...node, props: { ...node.props, children: expand(node.props?.children) } }
}
const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)]
const text = node => typeof node === 'string' ? node : typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join(' ') : node && typeof node === 'object' ? text(node.props?.children ?? '') : ''

function renderHeld(availability = evaluateEcgLearnerAvailability()) {
  const code = ts.transpileModule(workspaceRaw, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  const stubs = {
    // Hooks are stubbed: the held path renders once and never re-renders.
    react: { useState: initial => [initial, () => {}], useEffect: () => {}, useRef: initial => ({ current: initial }) },
    './ecg-workspace.css': {}, 'next/link': { default: 'Link' }, '../../components/auth/AuthGate': { default: 'AuthGate' },
    '../../components/release/AppearanceSettings': { useAppearance: () => 'light' },
    '../../lib/clinicalIntelligence/ecgReviewedPdfIdentity': { matchesReviewedEcgPdf: async () => false },
    '../../lib/nativeSafeArea': { NATIVE_SAFE_AREA_TOP: '0px', NATIVE_SAFE_AREA_BOTTOM: '0px' },
  }
  vm.runInNewContext(code, { exports, require: name => stubs[name] ?? require(name) })
  const gate = exports.default({ availability })
  assert.equal(gate.type, 'AuthGate')
  assert.equal(gate.props.allowGuest, false)
  return expand(gate.props.children())
}

test('the held workspace shows an honest state: no tracing, no interactive question, no progress, no substitute', () => {
  const tree = renderHeld()
  const all = nodes(tree)
  for (const forbidden of ['input', 'fieldset', 'button', 'object', 'iframe', 'img', 'canvas', 'svg', 'video']) assert.equal(all.some(n => n.type === forbidden), false, `held state renders <${forbidden}>`)
  const main = all.find(n => n.type === 'main')
  assert.equal(main.props['data-state'], 'held')
  assert.equal(main.props['aria-labelledby'], 'ecg-title')
  assert.equal(all.filter(n => n.type === 'h1').length, 1)
  const copy = text(tree)
  for (const expected of ['Case temporarily unavailable', 'This tracing isn’t shown yet', 'temporarily unavailable while its display is being verified', 'Practice question', 'What rhythm is shown?', 'return to Learn and continue with another available activity']) assert.ok(copy.includes(expected), `missing: ${expected}`)
  assert.ok(all.some(n => n.type === 'p' && n.props.role === 'status'))
  // The answer is never revealed before there is anything to interpret.
  assert.doesNotMatch(copy, /sinus|flutter|fibrillation/i)
  assert.equal(all.find(n => n.type === 'Link').props.href, '/?view=learn')
})

test('learner presentation does not expose internal governance or provenance metadata', () => {
  const tree = renderHeld()
  const copy = text(tree)
  assert.equal(nodes(tree).filter(n => n.type === 'details').length, 0)
  for (const internal of ['SHA-256', 'Promotion decision', 'Display decision', 'Policy', 'platform-family-mismatch', 'governed-artifact-source-unavailable', ECG_LEARNER_DELIVERY_ROUTE, ECG_RECORD10_RUBRIC_APPROVAL_SHA256, RECORD10_REVIEW_PDF.sha256]) assert.ok(!copy.includes(internal), `learner UI leaks ${internal}`)
})

// ── the ready workspace (unreachable in production today; contracts only) ─────

test('the ready workspace verifies the reviewed file before anything is shown, and shows nothing if it cannot', () => {
  const fetchAt = workspace.indexOf('fetch(source'), verifyAt = workspace.indexOf('matchesReviewedEcgPdf(bytes)'), urlAt = workspace.indexOf('URL.createObjectURL')
  assert.ok(fetchAt > -1 && verifyAt > fetchAt && urlAt > verifyAt, 'fetch → verify → object URL, in that order')
  assert.match(workspace, /throw new Error\('mismatch'\)/)
  assert.match(workspace, /The reviewed file could not be verified/)
  // The status chip follows the real verification state, so a failed check never reads as a reviewed case.
  assert.match(workspace, /tracing\.status === 'failed' \? 'Case temporarily unavailable'/)
  assert.match(workspace, /Nothing is shown in its place, and the question stays closed\./)
  // The interactive stages only render once the tracing is verified.
  assert.match(workspace, /\{tracing\.status !== 'verified' \? null : stage === 0/)
  // The one network call is a GET for the governed artifact.
  assert.equal(workspace.match(/fetch\(/g).length, 1)
  assert.doesNotMatch(workspace, /method:\s*['"](POST|PUT|PATCH|DELETE)|body:/)
})

test('the stage rail has exactly the stages the approved case supports, and the question is a semantic radio group', () => {
  assert.match(workspace, /const STAGES = \['Observe', 'Interpret', 'Review'\] as const/)
  assert.doesNotMatch(workspace, /Decide/)
  assert.match(workspace, /aria-current=\{index === stage \? 'step' : undefined\}/)
  assert.match(workspace, /<fieldset className="ecg-question">\s*<legend>\{availability\.question\.prompt\}<\/legend>/)
  assert.match(workspace, /<input type="radio" name="ecg-rhythm" value=\{option\.id\}/)
  assert.match(workspace, /availability\.options\.map\(option =>/)
  // Options and the reference answer come only from the availability payload, never from literals here.
  assert.doesNotMatch(workspace, /Sinus rhythm|Atrial fibrillation|Atrial flutter|Unable to determine|correctOptionId: '|'sinus'/)
  assert.match(workspace, /answer === availability\.review\.correctOptionId/)
  assert.match(workspace, /<button type="button" className="ecg-cta" disabled=\{!chosen\}/)
  // Focus moves to the new stage heading, never on first paint.
  assert.match(workspace, /if \(!moved\.current\) \{ moved\.current = true; return \}\s*headingRef\.current\?\.focus\(\)/)
  assert.match(workspace, /<div className="ecg-result" role="status">/)
})

test('nothing is saved, scored, recorded as progress or reused from the legacy quiz or the reviewer endpoint', () => {
  assert.doesNotMatch(workspace, /supabase|localStorage|sessionStorage|indexedDB|\/api\/|ecg-review-attempt|ecgChallengeProgress|loadEcgSavedAnswers|EcgSavedHistory|ProgressTrajectory|submitEcgAnswers|saveGovernedEcgAttempt|prepareEcgAccountAttempt|recordEcgCaseAnswer/)
  assert.doesNotMatch(workspace, /EcgChallenge|ecgWaveform|createSyntheticLead|SyntheticLead|<svg|<canvas|<img/)
  assert.doesNotMatch(workspace, /learnerReady|LEARNER_ELIGIBLE|HUMAN_REVIEWED|humanClinicalAttestationId|gateState/)
  assert.match(workspace, /Feedback only\. This answer is not saved and does not change your progress\./)
  assert.doesNotMatch(workspace, /existing human review|Promotion decision|Display decision|SHA-256|decision\.policy|deliveryRoute/)
  assert.match(workspace, /Viewing this page does not record progress\./)
})

test('no XP, emoji, streak, difficulty badge or prescriptive legacy copy', () => {
  for (const source of [workspaceRaw, read('app/learn/ecg/ecg-workspace.css'), read('app/lib/competency/ecgLearnerAvailability.ts')]) {
    assert.doesNotMatch(source, /\bXP\b|streak|leaderboard|level up|EXCELLENT|CRITICAL/i)
    assert.doesNotMatch(source, /[\u{1F300}-\u{1FAFF}☀-➿]/u)
  }
  assert.doesNotMatch(workspace, /reperfusion|thrombolys|anticoag|heparin|aspirin|clopidogrel|amiodarone|cardioversion|pacing|cath(eterization)? lab|activate|treatment|treat |administer|mg\b/i)
  assert.doesNotMatch(workspace, /Chest discomfort|54 years|anterior injury|1 of 4|Acute anterior/)
  assert.match(workspace, /The final 106 ms remain unchanged and must not be used as a target morphology feature\./)
  assert.match(workspace, /it is not a measure of clinical competence/)
})

test('styling is scoped, token-only, restrained, and nothing is positioned over the tracing', () => {
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(css, /gradient|box-shadow|text-shadow|backdrop-filter|filter:|blur\(|glow|animation|@keyframes|transition|transform|position:\s*(absolute|fixed|sticky)|z-index/i)
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  assert.ok(selectors.length >= 25)
  for (const selector of selectors) assert.match(selector, /^\[data-ecg-workspace\]/, `unscoped selector: ${selector}`)
  // The root layout's fixed watermark must stay behind the workspace: its own stacking context, as the shell has.
  assert.match(css, /\[data-ecg-workspace\]\[data-commercial-shell\] \{[^}]*isolation: isolate/)
  assert.match(css, /\.ecg-tracing \{[^}]*width: 100%[^}]*height: clamp\(320px, 62vh, 760px\)/)
  assert.match(css, /@media \(min-width: 1000px\) \{\s*\[data-ecg-workspace\] \.ecg-grid \{ grid-template-columns: minmax\(0, 1fr\) minmax\(300px, 360px\); \}/)
  assert.match(css, /\.ecg-cta \{[^}]*min-height: 52px/)
  assert.match(css, /\.ecg-back \{[^}]*min-height: 44px/)
  assert.match(css, /\.ecg-viewer-link \{[^}]*min-height: 48px/)
  assert.match(css, /\.ecg-option \{[^}]*min-height: 48px/)
  assert.match(css, /\.ecg-evidence > summary \{[^}]*min-height: 48px/)
  assert.doesNotMatch(css.replace(/@media \(min-width: \d+px\)/g, ''), /font-size: \d+px/)
  assert.match(workspaceRaw, /<main\s+data-commercial-shell\s+data-appearance=\{appearance\}\s+data-ecg-workspace/)
})

// ── wiring, the legacy route and the reviewer-only path ───────────────────────

test('Learn and Progress open the governed workspace; the legacy quiz is no longer any primary entry', () => {
  assert.match(read('app/components/release/LearnTracks.tsx'), /id:\s*'ecg',[\s\S]*?href:\s*'\/learn\/ecg'/)
  assert.match(read('app/components/release/ProgressTrajectory.tsx'), /ecg: \{ accent: 'var\(--cv-teal\)', href: '\/learn\/ecg' \}/)
  for (const file of ['app/components/release/LearnTracks.tsx', 'app/components/release/ProgressTrajectory.tsx', 'app/components/release/AtlasReleaseCatalog.tsx', 'app/components/ReleaseApp.tsx', 'app/components/release/MeHub.tsx', 'app/components/release/OnboardingScreens.tsx']) {
    assert.equal(stripComments(read(file)).includes('/labs/ecg-challenge'), false, `${file} still links the legacy quiz`)
  }
})

test('the legacy route and its component are untouched and no longer reachable from the shell', () => {
  // Kept until the new path is proven; still governed only by its own (unchanged) page.
  assert.ok(existsSync(new URL('../app/labs/ecg-challenge/page.tsx', import.meta.url)))
  assert.match(read('app/labs/ecg-challenge/page.tsx'), /<EcgChallenge onXP=\{\(\) => \{\}\} \/>/)
  assert.ok(existsSync(new URL('../app/components/EcgChallenge.tsx', import.meta.url)))
  // The existing deep-link resolver for a specific case id is unchanged and still lives beside the new index route.
  assert.ok(existsSync(new URL('../app/learn/ecg/[caseId]/page.tsx', import.meta.url)))
  assert.match(read('app/learn/ecg/[caseId]/page.tsx'), /destinationHref="\/\?view=learn"/)
})

test('the reviewer-only endpoint and review workspace stay reviewer-only and are not exposed to learners', () => {
  const route = read('app/api/ecg-review-attempt/route.ts')
  assert.match(route, /process\.env\.VERCEL_ENV !== 'preview' && process\.env\.NODE_ENV !== 'development'\) return null/)
  assert.match(route, /identity\.data\.user\?\.email !== 'reviewer@cliniverseai\.com'/)
  assert.match(route, /confirmed-external-iphone-xs-max-ios-18\.7\.10/)
  assert.match(read('app/labs/ecg-account-review/page.tsx'), /notFound\(\)/)
  for (const source of [workspace, availabilitySource]) assert.doesNotMatch(source, /ecg-review-attempt|echo-review-access|reviewer@cliniverseai\.com|confirmed-external-iphone/)
})

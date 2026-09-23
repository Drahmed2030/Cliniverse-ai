import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET as ASSET } from '../app/lib/clinicalMedia/licensedEchoAsset.ts'
import { ECHO_A4C_CLINICAL_REVIEW_ATTESTATION as REVIEW } from '../app/lib/clinicalMedia/echoClinicalReviewAttestation.ts'
import { ECHO_A4C_PREVIEW_STUDY } from '../app/lib/clinicalMedia/echoPreviewStudy.ts'

const require = createRequire(import.meta.url)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const stripComments = source => source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const workspaceRaw = read('app/learn/echo/EchoLearnerWorkspace.tsx')
const workspace = stripComments(workspaceRaw)
const caption = stripComments(read('app/components/clinical-media/EchoCineCaption.tsx'))
const preview = read('app/components/clinical-media/ClinicalMediaPreview.tsx')
const moduleCss = read('app/components/clinical-media/clinical-media.module.css')
const marker = moduleCss.indexOf('/* ── Learner layout (Echo v2)')
const learnerCss = stripComments(moduleCss.slice(marker))
const workspaceCss = stripComments(read('app/learn/echo/echo-workspace.css'))
const summaryCss = read('app/components/clinical-media/EchoStudySummaryPanel.module.css')

// ── the engine and its governance values are untouched ────────────────────────

test('the licensed media bytes and the rights record are exactly what they were: the file still hashes to the frozen derivative checksum', () => {
  const bytes = readFileSync(new URL('../public/clinical-media/echo/a4c-normal-cardionetworks-v1.mp4', import.meta.url))
  assert.equal(bytes.length, ASSET.rights.derivativeBytes)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), ASSET.rights.derivativeSha256)
  assert.equal(ASSET.rights.licenseId, 'CC-BY-SA-3.0')
  assert.equal(ASSET.rights.shareAlikeRequired, true)
  assert.equal(ASSET.rights.vrtTicket, '2011102310008874')
  assert.equal(ASSET.rights.originalSha1, '1ae4551bf89fc5f41d4f2632584999230c2dcbab')
  assert.equal(ASSET.surfaceAccess, 'learner')
  assert.equal(ASSET.reviewStatus, 'source-rights-reviewed-clinical-copy-approved')
  assert.equal(REVIEW.decision, 'approved-for-learner-use')
  assert.equal(REVIEW.scope, ASSET.assetId)
  assert.equal(ECHO_A4C_PREVIEW_STUDY.clips.length, 1)
  assert.equal(ECHO_A4C_PREVIEW_STUDY.clips[0].qaState, 'learner-ready')
})

test('the workspace reuses the existing engine: one player, no second media path, no new backend', () => {
  assert.match(workspaceRaw, /<ClinicalMediaPreview echoOnly variant="learner" \/>/)
  assert.doesNotMatch(workspace, /@remotion|<Player|<video|<audio|<canvas|<img|<svg|OffthreadVideo|staticFile/)
  assert.doesNotMatch(workspace + caption, /fetch\(|supabase|localStorage|sessionStorage|indexedDB|\/api\/|XMLHttpRequest/)
  assert.equal((preview.match(/<Player\s/g) ?? []).length, 1)
  for (const path of ['app/components/clinical-media/EchoPlaybackControls.tsx', 'app/components/clinical-media/EchoA4cLesson.tsx', 'app/components/clinical-media/EchoA4cMediaComposition.tsx', 'app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx', 'app/components/clinical-media/EchoStudyNavigation.tsx']) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `${path} still exists`)
  }
  assert.doesNotMatch(read('app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx'), /\bDCM\b|\bHCM\b/)
})

test('every fact in the shell and the caption is read from the existing records: no identity, licence or review value is written out here', () => {
  assert.match(workspace, /from '\.\.\/\.\.\/lib\/clinicalMedia\/licensedEchoAsset'/)
  assert.doesNotMatch(workspace, /echoClinicalReviewAttestation/)
  assert.match(caption, /from '\.\.\/\.\.\/lib\/clinicalMedia\/licensedEchoAsset'/)
  for (const literal of [ASSET.rights.derivativeSha256, ASSET.rights.originalSha1, ASSET.rights.vrtTicket, ASSET.rights.licenseId, ASSET.rights.creator, ASSET.rights.sourcePageUrl, REVIEW.date, REVIEW.scope, 'CC BY-SA', 'CardioNetworks']) {
    assert.equal((workspace + caption).includes(literal), false, `hard-coded record value: ${literal}`)
  }
  // No measurement, diagnosis or treatment text is introduced by the shell.
  assert.doesNotMatch(workspace + caption, /\bEF\b|ejection|mmHg|gradient|valve area|stenosis|regurgitation|effusion|cardiomyopathy|treat|prescri|diagnos(is|e)\b/i)
  assert.doesNotMatch(workspace + caption, /\bXP\b|streak|leaderboard/i)
  assert.doesNotMatch(workspaceRaw, /[\u{1F300}-\u{1FAFF}☀-➿]/u)
})

// ── the studio variant is what it was; the learner variant only rearranges ────

test('the default variant is the existing studio preview: every studio-only element is guarded by the learner flag, none removed', () => {
  assert.match(preview, /variant = 'studio'/)
  assert.match(preview, /variant\?: 'studio' \| 'learner'/)
  assert.match(preview, /\{learner\?null:<div className=\{styles\.previewHeader\}>/)
  assert.match(preview, /\{learner\?null:<details className=\{styles\.previewStatus\} data-testid="clinical-media-status">/)
  assert.match(preview, /\{learner\?null:<div className=\{styles\.previewFooter\}>/)
  assert.match(preview, /&&!\(learner&&ECHO_A4C_PREVIEW_STUDY\.clips\.length<2\)\?<EchoStudyNavigation/)
  // The DCM local review, the loop toggle and the frame controls are the same code paths.
  assert.match(preview, /DCM candidate · local review only/)
  assert.match(preview, /process\.env\.NODE_ENV==='development'/)
  assert.match(preview, /<EchoPlaybackControls key=\{playerKey\} playerRef=\{playerRef\}/)
  // The only behavioural difference is the initial state of the existing "expand cine" toggle.
  assert.match(preview, /useState\(learner\)/)
  assert.equal((preview.match(/useState\(learner\)/g) ?? []).length, 1)
  assert.match(preview, /<EchoA4cLesson onAssessment=\{onAssessment\} reducedMotion=\{reducedMotion\}/)
  assert.match(preview, /<EchoStudySummaryPanel summary=\{echoSummary\} recommendation=\{null\}\/>/)
  // Grouping wrappers exist only in the learner layout.
  assert.match(preview, /function Region\(\{ learner, className, children \}[^]*?return learner \? <div className=\{className\}>\{children\}<\/div> : <>\{children\}<\/>/)
})

test('the shell gives the cine its credit next to it (CC BY-SA), because the expanded cine hides the composition footer', () => {
  assert.match(caption, /\{rights\.creator\} · \{rights\.licenseId\}/)
  assert.match(caption, /href=\{rights\.sourcePageUrl\}/)
  assert.match(preview, /\{learner&&\(!dcmReview\|\|dcmStatus==='ready'\)\?<EchoCineCaption\/>:null\}/)
  assert.match(moduleCss, /\.cineFocus \.brandRow, \.cineFocus \.copy, \.cineFocus \.footerRow, \.cineFocus \.realEchoMediaMeta \{ display: none; \}/)
})

// ── the shell, rendered ───────────────────────────────────────────────────────

const expand = node => {
  if (!node || typeof node !== 'object') return node
  if (Array.isArray(node)) return node.map(expand)
  if (typeof node.type === 'function') return expand(node.type(node.props))
  return { ...node, props: { ...node.props, children: expand(node.props?.children) } }
}
const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)]
const text = node => typeof node === 'string' ? node : typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children ?? '') : ''

function renderShell() {
  const code = ts.transpileModule(workspaceRaw, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  const stubs = {
    './echo-workspace.css': {}, 'next/link': { default: 'Link' }, '../../components/auth/AuthGate': { default: 'AuthGate' },
    '../../components/clinical-media/ClinicalMediaPreview': { default: 'ClinicalMediaPreview' },
    '../../components/release/AppearanceSettings': { useAppearance: () => 'light' },
    // The real records, imported above: the shell must render exactly what they contain.
    '../../lib/clinicalMedia/licensedEchoAsset': { A4C_NORMAL_CLINICAL_STUDIO_ASSET: ASSET },
    '../../lib/clinicalMedia/echoClinicalReviewAttestation': { ECHO_A4C_CLINICAL_REVIEW_ATTESTATION: REVIEW },
    '../../lib/nativeSafeArea': { NATIVE_SAFE_AREA_TOP: '0px', NATIVE_SAFE_AREA_BOTTOM: '0px' },
  }
  vm.runInNewContext(code, { exports, require: name => stubs[name] ?? require(name) })
  const gate = exports.default()
  assert.equal(gate.type, 'AuthGate')
  assert.equal(gate.props.allowGuest, false)
  return expand(gate.props.children())
}

test('the shell renders one h1, a way back to Learn, the existing engine, and concise learner-facing attribution', () => {
  const tree = renderShell()
  const all = nodes(tree)
  const main = all.find(n => n.type === 'main')
  assert.equal(main.props['aria-labelledby'], 'echo-title')
  assert.equal(all.filter(n => n.type === 'h1').length, 1)
  assert.equal(text(all.find(n => n.type === 'h1')), 'Observe an echo cine')
  assert.equal(all.find(n => n.type === 'Link').props.href, '/?view=learn')
  const engine = all.filter(n => n.type === 'ClinicalMediaPreview')
  assert.equal(engine.length, 1)
  assert.equal(engine[0].props.echoOnly, true)
  assert.equal(engine[0].props.variant, 'learner')
  const copy = text(tree).replace(/\s+/g, ' ')
  for (const expected of [`Real cine · ${ASSET.cine.view}`, `ECHO · ${ASSET.cine.view}`, `source-labelled ${ASSET.cine.sourceLabel}`, 'view-recognition practice', ASSET.rights.creator, ASSET.rights.licenseId, ASSET.disclaimer]) assert.ok(copy.includes(expected), `missing: ${expected}`)
  assert.equal(all.filter(n => n.type === 'details').length, 0)
  for (const internal of [ASSET.rights.derivativeSha256, ASSET.rights.originalSha1, ASSET.rights.vrtTicket, REVIEW.date, REVIEW.scope, REVIEW.notes, ASSET.privacy.reviewMethod, ASSET.privacy.status, 'Approved for learner use']) assert.ok(!copy.includes(internal), `learner UI leaks ${internal}`)
  const links = all.filter(n => n.type === 'a')
  assert.ok(links.some(n => n.props.href === ASSET.rights.sourcePageUrl))
  assert.ok(links.some(n => n.props.href === ASSET.rights.licenseUrl))
  assert.equal(all.some(n => n.type === 'button' || n.type === 'input' || n.type === 'video'), false)
})

// ── styling ───────────────────────────────────────────────────────────────────

test('the learner layout is scoped to its own classes and adds no glow, glass, shadow or gradient to the reasoning zone', () => {
  assert.ok(marker > 0 && moduleCss.trimEnd().endsWith('}'))
  const selectors = [...learnerCss.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  assert.ok(selectors.length >= 60)
  for (const selector of selectors) assert.match(selector, /^\.learner(Layout|Media|Reasoning|Caption)\b/, `unscoped selector: ${selector}`)
  const reasoning = learnerCss.slice(learnerCss.indexOf('.learnerReasoning {'))
  assert.doesNotMatch(reasoning, /gradient|box-shadow: [^n]|backdrop-filter: blur|text-shadow|filter: blur|animation|@keyframes|transition/)
  assert.doesNotMatch(reasoning.replace(/var\(--[a-z-]+,[^)]*\)/g, ''), /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  // The media unit keeps the module's own dark viewer surface; the control shelf loses its glass.
  assert.match(learnerCss, /\.learnerMedia \.cineControlShelf \{[^}]*backdrop-filter: none[^}]*background: var\(--replay-raised, #1f2937\)/)
  assert.match(learnerCss, /\.learnerMedia \.player \{ border: 0; border-radius: 0; box-shadow: none; \}/)
})

test('media first: the cine leads on compact screens and is dominant and sticky beside a right rail from 1000px; targets are practical and text is rem-based', () => {
  assert.match(learnerCss, /\.learnerLayout \{[^}]*grid-template-columns: minmax\(0, 1fr\);/)
  assert.match(learnerCss, /@media \(min-width: 1000px\) \{\s*\.learnerLayout \{ grid-template-columns: minmax\(0, 1fr\) minmax\(320px, 400px\); align-items: start; \}\s*\.learnerMedia \{ position: sticky; top: var\(--cv-space-4\); \}/)
  assert.match(learnerCss, /\.learnerReasoning \.echoOptions button \{[^}]*min-height: 48px/)
  assert.match(learnerCss, /\.learnerReasoning \.echoPrimaryAction,\s*\.learnerReasoning \.echoSecondaryAction \{ min-height: 48px/)
  assert.match(learnerCss, /\.learnerCaption a \{[^}]*min-height: 44px/)
  assert.doesNotMatch(learnerCss.replace(/@media \(min-width: \d+px\)/g, ''), /font-size: \d+px/)
  // The chosen option is stated by border, weight and a check mark whose text is kept out of the accessible name.
  assert.match(learnerCss, /\.echoOptionSelected,\s*\.learnerReasoning \.echoOptions \.echoOptionSelected:hover \{ border: 2px solid var\(--cv-teal\)[^}]*font-weight: 800/)
  assert.match(learnerCss, /content: "\\2713\\00a0" \/ ""/)
})

test('the workspace frame is scoped, token-only and in its own stacking context so the root watermark stays behind the cine', () => {
  assert.doesNotMatch(workspaceCss, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  assert.doesNotMatch(workspaceCss, /gradient|box-shadow|text-shadow|backdrop-filter|filter:|blur\(|animation|@keyframes|transition|transform|position:\s*(absolute|fixed|sticky)|z-index/i)
  const selectors = [...workspaceCss.matchAll(/([^{}]+)\{/g)].map(match => match[1].trim()).filter(head => !head.startsWith('@')).flatMap(head => head.split(/,(?![^()]*\))/).map(part => part.trim()))
  for (const selector of selectors) assert.match(selector, /^\[data-echo-workspace\]/, `unscoped selector: ${selector}`)
  assert.match(workspaceCss, /\[data-echo-workspace\]\[data-commercial-shell\] \{[^}]*isolation: isolate/)
  assert.match(workspaceRaw, /<main\s+data-commercial-shell\s+data-appearance=\{appearance\}\s+data-echo-workspace/)
  assert.match(workspaceCss, /\.echo-back \{[^}]*min-height: 44px/)
  assert.doesNotMatch(workspaceCss, /echo-evidence/)
  assert.match(workspaceCss, /\.echo-attribution a \{[^}]*min-height: 44px/)
})

test('the summary panel keeps its exact studio look: every colour and size is a variable whose fallback is the previous value', () => {
  const without = summaryCss.replace(/var\(--[a-z-]+,(?:[^()]|\([^()]*\))*\)/g, '')
  assert.doesNotMatch(without, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/)
  for (const fallback of ['rgba(148,163,184,.22)', 'rgba(15,23,42,.72)', '#e5e7eb', '#f8fafc', '#67e8f9', '#94a3b8', 'rgba(30,41,59,.62)', 'rgba(61,214,161,.07)']) assert.ok(summaryCss.includes(fallback), `fallback ${fallback} preserved`)
})

// ── wiring ────────────────────────────────────────────────────────────────────

test('Learn and Progress open the Echo workspace; the studio preview stays for QA and governance and is no longer any primary entry', () => {
  assert.match(read('app/components/release/LearnTracks.tsx'), /id: 'echo',[\s\S]*?href: '\/learn\/echo'/)
  assert.match(read('app/components/release/ProgressTrajectory.tsx'), /echo: \{ accent: 'var\(--cv-violet\)', href: '\/learn\/echo' \}/)
  for (const file of ['app/components/release/LearnTracks.tsx', 'app/components/release/ProgressTrajectory.tsx', 'app/components/release/AtlasReleaseCatalog.tsx', 'app/components/ReleaseApp.tsx', 'app/components/release/MeHub.tsx', 'app/components/release/OnboardingScreens.tsx']) {
    assert.equal(stripComments(read(file)).includes('/labs/echo-preview'), false, `${file} still links the studio preview`)
  }
  assert.ok(existsSync(new URL('../app/labs/echo-preview/page.tsx', import.meta.url)))
  assert.match(read('app/labs/echo-preview/page.tsx'), /<ClinicalMediaPreview echoOnly \/>/)
  assert.ok(existsSync(new URL('../app/labs/echo-account-review/page.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/learn/echo/[studyId]/page.tsx', import.meta.url)))
  assert.match(read('app/learn/echo/page.tsx'), /<EchoLearnerWorkspace \/>/)
})

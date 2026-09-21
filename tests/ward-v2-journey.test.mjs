import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { MOCK_PATIENTS } from '../app/lib/ward/wardData.ts'
import { CASE_TEMPLATES, getTemplate } from '../app/lib/ward/templates.ts'
import * as presentation from '../app/lib/ward/journeyPresentation.ts'

const require = createRequire(import.meta.url)
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

function load(path, mocks = {}) {
  const code = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: id => (id in mocks ? mocks[id] : require(id)) })
  return exports
}
const nodes = n => (!n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)])
const text = n => (typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : n && n.props ? text(n.props.children) : '')

// ---- Ward data and engine are preserved -----------------------------------------------------------------------------

test('the seven-case Ward set is intact and w5 keeps its own acs_ruleout template', () => {
  assert.deepEqual(MOCK_PATIENTS.map(p => p.id), ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'])
  const byId = Object.fromEntries(MOCK_PATIENTS.map(p => [p.id, p.templateId]))
  assert.equal(byId.w5, 'acs_ruleout')
  assert.deepEqual(MOCK_PATIENTS.filter(p => p.templateId === 'stemi_anterior').map(p => p.id), ['w1'])
  assert.equal(new Set(MOCK_PATIENTS.map(p => p.templateId)).size, 7)
  for (const patient of MOCK_PATIENTS) assert.ok(getTemplate(patient.templateId), `${patient.id} has a template`)
})

test('only the seven catalogued templates are reachable; the hidden extra templates are not', () => {
  const extra = [...read('app/lib/ward/wardTemplatesExtra.ts').matchAll(/^\s+id:\s*'([a-z_]+)'/gm)].map(m => m[1])
  assert.ok(extra.length >= 8)
  const reachable = new Set(MOCK_PATIENTS.map(p => p.templateId))
  for (const id of extra) assert.ok(!reachable.has(id), `${id} must stay unreachable`)
  assert.ok(!/wardTemplatesExtra/.test(read('app/components/ward/PatientJourney.tsx') + read('app/components/ward/WardHome.tsx')))
})

test('STEMI timeline: the post-PCI patient is never asked an emergency-phase question', () => {
  const stemi = MOCK_PATIENTS.find(p => p.id === 'w1')
  assert.match(stemi.diagnosis, /Post PCI Day 2/)
  const prompts = getTemplate('stemi_anterior').decisionPoints.map(d => d.prompt)
  assert.match(prompts[0], /^Post-PCI day 2\./)
  for (const prompt of prompts) assert.doesNotMatch(prompt, /^ED\b|ED:|next best immediate action|arrival/i)
  // No template anywhere carries the legacy emergency-phase wording.
  for (const template of CASE_TEMPLATES) for (const dp of template.decisionPoints) assert.doesNotMatch(dp.prompt, /next best immediate action/i)
  // The journey renders prompts only through the validated stage list, never straight from the template.
  const journey = read('app/components/ward/PatientJourney.tsx')
  assert.match(journey, /learnerDecisionStages\(getTemplate\(patient\.templateId\)\)/)
  assert.doesNotMatch(journey, /\.decisionPoints/)
})

test('w5 record and prompt agree on who the patient is', () => {
  const w5 = MOCK_PATIENTS.find(p => p.id === 'w5')
  const first = getTemplate('acs_ruleout').decisionPoints[0].prompt
  assert.match(first, new RegExp(`${w5.age}${w5.sex}`))
})

// ---- Decision-point rules --------------------------------------------------------------------------------------------

test('every catalogued template surfaces all three of its existing decision points, unchanged', () => {
  for (const template of CASE_TEMPLATES) {
    const stages = presentation.learnerDecisionStages(template)
    assert.equal(stages.length, template.decisionPoints.length, template.id)
    assert.equal(stages.length, 3, template.id)
    assert.deepEqual(stages, template.decisionPoints, `${template.id} stages are the source data, not a copy with changes`)
  }
})

test('incomplete decision points fail closed and stop the sequence', () => {
  const ok = { id: 'd1', prompt: 'p', options: [{ id: 'a', label: 'A', effect: 'e' }, { id: 'b', label: 'B', effect: 'e' }] }
  const stage = patch => ({ ...ok, ...patch })
  const one = presentation.learnerDecisionStages({ decisionPoints: [ok] })
  assert.equal(one.length, 1)
  assert.equal(presentation.learnerDecisionStages(undefined).length, 0)
  assert.equal(presentation.learnerDecisionStages({ decisionPoints: [] }).length, 0)
  for (const bad of [
    stage({ prompt: '  ' }),
    stage({ options: [ok.options[0]] }),
    stage({ options: [ok.options[0], { id: 'b', label: 'B', effect: '' }] }),
    stage({ options: [ok.options[0], { id: 'a', label: 'dup', effect: 'e' }] }),
    stage({ options: [ok.options[0], { id: 'b', label: '', effect: 'e' }] }),
  ]) {
    assert.equal(presentation.isLearnerReadyStage(bad), false)
    // A broken middle stage hides itself and everything after it: later prompts assume the earlier ones.
    const stages = presentation.learnerDecisionStages({ decisionPoints: [ok, bad, stage({ id: 'd3' })] })
    assert.deepEqual(stages.map(s => s.id), ['d1'])
  }
})

test('the timeline is ordered earliest first without mutating the record', () => {
  const events = [
    { id: 'c', at: 'not a date', title: 'C', type: 'result' },
    { id: 'b', at: '2026-08-11T08:00:00Z', title: 'B', type: 'decision' },
    { id: 'a', at: '2026-08-11T06:10:00Z', title: 'A', type: 'arrival' },
  ]
  const before = events.map(e => e.id).join()
  assert.deepEqual(presentation.orderedTimeline(events).map(e => e.id), ['a', 'b', 'c'])
  assert.equal(events.map(e => e.id).join(), before)
  assert.deepEqual(presentation.orderedTimeline(undefined), [])
  const stemi = MOCK_PATIENTS.find(p => p.id === 'w1')
  assert.deepEqual(presentation.orderedTimeline(stemi.timeline).map(e => e.id), stemi.timeline.map(e => e.id))
})

test('status and priority wording covers every status the engine defines', () => {
  const statuses = [...read('app/lib/ward/types.ts').match(/export type CaseStatus = ([^\n]+)/)[1].matchAll(/"([a-z_]+)"/g)].map(m => m[1])
  for (const status of statuses) assert.ok(presentation.caseStatusLabel(status) && !presentation.caseStatusLabel(status).includes('_'), status)
  assert.deepEqual(presentation.PRIORITY_LABEL, { critical: 'Critical', urgent: 'Urgent', stable: 'Stable' })
})

// ---- The rendered journey shows one decision step at a time ---------------------------------------------------------

function renderJourney(patient, state = { slots: [] }, props = {}) {
  let cursor = 0
  const react = {
    useState: init => {
      const i = cursor++
      if (!(i in state.slots)) state.slots[i] = typeof init === 'function' ? init() : init
      return [state.slots[i], value => { state.slots[i] = typeof value === 'function' ? value(state.slots[i]) : value }]
    },
    useRef: () => ({ current: null }),
    useEffect: () => {},
  }
  const Journey = load('app/components/ward/PatientJourney.tsx', {
    react,
    './RelatedEvidencePanel': { default: 'RelatedEvidencePanel' },
    './ClinicalPanelV2': { default: 'ClinicalPanelV2' },
    './stemiClinicalSeed': { STEMI_CLINICAL_BUNDLE: {} },
    '../../lib/ward/templates': { getTemplate },
    '../../lib/ward/journeyPresentation': presentation,
    '../../lib/nativeSafeArea': { NATIVE_SAFE_AREA_TOP: '0px', NATIVE_SAFE_AREA_BOTTOM: '0px' },
  }).default
  return Journey({ patient, onClose: () => {}, ...props })
}

test('the journey opens on step 1 only, with no later prompt, and reveals reasoning on choice', () => {
  const patient = MOCK_PATIENTS.find(p => p.id === 'w1')
  const prompts = getTemplate('stemi_anterior').decisionPoints.map(d => d.prompt)
  const state = { slots: [] }
  let tree = renderJourney(patient, state)
  let all = text(tree)
  assert.match(all, /PATIENT JOURNEY/)
  assert.match(all, /STEP 1 OF 3/)
  const legends = nodes(tree).filter(n => n.type === 'legend')
  assert.equal(legends.length, 1)
  assert.equal(text(legends[0]), prompts[0])
  assert.ok(!all.includes(prompts[1]) && !all.includes(prompts[2]), 'later steps are not shown yet')
  assert.match(all, /Choose an option to see the response/)
  assert.equal(nodes(tree).filter(n => n.type === 'input' && n.props.type === 'radio').length, 3)
  const next = () => nodes(tree).find(n => n.type === 'button' && text(n) === 'Next step')
  assert.equal(next().props.disabled, true)

  const [, second] = getTemplate('stemi_anterior').decisionPoints[0].options
  nodes(tree).find(n => n.type === 'input' && n.props.value === second.id).props.onChange()
  tree = renderJourney(patient, state)
  all = text(tree)
  assert.match(all, /RESPONSE AND REASONING/)
  assert.ok(all.includes(second.effect), 'the existing option effect text is shown verbatim')
  assert.equal(next().props.disabled, false)

  next().props.onClick()
  tree = renderJourney(patient, state)
  all = text(tree)
  assert.match(all, /STEP 2 OF 3/)
  assert.ok(all.includes(prompts[1]) && !all.includes(prompts[0]) && !all.includes(prompts[2]))
})

test('the journey keeps Close, the consult request and its local-only confirmation', () => {
  const patient = MOCK_PATIENTS.find(p => p.id === 'w5')
  let closed = 0; const consults = []
  let tree = renderJourney(patient, { slots: [] }, { onClose: () => closed++, onRequestConsult: id => consults.push(id) })
  nodes(tree).find(n => n.type === 'button' && text(n) === 'Close').props.onClick()
  nodes(tree).find(n => n.type === 'button' && text(n) === 'Request Consult').props.onClick()
  assert.equal(closed, 1)
  assert.deepEqual(consults, ['w5'])
  tree = renderJourney(patient, { slots: [] }, { consultRequested: true })
  assert.match(text(tree), /Consult Requested/)
  assert.match(text(tree), /No external message was sent/)
  assert.equal(nodes(tree).find(n => n.type === 'button' && text(n) === 'Consult Requested').props.disabled, true)
})

test('a case with no complete decision points shows no invented decision', () => {
  const patient = { ...MOCK_PATIENTS.find(p => p.id === 'w1'), templateId: 'no_such_template' }
  const tree = renderJourney(patient)
  assert.match(text(tree), /No decision practice is available for this case yet/)
  assert.equal(nodes(tree).filter(n => n.type === 'input').length, 0)
})

// ---- Source contracts ------------------------------------------------------------------------------------------------

test('Ward v2 surfaces use semantic tokens, no emoji and keep the pinned release contracts', () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
  for (const path of ['app/components/ward/WardHome.tsx', 'app/components/ward/PatientJourney.tsx', 'app/components/ward/RelatedEvidencePanel.tsx']) {
    assert.doesNotMatch(read(path), emoji, `${path} has no emoji`)
  }
  const journey = read('app/components/ward/PatientJourney.tsx')
  assert.doesNotMatch(journey, /#[0-9a-fA-F]{3,8}\b/, 'no hard-coded colours')
  assert.match(journey, /data-patient-journey-top/)
  assert.match(journey, /NATIVE_SAFE_AREA_TOP/)
  assert.match(journey, /NATIVE_SAFE_AREA_BOTTOM/)
  assert.match(journey, /PATIENT JOURNEY/)
  assert.match(journey, /type="radio"/)
  assert.doesNotMatch(journey, /\bXP\b/)
  const home = read('app/components/ward/WardHome.tsx')
  assert.doesNotMatch(home, /assignedToMe/, 'the list is the whole catalogued set, not an assignment filter')
  assert.match(home, /patient\.status !== 'discharged'/)
  assert.match(home, /isPro \|\| patient\.id === 'w1'/)
  assert.match(read('app/components/ward/index.tsx'), /import '\.\/ward-v2\.css'/)
})

test('the stylesheet is scoped, tokenised and motion-free', () => {
  const css = read('app/components/ward/ward-v2.css')
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const selector of rules.match(/[^{}]+(?=\{)/g).map(s => s.trim()).filter(s => !s.startsWith('@'))) {
    assert.ok(selector.replace(/\([^)]*\)/g, '()').split(',').every(part => part.trim().startsWith('[data-ward-v2]')), `unscoped selector: ${selector}`)
  }
  assert.doesNotMatch(rules, /animation|transition|@keyframes|linear-gradient|radial-gradient|backdrop-filter|box-shadow|blur\(/)
  assert.doesNotMatch(rules.replace(/var\([^)]*\)/g, ''), /#[0-9a-fA-F]{3,8}\b/, 'colours come from tokens (fallbacks live inside var())')
  assert.match(rules, /min-height: 48px/)
  assert.match(rules, /:focus-visible/)
  assert.match(rules, /@media \(min-width: 900px\)/)
})

test('the legacy child panels read the shell palette but keep their original fallbacks', () => {
  for (const path of ['app/components/ward/ClinicalPanelV2.tsx', 'app/components/ward/RelatedEvidencePanel.tsx']) {
    const source = read(path)
    const palette = source.slice(source.indexOf('const T = {'), source.indexOf('};', source.indexOf('const T = {')))
    assert.match(palette, /var\(--ward-text, #F8FAFC\)/)
    assert.match(palette, /var\(--ward-surface, #111827\)/)
  }
})

test('protected surfaces were not touched by the Ward v2 files', () => {
  for (const path of ['app/components/ward/WardHome.tsx', 'app/components/ward/PatientJourney.tsx', 'app/lib/ward/journeyPresentation.ts']) {
    assert.doesNotMatch(read(path), /supabase|storekit|entitlement|clinicalMedia|connected diagnostics|neuraops/i, path)
  }
})

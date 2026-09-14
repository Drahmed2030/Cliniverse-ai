import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { learningJourney } from '../app/lib/ward/learningJourney.ts'
import { reviewMediaBindings } from '../app/lib/ward/reviewMediaBinding.ts'

const require = createRequire(import.meta.url)
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('journey reuses the two existing viewers and does not invent a paired case', () => {
  assert.deepEqual(learningJourney.map(item => item.id), ['ecg', 'echo'])
  assert.equal(learningJourney[0].href, reviewMediaBindings['SIM-ECG-001'].href)
  assert.equal(learningJourney[1].href, reviewMediaBindings['SIM-ECHO-001'].href)
  for (const item of learningJourney) {
    assert.equal(item.steps.length, 3)
    assert.ok(item.objective && item.prerequisite)
    assert.equal('caseId' in item, false)
    assert.equal('score' in item, false)
  }
})

test('guidance keeps the actual file and review prerequisites visible', () => {
  assert.match(learningJourney[0].prerequisite, /reviewed Record 10 PDF/)
  assert.match(learningJourney[1].prerequisite, /Review-account access is required/)
  for (const item of learningJourney) assert.match(item.steps[2], /confirmation/)
})

function render() {
  const source = read('app/components/release/PracticeShift.tsx')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => {
    if (name === 'next/link') return { default: 'a' }
    if (name === 'react') return { useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] }
    if (name.endsWith('/learningJourney')) return { learningJourney }
    if (name.endsWith('/reviewMediaBinding')) return { reviewMediaBindings }
    if (name.startsWith('../../lib/ward/')) return require(`../app/lib/ward/${name.split('/').at(-1)}.ts`)
    return require(name)
  } })
  const calls = []
  const tree = exports.default({ onWard: () => calls.push('ward'), onProgress: () => calls.push('progress'), onPathway: () => calls.push('pathway') })
  return { tree, calls }
}
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
function text(n) { return typeof n === 'string' ? n : Array.isArray(n) ? n.map(text).join('') : text(n?.props?.children ?? '') }

test('rendered practice links expose their matching prerequisite and reuse existing routes', () => {
  const all = nodes(render().tree)
  for (const activity of learningJourney) {
    const link = all.find(n => n.type === 'a' && n.props.href === activity.href && n.props['aria-describedby'])
    assert.ok(link)
    const description = all.find(n => n.props?.id === link.props['aria-describedby'])
    assert.ok(text(description).includes(activity.prerequisite))
    assert.equal(link.props.style.minHeight, 44)
  }
  assert.match(text(render().tree), /not paired examinations from one patient/)
})

test('existing Ward, Progress and premium Pathway callbacks remain intact', () => {
  const { tree, calls } = render()
  for (const label of ['Practise a Ward handover', 'Review saved progress', 'Practise STEMI coordination · PRO']) {
    const action = nodes(tree).find(n => n.type === 'button' && text(n) === label)
    assert.ok(action)
    action.props.onClick()
  }
  assert.deepEqual(calls, ['ward', 'progress', 'pathway'])
})

test('journey remains inside the existing reviewer-only shell gate', () => {
  assert.match(read('app/components/ReleaseApp.tsx'), /tab === 'today' && showEcgReview && <PracticeShift/)
  const source = read('app/lib/ward/learningJourney.ts')
  assert.doesNotMatch(source, /fetch\(|localStorage|supabase|setEntitlement|awardXp/)
})

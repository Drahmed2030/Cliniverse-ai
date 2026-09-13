import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import * as lessonSources from '../app/lib/codelab/lessonSources.ts'
import * as bls from '../app/lib/codelab/blsLessons.ts'
import * as acls from '../app/lib/codelab/aclsLessons.ts'

const require = createRequire(import.meta.url)
const code = ts.transpileModule(fs.readFileSync(new URL('../app/components/ward/BLSLessonPlayer.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText
// Real component and click handlers; deterministic hooks, not browser rendering evidence.
function harness(lesson, completionDisabled = false) {
  const states = []
  const completions = []
  let cursor = 0
  const hooks = { ...require('react'), useEffect() {}, useRef() { return { current: null } }, useState(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
  } }
  const exports = {}
  vm.runInNewContext(code, { exports, require(name) {
    if (name.endsWith('/lessonSources')) return lessonSources
    if (name === 'react') return hooks
    if (name.endsWith('/blsLessons')) return bls
    if (name.endsWith('/aclsLessons')) return acls
    return require(name)
  } })
  return { completions, render() { cursor = 0; return exports.default({ lesson, isPro: true, completionDisabled, onComplete: errors => completions.push(errors), onBack() {} }) } }
}
function nodes(node) {
  if (!node || typeof node !== 'object') return []
  return Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)]
}
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  return Array.isArray(node) ? node.map(text).join('') : text(node?.props?.children ?? '')
}
function button(app, label) {
  const result = nodes(app.render()).find(n => n.type === 'button' && text(n).includes(label))
  assert.ok(result, label)
  return result
}
function questions(app) {
  button(app, 'Start Practice').props.onClick()
  button(app, 'Continue to Questions').props.onClick()
}
function answer(app, lesson, correct) {
  for (const [qi, question] of lesson.mcqs.entries()) {
    const oi = correct ? question.answerIndex : (question.answerIndex + 1) % question.options.length
    const container = nodes(app.render()).find(n => n.type === 'div' && text(n.props.children?.[0]) === question.q)
    assert.ok(container, `question ${qi + 1}`)
    const choices = nodes(container).filter(n => n.type === 'button' && n.props.onClick && nodes(n).some(child => child.type === 'span' && text(child) === question.options[oi]))
    assert.ok(choices.length, `question ${qi + 1}`)
    choices[0].props.onClick()
  }
  button(app, 'Submit Answers').props.onClick()
}
test('every catalog lesson identifies the correct track and catalog size', () => {
  for (const catalog of [bls.BLS_LESSONS, acls.ACLS_LESSONS]) {
    for (const lesson of catalog) {
      assert.ok(text(harness(lesson).render()).includes(`${lesson.track.toUpperCase()} · ${lesson.order}/${catalog.length}`))
    }
  }
})
test('review appears only after submission, includes existing lesson text, and resets on retry', () => {
  const lesson = bls.BLS_LESSONS[0]
  const app = harness(lesson)
  assert.equal(nodes(app.render()).some(n => n.type === 'details'), false)
  questions(app)
  button(app, 'Submit Answers').props.onClick()
  assert.equal(nodes(app.render()).some(n => n.type === 'details'), false)
  answer(app, lesson, false)
  const review = nodes(app.render()).find(n => n.type === 'details')
  assert.ok(review)
  assert.deepEqual(nodes(review).filter(n => n.type === 'li').map(text), lesson.keyPoints)
  assert.deepEqual(app.completions, [])
  button(app, 'Retry Questions').props.onClick()
  assert.equal(nodes(app.render()).some(n => n.type === 'details'), false)
})
test('lesson review preserves passing completion and service-disabled completion', () => {
  for (const disabled of [false, true]) {
    const lesson = acls.ACLS_LESSONS[0]
    const app = harness(lesson, disabled)
    questions(app)
    answer(app, lesson, true)
    assert.ok(nodes(app.render()).some(n => n.type === 'details'))
    const complete = button(app, 'Mark Lesson Complete')
    assert.equal(complete.props.disabled, disabled)
    if (!disabled) { complete.props.onClick(); assert.deepEqual(app.completions, [0]) }
    else assert.deepEqual(app.completions, [])
  }
})

test('answer controls expose selection, lock after submission and name the correct result', () => {
  const lesson = bls.BLS_LESSONS[0], app = harness(lesson)
  questions(app)
  assert.equal(button(app, 'Submit Answers').props.disabled, true)
  const options = nodes(app.render()).filter(n => n.type === 'button' && 'aria-pressed' in n.props)
  options[0].props.onClick()
  assert.equal(nodes(app.render()).filter(n => n.type === 'button' && n.props['aria-pressed']).length, 1)
  answer(app, lesson, true)
  const submitted = nodes(app.render()).filter(n => n.type === 'button' && 'aria-pressed' in n.props)
  assert.ok(submitted.every(n => n.props.disabled))
  assert.equal(submitted.filter(n => text(n).includes('Correct answer')).length, lesson.mcqs.length)
})

test('practice step buttons swap sequence and checklist controls toggle selected state', () => {
  const sequence = [...bls.BLS_LESSONS, ...acls.ACLS_LESSONS].find(l => l.practice.type === 'sequence')
  const app = harness(sequence)
  button(app, 'Start Practice').props.onClick()
  const steps = () => nodes(app.render()).filter(n => n.type === 'button' && 'aria-pressed' in n.props)
  const before = steps().map(text)
  steps()[0].props.onClick()
  assert.equal(steps()[0].props['aria-pressed'], true)
  steps()[1].props.onClick()
  assert.ok(text(steps()[0]).includes(sequence.practice.items[1]))
  assert.ok(text(steps()[1]).includes(sequence.practice.items[0]))
  assert.notDeepEqual(steps().map(text), before)
  const checklist = [...bls.BLS_LESSONS, ...acls.ACLS_LESSONS].find(l => l.practice.type === 'checklist')
  const check = harness(checklist)
  button(check, 'Start Practice').props.onClick()
  const control = () => nodes(check.render()).find(n => n.type === 'button' && 'aria-pressed' in n.props)
  control().props.onClick(); assert.equal(control().props['aria-pressed'], true)
  control().props.onClick(); assert.equal(control().props['aria-pressed'], false)
})

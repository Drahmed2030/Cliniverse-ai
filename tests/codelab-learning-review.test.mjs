import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
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
    const choices = nodes(container).filter(n => n.type === 'div' && n.props.onClick && nodes(n).some(child => child.type === 'div' && text(child) === question.options[oi]))
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

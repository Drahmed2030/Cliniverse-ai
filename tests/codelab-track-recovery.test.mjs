import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { BLS_LESSONS } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS } from '../app/lib/codelab/aclsLessons.ts'

const require = createRequire(import.meta.url)
const source = fs.readFileSync(new URL('../app/components/ward/CodeLabHub.tsx', import.meta.url), 'utf8')
// Execute the real component and handlers with a deterministic hook harness.
// This is a component logic test, not browser or native rendering evidence.
function harness(isPro = true, progressMode = 'local') {
  const states = []
  let cursor = 0
  let upgrades = 0
  let writes = 0
  const hooks = { ...require('react'), useEffect() {}, useState(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
  } }
  const exports = {}
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  vm.runInNewContext(code, { exports, localStorage: { setItem() { writes++ } }, require(name) {
    if (name === 'react') return hooks
    if (name.endsWith('/blsLessons')) return { BLS_LESSONS, BLS_DISCLAIMER: 'BLS' }
    if (name.endsWith('/aclsLessons')) return { ACLS_LESSONS, ACLS_DISCLAIMER: 'ACLS' }
    if (name === './BLSLessonPlayer') return { __esModule: true, default: 'LessonPlayer' }
    return require(name)
  } })
  return { states, writes: () => writes, upgrades: () => upgrades, render() { cursor = 0; return exports.default({ isPro, progressMode, onUpgrade: () => upgrades++, onBack() {} }) } }
}
function nodes(node) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(nodes)
  return [node, ...nodes(node.props?.children)]
}
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  return text(node?.props?.children ?? '')
}
function click(tree, label) {
  const button = nodes(tree).find(node => node.type === 'button' && text(node).includes(label))
  assert.ok(button, `button ${label}`)
  button.props.onClick()
}
test('every ACLS lesson opens the existing player with the correct lesson', () => {
  for (const lesson of ACLS_LESSONS) {
    const app = harness()
    click(app.render(), 'ACLS')
    click(app.render(), lesson.title)
    const player = app.render()
    assert.equal(player.type, 'LessonPlayer')
    assert.equal(player.props.lesson.id, lesson.id)
  }
})
test('free access preserves first two lessons per track and blocks later lessons', () => {
  for (const track of [BLS_LESSONS, ACLS_LESSONS]) {
    for (const lesson of track) {
      const app = harness(false)
      if (lesson.track === 'acls') click(app.render(), 'ACLS')
      click(app.render(), lesson.title)
      assert.equal(app.upgrades(), lesson.order > 2 ? 1 : 0)
      assert.equal(app.render().type === 'LessonPlayer', lesson.order <= 2)
    }
  }
})
test('progress counts only the selected track, ignoring duplicate and unknown IDs', () => {
  const app = harness()
  app.render()
  app.states[0] = { completedIds: [...BLS_LESSONS.map(l => l.id), BLS_LESSONS[0].id, 'unknown', ACLS_LESSONS[0].id] }
  assert.ok(text(app.render()).includes('6 / 6 lessons complete'))
  click(app.render(), 'ACLS')
  assert.ok(text(app.render()).includes('1 / 6 lessons complete'))
})
test('completion returns to the selected catalog and updates its count', () => {
  const app = harness()
  click(app.render(), 'ACLS')
  click(app.render(), ACLS_LESSONS[0].title)
  app.render().props.onComplete()
  assert.ok(text(app.render()).includes('ACLS TRACK'))
  assert.ok(text(app.render()).includes('1 / 6 lessons complete'))
})

test('commercial session mode completes without writing shared device history', () => {
  const app = harness(true, 'session')
  click(app.render(), ACLS_LESSONS[0].track.toUpperCase())
  click(app.render(), ACLS_LESSONS[0].title)
  app.render().props.onComplete()
  assert.equal(app.writes(), 0)
  assert.ok(text(app.render()).includes('1 / 6 lessons complete'))
})

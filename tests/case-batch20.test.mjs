import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { batch20, sourceRegistry, batchReview } from '../content/medical/batch20.ts'

test('batch has 20 distinct microcases, complete exercises and resolvable references', () => {
  assert.equal(batch20.length, 20)
  assert.equal(new Set(batch20.map(c => c.id)).size, 20)
  assert.equal(new Set(batch20.map(c => c.scenario)).size, 20)
  for (const c of batch20) {
    assert.ok(c.objective && c.scenario && c.question && c.explanation && c.communication)
    assert.equal(new Set(c.options).size, 3)
    assert.ok(Number.isInteger(c.answer) && c.answer >= 0 && c.answer < c.options.length)
    assert.ok(c.sourceIds.length)
    for (const id of c.sourceIds) assert.equal(new URL(sourceRegistry[id].url).protocol, 'https:')
  }
})

test('legacy adaptations and new drafts are distinguished without inflating approval', () => {
  assert.equal(batch20.filter(c => c.legacyOrigins.length > 0).length, 5)
  assert.equal(batch20.filter(c => c.legacyOrigins.length === 0).length, 15)
  assert.equal(batchReview.userConfirmedTextCases, 20)
  for (const c of batch20) {
    assert.equal(c.status, 'draft')
    assert.equal(c.clinicalReview, 'user-confirmed')
    assert.equal(c.mediaStatus, 'unbound')
    for (const origin of c.legacyOrigins) {
      const [path,id] = origin.split('#')
      assert.ok(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').includes(id))
    }
  }
})

test('server entry rejects production before rendering or serializing the draft catalogue', () => {
  const source = readFileSync(new URL('../app/labs/case-batch-preview/page.tsx', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  function invoke(env) {
    const exports = {}
    let rendered = false
    const context = { exports, process: { env: { NODE_ENV: env } }, require: name => {
      if (name === 'next/navigation') return { notFound: () => { throw new Error('NOT_FOUND') } }
      if (name === 'react/jsx-runtime') return { jsx: () => { rendered = true; return 'preview' } }
      if (name.includes('CaseBatchPreview')) return { default: () => null }
      return { batch20, sourceRegistry }
    } }
    vm.runInNewContext(compiled, context)
    if (env !== 'development') { assert.throws(() => exports.default(), /NOT_FOUND/); assert.equal(rendered, false) }
    else { assert.equal(exports.default(), 'preview'); assert.equal(rendered, true) }
  }
  for (const env of ['production','test',undefined,'development']) invoke(env)
})

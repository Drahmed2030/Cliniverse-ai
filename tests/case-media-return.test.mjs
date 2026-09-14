import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../app/labs/echo-account-review/page.tsx', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText
function page(env) {
  const exports = {}
  vm.runInNewContext(code, { exports, process: { env }, require(name) {
    if (name === 'next/navigation') return { notFound() { throw Error('NOT_FOUND') } }
    if (name === 'next/link') return { default: 'Link' }
    if (name === './EchoAccountReview') return { default: 'ExistingGatedEchoReview' }
    if (name === 'react/jsx-runtime') return { Fragment: 'Fragment', jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
    throw Error(`Unexpected import: ${name}`)
  } })
  return from => exports.default({ searchParams: Promise.resolve({ from }) })
}
const qa = { NODE_ENV: 'production', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'qa/case-batch20-cloud' }
test('known A4C source returns to the case while retaining the existing gated viewer', async () => {
  const tree = await page(qa)('a4c-orientation')
  assert.equal(tree.props.children[0].props.children.props.href, '/labs/case-batch-preview#a4c-orientation/0')
  assert.equal(tree.props.children[1].type, 'ExistingGatedEchoReview')
})
test('unrecognised source and repeated parameters cannot create arbitrary return links', async () => {
  for (const value of [undefined, 'https://example.invalid', '//example.invalid', 'dilated-lv', ['a4c-orientation']]) {
    const tree = await page(qa)(value)
    assert.equal(tree.props.children[0], null)
    assert.equal(tree.props.children[1].type, 'ExistingGatedEchoReview')
  }
})
test('return route is limited to a development or approved case preview deployment', async () => {
  await assert.rejects(page({ NODE_ENV: 'production', VERCEL_ENV: 'production' })('a4c-orientation'), /NOT_FOUND/)
  const other = await page({ ...qa, VERCEL_GIT_COMMIT_REF: 'other' })('a4c-orientation')
  assert.equal(other.props.children[0], null)
  assert.ok((await page({ NODE_ENV: 'development' })('a4c-orientation')).props.children[0])
})

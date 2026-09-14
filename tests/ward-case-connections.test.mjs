import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { batch20 } from '../content/medical/batch20.ts'
import { wardCaseConnections } from '../app/lib/ward/caseConnections.ts'
const require = createRequire(import.meta.url)
function render(path, props, env = {}) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, process: { env }, require: name => {
    if (name.endsWith('/caseConnections')) return { wardCaseConnections }
    if (name.endsWith('/WardCaseConnections')) return { default: 'Connections' }
    if (name.endsWith('/ReleaseApp')) return { default: 'ReleaseApp' }
    return require(name)
  } })
  return exports.default(props)
}
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
test('three supplementary topics resolve to reviewed cases, never inventing a media binding', () => {
  assert.equal(wardCaseConnections.length, 3)
  for (const item of wardCaseConnections) {
    assert.ok(batch20.some(c => c.id === item.caseId && c.clinicalReview === 'user-confirmed'))
    assert.ok(item.question && item.explanation && item.handover)
    assert.equal('assetId' in item, false)
  }
})
test('Ward and Atlas connections retain separate accessible sections and safe new-tab links', () => {
  for (const context of ['ward', 'atlas']) {
    const tree = render('../app/components/ward/WardCaseConnections.tsx', { context })
    assert.equal(tree.props['aria-labelledby'], `${context}-evidence-title`)
    const all = nodes(tree)
    assert.equal(all.filter(n => n.type === 'details').length, 3)
    const links = all.filter(n => n.type === 'a')
    assert.equal(links.length, 3)
    for (const [i, link] of links.entries()) {
      assert.equal(link.props.href, `/labs/case-batch-preview#${wardCaseConnections[i].caseId}/0`)
      assert.equal(link.props.target, '_blank'); assert.equal(link.props.rel, 'noopener noreferrer')
      assert.ok(link.props.style.minHeight >= 44)
    }
  }
})
test('Atlas only includes the case connections when enabled', () => {
  for (const enabled of [false, true]) {
    const all = nodes(render('../app/components/release/AtlasReleaseCatalog.tsx', { caseLibraryPreview: enabled }))
    assert.equal(all.filter(n => n.type === 'Connections').length, enabled ? 1 : 0)
  }
})
test('server enables case library only where its existing route is available', () => {
  const cases = [
    [{ NODE_ENV: 'development' }, true],
    [{ NODE_ENV: 'production', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'qa/case-batch20-cloud' }, true],
    [{ NODE_ENV: 'production', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'other' }, false],
    [{ NODE_ENV: 'production', VERCEL_ENV: 'production' }, false],
  ]
  for (const [env, expected] of cases) assert.equal(render('../app/page.tsx', {}, env).props.caseLibraryPreview, expected)
})

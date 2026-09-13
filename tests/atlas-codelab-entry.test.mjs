import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const source = fs.readFileSync(new URL('../app/components/release/AtlasReleaseCatalog.tsx', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const exports = {}
vm.runInNewContext(code, { exports, require })
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
function text(n) { return typeof n === 'string' ? n : Array.isArray(n) ? n.map(text).join('') : text(n?.props?.children ?? '') }
test('Explore opens the existing Code Lab workspace without requesting a plan', () => {
  let destination, upgrades = 0
  const tree = exports.default({ onNavigate: next => { destination = next }, onOpenPlan: () => upgrades++ })
  const entry = nodes(tree).find(n => n.type === 'button' && text(n) === 'Open Code Lab →')
  assert.ok(entry)
  entry.props.onClick()
  assert.equal(destination.tab, 'care')
  assert.equal(destination.workspace, 'codelab')
  assert.equal(upgrades, 0)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
function component(path, mocks = {}) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: id => mocks[id] ?? require(id) })
  return exports.default
}
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
const Atlas = component('../app/components/release/AtlasReleaseCatalog.tsx', { '../ward/WardCaseConnections': { default: 'WardCaseConnections' } })
test('Explore keeps the existing destination for its one workspace entry; plan actions live in Me, not Explore', () => {
  const destinations = []
  const buttons = nodes(Atlas({ onNavigate: d => destinations.push(d) })).filter(n => n.type === 'button')
  buttons.forEach(n => n.props.onClick())
  assert.deepEqual(destinations.map(d => d.workspace ?? d.tab), ['cardiology'])
})
const patients = ['w1', 'w2'].map(id => ({ id, name: id, assignedToMe: true, status: 'active', priority: 'stable', department: 'cardiology', bed: id, diagnosis: 'Fictional case' }))
const Ward = component('../app/components/ward/WardHome.tsx', {
  react: { useState: () => ['all', () => {}] },
  '../../lib/ward': { DEPARTMENTS: [], MOCK_PATIENTS: patients },
})
for (const isPro of [false, true]) test(`Ward selection preserves case access for PRO=${isPro}`, () => {
  const selected = []; let upgrades = 0
  const tree = nodes(Ward({ isPro, onSelectPatient: id => selected.push(id), onUpgrade: () => upgrades++ }))
  tree.filter(n => n.type === 'button' && n.props['aria-label']).forEach(n => n.props.onClick())
  assert.deepEqual(selected, isPro ? ['w1', 'w2'] : ['w1'])
  assert.equal(upgrades, isPro ? 0 : 1)
  assert.ok(tree.some(n => n.props?.id === 'ward-learning-goal'))
})

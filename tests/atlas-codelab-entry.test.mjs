import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const source = read('app/components/release/AtlasReleaseCatalog.tsx')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const exports = {}
vm.runInNewContext(code, { exports, require: name => name === '../ward/WardCaseConnections' ? { default: 'WardCaseConnections' } : require(name) })
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
function text(n) { return typeof n === 'string' ? n : Array.isArray(n) ? n.map(text).join('') : text(n?.props?.children ?? '') }

test('Explore v2 no longer lists Code Lab, and its only workspace entry opens Cardiology Operations without requesting a plan', () => {
  const destinations = []
  const tree = exports.default({ onNavigate: next => destinations.push(JSON.parse(JSON.stringify(next))) })
  assert.equal(nodes(tree).some(n => /Code Lab/.test(text(n))), false)
  nodes(tree).filter(n => n.type === 'button').forEach(n => n.props.onClick())
  assert.deepEqual(destinations, [{ tab: 'care', workspace: 'cardiology' }])
})

test('Code Lab remains reachable through unified Learn and Progress, but no longer crowds Today', () => {
  const app = read('app/components/ReleaseApp.tsx')
  const learn = read('app/components/release/LearnTracks.tsx')
  assert.match(app, /const openCodeLab = \(\) => \{ setCareWorkspace\('codelab'\); setTab\('learn'\) \}/)
  assert.match(app, /<TodaySurface actorId=\{accountId\} onNavigate=\{goTab\} \/>/)
  assert.doesNotMatch(app, /<TodaySurface[^>]*onOpenCodeLab/)
  assert.match(app, /<ProgressSurface [\s\S]*?onOpenCodeLab=\{openCodeLab\} \/>/)
  assert.match(learn, /title:'Code Lab'[\s\S]*?workspace:'codelab'/)
  // The underlying Ward family workspace remains available and free; unified Learn controls its presentation.
  assert.match(read('app/components/ward/index.tsx'), /label: 'Code Lab',[\s\S]*?premium: false/)
})

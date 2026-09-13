import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { BLS_LESSONS, BLS_DISCLAIMER } from '../app/lib/codelab/blsLessons.ts'
import { ACLS_LESSONS, ACLS_DISCLAIMER } from '../app/lib/codelab/aclsLessons.ts'
import { validateLessonCompletion } from '../app/lib/lessonCompletion.ts'

const require = createRequire(import.meta.url)
const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const tick = () => new Promise(resolve => setTimeout(resolve, 10))
function nodes(n) { return !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...nodes(n.props?.children)] }
function text(n) { return typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(text).join('') : n ? text(n.props?.children) : '' }
function runner(component, props) {
  const values = [], effects = [], pending = []
  let cursor = 0
  const hooks = { ...require('react'), useState(initial) { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], v => { values[i] = typeof v === 'function' ? v(values[i]) : v }] },
    useRef(initial) { const i = cursor++; return values[i] ??= { current: initial } },
    useEffect(fn, deps) { const i = cursor++; if (!effects[i] || deps.some((d, j) => !Object.is(d, effects[i].deps[j]))) pending.push(() => { effects[i]?.cleanup?.(); effects[i] = { deps, cleanup: fn() } }) } }
  return { hooks, render() { cursor = 0; current = hooks; const tree = component(props); pending.splice(0).forEach(fn => fn()); return tree }, dispose() { effects.forEach(e => e?.cleanup?.()) } }
}
let current
function setup() {
  const state = { owner: A, rows: [], storage: new Map(), failLoad: false, failSave: false, saveCalls: [], listener: null, delay: null }
  const repo = { async load(owner, ids) { if (state.failLoad) throw Error('offline'); return state.rows.filter(r => r.user_id === owner && ids.includes(r.case_id)) }, async save(row) {
    state.saveCalls.push(row)
    if (state.delay) await state.delay
    if (state.failSave) throw Error('offline')
    if (!state.rows.some(r => r.id === row.id)) state.rows.push(row)
    return row
  } }
  const code = ts.transpileModule(fs.readFileSync(new URL('../app/components/ward/AccountCodeLab.tsx', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const exports = {}
  const react = new Proxy(require('react'), { get(target, key) { return ['useState', 'useRef', 'useEffect'].includes(key) ? (...args) => current[key](...args) : target[key] } })
  vm.runInNewContext(code, { exports, crypto: webcrypto, TextEncoder, sessionStorage: { getItem:k => state.storage.get(k) ?? null, setItem:(k,v) => state.storage.set(k,v), removeItem:k => state.storage.delete(k) }, require(name) {
    if (name === 'react') return react
    if (name.endsWith('/supabase')) return { supabase: { auth: { getUser: async () => ({ data: { user: state.owner ? { id: state.owner } : null }, error: null }), onAuthStateChange(fn) { state.listener = fn; return { data: { subscription: { unsubscribe() {} } } } } } } }
    if (name.endsWith('/blsLessons')) return { BLS_LESSONS, BLS_DISCLAIMER }
    if (name.endsWith('/aclsLessons')) return { ACLS_LESSONS, ACLS_DISCLAIMER }
    if (name.endsWith('/lessonCompletion')) return { createLessonCompletionRepository: () => repo, validateLessonCompletion }
    if (name === './CodeLabHub') return { __esModule: true, default: 'CodeLabHub' }
    return require(name)
  } })
  const props = { isPro: true, onUpgrade() {}, onBack() {} }
  const outer = runner(exports.default, props)
  async function mount() { outer.render(); await tick(); const node = outer.render(); const inner = runner(node.type, node.props); inner.render(); await tick(); return inner }
  const hub = inner => nodes(inner.render()).find(n => n.type === 'CodeLabHub')
  return { state, outer, mount, hub }
}

test('account UI saves only after acknowledgement and restores actual results on reopening', async () => {
  const h = setup(), first = await h.mount()
  assert.equal(h.hub(first).props.accountProgress.ready, true)
  assert.equal(await h.hub(first).props.accountProgress.complete(BLS_LESSONS[0].id, 0), true)
  assert.ok(text(first.render()).includes('Saved to your account'))
  assert.ok(text(first.render()).includes('knowledge-check answers correct'))
  first.dispose()
  const reopened = await h.mount()
  assert.ok(h.hub(reopened).props.accountProgress.completedIds.includes(BLS_LESSONS[0].id))
  reopened.dispose(); h.outer.dispose()
})
test('failed restoration keeps completion disabled and offers explicit reload', async () => {
  const h = setup(); h.state.failLoad = true; const inner = await h.mount()
  assert.equal(h.hub(inner).props.accountProgress.ready, false)
  assert.equal(await h.hub(inner).props.accountProgress.complete(BLS_LESSONS[0].id, 0), false)
  assert.equal(h.state.saveCalls.length, 0)
  h.state.failLoad = false
  nodes(inner.render()).find(n => n.type === 'button' && text(n) === 'Retry loading progress').props.onClick()
  inner.render(); await tick(); assert.equal(h.hub(inner).props.accountProgress.ready, true)
  inner.dispose(); h.outer.dispose()
})
test('pending save survives workspace close and retries the same event without replaying the quiz', async () => {
  const h = setup(), first = await h.mount(); h.state.failSave = true
  assert.equal(await h.hub(first).props.accountProgress.complete(BLS_LESSONS[0].id, 0), false)
  const id = h.state.saveCalls[0].id; first.dispose()
  const reopened = await h.mount(); assert.equal(h.hub(reopened).props.accountProgress.ready, false)
  h.state.failSave = false
  const before = h.hub(reopened).key
  nodes(reopened.render()).find(n => n.type === 'button' && text(n) === 'Retry saving completion').props.onClick()
  await tick()
  assert.equal(h.state.saveCalls[1].id, id)
  assert.notEqual(h.hub(reopened).key, before, 'successful recovery closes the old player to prevent double completion')
  assert.equal(h.state.storage.size, 0)
  assert.ok(h.hub(reopened).props.accountProgress.completedIds.includes(BLS_LESSONS[0].id))
  reopened.dispose(); h.outer.dispose()
})
test('rapid completion presses coalesce while the save is in flight', async () => {
  const h = setup(), inner = await h.mount(); let release
  h.state.delay = new Promise(resolve => { release = resolve })
  const complete = h.hub(inner).props.accountProgress.complete
  const request = complete(BLS_LESSONS[0].id, 0)
  assert.equal(await complete(BLS_LESSONS[0].id, 0), false)
  assert.equal(h.hub(inner).props.accountProgress.saving, true)
  release(); await request; assert.equal(h.state.saveCalls.length, 1)
  inner.dispose(); h.outer.dispose()
})
test('account switch remounts the workspace and hides prior account progress and pending save', async () => {
  const h = setup(), first = await h.mount(); h.state.failSave = true
  await h.hub(first).props.accountProgress.complete(BLS_LESSONS[0].id, 0)
  const oldKey = h.outer.render().key
  h.state.owner = B; h.state.listener('SIGNED_IN', { user: { id: B } })
  const next = h.outer.render(); assert.notEqual(next.key, oldKey); first.dispose()
  const second = runner(next.type, next.props); second.render(); await tick()
  assert.equal(h.hub(second).props.accountProgress.completedIds.length, 0)
  assert.equal(nodes(second.render()).some(n => text(n) === 'Retry saving completion'), false)
  second.dispose(); h.outer.dispose()
})
test('late save acknowledgement after unmount does not mutate the disposed workspace', async () => {
  const h = setup(), inner = await h.mount(); let release
  h.state.delay = new Promise(resolve => { release = resolve })
  const request = h.hub(inner).props.accountProgress.complete(BLS_LESSONS[0].id, 0)
  inner.dispose(); release()
  assert.equal(await request, false)
  assert.equal(h.state.storage.size, 1, 'retain retry identity until the owner restores and confirms it')
  h.outer.dispose()
})

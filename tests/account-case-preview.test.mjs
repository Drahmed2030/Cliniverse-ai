import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { batch20, sourceRegistry } from '../content/medical/batch20.ts'
import * as completion from '../app/lib/caseCompletion.ts'
const require = createRequire(import.meta.url)
const owner = '00000000-0000-4000-8000-000000000001'
const tick = () => new Promise(r => setTimeout(r, 15))
let current
function runner(fn, props) {
  const values = [], effects = [], pending = []; let cursor = 0
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial; return [values[i], v => { values[i] = typeof v === 'function' ? v(values[i]) : v }] },
    useRef(initial) { const i = cursor++; return values[i] ??= { current: initial } },
    useEffect(fn, deps) { const i = cursor++; if (!effects[i] || deps.some((d, j) => !Object.is(d, effects[i].deps[j]))) pending.push(() => { effects[i]?.cleanup?.(); effects[i] = { deps, cleanup: fn() } }) },
  }
  return { render() { cursor = 0; current = hooks; const tree = fn(props); pending.splice(0).forEach(f => f()); return tree }, dispose() { effects.forEach(e => e?.cleanup?.()) } }
}
function setup() {
  const state = { owner, rows: [], storage: new Map(), calls: [], failLoad: false, failSave: false, delay: null, listener: null }
  const repo = { async load(who) { if (state.failLoad) throw Error('offline'); return state.rows.filter(r => r.user_id === who) }, async save(row) {
    state.calls.push(row); if (state.delay) await state.delay
    if (state.failSave) throw Error('lost acknowledgement')
    if (!state.rows.some(r => r.id === row.id)) state.rows.push(row)
    return row
  } }
  const source = fs.readFileSync(new URL('../app/components/case-preview/AccountCaseBatchPreview.tsx', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, crypto: webcrypto, setTimeout, clearTimeout,
    sessionStorage: { getItem: k => state.storage.get(k) ?? null, setItem: (k, v) => state.storage.set(k, v), removeItem: k => state.storage.delete(k) },
    require(name) {
      if (name === 'react') return new Proxy(require('react'), { get(t, k) { return ['useState','useRef','useEffect'].includes(k) ? (...args) => current[k](...args) : t[k] } })
      if (name.endsWith('/supabase')) return { supabase: { auth: { getUser: async () => ({ data: { user: state.owner ? { id: state.owner } : null }, error: null }), onAuthStateChange(fn) { state.listener = fn; return { data: { subscription: { unsubscribe() {} } } } } } } }
      if (name.endsWith('/caseCompletion')) return { ...completion, createCaseCompletionRepository: () => repo }
      if (name === './CaseBatchPreview') return { default: 'CaseBatchPreview' }
      return require(name)
    },
  })
  const outer = runner(exports.default, { cases: batch20, sources: sourceRegistry })
  async function mount() { outer.render(); await tick(); const node = outer.render(); const inner = runner(node.type, node.props); inner.render(); await tick(); return inner }
  return { state, outer, mount, progress: inner => inner.render().props.accountProgress }
}
test('explicit save becomes completed only after acknowledgement; reopen restores completion', async () => {
  const h = setup(), inner = await h.mount(); let release
  h.state.delay = new Promise(r => { release = r })
  const request = h.progress(inner).complete(batch20[0].id, batch20[0].answer)
  await tick(); assert.equal(h.progress(inner).saving, true); assert.equal(h.progress(inner).completedIds.length, 0)
  assert.equal(h.progress(inner).savingCaseId, batch20[0].id)
  release(); assert.equal(await request, true)
  assert.deepEqual(Array.from(h.progress(inner).completedIds), [batch20[0].id])
  assert.equal(h.progress(inner).savingCaseId, undefined)
  inner.dispose(); const next = await h.mount(); assert.equal(h.progress(next).completedIds.length, 1)
  next.dispose(); h.outer.dispose()
})
test('failed restore disables writes until explicit reload succeeds', async () => {
  const h = setup(); h.state.failLoad = true; const inner = await h.mount()
  assert.equal(h.progress(inner).ready, false); assert.equal(await h.progress(inner).complete(batch20[0].id, 1), false)
  h.state.failLoad = false; h.progress(inner).retryLoad(); inner.render(); await tick()
  assert.equal(h.progress(inner).ready, true); assert.equal(h.state.calls.length, 0)
  inner.dispose(); h.outer.dispose()
})
test('pending completion survives reopen and retries the same UUID', async () => {
  const h = setup(), inner = await h.mount(); h.state.failSave = true
  await h.progress(inner).complete(batch20[0].id, 1); const id = h.state.calls[0].id
  inner.dispose(); const next = await h.mount(); assert.equal(h.progress(next).ready, false)
  h.state.failSave = false; h.progress(next).retrySave(); await tick()
  assert.equal(h.state.calls[1].id, id); assert.equal(h.state.storage.size, 0)
  assert.equal(h.progress(next).completedIds.length, 1); next.dispose(); h.outer.dispose()
})
test('rapid presses coalesce even during asynchronous content hashing', async () => {
  const h = setup(), inner = await h.mount(); const complete = h.progress(inner).complete
  const first = complete(batch20[0].id, 1)
  assert.equal(await complete(batch20[0].id, 1), false); await first
  assert.equal(h.state.calls.length, 1); inner.dispose(); h.outer.dispose()
})
test('account switch remounts the case UI, isolating answers and pending progress', async () => {
  const h = setup(), inner = await h.mount(); const key = h.outer.render().key
  h.state.owner = '00000000-0000-4000-8000-000000000002'; h.state.listener('SIGNED_IN', { user: { id: h.state.owner } })
  assert.notEqual(h.outer.render().key, key)
  inner.dispose(); const next = await h.mount(); assert.equal(h.progress(next).completedIds.length, 0)
  next.dispose(); h.outer.dispose()
})
test('late acknowledgement after disposal cannot mark the disposed UI as saved', async () => {
  const h = setup(), inner = await h.mount(); let release
  h.state.delay = new Promise(r => { release = r })
  const request = h.progress(inner).complete(batch20[0].id, 1); await tick(); inner.dispose()
  release(); assert.equal(await request, false); assert.equal(h.state.storage.size, 1)
  h.outer.dispose()
})
test('foreign or invalid pending payload is not offered for retry', async () => {
  const h = setup(); h.state.storage.set(`cliniverse:microcase:pending:${owner}`, JSON.stringify({ user_id: 'other', id: 'invalid' }))
  const inner = await h.mount(); assert.equal(h.progress(inner).retrySave, undefined)
  assert.equal(h.state.calls.length, 0); inner.dispose(); h.outer.dispose()
})
test('account-enabled preview remains opt-in locally and restricted to the approved cloud branch', () => {
  const source = fs.readFileSync(new URL('../app/labs/case-batch-preview/page.tsx', import.meta.url), 'utf8')
  assert.ok(source.indexOf("process.env.NODE_ENV !== 'development'") < source.indexOf("process.env.CASE_ACCOUNT_PREVIEW_ENABLED === 'true'"))
  assert.match(source, /process.env.VERCEL_ENV === 'preview'/)
  assert.match(source, /process.env.VERCEL_GIT_COMMIT_REF === 'qa\/case-batch20-cloud'/)
  const ui = fs.readFileSync(new URL('../app/components/case-preview/CaseBatchPreview.tsx', import.meta.url), 'utf8')
  assert.match(ui, /I reviewed the explanation — save completion/)
  assert.match(ui, /accountProgress.complete\(active.id, answers\[active.id\]\)/)
  assert.match(ui, /!accountProgress.ready \|\| accountProgress.saving/)
})

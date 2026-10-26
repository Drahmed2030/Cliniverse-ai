import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Real staleWorkerGuard.ts run against fakes: "current" workers answer the version probe, older ones never do.
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const code = ts.transpileModule(read('app/lib/staleWorkerGuard.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const G = {}
vm.runInNewContext(code, { exports: G, URLSearchParams, Promise, MessageChannel, setTimeout, clearTimeout })

const HASH = '#access_token=SYNTHETIC.AT&refresh_token=SYNTHETIC-RT&expires_in=3600&token_type=bearer&type=recovery'
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve() }

function world({ controller = null, registrations = [], cacheNames = [], search = '', getRegistrationsThrows = false, unregisterThrows = false } = {}) {
  const log = []
  const timers = []
  const location = { pathname: '/reset-password', search, hash: HASH, replace: url => log.push(['replace', url]) }
  const worker = (answers, label) => ({ label, postMessage(message, ports) { log.push(['probe', label]); if (answers) ports[0].postMessage({ version: 'cliniverse-static-v4' }) } })
  const channel = () => { const port1 = { onmessage: null }; const port2 = { postMessage: data => port1.onmessage && port1.onmessage({ data }) }; return { port1, port2 } }
  const reg = (w) => ({ active: w, unregister: async () => { log.push(['unregister', w ? w.label : 'none']); if (unregisterThrows) throw new Error('x'); return true } })
  const env = {
    serviceWorker: { controller, getRegistrations: async () => { if (getRegistrationsThrows) throw new Error('x'); return registrations } },
    caches: { keys: async () => cacheNames, delete: async name => { log.push(['delete-cache', name]); return true } },
    location, createChannel: channel,
    setTimer: fn => { timers.push(fn); return timers.length }, clearTimer: () => {},
  }
  return { env, log, timers, worker, reg }
}
const settle = async (promise, timers) => { await flush(); timers.splice(0).forEach(fire => fire()); return promise }

test('no service-worker support, or nothing registered and nothing controlling: clean, no side effects', async () => {
  assert.equal(await G.ensureNoStaleWorker({ location: { pathname: '/reset-password', search: '', hash: HASH, replace() { throw new Error('no') } } }), 'clean')
  const w = world()
  assert.equal(await G.ensureNoStaleWorker(w.env), 'clean')
  assert.deepEqual(w.log, [])
})

test('the CURRENT worker (answers the probe) is left alone: no unregister, no cache deletion, no reload', async () => {
  const w = world(); const current = w.worker(true, 'current')
  const env = { ...w.env, serviceWorker: { controller: current, getRegistrations: async () => [w.reg(current)] } }
  assert.equal(await G.ensureNoStaleWorker(env), 'clean')
  assert.deepEqual(w.log.filter(e => e[0] !== 'probe'), [])
})

test('OLD controlling worker on the first direct visit: unregistered, legacy caches deleted, one reload that keeps the fragment, no token use', async () => {
  const w = world({ cacheNames: ['cliniverse-v3', 'cliniverse-static-v4', 'unrelated'] })
  const old = w.worker(false, 'old')
  const env = { ...w.env, serviceWorker: { controller: old, getRegistrations: async () => [w.reg(old)] } }
  const result = await settle(G.ensureNoStaleWorker(env), w.timers)
  await flush()
  assert.equal(result, 'reloading')
  const events = w.log.map(e => e.join(':'))
  assert.ok(events.includes('unregister:old'))
  assert.deepEqual(w.log.filter(e => e[0] === 'delete-cache').map(e => e[1]), ['cliniverse-v3'], 'only legacy Cliniverse caches')
  assert.deepEqual(w.log.filter(e => e[0] === 'replace'), [['replace', '/reset-password?swclean=1' + HASH]], 'same path, marker, fragment byte-for-byte')
  assert.ok(events.indexOf('unregister:old') < events.findIndex(e => e.startsWith('replace')), 'unregister before reload')
})

test('an old ACTIVE registration that does not control this page yet is also removed', async () => {
  const w = world()
  const old = w.worker(false, 'old-active')
  const env = { ...w.env, serviceWorker: { controller: null, getRegistrations: async () => [w.reg(old)] } }
  assert.equal(await settle(G.ensureNoStaleWorker(env), w.timers), 'reloading')
  assert.ok(w.log.some(e => e[0] === 'unregister' && e[1] === 'old-active'))
})

test('after the one reload a stale worker is still present: BLOCKED (fail closed), nothing else is touched', async () => {
  const w = world({ search: '?swclean=1' })
  const old = w.worker(false, 'old')
  const env = { ...w.env, serviceWorker: { controller: old, getRegistrations: async () => [w.reg(old)] } }
  assert.equal(await settle(G.ensureNoStaleWorker(env), w.timers), 'blocked')
  assert.deepEqual(w.log.filter(e => e[0] !== 'probe'), [])
})

test('after the reload with nothing stale left the page proceeds (marker present, clean)', async () => {
  const w = world({ search: '?swclean=1' })
  assert.equal(await G.ensureNoStaleWorker(w.env), 'clean')
})

test('unregister failures and unreadable registrations still end in reload-then-block, never in using the tokens', async () => {
  const w = world({ unregisterThrows: true })
  const old = w.worker(false, 'old')
  const env = { ...w.env, serviceWorker: { controller: old, getRegistrations: async () => [w.reg(old)] } }
  assert.equal(await settle(G.ensureNoStaleWorker(env), w.timers), 'reloading')
  const w2 = world({ getRegistrationsThrows: true })
  const env2 = { ...w2.env, serviceWorker: { controller: w2.worker(true, 'maybe'), getRegistrations: async () => { throw new Error('x') } } }
  assert.equal(await settle(G.ensureNoStaleWorker(env2), w2.timers), 'clean', 'a controller that answers the probe is the current worker')
  const w3 = world({ getRegistrationsThrows: true })
  const env3 = { ...w3.env, serviceWorker: { controller: w3.worker(false, 'old'), getRegistrations: async () => { throw new Error('x') } } }
  assert.equal(await settle(G.ensureNoStaleWorker(env3), w3.timers), 'reloading')
})

test('the version expected by the guard, the worker and the registration script is one and the same', () => {
  const guard = read('app/lib/staleWorkerGuard.ts').match(/EXPECTED_WORKER_VERSION = '([^']+)'/)[1]
  assert.equal(guard, read('public/sw.js').match(/const CACHE = '([^']+)'/)[1])
  assert.equal(guard, read('public/register-sw.js').match(/CURRENT_CACHE = '([^']+)'/)[1])
})

test('the recovery page runs the guard BEFORE it reads the tokens or creates the recovery client, and blocked never uses the link', () => {
  const page = read('app/reset-password/ResetPasswordClient.tsx')
  const guard = page.indexOf('await ensureNoStaleWorker(')
  assert.ok(guard > 0)
  assert.ok(guard < page.indexOf('parseRecoveryHash(window.location.hash)'))
  assert.ok(guard < page.indexOf('createRecoveryClient()'))
  assert.match(page, /if \(guard === 'reloading'\) return/)
  const blocked = page.slice(page.indexOf("if (guard === 'blocked')"), page.indexOf("if (link.kind === 'invalid')"))
  assert.match(blocked, /setView\(\{ name: 'blocked' \}\); return/)
  assert.ok(page.indexOf('window.history.replaceState') < page.indexOf("if (guard === 'blocked')"), 'the fragment is stripped even when blocked')
})

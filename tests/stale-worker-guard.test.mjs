import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Real staleWorkerGuard.ts and recoveryRun.ts run against fakes: "current" workers answer the version probe,
// older ones never do. The Chromium script drives the same code against a genuinely controlling legacy worker.
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
function load(path, requireShim = () => { throw new Error('no imports expected') }) {
  const code = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: requireShim, URLSearchParams, Promise, MessageChannel, setTimeout, clearTimeout, Error })
  return exports
}
const G = load('app/lib/staleWorkerGuard.ts')
const HASH = '#access_token=SYNTHETIC.AT&refresh_token=SYNTHETIC-RT&expires_in=3600&token_type=bearer&type=recovery'
const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve() }

// A fake browser: workers, registrations, caches, controllerchange events, a log of every side effect.
function world({ search = '', cacheNames = [], deleteMode = 'ok', keysMode = 'ok', unregisterMode = 'ok', listMode = 'ok', noCaches = false } = {}) {
  const log = []; const timers = []; const listeners = []; let listCalls = 0
  const caches = new Set(cacheNames)
  const container = {
    controller: null, registrations: [],
    getRegistrations: () => {
      listCalls++
      const mode = typeof listMode === 'function' ? listMode(listCalls) : listMode
      if (mode === 'throws') throw new Error('x')
      if (mode === 'rejects') return Promise.reject(new Error('x'))
      if (mode === 'hang') return new Promise(() => {})
      if (mode === 'nonarray') return Promise.resolve({ length: 0 })
      if (mode === 'malformed') return Promise.resolve([null])
      log.push(['list']); return Promise.resolve(container.registrations)
    },
    addEventListener: (type, fn) => { if (type === 'controllerchange') listeners.push(fn) },
    removeEventListener: (type, fn) => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1) },
  }
  const worker = (answers, label) => ({ label, answers, postMessage(message, ports) { log.push(['probe', label]); if (container.onProbe) container.onProbe(label); if (worker.current(answers, label)) ports[0].postMessage({ version: 'cliniverse-static-v4' }) } })
  worker.current = answers => answers
  const reg = w => { const registration = { active: w, unregister: async () => { log.push(['unregister', registration.active ? registration.active.label : 'none']); if (unregisterMode === 'throws') throw new Error('x'); if (unregisterMode === 'false') return false; container.registrations = container.registrations.filter(r => r !== registration); return true } }; return registration }
  const location = { pathname: '/reset-password', search, hash: HASH, replace: url => log.push(['replace', url]) }
  const env = {
    serviceWorker: container,
    caches: noCaches ? undefined : {
      keys: async () => { if (keysMode === 'throws') throw new Error('x'); if (typeof keysMode === 'function') return keysMode([...caches]); return [...caches] },
      delete: async name => { log.push(['delete-cache', name]); if (deleteMode === 'throws') throw new Error('x'); if (deleteMode === 'false') return false; if (deleteMode === 'lie') return true; caches.delete(name); return true },
    },
    location,
    createChannel: () => { const port1 = { onmessage: null }; return { port1, port2: { postMessage: data => port1.onmessage && port1.onmessage({ data }) } } },
    setTimer: fn => { timers.push(fn); return timers.length }, clearTimer: () => {},
  }
  const fire = () => listeners.slice().forEach(fn => fn())
  const timeoutAll = () => timers.splice(0).forEach(f => f())
  return { env, container, worker, reg, log, caches, fire, timeoutAll, location, listeners }
}
const run = async (w, guardOpts = {}) => { const guard = G.createWorkerGuard({ ...w.env, ...guardOpts }); const p = guard.check(); await flush(); w.timeoutAll(); await flush(); w.timeoutAll(); return { guard, result: await p } }
const noSideEffects = w => w.log.filter(e => ['unregister', 'delete-cache', 'replace'].includes(e[0]))

test('nothing registered, nothing controlling, no caches: clean without side effects (also without SW or Cache API support)', async () => {
  const w = world(); assert.equal((await run(w)).result, 'clean'); assert.deepEqual(noSideEffects(w), [])
  assert.equal(await G.ensureNoStaleWorker({ location: w.location }), 'clean')
  const nc = world({ noCaches: true }); assert.equal((await run(nc)).result, 'clean')
})

test('the CURRENT worker is left alone: no unregister, no cache deletion, no reload', async () => {
  const w = world({ cacheNames: ['cliniverse-static-v4', 'unrelated'] }); const current = w.worker(true, 'current')
  w.container.controller = current; w.container.registrations = [w.reg(current)]
  assert.equal((await run(w)).result, 'clean'); assert.deepEqual(noSideEffects(w), [])
})

test('OLD controlling worker on the first direct visit: unregistered, legacy caches deleted AND verified gone, one reload keeping the fragment', async () => {
  const w = world({ cacheNames: ['cliniverse-v3', 'Cliniverse-old', 'cliniverse-static-v4', 'unrelated'] }); const old = w.worker(false, 'old')
  w.container.controller = old; w.container.registrations = [w.reg(old)]
  const { result } = await run(w)
  assert.equal(result, 'reloading')
  assert.deepEqual(w.log.filter(e => e[0] === 'delete-cache').map(e => e[1]).sort(), ['Cliniverse-old', 'cliniverse-v3'])
  assert.deepEqual([...w.caches].sort(), ['cliniverse-static-v4', 'unrelated'], 'only legacy Cliniverse caches were touched')
  assert.deepEqual(w.log.filter(e => e[0] === 'replace'), [['replace', '/reset-password?swclean=1' + HASH]])
})

// ───────── R6.2 #1: service worker changes while the probe is pending ─────────
test('controller changes to an OLD worker while the probe of the previous controller is pending: that result is discarded and the page is NOT clean', async () => {
  const w = world(); const current = w.worker(true, 'current'); const old = w.worker(false, 'old')
  w.container.controller = current; w.container.registrations = [w.reg(current)]
  let swapped = false
  w.container.onProbe = label => { if (label === 'current' && !swapped) { swapped = true; w.container.controller = old; w.container.registrations = [w.reg(old)]; w.fire() } }
  const { result } = await run(w)
  assert.equal(swapped, true)
  assert.notEqual(result, 'clean', 'the stale "current" answer must not be accepted')
  assert.equal(result, 'reloading'); assert.ok(w.log.some(e => e[0] === 'unregister' && e[1] === 'old'))
})

test('controller changes to a CURRENT worker mid-check: the first result is discarded, the re-check is clean', async () => {
  const w = world(); const old = w.worker(false, 'old'); const fresh = w.worker(true, 'fresh')
  w.container.controller = old; w.container.registrations = [w.reg(old)]
  let swapped = false
  w.container.onProbe = label => { if (label === 'old' && !swapped) { swapped = true; w.container.controller = fresh; w.container.registrations = [w.reg(fresh)]; w.fire() } }
  const { result } = await run(w)
  assert.equal(result, 'clean'); assert.deepEqual(noSideEffects(w), [], 'no cleanup was triggered by the discarded evaluation')
})

test('the set of active workers changing mid-check (no controllerchange event) also discards the evaluation', async () => {
  const w = world(); const a = w.worker(true, 'a'); const b = w.worker(false, 'b')
  w.container.controller = null; w.container.registrations = [w.reg(a)]
  let once = false
  w.container.onProbe = () => { if (!once) { once = true; w.container.registrations = [w.reg(a), w.reg(b)] } }
  const { result } = await run(w)
  assert.equal(result, 'reloading'); assert.ok(w.log.some(e => e[0] === 'unregister' && e[1] === 'b'))
})

test('a change AFTER a clean result but BEFORE token use: stillCurrent() turns false', async () => {
  const w = world(); const current = w.worker(true, 'current'); const old = w.worker(false, 'old')
  w.container.controller = current; w.container.registrations = [w.reg(current)]
  const { guard, result } = await run(w)
  assert.equal(result, 'clean'); assert.equal(guard.stillCurrent(), true)
  w.container.controller = old; w.fire()
  assert.equal(guard.stillCurrent(), false)
  const again = guard.check(); await flush(); w.timeoutAll(); await flush()
  assert.notEqual(await again, 'clean', 'the re-check sees the old worker')
})

test('repeated changes that never settle fail closed (blocked), without side effects', async () => {
  const w = world(); const a = w.worker(true, 'a'); w.container.controller = a; w.container.registrations = [w.reg(a)]
  w.container.onProbe = () => w.fire()
  const { result } = await run(w, { maxAttempts: 3 })
  assert.equal(result, 'blocked'); assert.deepEqual(noSideEffects(w), [])
})

// ───────── R6.3: identity of the active worker is captured, not just the registration object ─────────
// `registration.active` is a live property: the SAME registration object can start pointing at a different worker.
test('REPRO (R6.2 passed this wrongly): registration.active is swapped IN PLACE to an old worker while the probe is pending — not clean', async () => {
  const w = world(); const current = w.worker(true, 'current'); const old = w.worker(false, 'old')
  const registration = w.reg(current); w.container.controller = null; w.container.registrations = [registration]
  let swapped = false
  w.container.onProbe = label => { if (label === 'current' && !swapped) { swapped = true; registration.active = old } }   // same object, new worker, no event
  const { result } = await run(w)
  assert.equal(swapped, true)
  assert.notEqual(result, 'clean', 'an in-place change of registration.active must discard the evaluation')
  assert.equal(result, 'reloading'); assert.ok(w.log.some(e => e[0] === 'unregister' && e[1] === 'old'))
})

test('REPRO (R6.2 passed this wrongly): registration.active swapped in place AFTER a clean result — stillCurrent() must turn false', async () => {
  const w = world(); const current = w.worker(true, 'current'); const old = w.worker(false, 'old')
  const registration = w.reg(current); w.container.registrations = [registration]
  const { guard, result } = await run(w)
  assert.equal(result, 'clean'); assert.equal(guard.stillCurrent(), true)
  registration.active = old
  assert.equal(guard.stillCurrent(), false, 'the captured worker identity no longer matches the live registration')
})

// ───────── R6.2 #3: cache deletion must be verified, also across the reload ─────────
test('delete REJECTS: not clean — blocked immediately, no reload, nothing assumed', async () => {
  const w = world({ cacheNames: ['cliniverse-v3'], deleteMode: 'throws' }); const old = w.worker(false, 'old'); w.container.controller = old; w.container.registrations = [w.reg(old)]
  assert.equal((await run(w)).result, 'blocked'); assert.equal(w.log.filter(e => e[0] === 'replace').length, 0)
})
test('delete returns FALSE: not clean — blocked', async () => {
  const w = world({ cacheNames: ['cliniverse-v3'], deleteMode: 'false' })
  assert.equal((await run(w)).result, 'blocked'); assert.equal(w.log.filter(e => e[0] === 'replace').length, 0)
})
test('delete claims success but the cache is still listed: verification catches it — blocked', async () => {
  const w = world({ cacheNames: ['cliniverse-v3'], deleteMode: 'lie' })
  assert.equal((await run(w)).result, 'blocked')
})
test('cache listing REJECTS: unverifiable ⇒ blocked, before and after cleanup', async () => {
  assert.equal((await run(world({ keysMode: 'throws' }))).result, 'blocked')
  // listing works at first, fails when verifying
  let calls = 0
  const w = world({ cacheNames: ['cliniverse-v3'], keysMode: names => { calls++; if (calls >= 2) throw new Error('x'); return names } })
  assert.equal((await run(w)).result, 'blocked'); assert.equal(w.log.filter(e => e[0] === 'replace').length, 0)
})
test('a legacy cache that LINGERS after the reload is blocked even though no worker is stale (verified on every load)', async () => {
  const w = world({ search: '?swclean=1', cacheNames: ['cliniverse-v3'] })
  assert.equal((await run(w)).result, 'blocked'); assert.deepEqual(noSideEffects(w), [])
  const ok = world({ search: '?swclean=1' }); assert.equal((await run(ok)).result, 'clean')
})
test('stale worker + marker already present (a second attempt) is blocked; no endless reloads', async () => {
  const w = world({ search: '?swclean=1' }); const old = w.worker(false, 'old'); w.container.controller = old; w.container.registrations = [w.reg(old)]
  assert.equal((await run(w)).result, 'blocked'); assert.deepEqual(noSideEffects(w), [])
})
test('unregister failure (rejects or false) is not a reason to use the tokens: the reload re-checks and then blocks', async () => {
  for (const unregisterMode of ['throws', 'false']) {
    const w = world({ unregisterMode }); const old = w.worker(false, 'old'); w.container.controller = old; w.container.registrations = [w.reg(old)]
    assert.equal((await run(w)).result, 'reloading')
    const second = world({ unregisterMode, search: '?swclean=1' }); const old2 = second.worker(false, 'old'); second.container.controller = old2; second.container.registrations = [second.reg(old2)]
    assert.equal((await run(second)).result, 'blocked')
  }
})
test('only Cliniverse-owned legacy caches are ever deleted (case-insensitive prefix; the current cache and unrelated caches stay)', async () => {
  const w = world({ cacheNames: ['cliniverse-v3', 'CLINIVERSE-x', 'cliniverse-static-v4', 'workbox-precache', 'my-app', 'cv-cache'] })
  await run(w)
  assert.deepEqual([...w.caches].sort(), ['cv-cache', 'cliniverse-static-v4', 'my-app', 'workbox-precache'].sort())
})


test('R6.3 identity capture: the probe verdict belongs to the captured worker OBJECT — swapping registration.active to another CURRENT worker mid-check is also discarded and re-probed', async () => {
  const w = world(); const a = w.worker(true, 'a'); const b = w.worker(true, 'b')
  const registration = w.reg(a); w.container.registrations = [registration]
  let swapped = false
  w.container.onProbe = label => { if (label === 'a' && !swapped) { swapped = true; registration.active = b } }
  const { result } = await run(w)
  assert.equal(result, 'clean'); assert.equal(w.log.filter(e => e[0] === 'probe' && e[1] === 'b').length >= 1, true, 'the new identity was probed before it was accepted')
})

test('ENUMERATION UNAVAILABLE or UNRELIABLE is unverified, never "no workers": blocked for every kind of failure and every controller state, no side effects', async () => {
  for (const listMode of ['throws', 'rejects', 'hang', 'nonarray', 'malformed']) {
    for (const controllerKind of ['none', 'current', 'old']) {
      const w = world({ listMode, cacheNames: ['cliniverse-v3'] })
      if (controllerKind === 'current') w.container.controller = w.worker(true, 'cur')
      if (controllerKind === 'old') w.container.controller = w.worker(false, 'old')
      const { result } = await run(w)
      assert.equal(result, 'blocked', `${listMode} / ${controllerKind}`)
      assert.deepEqual(noSideEffects(w), [], `${listMode} / ${controllerKind}`)
    }
  }
})

test('enumeration that works at first but fails when it is repeated to confirm stability: blocked', async () => {
  const w = world({ listMode: n => (n >= 2 ? 'rejects' : 'ok') }); const cur = w.worker(true, 'cur'); w.container.registrations = [w.reg(cur)]
  assert.equal((await run(w)).result, 'blocked')
})

test('no service-worker support at all is still clean (nothing can control the page)', async () => {
  assert.equal(await G.ensureNoStaleWorker({ location: { pathname: '/reset-password', search: '', hash: HASH, replace() { throw new Error('no') } } }), 'clean')
})

test('confirm(): true when the same current workers are still there; false for a worker identity that was never probed, for an unavailable enumeration and after dispose/cancel', async () => {
  const w = world(); const cur = w.worker(true, 'cur'); const registration = w.reg(cur); w.container.registrations = [registration]
  const { guard, result } = await run(w); assert.equal(result, 'clean')
  assert.equal(await guard.confirm(), true)
  // a new registration with a never-probed worker appears
  w.container.registrations = [registration, w.reg(w.worker(true, 'stranger'))]
  assert.equal(await guard.confirm(), false)
  w.container.registrations = [registration]
  assert.equal(await guard.confirm(), true)
  // unavailable now
  const failing = world({ listMode: n => (n >= 3 ? 'rejects' : 'ok') }); const c2 = failing.worker(true, 'c'); failing.container.registrations = [failing.reg(c2)]
  const run2 = await run(failing); assert.equal(run2.result, 'clean'); assert.equal(await run2.guard.confirm(), false)
  // cancelled
  let cancelled = false
  const w3 = world(); const c3 = w3.worker(true, 'c'); w3.container.registrations = [w3.reg(c3)]
  const run3 = await run(w3, { isCancelled: () => cancelled }); assert.equal(run3.result, 'clean'); cancelled = true
  assert.equal(await run3.guard.confirm(), false); assert.equal(run3.guard.stillCurrent(), false)
})

// ───────── real guard + real run together: the in-place identity change between the check and the token use ─────────
async function integrated({ prepare }) {
  const w = world(); const log = w.log; const views = []
  const store = { link: null, stripped: false }
  const deps = {
    makeGuard: isCancelled => G.createWorkerGuard({ ...w.env, isCancelled }),
    linkStore: store, readHash: () => { log.push(['readHash']); return HASH }, stripUrl: () => log.push(['history.replaceState']),
    createClient: () => { log.push(['createClient']); return {} },
    startRecovery: async () => { log.push(['setSession']); return { status: 'ready', maskedEmail: 'j•@x' } },
    completeRecovery: async () => ({ status: 'done', sessionsEnded: true }),
    setView: v => views.push(v.name),
  }
  const ctx = prepare(w)
  const runInstance = R.createRecoveryRun(deps)
  const started = runInstance.start()
  for (let i = 0; i < 40; i++) { await flush(); w.timeoutAll(); if (ctx && ctx.step) await ctx.step(i) }
  await started
  return { w, views, log, runInstance }
}

test('INTEGRATED: registration.active swapped in place to an OLD worker after the check but during the pre-use confirmation ⇒ the recovery session is NOT used', async () => {
  const { views, log } = await integrated({ prepare: w => {
    const current = w.worker(true, 'current'); const old = w.worker(false, 'old')
    const registration = w.reg(current); w.container.registrations = [registration]
    let lists = 0; const realList = w.container.getRegistrations
    w.container.getRegistrations = () => { lists++; if (lists === 3) registration.active = old; return realList() }   // 1st+2nd = the check, 3rd = confirm
    return {}
  } })
  assert.deepEqual(log.filter(e => ['setSession', 'createClient', 'readHash'].includes(e[0])), [], 'tokens never read or used')
  assert.ok(['blocked', 'reloading'].includes(views[0] ?? 'reloading'))
})

test('INTEGRATED: enumeration becomes unavailable exactly at the pre-use confirmation ⇒ blocked, tokens untouched, fragment stripped', async () => {
  const { views, log } = await integrated({ prepare: w => {
    const current = w.worker(true, 'current'); w.container.registrations = [w.reg(current)]
    let lists = 0; const realList = w.container.getRegistrations
    w.container.getRegistrations = () => { lists++; return lists >= 3 ? Promise.reject(new Error('x')) : realList() }
    return {}
  } })
  assert.deepEqual(views, ['blocked']); assert.deepEqual(log.filter(e => ['setSession', 'createClient', 'readHash'].includes(e[0])), [])
  assert.ok(log.some(e => e[0] === 'history.replaceState'))
})

test('INTEGRATED: a different CURRENT worker appears before use ⇒ confirmation fails, a full re-check probes it, then the session is used exactly once', async () => {
  const { views, log } = await integrated({ prepare: w => {
    const a = w.worker(true, 'a'); const b = w.worker(true, 'b')
    const registration = w.reg(a); w.container.registrations = [registration]
    let lists = 0; const realList = w.container.getRegistrations
    w.container.getRegistrations = () => { lists++; if (lists === 3) registration.active = b; return realList() }
    return {}
  } })
  assert.deepEqual(views, ['form']); assert.equal(log.filter(e => e[0] === 'setSession').length, 1)
  assert.ok(log.some(e => e[0] === 'probe' && e[1] === 'b'))
})

test('INTEGRATED: the page is left while the pre-use confirmation is pending ⇒ nothing is read, stripped, created, requested or shown', async () => {
  const w = world(); const log = w.log; const views = []
  const current = w.worker(true, 'current'); w.container.registrations = [w.reg(current)]
  let lists = 0; let release; const held = new Promise(r => { release = r }); const realList = w.container.getRegistrations
  w.container.getRegistrations = () => { lists++; return lists === 3 ? held.then(() => realList()) : realList() }
  const deps = { makeGuard: isCancelled => G.createWorkerGuard({ ...w.env, isCancelled }), linkStore: { link: null, stripped: false }, readHash: () => { log.push(['readHash']); return HASH }, stripUrl: () => log.push(['history.replaceState']), createClient: () => { log.push(['createClient']); return {} }, startRecovery: async () => { log.push(['setSession']); return { status: 'ready', maskedEmail: 'x' } }, completeRecovery: async () => ({ status: 'done', sessionsEnded: true }), setView: v => views.push(v.name) }
  const instance = R.createRecoveryRun(deps); const started = instance.start()
  for (let i = 0; i < 10; i++) await flush()   // no timers fired: the confirmation enumeration stays pending
  assert.equal(lists, 3, 'the confirmation enumeration is pending')
  instance.cancel(); release(); await started
  assert.deepEqual(log.filter(e => ['readHash', 'history.replaceState', 'createClient', 'setSession'].includes(e[0])), []); assert.deepEqual(views, [])
})

// ───────── cancellation ─────────
test('cancelled while probing or before a side effect: no unregister, no cache delete, no reload', async () => {
  let cancelled = false
  const w = world({ cacheNames: ['cliniverse-v3'] }); const old = w.worker(false, 'old'); w.container.controller = old; w.container.registrations = [w.reg(old)]
  w.container.onProbe = () => { cancelled = true }
  const { result } = await run(w, { isCancelled: () => cancelled })
  assert.equal(result, 'cancelled'); assert.deepEqual(noSideEffects(w), [])
  // cancelled between unregister and delete
  let c2 = false
  const w2 = world({ cacheNames: ['cliniverse-v3'] }); const o2 = w2.worker(false, 'old'); w2.container.controller = o2
  const r2 = w2.reg(o2); const orig = r2.unregister; r2.unregister = async () => { const v = await orig(); c2 = true; return v }; w2.container.registrations = [r2]
  const out = await run(w2, { isCancelled: () => c2 })
  assert.equal(out.result, 'cancelled'); assert.equal(w2.log.filter(e => e[0] === 'delete-cache' || e[0] === 'replace').length, 0)
})

test('the version expected by the guard, the worker and the registration script is one and the same', () => {
  const guard = read('app/lib/staleWorkerGuard.ts').match(/EXPECTED_WORKER_VERSION = '([^']+)'/)[1]
  assert.equal(guard, read('public/sw.js').match(/const CACHE = '([^']+)'/)[1])
  assert.equal(guard, read('public/register-sw.js').match(/CURRENT_CACHE = '([^']+)'/)[1])
})

// ───────── R6.2 #2: page life cycle (recoveryRun) ─────────
const R = load('app/lib/recoveryRun.ts', name => {
  if (name === './passwordRecovery') return { parseRecoveryHash: hash => hash.includes('type=recovery') ? { kind: 'ready', accessToken: 'AT', refreshToken: 'RT' } : { kind: 'invalid', reason: 'missing' } }
  throw new Error('unexpected ' + name)
})
function page({ guardResults = ['clean'], stillCurrent = () => true, startDelay = null, completeDelay = null, confirmResult = () => true } = {}) {
  const log = []; const views = []
  let results = [...guardResults]; let guardGate = null; let confirmGate = null
  const store = { link: null, stripped: false }
  const makeGuard = isCancelled => ({
    check: async () => { log.push(['guard.check']); if (guardGate) await guardGate.promise; return results.length > 1 ? results.shift() : results[0] },
    stillCurrent: () => stillCurrent(), confirm: async () => { log.push(['guard.confirm']); if (confirmGate) await confirmGate.promise; return confirmResult() }, dispose: () => log.push(['guard.dispose']),
  })
  const deps = {
    makeGuard, linkStore: store,
    readHash: () => { log.push(['readHash']); return HASH },
    stripUrl: () => log.push(['history.replaceState']),
    createClient: () => { log.push(['createClient']); return { id: 'client' } },
    startRecovery: async () => { log.push(['setSession']); if (startDelay) await startDelay.promise; return { status: 'ready', maskedEmail: 'j•@x' } },
    completeRecovery: async () => { log.push(['updateUser']); if (completeDelay) await completeDelay.promise; log.push(['signOut global']); return { status: 'done', sessionsEnded: true } },
    setView: v => { log.push(['view', v.name]); views.push(v.name) },
  }
  const gate = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
  return { deps, log, views, store, hold: () => { guardGate = gate(); return guardGate }, holdConfirm: () => { confirmGate = gate(); return confirmGate }, gate, names: () => log.map(e => e.join(':')) }
}
const TOKEN_USE = ['readHash', 'history.replaceState', 'createClient', 'setSession', 'view:form']

test('normal run: guard → read fragment → strip → recovery client → setSession → form', async () => {
  const p = page(); const r = R.createRecoveryRun(p.deps); await r.start()
  assert.deepEqual(p.names().filter(n => !n.startsWith('guard')), ['readHash', 'history.replaceState', 'createClient', 'setSession', 'view:form'])
})
test('UNMOUNT while the guard is pending: no fragment read, no history change, no client, no request, no view update', async () => {
  const p = page(); const gate = p.hold(); const r = R.createRecoveryRun(p.deps); const started = r.start()
  r.cancel(); gate.resolve(); await started
  assert.deepEqual(p.names().filter(n => TOKEN_USE.includes(n)), [], p.names().join(' '))
  assert.deepEqual(p.views, [])
})
test('UNMOUNT after the guard said "reloading" or "blocked": nothing is written to history or the view', async () => {
  for (const result of ['blocked', 'reloading']) {
    const p = page({ guardResults: [result] }); const gate = p.hold(); const r = R.createRecoveryRun(p.deps); const started = r.start()
    r.cancel(); gate.resolve(); await started
    assert.deepEqual(p.names().filter(n => n === 'history.replaceState' || n.startsWith('view')), [], result)
  }
})
test('UNMOUNT during setSession: the request is NOT claimed cancelled, but no view update and nothing new starts', async () => {
  const delay = page().gate(); const p = page({ startDelay: delay }); const r = R.createRecoveryRun(p.deps); const started = r.start()
  await flush(); assert.ok(p.names().includes('setSession'))
  r.cancel(); delay.resolve(); await started
  assert.deepEqual(p.views, []); assert.equal(p.names().filter(n => n === 'setSession').length, 1)
  assert.deepEqual(JSON.parse(JSON.stringify(await r.submit('x', 'x'))), { status: 'cancelled' }, 'no new request after cancel')
})
test('UNMOUNT during the password update: no UI update, but the global sign-out of the already-sent update still completes', async () => {
  const p = page(); const r = R.createRecoveryRun(p.deps); await r.start()
  const delay = p.gate(); p.deps.completeRecovery = async () => { p.log.push(['updateUser']); await delay.promise; p.log.push(['signOut global']); return { status: 'done', sessionsEnded: true } }
  const submitting = r.submit('correct-horse-9', 'correct-horse-9'); await flush()
  r.cancel(); delay.resolve()
  assert.deepEqual(JSON.parse(JSON.stringify(await submitting)), { status: 'cancelled' })
  assert.ok(p.names().includes('signOut global'), 'completing an update that was already sent')
  assert.equal(p.views.filter(v => v === 'done').length, 0)
})
test('StrictMode-style remount: cancel run 1 before its guard answers, start run 2 — the fragment is read and stripped exactly once, one setSession', async () => {
  const p = page(); const gate = p.hold()
  const r1 = R.createRecoveryRun(p.deps); const s1 = r1.start(); r1.cancel()
  const r2 = R.createRecoveryRun(p.deps); const s2 = r2.start(); gate.resolve(); await Promise.all([s1, s2])
  const names = p.names()
  assert.equal(names.filter(n => n === 'readHash').length, 1); assert.equal(names.filter(n => n === 'history.replaceState').length, 1)
  assert.equal(names.filter(n => n === 'setSession').length, 1); assert.deepEqual(p.views, ['form'])
})
test('a superseded run cannot write: run 1 finishes setSession after run 2 took over — only the live run updates the view', async () => {
  const delay = page().gate(); const p = page({ startDelay: delay })
  const r1 = R.createRecoveryRun(p.deps); const s1 = r1.start(); await flush()
  r1.cancel(); const r2 = R.createRecoveryRun(p.deps); delay.resolve(); await s1; await r2.start()
  assert.deepEqual(p.views, ['form'])
})
test('worker change AFTER the clean result but BEFORE token use: re-checked; if it turns stale the link is not used', async () => {
  let current = false; const p = page({ guardResults: ['clean', 'blocked'], stillCurrent: () => current })
  const r = R.createRecoveryRun(p.deps); await r.start()
  assert.deepEqual(p.names().filter(n => ['readHash', 'createClient', 'setSession'].includes(n)), [])
  assert.deepEqual(p.views, ['blocked']); assert.ok(p.names().includes('history.replaceState'), 'the fragment is still removed')
  // a change that settles back to current: the re-check is clean and tokens are used
  let n = 0; const q = page({ guardResults: ['clean'], stillCurrent: () => ++n > 1 })
  await R.createRecoveryRun(q.deps).start()
  assert.ok(q.names().includes('setSession'))
})
test('a clean result that never becomes "current" (the worker keeps changing) is not accepted: blocked, link unused', async () => {
  const p = page({ guardResults: ['clean'], stillCurrent: () => false }); await R.createRecoveryRun(p.deps).start()
  assert.deepEqual(p.names().filter(n => ['readHash', 'createClient', 'setSession'].includes(n)), [])
  assert.deepEqual(p.views, ['blocked']); assert.equal(p.names().filter(n => n === 'guard.check').length, 4, 'bounded re-checks, then fail closed')
})
test('blocked: the fragment is removed, the link is never parsed or used', async () => {
  const p = page({ guardResults: ['blocked'] }); await R.createRecoveryRun(p.deps).start()
  assert.deepEqual(p.names().filter(n => ['readHash', 'createClient', 'setSession'].includes(n)), [])
  assert.deepEqual(p.views, ['blocked']); assert.ok(p.names().includes('history.replaceState'))
})

// ───────── page source and copy ─────────
test('the page is a thin shell over the run: cleanup cancels, view updates are gated on the live run, copy distinguishes link / session / password', () => {
  const page = read('app/reset-password/ResetPasswordClient.tsx')
  assert.match(page, /return \(\) => \{ current\.cancel\(\)/)
  assert.match(page, /setView: next => \{ if \(current\.isAlive\(\)\) setView\(next\) \}/)
  assert.match(page, /if \(!current\.isAlive\(\)\) return \/\/ the page was left meanwhile/)
  assert.doesNotMatch(page, /started\.current/)
  assert.doesNotMatch(page, /Your link was not used/)
  assert.match(page, /This page did not use your recovery session\./)
  assert.match(page, /The link in your email may already have been used up/)
  assert.match(page, /Your password was not changed\./)
  // the page only hands the run two small callbacks; it never calls them itself
  assert.equal((page.match(/history\.replaceState/g) ?? []).length, 1)
  assert.equal((page.match(/window\.location\.hash/g) ?? []).length, 1)
  assert.match(page, /readHash: \(\) => window\.location\.hash,\n\s+stripUrl: \(\) => window\.history\.replaceState\(null, '', window\.location\.pathname\),/)
  const run = read('app/lib/recoveryRun.ts')
  assert.ok(run.indexOf('guard.check()') < run.indexOf('parseRecoveryHash('))
  assert.match(run, /stillCurrent\(\)/)
})

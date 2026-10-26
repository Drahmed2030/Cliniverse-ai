import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function load(path) {
  const source = fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, setTimeout, clearTimeout, Promise })
  return exports
}
const { createAuthMutationQueue, createSessionScopedSignOut } = load('app/lib/authMutationCoordinator.ts')
const { createAuthSessionController } = load('app/lib/authSessionController.ts')
const { isVerifiedUser } = load('app/lib/emailVerification.ts')

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve() }
const sess = (id, extra = {}) => ({ user: { id, email: `${id}@x.test`, email_confirmed_at: '2026-01-01', app_metadata: { provider: 'email' }, ...extra } })

// Models the supabase-js behaviour that makes the race real (auth-js 2.109, GoTrueClient):
//  - signOut() calls the server, then removes WHATEVER session is stored at that moment;
//  - signInWithPassword() does its token request first and saves the session afterwards.
// Network completion is controlled by the test through `release(name)`.
function fakeAuth(initial = null) {
  let stored = initial
  const listeners = []
  const log = []
  const waiting = { signOut: [], signIn: [] }
  const emit = (event, session) => listeners.forEach(listener => listener(event, session))
  const auth = {
    getSession: async () => ({ data: { session: stored }, error: null }),
    async signOut() {
      log.push('signOut:start'); const d = deferred(); waiting.signOut.push(d); await d.promise
      stored = null; emit('SIGNED_OUT', null); log.push('signOut:end'); return { error: null }
    },
    async signInWithPassword(id, extra) {
      log.push(`signIn:${id}:start`); const d = deferred(); waiting.signIn.push(d); await d.promise
      stored = sess(id, extra); emit('SIGNED_IN', stored); log.push(`signIn:${id}:end`); return { data: { session: stored }, error: null }
    },
  }
  return {
    auth, log, stored: () => stored, listeners,
    release: async name => { waiting[name].shift().resolve(); await flush() },
    subscribe: cb => { listeners.push(cb); return { unsubscribe() {} } },
  }
}

test('REPRODUCTION (model of unguarded supabase calls): an in-flight signOut removes a newer account\'s session', async () => {
  const f = fakeAuth(sess('a'))
  const out = f.auth.signOut(); await flush()                    // A signOut in flight
  const inB = f.auth.signInWithPassword('b'); await flush()      // B signs in concurrently
  await f.release('signIn')                                      // B's session is saved...
  await f.release('signOut')                                     // ...then A's signOut completes and removes it
  await Promise.all([out, inB])
  assert.equal(f.stored(), null, 'B was signed out by A\'s sign-out — the hazard is real')
})

test('FIX: with the queue, A signOut → B sign-in are serialized and B keeps its session', async () => {
  const f = fakeAuth(sess('a')); const queue = createAuthMutationQueue()
  const out = queue.run(() => f.auth.signOut()); await flush()
  const inB = queue.run(() => f.auth.signInWithPassword('b')); await flush()
  assert.deepEqual(f.log, ['signOut:start'], 'B sign-in has not started while signOut is in flight')
  await f.release('signOut')
  assert.deepEqual(f.log.slice(-1), ['signIn:b:start'])
  await f.release('signIn'); await Promise.all([out, inB])
  assert.equal(f.stored().user.id, 'b')
})

test('FIX: a session-scoped signOut queued behind B\'s sign-in does nothing once B is stored', async () => {
  const f = fakeAuth(sess('a')); const queue = createAuthMutationQueue()
  const signOutSession = createSessionScopedSignOut(queue, f.auth)
  const inB = queue.run(() => f.auth.signInWithPassword('b')); await flush()   // B in flight
  const stale = signOutSession('a'); await flush()                            // controller decides to end A
  await f.release('signIn'); const [, result] = await Promise.all([inB, stale])
  assert.deepEqual([result.skipped, f.stored().user.id], [true, 'b'])
  assert.equal(f.log.includes('signOut:start'), false, 'no signOut request was ever started')
})

test('a scoped signOut still ends the matching session, and never guesses when the session cannot be read', async () => {
  const f = fakeAuth(sess('a')); const queue = createAuthMutationQueue()
  const signOutSession = createSessionScopedSignOut(queue, f.auth)
  const p = signOutSession('a'); await flush(); await f.release('signOut')
  assert.deepEqual([(await p).skipped, f.stored()], [false, null])
  const broken = createSessionScopedSignOut(queue, { getSession: async () => ({ data: { session: null }, error: new Error('x') }), signOut: async () => { throw new Error('must not run') } })
  assert.equal((await broken('a')).skipped, true)
})

test('a failing task does not wedge the queue', async () => {
  const queue = createAuthMutationQueue()
  await assert.rejects(queue.run(async () => { throw new Error('boom') }))
  assert.equal(await queue.run(async () => 'next'), 'next')
})

test('REGRESSION (R3 flaw): a pending signOut(A) that outlives the wait timeout must not let sign-in(B) overlap and be wiped by A\'s late completion', async () => {
  const f = fakeAuth(sess('a')); const timers = []
  const queue = createAuthMutationQueue({ waitTimeoutMs: 50, releaseAfterMs: 50, setTimer: fn => { timers.push(fn); return timers.length - 1 }, clearTimer: () => {} })
  const out = queue.run(() => f.auth.signOut()); await flush()            // A signOut starts and stays pending
  const inB = queue.run(() => f.auth.signInWithPassword('b')).then(() => 'ran', error => error)
  await flush()
  timers.splice(0).forEach(fire => fire()); await flush()                  // the timeout elapses while A is still pending
  assert.equal(f.log.includes('signIn:b:start'), false, 'B must NOT start while A\'s signOut is unresolved')
  await f.release('signOut'); await out                                    // A completes late
  const outcome = await inB
  assert.equal(outcome?.name, 'AuthMutationBusyError', 'B was refused (fail closed), not run')
  assert.equal(f.stored(), null, 'A is signed out and B never signed in')
  assert.equal(f.log.includes('signIn:b:start'), false)
  // Once A has really finished, a retry of B works and keeps its session.
  const retry = queue.run(() => f.auth.signInWithPassword('b')); await flush(); await f.release('signIn'); await retry
  assert.equal(f.stored().user.id, 'b')
})

test('timeouts never reorder or drop waiters: three waiters behind a hung task all refuse, then run in order after it settles', async () => {
  const f = fakeAuth(sess('a')); const timers = []
  const queue = createAuthMutationQueue({ waitTimeoutMs: 50, setTimer: fn => { timers.push(fn); return timers.length - 1 }, clearTimer: () => {} })
  const out = queue.run(() => f.auth.signOut()); await flush()
  const results = [1, 2, 3].map(() => queue.run(async () => 'ran').then(v => v, e => e.name))
  await flush(); timers.splice(0).forEach(fire => fire()); await flush()
  assert.deepEqual(await Promise.all(results), ['AuthMutationBusyError', 'AuthMutationBusyError', 'AuthMutationBusyError'])
  let lateRan = false
  const late = queue.run(async () => { lateRan = true; return 'late' }); await flush()
  assert.equal(lateRan, false, 'a new waiter still queues behind the unresolved task, even after earlier waiters were refused')
  assert.equal(f.log.length, 1)                                           // still only A's signOut:start
  await f.release('signOut'); await out
  assert.equal(await late, 'late', 'after the real settlement the queue works again')
})

test('a scoped signOut refused as busy reports skipped, never a thrown error and never a started request', async () => {
  const f = fakeAuth(sess('a')); const timers = []
  const queue = createAuthMutationQueue({ waitTimeoutMs: 50, setTimer: fn => { timers.push(fn); return timers.length - 1 }, clearTimer: () => {} })
  const hung = queue.run(() => new Promise(() => {})); void hung
  const result = createSessionScopedSignOut(queue, f.auth)('a').then(r => r, e => e)
  await flush(); timers.splice(0).forEach(fire => fire()); await flush()
  const r = await result
  assert.equal(r?.name, 'AuthMutationBusyError')
  assert.equal(f.log.length, 0)
})

test('INTEGRATION: unverified A is being cleaned up while B signs in — B ends signed in, A\'s sign-out never runs', async () => {
  const f = fakeAuth(sess('a', { email_confirmed_at: null })); const queue = createAuthMutationQueue()
  const signOutSession = createSessionScopedSignOut(queue, f.auth)
  const states = []; const tasks = []
  const controller = createAuthSessionController({
    getSession: () => new Promise(() => {}), ensureProfile: async () => ({ error: null }), signOut: signOutSession,
    isVerifiedUser, subscribe: f.subscribe, onState: s => states.push(s), schedule: t => tasks.push(t),
  })
  controller.start()
  f.listeners[0]('SIGNED_IN', f.stored())                     // A (unverified) event → task scheduled
  const inB = queue.run(() => f.auth.signInWithPassword('b')); await flush()   // user signs in as B meanwhile
  tasks.shift()(); await flush()                              // controller runs A's task → queues scoped signOut behind B
  await f.release('signIn'); await inB                        // B saved → SIGNED_IN B
  while (tasks.length) tasks.shift()(); await flush()
  assert.deepEqual([states.at(-1).status, states.at(-1).user.id], ['signed_in', 'b'])
  assert.equal(f.stored().user.id, 'b')
  assert.equal(f.log.includes('signOut:start'), false)
  assert.equal(states.some(s => s.status === 'signed_in' && s.user.id === 'a'), false)
})

test('INTEGRATION: user signs out of A, then B signs in before the sign-out finishes — the late SIGNED_OUT cannot hide B', async () => {
  const f = fakeAuth(sess('a')); const queue = createAuthMutationQueue()
  const states = []; const tasks = []
  const controller = createAuthSessionController({
    getSession: () => new Promise(() => {}), ensureProfile: async () => ({ error: null }), signOut: async () => {},
    isVerifiedUser, subscribe: f.subscribe, onState: s => states.push(s), schedule: t => tasks.push(t),
  })
  controller.start()
  const out = queue.run(() => f.auth.signOut()); await flush()
  const inB = queue.run(() => f.auth.signInWithPassword('b')); await flush()
  await f.release('signOut')        // SIGNED_OUT emitted
  await f.release('signIn')         // SIGNED_IN b emitted
  await Promise.all([out, inB])
  while (tasks.length) { tasks.shift()(); await flush() }
  assert.deepEqual([states.at(-1).status, states.at(-1).user.id], ['signed_in', 'b'])
  assert.equal(f.stored().user.id, 'b')
})

test('every auth mutation in the app goes through the coordinator (source guard)', () => {
  const root = new URL('../app/', import.meta.url).pathname
  const offenders = []
  const walk = dir => { for (const entry of fs.readdirSync(dir)) {
    const full = `${dir}/${entry}`
    if (fs.statSync(full).isDirectory()) { walk(full); continue }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    const source = fs.readFileSync(full, 'utf8')
    if (/\.auth\.(signIn\w*|signUp|signOut|setSession|refreshSession|exchangeCodeForSession|verifyOtp|updateUser)\(/.test(source) && !full.endsWith('/lib/identity.ts') && !full.endsWith('/lib/passwordRecovery.ts')) offenders.push(full)
  } }
  walk(root.replace(/\/$/, ''))
  assert.deepEqual(offenders, [])
  // The one allowed exception drives an isolated, in-memory recovery client — never the app's session.
  const recovery = fs.readFileSync(new URL('../app/lib/passwordRecovery.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(recovery, /from '\.\.?\/(\.\.\/)?supabase'|from '\.\/identity'/)
  assert.match(recovery, /persistSession: false/)
  const identity = fs.readFileSync(new URL('../app/lib/identity.ts', import.meta.url), 'utf8')
  for (const call of ['signInWithPassword', 'signUp', 'signInWithOtp', 'signInWithOAuth', 'signOut']) {
    assert.match(identity, new RegExp(`mutate\\(\\(\\) => supabase\\.auth\\.${call}\\(`), call)
  }
  // The only direct queue use is the shared `mutate` helper; the scoped sign-out queues itself exactly once.
  assert.equal((identity.match(/authMutations\.run\(/g) ?? []).length, 1)
  assert.match(identity, /createSessionScopedSignOut\(authMutations, supabase\.auth\)/)
})

// Runs the REAL identity.ts (transpiled) against a fake supabase and the real coordinator, with controllable timers.
function loadIdentity(authImpl) {
  const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const compile = path => ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const timers = []
  const modules = {}
  const requireShim = name => {
    if (name === '../supabase') return { supabase: { auth: authImpl } }
    if (name === './authMutationCoordinator') return modules.coordinator
    if (name === './emailVerification') return modules.verification
    if (name === './passwordRecovery') return { RESET_REDIRECT_URL: 'https://reset.example' }
    throw new Error(`unexpected import ${name}`)
  }
  const evaluate = (path, extra = {}) => { const exports = {}; vm.runInNewContext(compile(path), { exports, require: requireShim, setTimeout: fn => { timers.push(fn); return timers.length }, clearTimeout() {}, Promise, Error, ...extra }); return exports }
  modules.coordinator = evaluate('app/lib/authMutationCoordinator.ts')
  modules.verification = evaluate('app/lib/emailVerification.ts')
  const identity = evaluate('app/lib/identity.ts')
  return { identity, fireTimers: () => timers.splice(0).forEach(fire => fire()) }
}

test('identity.ts: while A\'s signOut is unresolved past the wait limit, B\'s sign-in is refused as an auth error and never reaches Supabase', async () => {
  const f = fakeAuth(sess('a'))
  const { identity, fireTimers } = loadIdentity({ ...f.auth, signUp: async () => { throw new Error('unused') } })
  const out = identity.signOut(); await flush()
  const inB = identity.signInWithPassword('b', 'pw'); await flush()
  fireTimers(); await flush()
  const refused = await inB
  assert.equal(refused.error.name, 'AuthMutationBusyError')
  assert.deepEqual([refused.data.session, refused.data.user], [null, null])
  assert.equal(f.log.includes('signIn:b:start'), false)
  const scopedP = identity.signOutSession('a'); await flush(); fireTimers(); await flush()   // also refused, not thrown, not run
  const scoped = await scopedP
  assert.equal(scoped.skipped, true); assert.equal(scoped.error.name, 'AuthMutationBusyError')
  await f.release('signOut'); await out
  assert.equal(f.stored(), null)
})

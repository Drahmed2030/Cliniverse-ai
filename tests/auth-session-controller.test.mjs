import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Real behaviour tests: the controller and the verification rule are transpiled from the app source
// and run against controllable fakes (deferred Supabase results, manual scheduler).
function load(path) {
  const source = fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, setTimeout, Error, Promise })
  return exports
}
const { createAuthSessionController } = load('app/lib/authSessionController.ts')
const { isVerifiedUser } = load('app/lib/emailVerification.ts')

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve() }
const user = (id, extra = {}) => ({ id, email: `${id}@x.test`, email_confirmed_at: '2026-01-01', app_metadata: { provider: 'email' }, ...extra })
const session = u => ({ user: u })

function harness({ verified = isVerifiedUser } = {}) {
  const states = []
  const calls = { getSession: 0, ensureProfile: 0, signOut: 0, signOutIds: [] }
  const profile = []      // pending ensureProfile deferreds, in call order
  const restoreD = deferred()
  const tasks = []
  let listener = null
  let unsubscribed = 0
  const controller = createAuthSessionController({
    getSession: () => { calls.getSession++; return restoreD.promise },
    ensureProfile: () => { calls.ensureProfile++; const d = deferred(); profile.push(d); return d.promise },
    signOut: async id => { calls.signOut++; calls.signOutIds.push(id) },
    isVerifiedUser: verified,
    subscribe: cb => { listener = cb; return { unsubscribe: () => { unsubscribed++ } } },
    onState: s => states.push(s),
    schedule: task => tasks.push(task),
  })
  const runTasks = async () => { while (tasks.length) tasks.shift()(); await flush() }
  const last = () => states[states.length - 1]
  const everSignedInAs = id => states.some(s => s.status === 'signed_in' && s.user.id === id)
  return { controller, states, calls, profile, restoreD, tasks, runTasks, last, everSignedInAs, event: (name, s) => listener(name, s), unsubscribed: () => unsubscribed }
}

test('restore of a verified session bootstraps the profile once and signs in', async () => {
  const h = harness(); h.controller.start()
  h.restoreD.resolve({ data: { session: session(user('a')) }, error: null }); await flush()
  assert.equal(h.last().status, 'loading')
  h.profile[0].resolve({ error: null }); await flush()
  assert.deepEqual([h.last().status, h.last().user.id], ['signed_in', 'a'])
  assert.equal(h.calls.ensureProfile, 1)
})

test('logout while the profile is loading never ends in signed_in', async () => {
  const h = harness(); h.controller.start()
  h.restoreD.resolve({ data: { session: session(user('a')) }, error: null }); await flush()
  h.event('SIGNED_OUT', null)                       // user signs out while the profile request is in flight
  assert.equal(h.last().status, 'signed_out')       // applied synchronously
  await h.runTasks()
  h.profile[0].resolve({ error: null }); await flush()   // the stale profile result arrives late
  assert.equal(h.last().status, 'signed_out')
  assert.equal(h.everSignedInAs('a'), false)
})

test('switching account A to B: the late profile result for A cannot grant access, B ends signed in', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); await h.runTasks()
  h.event('SIGNED_IN', session(user('b')))
  assert.equal(h.last().status, 'loading', 'A is not shown while B is resolving')
  await h.runTasks()
  h.profile[1].resolve({ error: null }); await flush()
  h.profile[0].resolve({ error: null }); await flush()   // A resolves last
  assert.deepEqual([h.last().status, h.last().user.id], ['signed_in', 'b'])
  assert.equal(h.everSignedInAs('a'), false)
})

test('a delayed restore result cannot override a newer auth event', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_OUT', null); await h.runTasks()
  h.restoreD.resolve({ data: { session: session(user('a')) }, error: null }); await flush()
  assert.equal(h.last().status, 'signed_out')
  assert.equal(h.calls.ensureProfile, 0)
})

test('a delayed restore error cannot override a newer signed-in state', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); await h.runTasks(); h.profile[0].resolve({ error: null }); await flush()
  h.restoreD.resolve({ data: { session: null }, error: new Error('late') }); await flush()
  assert.deepEqual([h.last().status, h.last().user.id], ['signed_in', 'a'])
})

test('dispose (unmount) during restore or profile load emits nothing and unsubscribes', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); await h.runTasks()
  const before = h.states.length
  h.controller.dispose()
  h.profile[0].resolve({ error: null }); h.restoreD.resolve({ data: { session: session(user('a')) }, error: null }); await flush()
  assert.equal(h.states.length, before)
  assert.equal(h.unsubscribed(), 1)
})

test('a scheduled task invalidated before it runs starts NO profile work (logout, switch, dispose, newer event)', async () => {
  // logout between the event and its scheduled task
  let h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); h.event('SIGNED_OUT', null)
  await h.runTasks()
  assert.deepEqual([h.calls.ensureProfile, h.calls.signOut], [0, 0])
  assert.equal(h.last().status, 'signed_out')
  // account switch: only B's task may start profile work
  h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); h.event('SIGNED_IN', session(user('b')))
  await h.runTasks()
  assert.equal(h.calls.ensureProfile, 1)
  h.profile[0].resolve({ error: null }); await flush()
  assert.deepEqual([h.last().status, h.last().user.id], ['signed_in', 'b'])
  // dispose before the task executes
  h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); h.controller.dispose()
  await h.runTasks()
  assert.deepEqual([h.calls.ensureProfile, h.calls.signOut], [0, 0])
  // a restore result that arrives after a newer event
  h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('b'))); await h.runTasks()
  h.restoreD.resolve({ data: { session: session(user('a')) }, error: null }); await flush()
  assert.equal(h.calls.ensureProfile, 1, 'only B bootstraps')
  // a stale unverified task starts no signOut either
  h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('u', { email_confirmed_at: null }))); h.event('SIGNED_OUT', null)
  await h.runTasks()
  assert.equal(h.calls.signOut, 0)
})

test('a stale task touches nothing at entry: not even the verification rule is evaluated', async () => {
  let evaluated = 0
  const h = harness({ verified: u => { evaluated++; return isVerifiedUser(u) } }); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); h.event('SIGNED_IN', session(user('b'))); h.event('SIGNED_OUT', null)
  const statesBefore = h.states.length
  await h.runTasks()
  assert.equal(evaluated, 0, 'the two invalidated tasks never evaluated their sessions (the newest is a logout, which needs no check)')
  assert.deepEqual(h.states.slice(statesBefore).map(s => s.status), ['signed_out'], 'only the newest task acted')
  assert.deepEqual([h.calls.ensureProfile, h.calls.signOut], [0, 0])
})

test('automated sign-out is always scoped to the user it decided about', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('u', { email_confirmed_at: null }))); await h.runTasks()
  assert.deepEqual(h.calls.signOutIds, ['u'])
})

test('reviewer scenarios: a confirmed reviewer signs in; an unconfirmed one is denied before any profile call', async () => {
  const ok = harness(); ok.controller.start()
  ok.event('SIGNED_IN', session(user('reviewer', { email: 'reviewer@cliniverseai.com' }))); await ok.runTasks()
  ok.profile[0].resolve({ error: null }); await flush()
  assert.equal(ok.last().status, 'signed_in')
  const denied = harness(); denied.controller.start()
  denied.event('SIGNED_IN', session(user('reviewer', { email: 'reviewer@cliniverseai.com', email_confirmed_at: null }))); await denied.runTasks()
  assert.deepEqual([denied.last().status, denied.calls.ensureProfile], ['signed_out', 0])
})

test('an unverified email/password session is signed out and never reaches the profile or access', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('u', { email_confirmed_at: null }))); await h.runTasks()
  assert.equal(h.last().status, 'signed_out')
  assert.equal(h.calls.ensureProfile, 0)
  assert.equal(h.calls.signOut, 1)
  assert.equal(h.states.some(s => s.status === 'signed_in'), false)
})

test('a stale unverified decision never signs out a newer verified login', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('u', { email_confirmed_at: null })))   // scheduled, not yet run
  h.event('SIGNED_IN', session(user('a')))                                 // newer login
  await h.runTasks()
  assert.equal(h.calls.signOut, 0)
  h.profile[0].resolve({ error: null }); await flush()
  assert.deepEqual([h.last().status, h.last().user.id], ['signed_in', 'a'])
})

test('the auth-state callback is synchronous and calls no Supabase API until it is scheduled', async () => {
  const h = harness(); h.controller.start()
  const getSessionBefore = h.calls.getSession
  const returned = h.event('SIGNED_IN', session(user('a')))
  assert.equal(returned, undefined, 'callback returns nothing awaitable')
  assert.deepEqual([h.calls.getSession - getSessionBefore, h.calls.ensureProfile, h.calls.signOut], [0, 0, 0])
  assert.equal(h.tasks.length, 1, 'follow-up work is deferred out of the callback')
  await h.runTasks()
  assert.equal(h.calls.ensureProfile, 1)
})

test('event storm: refreshes of a ready user do not re-bootstrap; the last event wins', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); await h.runTasks(); h.profile[0].resolve({ error: null }); await flush()
  for (let i = 0; i < 50; i++) h.event('TOKEN_REFRESHED', session(user('a')))
  await h.runTasks()
  assert.equal(h.calls.ensureProfile, 1)
  assert.equal(h.last().status, 'signed_in')
  for (let i = 0; i < 20; i++) h.event('SIGNED_IN', session(user(i % 2 ? 'a' : 'b')))   // ends on 'a'
  h.event('SIGNED_OUT', null)
  await h.runTasks()
  for (const d of h.profile) d.resolve({ error: null })
  await flush()
  assert.equal(h.last().status, 'signed_out', 'the final event (logout) wins over every pending profile')
})

test('a profile failure is shown as an error, and a stale failure after logout is ignored', async () => {
  const h = harness(); h.controller.start()
  h.event('SIGNED_IN', session(user('a'))); await h.runTasks(); h.profile[0].resolve({ error: new Error('x') }); await flush()
  assert.equal(h.last().status, 'error')
  const g = harness(); g.controller.start()
  g.event('SIGNED_IN', session(user('a'))); await g.runTasks()
  g.event('SIGNED_OUT', null); await g.runTasks()
  g.profile[0].resolve({ error: new Error('late') }); await flush()
  assert.equal(g.last().status, 'signed_out')
})

test('isVerifiedUser: email accounts need email_confirmed_at, OAuth identities are provider-verified', () => {
  assert.equal(isVerifiedUser(user('a')), true)
  assert.equal(isVerifiedUser(user('a', { email_confirmed_at: null })), false)
  assert.equal(isVerifiedUser({ id: 'a', email_confirmed_at: null }), false)
  assert.equal(isVerifiedUser(user('a', { email_confirmed_at: null, app_metadata: { provider: 'apple' } })), true)
  assert.equal(isVerifiedUser(user('a', { email_confirmed_at: null, app_metadata: { provider: 'google' } })), true)
})

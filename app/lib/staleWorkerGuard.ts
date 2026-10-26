// Runs on the password-recovery page BEFORE it reads or uses the recovery tokens in the URL fragment.
//
// Problem: an older Cliniverse service worker (it cached every GET, including Supabase responses) may still be
// controlling this origin when the user opens the reset link for the first time. Cleaning its caches is not
// enough — while it controls the page it would see, store and replay the page's own requests. A page cannot opt
// out of its controlling worker, but a NEW navigation is not controlled once the registration is removed.
//
// So: ask every active worker for its version (current workers answer, older ones never do); if any answers wrong
// or not at all, unregister it, delete the Cliniverse caches, VERIFY they are gone, and reload this page once with
// its fragment intact. No request that carries the tokens is made before that.
//
// Fail-closed rules (each one has a test):
//  - The check is only trusted if nothing changed while it ran: a `controllerchange` event, a different
//    controller object or a different set of active workers between the start and the end of an evaluation
//    discards that evaluation and starts again (a bounded number of times, then 'blocked').
//  - WORKER IDENTITY IS CAPTURED, NOT LOOKED UP LATER. `registration.active` is a live property: the same
//    registration object can start pointing at a different worker. Each evaluation therefore records the actual
//    active worker object of every registration at the moment it is enumerated, probes those objects, enumerates
//    again and compares the recorded identities with what is there now.
//  - After a 'clean' result the caller must confirm, immediately before using the tokens: `stillCurrent()` (synchronous:
//    epoch, controller and each captured registration still point at the captured worker) and `confirm()`
//    (asynchronous: enumerate again; every active worker must be one that was probed as current).
//  - If the registrations cannot be enumerated (rejects, throws, hangs, or returns something that is not a list of
//    registrations) the state is UNVERIFIED, never 'no workers': the result is 'blocked'.
//  - Cache cleanup must be VERIFIED: a delete that rejects or returns false, a cache listing that fails, or any
//    Cliniverse-owned legacy cache still present afterwards is NOT clean ('blocked'). The same check runs again on
//    the next load, so a deletion that did not survive the reload also blocks. Only Cliniverse-named caches
//    (/^cliniverse/i, other than the current one) are ever touched.
//  - One reload only (marker query); a stale or dirty state after it is 'blocked'.
//  - Nothing is done once the caller has cancelled (page left / superseded run): 'cancelled'.
//
// Limits: this needs the page's own scripts to run. If an old worker serves an old cached shell for this URL while
// the network is down, those scripts are not ours and nothing here can help; the worker upgrade itself covers that.
// A request already started (probe, unregister, cache delete) is not cancelled, only its consequences are.

export const EXPECTED_WORKER_VERSION = 'cliniverse-static-v4' // must equal CACHE in public/sw.js
export const RELOAD_MARKER = 'swclean'
const MAX_ATTEMPTS = 4

export type GuardResult = 'clean' | 'reloading' | 'blocked' | 'cancelled'

interface PostingWorker {
  postMessage: (message: unknown, transfer: Transferable[]) => void
}
interface RegistrationLike {
  active: (PostingWorker & object) | null
  unregister: () => Promise<boolean>
}
export interface GuardEnv {
  serviceWorker?: {
    controller: (PostingWorker & object) | null
    getRegistrations: () => Promise<readonly RegistrationLike[]>
    addEventListener?: (type: 'controllerchange', listener: () => void) => void
    removeEventListener?: (type: 'controllerchange', listener: () => void) => void
  }
  caches?: { keys: () => Promise<string[]>; delete: (name: string) => Promise<boolean> }
  location: { pathname: string; search: string; hash: string; replace: (url: string) => void }
  isCancelled?: () => boolean
  maxAttempts?: number
  enumerateTimeoutMs?: number
  probeTimeoutMs?: number
  createChannel?: () => { port1: { onmessage: ((event: { data?: { version?: string } }) => void) | null }; port2: unknown }
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

function probe(worker: PostingWorker, env: GuardEnv): Promise<string | null> {
  return new Promise(resolve => {
    const setTimer = env.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
    const clearTimer = env.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>))
    let settled = false
    const finish = (value: string | null) => { if (!settled) { settled = true; clearTimer(timer); resolve(value) } }
    const timer = setTimer(() => finish(null), env.probeTimeoutMs ?? 600)
    try {
      const channel = (env.createChannel ?? (() => new MessageChannel() as never))()
      channel.port1.onmessage = event => finish(typeof event.data?.version === 'string' ? event.data.version : null)
      worker.postMessage({ type: 'cliniverse-sw-version' }, [channel.port2 as Transferable])
    } catch {
      finish(null)
    }
  })
}

const isOwnedLegacyCache = (name: string) => /^cliniverse/i.test(name) && name !== EXPECTED_WORKER_VERSION

type CacheState = { listable: true; leftovers: string[] } | { listable: false }
async function inspectCaches(env: GuardEnv): Promise<CacheState> {
  if (!env.caches) return { listable: true, leftovers: [] } // no Cache API ⇒ nothing stored
  try { return { listable: true, leftovers: (await env.caches.keys()).filter(isOwnedLegacyCache) } } catch { return { listable: false } }
}

type Worker = PostingWorker & object
interface Entry { registration: RegistrationLike; worker: Worker | null }
interface Snapshot { entries: Entry[]; controller: Worker | null }
type Evaluation =
  | { stable: false }
  | { stable: true; unverifiable: true }
  | { stable: true; unverifiable: false; snapshot: Snapshot; currentWorkers: Set<Worker>; needsWorkerCleanup: boolean; staleRegistrations: RegistrationLike[]; cache: CacheState }

export function createWorkerGuard(env: GuardEnv) {
  const container = env.serviceWorker
  let epoch = 0
  let clean: { epoch: number; snapshot: Snapshot; currentWorkers: Set<Worker> } | null = null
  const onControllerChange = () => { epoch++ }
  container?.addEventListener?.('controllerchange', onControllerChange)
  const cancelled = () => env.isCancelled?.() === true

  // Enumerate registrations and RECORD the identity of each active worker right now. null = unverifiable.
  async function enumerate(): Promise<Snapshot | null> {
    if (!container) return { entries: [], controller: null }
    try {
      const setTimer = env.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
      const clearTimer = env.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>))
      let timer: unknown
      const timeout = new Promise<null>(resolve => { timer = setTimer(() => resolve(null), env.enumerateTimeoutMs ?? 3000) })
      const list: unknown = await Promise.race([container.getRegistrations(), timeout]).finally(() => clearTimer(timer))
      if (!Array.isArray(list)) return null // hung or not a list: unreliable
      const entries: Entry[] = []
      for (const registration of list as RegistrationLike[]) {
        if (!registration || typeof registration !== 'object' || !('active' in registration)) return null
        entries.push({ registration, worker: registration.active ?? null }) // identity captured at this instant
      }
      return { entries, controller: container.controller ?? null }
    } catch {
      return null
    }
  }

  // Same controller and the same recorded workers (as a multiset); for a registration object present in both,
  // the worker recorded the first time must be the one it points at now.
  function sameSnapshot(a: Snapshot, b: Snapshot) {
    if (a.controller !== b.controller || a.entries.length !== b.entries.length) return false
    const remaining = b.entries.map(entry => entry.worker)
    for (const entry of a.entries) {
      const index = remaining.indexOf(entry.worker)
      if (index < 0) return false
      remaining.splice(index, 1)
    }
    for (const entry of a.entries) {
      const twin = b.entries.find(other => other.registration === entry.registration)
      if (twin && twin.worker !== entry.worker) return false
    }
    return true
  }

  async function evaluate(): Promise<Evaluation> {
    const startEpoch = epoch
    const first = await enumerate()
    if (!first) return { stable: true, unverifiable: true }
    const controller = first.controller
    const currentWorkers = new Set<Worker>()
    const controllerStale = controller ? (await probe(controller, env)) !== EXPECTED_WORKER_VERSION : false
    if (controller && !controllerStale) currentWorkers.add(controller)
    const staleRegistrations: RegistrationLike[] = []
    for (const entry of first.entries) {
      if (!entry.worker) continue // the identity captured at enumeration, not entry.registration.active read later
      const version = entry.worker === controller ? (controllerStale ? null : EXPECTED_WORKER_VERSION) : await probe(entry.worker, env)
      if (version === EXPECTED_WORKER_VERSION) currentWorkers.add(entry.worker)
      else staleRegistrations.push(entry.registration)
    }
    const cache = await inspectCaches(env)
    // Trust the result only if nothing moved while it was being computed: enumerate again and compare identities.
    const second = await enumerate()
    if (!second) return { stable: true, unverifiable: true }
    if (epoch !== startEpoch || !sameSnapshot(first, second)) return { stable: false }
    return { stable: true, unverifiable: false, snapshot: second, currentWorkers, needsWorkerCleanup: controllerStale || staleRegistrations.length > 0, staleRegistrations, cache }
  }

  async function check(): Promise<GuardResult> {
    const attempts = env.maxAttempts ?? MAX_ATTEMPTS
    clean = null
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (cancelled()) return 'cancelled'
      const evaluation = await evaluate()
      if (cancelled()) return 'cancelled'
      if (!evaluation.stable) continue // something changed mid-check: discard and look again
      if (evaluation.unverifiable) return 'blocked' // cannot enumerate the workers: unverified is not "none"

      const dirtyCache = !evaluation.cache.listable || evaluation.cache.leftovers.length > 0
      if (!evaluation.needsWorkerCleanup && !dirtyCache) {
        clean = { epoch, snapshot: evaluation.snapshot, currentWorkers: evaluation.currentWorkers }
        return 'clean'
      }
      if (new URLSearchParams(env.location.search).has(RELOAD_MARKER)) return 'blocked' // already tried once
      if (!evaluation.cache.listable) return 'blocked' // cannot verify the caches: not clean

      await Promise.all(evaluation.staleRegistrations.map(registration => registration.unregister().catch(() => false)))
      if (cancelled()) return 'cancelled'
      await Promise.all(evaluation.cache.leftovers.map(name => env.caches!.delete(name).catch(() => false)))
      if (cancelled()) return 'cancelled'
      // Verify, do not assume: a delete that rejected or returned false leaves the cache here.
      const after = await inspectCaches(env)
      if (!after.listable || after.leftovers.length > 0) return 'blocked'
      if (cancelled()) return 'cancelled'
      // Same path, a non-sensitive marker, and the fragment untouched (it is never sent to a server).
      env.location.replace(`${env.location.pathname}?${RELOAD_MARKER}=1${env.location.hash}`)
      return 'reloading'
    }
    return 'blocked' // never stable
  }

  // Synchronous: nothing moved since the last 'clean' result — no controller change, and every registration that
  // was captured still points at the worker that was captured (live property read, so an in-place change shows).
  const stillCurrent = () => {
    if (!clean || clean.epoch !== epoch || cancelled()) return false
    if ((container ? container.controller ?? null : null) !== clean.snapshot.controller) return false
    return clean.snapshot.entries.every(entry => (entry.registration.active ?? null) === entry.worker)
  }

  // Asynchronous, to be awaited immediately before the recovery session is used: enumerate AGAIN and require that
  // every active worker is one that was probed as current. A worker identity not seen before means: not confirmed.
  async function confirm(): Promise<boolean> {
    if (!clean || cancelled() || !stillCurrent()) return false
    const snapshot = await enumerate()
    if (!snapshot || cancelled() || !clean || !stillCurrent()) return false
    if (snapshot.controller !== clean.snapshot.controller) return false
    return snapshot.entries.every(entry => entry.worker === null || clean!.currentWorkers.has(entry.worker))
  }

  return {
    check,
    stillCurrent,
    confirm,
    dispose: () => container?.removeEventListener?.('controllerchange', onControllerChange),
  }
}

export function ensureNoStaleWorker(env: GuardEnv) {
  const guard = createWorkerGuard(env)
  return guard.check().finally(() => guard.dispose())
}

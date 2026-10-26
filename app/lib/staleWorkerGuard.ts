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
//  - After a 'clean' result the caller must confirm `stillCurrent()` immediately before using the tokens.
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

type Evaluation =
  | { stable: false }
  | { stable: true; needsWorkerCleanup: boolean; staleRegistrations: RegistrationLike[]; cache: CacheState }

export function createWorkerGuard(env: GuardEnv) {
  const container = env.serviceWorker
  let epoch = 0
  let cleanEpoch = -1
  let cleanController: unknown = undefined
  const onControllerChange = () => { epoch++ }
  container?.addEventListener?.('controllerchange', onControllerChange)
  const cancelled = () => env.isCancelled?.() === true

  async function listRegistrations(): Promise<readonly RegistrationLike[] | null> {
    if (!container) return []
    try { return await container.getRegistrations() } catch { return null } // null = unavailable
  }
  const sameActives = (a: readonly RegistrationLike[] | null, b: readonly RegistrationLike[] | null) =>
    a === null || b === null ? a === b : a.length === b.length && a.every((registration, index) => registration.active === b[index].active)

  async function evaluate(): Promise<Evaluation> {
    const startEpoch = epoch
    const controller = container ? container.controller : null
    const first = await listRegistrations()
    const controllerStale = controller ? (await probe(controller, env)) !== EXPECTED_WORKER_VERSION : false
    const staleRegistrations: RegistrationLike[] = []
    for (const registration of first ?? []) {
      const worker = registration.active
      if (!worker) continue
      const version = worker === controller ? (controllerStale ? null : EXPECTED_WORKER_VERSION) : await probe(worker, env)
      if (version !== EXPECTED_WORKER_VERSION) staleRegistrations.push(registration)
    }
    const cache = await inspectCaches(env)
    // Trust the result only if nothing moved while it was being computed.
    const second = await listRegistrations()
    const unchanged = epoch === startEpoch && (container ? container.controller === controller : true) && sameActives(first, second)
    if (!unchanged) return { stable: false }
    return { stable: true, needsWorkerCleanup: controllerStale || staleRegistrations.length > 0, staleRegistrations, cache }
  }

  async function check(): Promise<GuardResult> {
    const attempts = env.maxAttempts ?? MAX_ATTEMPTS
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (cancelled()) return 'cancelled'
      const evaluation = await evaluate()
      if (cancelled()) return 'cancelled'
      if (!evaluation.stable) continue // something changed mid-check: discard and look again

      const dirtyCache = !evaluation.cache.listable || evaluation.cache.leftovers.length > 0
      if (!evaluation.needsWorkerCleanup && !dirtyCache) {
        cleanEpoch = epoch
        cleanController = container ? container.controller : null
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

  return {
    check,
    // True only if no worker change happened since the last 'clean' result. Call right before using the tokens.
    stillCurrent: () => cleanEpoch === epoch && cleanEpoch >= 0 && (container ? container.controller === cleanController : true),
    dispose: () => container?.removeEventListener?.('controllerchange', onControllerChange),
  }
}

export function ensureNoStaleWorker(env: GuardEnv) {
  const guard = createWorkerGuard(env)
  return guard.check().finally(() => guard.dispose())
}

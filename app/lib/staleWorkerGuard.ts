// Runs on the password-recovery page BEFORE it reads or uses the recovery tokens in the URL fragment.
//
// Problem: an older Cliniverse service worker (it cached every GET, including Supabase responses) may still be
// controlling this origin when the user opens the reset link for the first time. Cleaning its caches is not
// enough — while it controls the page it would see, store and replay the page's own requests. A page cannot opt
// out of its controlling worker, but a NEW navigation is not controlled once the registration is removed.
//
// So: ask every active worker for its version (current workers answer, older ones never do); if any answers wrong
// or not at all, unregister it, delete the Cliniverse caches, and reload this page once with its fragment intact.
// No request that carries the tokens is made before that. If an unrecognised worker is still present after the
// reload, the page fails closed ('blocked') and never uses the tokens.
//
// Limits: this needs the page's own scripts to run. If an old worker serves an old cached shell for this URL while
// the network is down, those scripts are not ours and nothing here can help; the worker upgrade itself covers that.

export const EXPECTED_WORKER_VERSION = 'cliniverse-static-v4' // must equal CACHE in public/sw.js
export const RELOAD_MARKER = 'swclean'

export type GuardResult = 'clean' | 'reloading' | 'blocked'

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
  }
  caches?: { keys: () => Promise<string[]>; delete: (name: string) => Promise<boolean> }
  location: { pathname: string; search: string; hash: string; replace: (url: string) => void }
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

export async function ensureNoStaleWorker(env: GuardEnv): Promise<GuardResult> {
  const container = env.serviceWorker
  if (!container) return 'clean'

  // If registrations cannot be listed, only the controlling worker (which is probed directly) can be judged.
  let registrations: readonly RegistrationLike[] = []
  try { registrations = await container.getRegistrations() } catch { registrations = [] }

  const controller = container.controller
  const controllerStale = controller ? (await probe(controller, env)) !== EXPECTED_WORKER_VERSION : false
  const staleRegistrations: RegistrationLike[] = []
  for (const registration of registrations) {
    const worker = registration.active
    if (!worker) continue
    const version = worker === controller ? (controllerStale ? null : EXPECTED_WORKER_VERSION) : await probe(worker, env)
    if (version !== EXPECTED_WORKER_VERSION) staleRegistrations.push(registration)
  }

  if (!controllerStale && staleRegistrations.length === 0) return 'clean'

  if (new URLSearchParams(env.location.search).has(RELOAD_MARKER)) return 'blocked' // already tried once

  await Promise.all(staleRegistrations.map(registration => registration.unregister().catch(() => false)))
  if (env.caches) {
    try {
      const names = await env.caches.keys()
      await Promise.all(names.filter(name => /^cliniverse/i.test(name) && name !== EXPECTED_WORKER_VERSION).map(name => env.caches!.delete(name).catch(() => false)))
    } catch { /* best effort; the next load re-checks */ }
  }
  // Same path, a non-sensitive marker, and the fragment untouched (it is never sent to a server).
  env.location.replace(`${env.location.pathname}?${RELOAD_MARKER}=1${env.location.hash}`)
  return 'reloading'
}

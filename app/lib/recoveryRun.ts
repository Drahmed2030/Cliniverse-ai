// The life cycle of the password-recovery page, kept out of React so it can be tested with fakes.
//
// One "run" = one mount of the page. A run is cancelled when the page is left or superseded (unmount, remount).
// Cancellation guarantees (each has a test):
//  - nothing NEW is started after cancel: no guard side effects, no URL parsing/stripping, no history change,
//    no recovery client, no setSession, no view update;
//  - a request that is already in flight is NOT cancelled (the browser/Supabase client offers no way to do that);
//    only its consequences are dropped. One deliberate exception: once the password update has been sent, the
//    global sign-out that follows still runs, because skipping it would leave other sessions alive.
// The parsed link survives a remount through `linkStore` so the one-shot URL fragment is consumed exactly once.

import { parseRecoveryHash, type RecoveryClient, type RecoveryComplete, type RecoveryLink, type RecoveryStart } from './passwordRecovery'
import type { GuardResult } from './staleWorkerGuard'

export type RecoveryView =
  | { name: 'checking' }
  | { name: 'invalid'; expired: boolean }
  | { name: 'blocked' }
  | { name: 'form'; maskedEmail: string }
  | { name: 'done'; sessionsEnded: boolean }

export interface LinkStore { link: RecoveryLink | null; stripped: boolean }

export interface RecoveryRunDeps {
  makeGuard: (isCancelled: () => boolean) => { check: () => Promise<GuardResult>; stillCurrent: () => boolean; dispose: () => void }
  linkStore: LinkStore
  readHash: () => string
  stripUrl: () => void
  createClient: () => RecoveryClient
  startRecovery: (client: RecoveryClient, link: Extract<RecoveryLink, { kind: 'ready' }>) => Promise<RecoveryStart>
  completeRecovery: (client: RecoveryClient, password: string, confirmation: string) => ReturnType<typeof import('./passwordRecovery').completeRecovery>
  setView: (view: RecoveryView) => void
}

export type SubmitOutcome = Awaited<ReturnType<RecoveryRunDeps['completeRecovery']>> | { status: 'cancelled' } | { status: 'unavailable' }

export function createRecoveryRun(deps: RecoveryRunDeps) {
  let alive = true
  let client: RecoveryClient | null = null
  let submitting = false
  const guard = deps.makeGuard(() => !alive)

  function stripOnce() {
    if (!deps.linkStore.stripped) { deps.stripUrl(); deps.linkStore.stripped = true }
  }

  async function start(): Promise<void> {
    let result = await guard.check()
    // A worker change between the check and the token use invalidates the result; look again (bounded).
    for (let attempt = 0; alive && result === 'clean' && !guard.stillCurrent() && attempt < 3; attempt++) result = await guard.check()
    if (!alive) return
    if (result === 'reloading' || result === 'cancelled') return
    if (result === 'blocked' || !guard.stillCurrent()) {
      stripOnce()
      deps.setView({ name: 'blocked' })
      return
    }
    // ── token use starts here: no await between the confirmation above and the read/strip/create below ──
    if (!deps.linkStore.link) deps.linkStore.link = parseRecoveryHash(deps.readHash())
    stripOnce()
    const link = deps.linkStore.link
    if (link.kind === 'invalid') { deps.setView({ name: 'invalid', expired: link.reason === 'expired' }); return }
    client = deps.createClient()
    const started = await deps.startRecovery(client, link)
    if (!alive) { client = null; return } // the lookup already ran; nothing further is started or shown
    deps.setView(started.status === 'ready' ? { name: 'form', maskedEmail: started.maskedEmail } : { name: 'invalid', expired: false })
  }

  async function submit(password: string, confirmation: string): Promise<SubmitOutcome> {
    if (!alive) return { status: 'cancelled' }
    if (!client || submitting) return { status: 'unavailable' }
    submitting = true
    try {
      const outcome = await deps.completeRecovery(client, password, confirmation)
      if (outcome.status === 'done') client = null
      return alive ? outcome : { status: 'cancelled' }
    } finally {
      submitting = false
    }
  }

  function cancel() {
    alive = false
    client = null
    guard.dispose()
  }

  return { start, submit, cancel, isAlive: () => alive }
}

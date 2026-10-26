// Central coordination of every auth MUTATION (sign-in, sign-up, sign-out) issued by this app.
//
// Why: supabase-js does not make a whole sign-in or sign-out atomic. `signOut()` reads the stored
// session, calls the server, then removes whatever session is stored; `signInWithPassword()` performs
// its token request outside that lock and saves the new session afterwards. A sign-out that is already
// in flight can therefore remove a NEWER account's freshly saved session, and a generation counter in
// the UI cannot cancel a request that has already started.
//
// What this guarantees: all mutations issued through this queue run strictly one after another (a waiter
// that waits too long is refused, never run alongside the one ahead), and a
// session-scoped sign-out re-reads the stored session inside the queue and does nothing unless it is
// still the session it was meant to end. What it does NOT cover: a session changed by something other
// than this app instance (e.g. another browser context sharing storage). The native iOS app is a
// single web view, so no such second context exists there.

export interface QueueOptions {
  // How long a WAITING mutation may wait for the one ahead of it. When it elapses the waiter is refused
  // (AuthMutationBusyError) and never runs. A mutation that has already started is never abandoned and
  // never "timed out": the queue stays closed until it has really settled, because a started Supabase
  // request cannot be cancelled and could otherwise complete after, and wipe, a newer account's session.
  waitTimeoutMs?: number
  setTimer?: (fn: () => void, ms: number) => unknown
  clearTimer?: (handle: unknown) => void
}

export class AuthMutationBusyError extends Error {
  constructor() {
    super('Another sign-in or sign-out is still finishing. Please try again in a moment.')
    this.name = 'AuthMutationBusyError'
  }
}

export function isAuthMutationBusy(error: unknown): error is AuthMutationBusyError {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AuthMutationBusyError'
}

export function createAuthMutationQueue(options: QueueOptions = {}) {
  const waitTimeoutMs = options.waitTimeoutMs ?? 20000
  const setTimer = options.setTimer ?? ((fn, ms) => setTimeout(fn, ms))
  const clearTimer = options.clearTimer ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>))
  // Settles only when the most recently queued mutation has really finished (or its refused slot has
  // passed). It never rejects.
  let tail: Promise<void> = Promise.resolve()

  function run<T>(task: () => Promise<T>): Promise<T> {
    const previous = tail
    let release!: () => void
    tail = new Promise<void>(resolve => { release = resolve })
    return new Promise<T>((resolve, reject) => {
      let started = false
      let refused = false
      const timer = setTimer(() => {
        if (started) return
        refused = true
        reject(new AuthMutationBusyError())
        // Keep this slot in line: whoever is behind us still waits for everything ahead of us.
        previous.then(release)
      }, waitTimeoutMs)
      previous.then(() => {
        if (refused) return
        started = true
        clearTimer(timer)
        let running: Promise<T>
        try { running = task() } catch (error) { running = Promise.reject(error) }
        running.then(resolve, reject).then(release, release)
      })
    })
  }

  return { run }
}

export interface CoordinatedAuth {
  getSession: () => Promise<{ data: { session: { user: { id: string } | null } | null }; error: unknown }>
  signOut: () => Promise<{ error: unknown }>
}

// Ends the stored session only if it still belongs to `expectedUserId`.
export function createSessionScopedSignOut(queue: ReturnType<typeof createAuthMutationQueue>, auth: CoordinatedAuth) {
  return function signOutSession(expectedUserId: string) {
    return queue.run(async () => {
      const { data, error } = await auth.getSession()
      // If the stored session cannot be read, do not guess: leave it (the gate already treats it as signed out).
      if (error) return { skipped: true, error }
      if (data.session?.user?.id !== expectedUserId) return { skipped: true, error: null }
      const result = await auth.signOut()
      return { skipped: false, error: result.error ?? null }
    })
  }
}

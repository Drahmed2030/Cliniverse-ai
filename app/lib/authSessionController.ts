// Framework-free session resolution for AuthGate. It owns every ordering rule that keeps a stale
// asynchronous result (session restore, profile bootstrap, sign-out) from granting access:
//  - each trigger (restore, auth event, dispose) takes a new monotonic generation;
//  - a result is applied only if its generation is still the newest;
//  - the auth-state callback itself is synchronous and calls no Supabase API — follow-up work is
//    scheduled outside the callback;
//  - a different user always passes through "loading" before they can reach "signed_in".

export interface ControllerUser {
  id: string
  email?: string | null
  email_confirmed_at?: string | null
  app_metadata?: { provider?: string }
}

export interface ControllerSession<U extends ControllerUser = ControllerUser> {
  user: U | null
}

export type ControllerState<U extends ControllerUser = ControllerUser> =
  | { status: 'loading'; user: null }
  | { status: 'signed_out'; user: null }
  | { status: 'signed_in'; user: U }
  | { status: 'error'; user: null; message: string }

export interface ControllerDeps<U extends ControllerUser> {
  getSession: () => Promise<{ data: { session: ControllerSession<U> | null }; error: unknown }>
  ensureProfile: () => Promise<{ error: unknown }>
  // Must end only the session of `userId` (see authMutationCoordinator); never a newer account's.
  signOut: (userId: string) => Promise<unknown>
  isVerifiedUser: (user: U) => boolean
  subscribe: (callback: (event: string, session: ControllerSession<U> | null) => void) => { unsubscribe: () => void }
  onState: (state: ControllerState<U>) => void
  // Defers work out of the auth-state callback. Defaults to setTimeout(0).
  schedule?: (task: () => void) => void
}

export function createAuthSessionController<U extends ControllerUser>(deps: ControllerDeps<U>) {
  const schedule = deps.schedule ?? (task => { setTimeout(task, 0) })
  let generation = 0
  let disposed = false
  let readyUserId: string | null = null
  let started = false
  let subscription: { unsubscribe: () => void } | null = null

  const current = (mine: number) => !disposed && mine === generation

  function emit(mine: number, state: ControllerState<U>) {
    if (current(mine)) deps.onState(state)
  }

  async function resolve(mine: number, session: ControllerSession<U> | null) {
    // A scheduled task that was invalidated before it ran (logout, account switch, dispose, newer event)
    // must do nothing at all: no state change and, above all, no side effect.
    if (!current(mine)) return
    const user = session?.user ?? null
    if (!user) {
      readyUserId = null
      emit(mine, { status: 'signed_out', user: null })
      return
    }
    if (!deps.isVerifiedUser(user)) {
      readyUserId = null
      emit(mine, { status: 'signed_out', user: null })
      if (!current(mine)) return
      try { await deps.signOut(user.id) } catch { /* the state is already signed_out */ }
      return
    }
    if (readyUserId === user.id) {
      // Same verified user (token refresh / user update): nothing to bootstrap again.
      emit(mine, { status: 'signed_in', user })
      return
    }
    readyUserId = null
    emit(mine, { status: 'loading', user: null })
    if (!current(mine)) return
    let profileError: unknown
    try { profileError = (await deps.ensureProfile()).error } catch (error) { profileError = error || new Error('profile') }
    // The request cannot be cancelled once started; its result is simply never allowed to grant access.
    if (!current(mine)) return
    if (profileError) {
      emit(mine, { status: 'error', user: null, message: 'Unable to prepare your profile.' })
      return
    }
    readyUserId = user.id
    emit(mine, { status: 'signed_in', user })
  }

  async function restore() {
    const mine = ++generation
    let result: Awaited<ReturnType<ControllerDeps<U>['getSession']>>
    try { result = await deps.getSession() } catch { result = { data: { session: null }, error: new Error('session') } }
    if (!current(mine)) return
    if (result.error) {
      emit(mine, { status: 'error', user: null, message: 'Unable to restore your session.' })
      return
    }
    await resolve(mine, result.data.session)
  }

  function start() {
    if (started || disposed) return
    started = true
    // Synchronous on purpose: no await, no Supabase call. Supabase can deadlock when its own
    // client is awaited inside this callback.
    subscription = deps.subscribe((_event, session) => {
      const mine = ++generation
      const incomingId = session?.user?.id ?? null
      if (!incomingId) { readyUserId = null; deps.onState({ status: 'signed_out', user: null }) }
      else if (incomingId !== readyUserId) { readyUserId = null; deps.onState({ status: 'loading', user: null }) }
      schedule(() => { void resolve(mine, session) })
    })
    void restore()
  }

  function dispose() {
    disposed = true
    generation++
    subscription?.unsubscribe()
    subscription = null
  }

  return { start, dispose }
}

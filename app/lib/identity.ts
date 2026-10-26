import { supabase } from '../supabase'
import { RESET_REDIRECT_URL } from './passwordRecovery'
import { createAuthMutationQueue, createSessionScopedSignOut, isAuthMutationBusy } from './authMutationCoordinator'

export type CliniverseAuthProvider = 'apple' | 'google'

// Every sign-in, sign-up and sign-out in the app goes through this queue (guarded by a source test).
const authMutations = createAuthMutationQueue()
const signOutIfSession = createSessionScopedSignOut(authMutations, supabase.auth)

// When another mutation is still unresolved past the wait limit, the request is refused as an ordinary
// auth error (callers already surface `error`); it is never run alongside the pending one.
async function mutate<T>(task: () => Promise<T>, refused: (error: Error) => T): Promise<T> {
  try {
    return await authMutations.run(task)
  } catch (error) {
    if (isAuthMutationBusy(error)) return refused(error)
    throw error
  }
}
const noSession = (error: Error) => ({ data: { user: null, session: null }, error }) as never

export async function signInWithPassword(email: string, password: string) {
  return mutate(() => supabase.auth.signInWithPassword({ email, password }), noSession)
}

export async function signUpWithPassword(email: string, password: string, redirectTo?: string) {
  return mutate(() => supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  }), noSession)
}

export { isVerifiedUser } from './emailVerification'

// Sends the recovery email only; it does not create, change or end any session, so it is not queued.
// The redirect is a fixed, allow-listed URL — never derived from the current page.
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_REDIRECT_URL })
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  return mutate(() => supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
    },
  }), noSession)
}

export async function signInWithOAuth(provider: CliniverseAuthProvider, redirectTo?: string) {
  return mutate(() => supabase.auth.signInWithOAuth({
    provider,
    options: redirectTo ? { redirectTo } : undefined,
  }), error => ({ data: { provider, url: null }, error }) as never)
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export async function getCurrentUser() {
  return supabase.auth.getUser()
}

export async function requireCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return { user: null, error }
  if (!data.user) return { user: null, error: new Error('No authenticated user') }
  return { user: data.user, error: null }
}

export function subscribeToAuthState(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function deleteCurrentAccount() {
  return supabase.functions.invoke('delete-account', {
    body: { confirmation: 'DELETE' },
  })
}

// Explicit user sign-out (Me, after account deletion): ends whatever session is current when it runs.
export async function signOut() {
  return mutate(() => supabase.auth.signOut(), error => ({ error }) as never)
}

// Automated clean-up of a specific session (unverified email, stale gate decision): never ends a different,
// newer account's session.
export async function signOutSession(expectedUserId: string) {
  // signOutIfSession already runs inside the mutation queue; do not queue it a second time.
  try {
    return await signOutIfSession(expectedUserId)
  } catch (error) {
    if (isAuthMutationBusy(error)) return { skipped: true, error }
    throw error
  }
}

// Client-side defense in depth only. `email_confirmed_at` is set by Supabase Auth; if the project's
// "Confirm email" setting is OFF, Supabase marks new addresses confirmed implicitly, so this check
// does NOT prove inbox ownership. Trusted enforcement is the Supabase Auth "Confirm email" setting
// (to be verified ON by an authorized operator) plus server-side authorization. OAuth identities
// (Apple/Google) are verified by their provider and are not held to the email check.
export function isVerifiedUser(user: { email_confirmed_at?: string | null; app_metadata?: { provider?: string } }) {
  const provider = user.app_metadata?.provider
  if (provider && provider !== 'email') return true
  return Boolean(user.email_confirmed_at)
}

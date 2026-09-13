/** Server policy for the explicitly authorized review account. No admin privileges. */
export function reviewerFeatureAccess(environment: string | undefined, user: { id: string; email?: string; email_confirmed_at?: string } | null) {
  return environment === 'preview' && user?.id === 'a14514a7-620b-4add-adee-9583935438fd'
    && user.email?.toLowerCase() === 'reviewer@cliniverseai.com' && Boolean(user.email_confirmed_at)
}

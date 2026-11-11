import { createClient } from '@supabase/supabase-js'
import { handleAccountDeletion } from './handler.mjs'

export function POST(request: Request) {
  // Construct the privileged client only after the request supplies a token.
  const getClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) throw new Error('Account deletion is not configured')
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  }
  let client: ReturnType<typeof getClient> | undefined
  const admin = () => (client ??= getClient())

  // Only allowlisted provider codes and numeric HTTP statuses reach logs.
  const reportFailure = (error: unknown) => {
    const source = error && typeof error === 'object' ? error as { code?: unknown; status?: unknown } : {}
    const allowed = ['bad_jwt', 'user_not_found', '23503', '42501', 'PGRST202']
    const code = typeof source.code === 'string' && allowed.includes(source.code) ? source.code : 'UNKNOWN'
    const status = typeof source.status === 'number' && Number.isInteger(source.status) && source.status >= 400 && source.status <= 599 ? source.status : 500
    console.error('account_deletion_failed', { code, status })
  }

  return handleAccountDeletion(request, {
    onFailure: reportFailure,
    async verify(token) {
      const { data, error } = await admin().auth.getUser(token)
      if (error) {
        if ([401, 403].includes(error.status ?? 0) || error.code === 'bad_jwt' || error.code === 'user_not_found') {
          return null
        }
        throw error
      }
      return data.user?.id ?? null
    },
    async cleanupReady() {
      const { data, error } = await admin().rpc('cliniverse_account_cleanup_ready')
      if (error) reportFailure(error)
      return !error && data === true
    },
    async deleteUser(id) {
      const { error } = await admin().auth.admin.deleteUser(id, false)
      if (error) throw error
    },
  })
}

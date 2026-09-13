import { supabase } from '../../supabase'

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' }
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') {
    return Response.json({ allowed: false }, { status: 404, headers })
  }
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return Response.json({ allowed: false }, { status: 401, headers })
  const { data, error } = await supabase.auth.getUser(token)
  const allowed = !error && data.user?.email === 'reviewer@cliniverseai.com' && Boolean(data.user.email_confirmed_at)
  return Response.json({ allowed }, { status: allowed ? 200 : 403, headers })
}

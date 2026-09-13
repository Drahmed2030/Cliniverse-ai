import { supabase } from '../../supabase'
import { reviewerFeatureAccess } from '../../lib/reviewerFeatureAccess'

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' }
  if (process.env.VERCEL_ENV !== 'preview') return Response.json({ allowed: false }, { status: 404, headers })
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return Response.json({ allowed: false }, { status: 401, headers })
  try {
    const { data, error } = await supabase.auth.getUser(token)
    const allowed = !error && reviewerFeatureAccess(process.env.VERCEL_ENV, data.user)
    return Response.json({ allowed }, { status: allowed ? 200 : 403, headers })
  } catch {
    return Response.json({ allowed: false }, { status: 503, headers })
  }
}

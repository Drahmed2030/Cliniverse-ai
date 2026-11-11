import { isDeletionConfirmed } from '../../../lib/account-deletion-confirmation.mjs'

/** @param {number} status @param {string} error */
function failure(status, error) {
  return Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * @param {Request} request
 * @param {{
 *   verify: (token: string) => Promise<string | null>,
 *   cleanupReady: () => Promise<boolean>,
 *   deleteUser: (id: string) => Promise<void>,
 *   onFailure?: (error: unknown) => void,
 * }} dependencies
 */
export async function handleAccountDeletion(request, dependencies) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([^\s,]+)$/i)?.[1]
  if (!token) return failure(401, 'Sign in to delete your account.')

  try {
    const userId = await dependencies.verify(token)
    if (!userId) return failure(401, 'Sign in to delete your account.')

    if (new URL(request.url).search) {
      return failure(403, 'Account selection is not allowed.')
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return failure(400, 'Account deletion must be confirmed.')
    }
    if (Object.keys(body).some(key => key !== 'confirmation')) {
      return failure(403, 'Account selection is not allowed.')
    }
    if (!isDeletionConfirmed(body.confirmation)) {
      return failure(400, 'Account deletion must be confirmed.')
    }

    if (!(await dependencies.cleanupReady())) {
      return failure(503, 'Account deletion is temporarily unavailable.')
    }

    await dependencies.deleteUser(userId)
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    dependencies.onFailure?.(error)
    return failure(500, 'Unable to delete your account. Please try again.')
  }
}

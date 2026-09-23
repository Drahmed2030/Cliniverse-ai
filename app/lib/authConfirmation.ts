export type EmailConfirmationRequest =
  | { state: 'ready'; tokenHash: string }
  | { state: 'invalid' }

export function parseEmailConfirmationRequest(search: string): EmailConfirmationRequest {
  const params = new URLSearchParams(search)
  const tokenHash = (params.get('token_hash') ?? '').trim()
  const type = params.get('type')
  if (!tokenHash || type !== 'email') return { state: 'invalid' }
  return { state: 'ready', tokenHash }
}

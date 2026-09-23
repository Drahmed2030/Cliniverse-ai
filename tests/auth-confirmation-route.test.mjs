import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseEmailConfirmationRequest } from '../app/lib/authConfirmation.ts'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('confirmation request accepts only a non-empty email token hash', () => {
  assert.deepEqual(parseEmailConfirmationRequest('?token_hash=abc123&type=email'), { state: 'ready', tokenHash: 'abc123' })
  assert.deepEqual(parseEmailConfirmationRequest('?token_hash=%20abc123%20&type=email'), { state: 'ready', tokenHash: 'abc123' })
  for (const search of ['', '?type=email', '?token_hash=abc123', '?token_hash=abc123&type=invite', '?token_hash=%20&type=email']) {
    assert.deepEqual(parseEmailConfirmationRequest(search), { state: 'invalid' })
  }
})

test('identity verifies the token hash through Supabase Auth without custom session authority', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /export async function confirmEmailToken\(tokenHash: string\)/)
  assert.match(identity, /supabase\.auth\.verifyOtp\(\{ token_hash: tokenHash, type: 'email' \}\)/)
  assert.doesNotMatch(identity, /confirmEmailToken[\s\S]{0,240}localStorage/)
})

test('branded confirmation route fails closed and never exposes raw provider errors or URLs', () => {
  const page = read('app/auth/confirm/page.tsx')
  assert.match(page, /parseEmailConfirmationRequest\(window\.location\.search\)/)
  assert.match(page, /error \|\| !data\.user \|\| !data\.session/)
  assert.match(page, /Confirmation link unavailable/)
  assert.match(page, /Email confirmed/)
  assert.match(page, /Continue to Cliniverse/)
  assert.doesNotMatch(page, /error\.message|supabase\.co|project-ref|token_hash.*\{request\.tokenHash\}/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('Me exposes a real in-app account deletion flow', () => {
  const me = read('app/components/release/MeHub.tsx')
  const action = read('app/components/auth/DeleteAccountAction.tsx')
  assert.match(me, /DeleteAccountAction/)
  assert.match(action, /Delete account/)
  assert.match(action, /Type DELETE to confirm/)
  assert.match(action, /Permanently delete/)
  assert.match(action, /does not cancel an App Store subscription/)
  assert.match(action, /deleteCurrentAccount/)
})

test('client deletion invokes the protected Edge Function without embedding admin credentials', () => {
  const identity = read('app/lib/identity.ts')
  assert.match(identity, /functions\.invoke\('delete-account'/)
  assert.match(identity, /confirmation: 'DELETE'/)
  assert.doesNotMatch(identity, /service_role|SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i)
})

test('server deletion verifies the caller and cleans non-cascading user data before Auth deletion', () => {
  const source = read('supabase/functions/delete-account/index.ts')
  assert.match(source, /auth\.getUser\(token\)/)
  assert.match(source, /confirmation !== "DELETE"/)
  for (const table of ['profiles','ecg_competency_attempts','exam_usage','case_completions','leaderboard','mcq_answers','user_activity','user_progress','feedback','app_errors']) {
    assert.ok(source.includes(`table: "${table}"`), table)
  }
  assert.match(source, /auth\.admin\.deleteUser\(user\.id\)/)
  assert.doesNotMatch(source, /deleteUser\([^u]|user_id.*payload|email.*payload/)
})

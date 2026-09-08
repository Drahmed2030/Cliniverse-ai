import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const SQL_URL = new URL('../docs/governance/EVIDENCE_LEDGER_PRIVATE_RPC_DRAFT.sql', import.meta.url)
const sql = await readFile(SQL_URL, 'utf8')

function requireSql(fragment) {
  assert.ok(sql.includes(fragment), `Expected private RPC SQL draft to contain: ${fragment}`)
}

test('draft remains non-applied and keeps governance storage private', () => {
  requireSql('DRAFT ONLY — DO NOT APPLY WITHOUT EXPLICIT RELEASE AUTHORIZATION')
  requireSql('revoke all on schema governance from public, anon, authenticated')
  requireSql('revoke all on table governance.evidence_ledger_events from public, anon, authenticated')
})

test('only narrow api RPC surface is defined', () => {
  requireSql('api.governance_ledger_find_event')
  requireSql('api.governance_ledger_append_event')
  requireSql('api.governance_ledger_list_subject')
  assert.equal(sql.includes('governance_ledger_update'), false)
  assert.equal(sql.includes('governance_ledger_delete'), false)
})

test('RPCs use invoker security with hardened search path', () => {
  requireSql('security invoker')
  requireSql('set search_path = pg_catalog, governance, pg_temp')
  assert.equal(sql.includes('security definer'), false)
})

test('client execution is revoked and service role is explicit', () => {
  requireSql('from public, anon, authenticated')
  requireSql('to service_role')
  requireSql('grant execute on function api.governance_ledger_find_event(text) to service_role')
})

test('subject list is product scoped, ordered, and bounded', () => {
  requireSql('e.product = p_product')
  requireSql('e.subject_id = p_subject_id')
  requireSql('p_limit < 1 or p_limit > 500')
  requireSql('order by e.occurred_at asc, e.recorded_at asc, e.event_id asc')
})

test('draft deliberately excludes realtime publication and direct client grants', () => {
  assert.equal(sql.includes('alter publication supabase_realtime'), false)
  assert.equal(sql.includes('grant select on table governance.evidence_ledger_events to authenticated'), false)
  assert.equal(sql.includes('grant insert on table governance.evidence_ledger_events to authenticated'), false)
})

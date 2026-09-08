import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const SQL_URL = new URL('../docs/governance/EVIDENCE_LEDGER_SUPABASE_DRAFT.sql', import.meta.url)
const sql = await readFile(SQL_URL, 'utf8')

function requireSql(fragment) {
  assert.ok(sql.includes(fragment), `Expected Supabase ledger draft to contain: ${fragment}`)
}

test('draft is explicitly non-applied and append-only', () => {
  requireSql('DRAFT ONLY — DO NOT APPLY WITHOUT EXPLICIT RELEASE AUTHORIZATION')
  requireSql('before update on governance.evidence_ledger_events')
  requireSql('before delete on governance.evidence_ledger_events')
  requireSql("raise exception 'evidence ledger is append-only; UPDATE/DELETE are forbidden'")
})

test('event ids are globally unique and product partition is constrained', () => {
  requireSql('event_id text primary key')
  requireSql("product in ('CLINIVERSE', 'NEURAOPS_CORE')")
})

test('canonical payload must match denormalized identity fields', () => {
  requireSql("canonical_event ->> 'eventId' = event_id")
  requireSql("canonical_event ->> 'product' = product")
  requireSql("canonical_event ->> 'subjectId' = subject_id")
  requireSql("canonical_event ->> 'kind' = event_kind")
})

test('client roles have no direct governance-ledger access', () => {
  requireSql('enable row level security')
  requireSql('revoke all on schema governance from anon, authenticated')
  requireSql('revoke all on table governance.evidence_ledger_events from anon, authenticated')
})

test('trusted server boundary has insert/select only', () => {
  requireSql('grant select, insert on governance.evidence_ledger_events to service_role')
  assert.equal(sql.includes('grant update'), false)
  assert.equal(sql.includes('grant delete'), false)
})

test('artifact SHA and policy bindings remain first-class persisted fields', () => {
  requireSql('artifact_sha256 text[] not null')
  requireSql('policy_bindings text[] not null')
  requireSql('canonical_event jsonb not null')
})

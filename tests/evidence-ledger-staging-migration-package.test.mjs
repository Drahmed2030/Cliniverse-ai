import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const MIGRATION_URL = new URL('../docs/governance/EVIDENCE_LEDGER_STAGING_MIGRATION_CANDIDATE.sql', import.meta.url)
const ROLLBACK_URL = new URL('../docs/governance/EVIDENCE_LEDGER_STAGING_ROLLBACK.sql', import.meta.url)
const PACKAGE_URL = new URL('../docs/governance/STAGING_MIGRATION_PACKAGE_V1.md', import.meta.url)

const migration = await readFile(MIGRATION_URL, 'utf8')
const rollback = await readFile(ROLLBACK_URL, 'utf8')
const review = await readFile(PACKAGE_URL, 'utf8')

function requireText(source, fragment) {
  assert.ok(source.includes(fragment), `Expected content to include: ${fragment}`)
}

function stripSqlComments(source) {
  return source
    .split('\n')
    .map(line => line.replace(/--.*$/, ''))
    .join('\n')
}

test('candidate remains review-only and preserves private governance storage', () => {
  requireText(migration, 'STAGING MIGRATION CANDIDATE ONLY — DO NOT APPLY WITHOUT EXPLICIT AUTHORIZATION')
  requireText(migration, 'create schema if not exists governance')
  requireText(migration, 'create schema if not exists api')
  requireText(migration, 'revoke all on schema governance from public, anon, authenticated')
  requireText(migration, 'grant select, insert on table governance.evidence_ledger_events to service_role')
})

test('candidate exposes only narrow service-role RPC execution', () => {
  requireText(migration, 'api.governance_ledger_find_event')
  requireText(migration, 'api.governance_ledger_append_event')
  requireText(migration, 'api.governance_ledger_list_subject')
  requireText(migration, 'revoke all on schema api from public, anon, authenticated')
  requireText(migration, 'grant execute on function api.governance_ledger_find_event(text) to service_role')
  assert.equal(/grant\s+execute[\s\S]*to\s+(anon|authenticated)/i.test(migration), false)
})

test('candidate uses invoker functions with fixed search path and no definer escalation', () => {
  requireText(migration, 'security invoker')
  requireText(migration, 'set search_path = pg_catalog, governance, pg_temp')
  assert.equal(migration.toLowerCase().includes('security definer'), false)
})

test('append-only semantics remain hard blocked', () => {
  requireText(migration, "raise exception 'evidence ledger is append-only; UPDATE/DELETE are forbidden'")
  requireText(migration, 'before update on governance.evidence_ledger_events')
  requireText(migration, 'before delete on governance.evidence_ledger_events')
  assert.equal(/grant\s+update/i.test(migration), false)
  assert.equal(/grant\s+delete/i.test(migration), false)
})

test('rollback refuses destructive removal when evidence rows exist', () => {
  requireText(rollback, "rollback refused: governance.evidence_ledger_events contains % row(s)")
  requireText(rollback, "select count(*) from governance.evidence_ledger_events")
  requireText(rollback, 'if row_count > 0 then')
  requireText(rollback, 'drop table if exists governance.evidence_ledger_events')

  const executableRollback = stripSqlComments(rollback)
  assert.equal(/\bdrop\s+schema\s+(if\s+exists\s+)?api\b/i.test(executableRollback), false)
  assert.equal(/\bdrop\s+schema\s+(if\s+exists\s+)?governance\b/i.test(executableRollback), false)
})

test('review package keeps apply behind explicit staging authorization and PHI guard', () => {
  requireText(review, 'REVIEW-READY / NOT AUTHORIZED TO APPLY')
  requireText(review, 'Explicit staging-only authorization is obtained')
  requireText(review, 'Confirm target Supabase project is not Production')
  requireText(review, 'Confirm no patient identifiers or PHI are included in pilot ledger events')
  requireText(review, 'never silently destroy audit evidence')
})

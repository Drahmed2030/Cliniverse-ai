import test from 'node:test'
import assert from 'node:assert/strict'
import { createLessonCompletionRepository, validateLessonCompletion } from '../app/lib/lessonCompletion.ts'

const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const row = () => ({ id: '10000000-0000-4000-8000-000000000001', user_id: A,
  case_id: `codelab:bls_01_chain:${'a'.repeat(64)}`, errors: 1, xp_earned: 0, completed_at: '2026-09-12T10:00:00.000Z' })

function database() {
  const state = { owner: A, rows: [], offline: false, loseAck: false, switchOnWrite: false, inserts: 0 }
  const client = { auth: { async getUser() { return { data: { user: state.owner ? { id: state.owner } : null }, error: null } } }, from(table) {
    assert.equal(table, 'case_completions')
    let inserted, filters = {}, limit
    const query = { insert(value) { inserted = value; return query }, select() { return query }, eq(k, v) { filters[k] = v; return query },
      order() { return query }, limit(v) { limit = v; return query }, single() { return execute(true) }, maybeSingle() { return execute(false) } }
    async function execute(required) {
      if (state.offline) throw new Error('offline')
      if (inserted) {
        state.inserts++
        if (inserted.user_id !== state.owner) return { data: null, error: { code: '42501' } }
        if (state.rows.some(r => r.id === inserted.id)) return { data: null, error: { code: '23505' } }
        state.rows.push({ ...inserted })
        if (state.switchOnWrite) state.owner = B
        if (state.loseAck) { state.loseAck = false; throw new Error('response lost after commit') }
        return { data: { ...inserted }, error: null }
      }
      let matches = state.rows.filter(r => r.user_id === state.owner && Object.entries(filters).every(([k, v]) => r[k] === v))
        .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
      if (limit) matches = matches.slice(0, limit)
      return { data: matches[0] ?? null, error: required && matches.length !== 1 ? new Error('not found') : null }
    }
    return query
  } }
  return { state, repo: createLessonCompletionRepository(client) }
}

test('save and reopen restores the exact account-owned completion and score evidence', async () => {
  const { repo, state } = database(); const event = row()
  assert.deepEqual(await repo.save(event), event)
  assert.deepEqual(await repo.load(A, [event.case_id]), [event])
  assert.equal(state.rows.length, 1)
})
test('lost acknowledgement retries without duplicating a committed completion', async () => {
  const { repo, state } = database(); const event = row(); state.loseAck = true
  await assert.rejects(repo.save(event))
  assert.deepEqual(await repo.save(event), event)
  assert.equal(state.rows.length, 1)
})
test('network failure remains retryable with the same identity', async () => {
  const { repo, state } = database(); const event = row(); state.offline = true
  await assert.rejects(repo.save(event)); assert.equal(state.rows.length, 0)
  state.offline = false; await repo.save(event); assert.equal(state.rows[0].id, event.id)
})
test('signed-out requests cannot read or write account progress', async () => {
  const { repo, state } = database(); state.owner = null
  await assert.rejects(repo.save(row())); await assert.rejects(repo.load(A, [row().case_id])); assert.equal(state.inserts, 0)
})
test('switch before saving never attributes an old completion to the new account', async () => {
  const { repo, state } = database(); state.owner = B
  await assert.rejects(repo.save(row())); assert.equal(state.rows.length, 0)
})
test('switch while saving suppresses the acknowledgement for the old account', async () => {
  const { repo, state } = database(); state.switchOnWrite = true
  await assert.rejects(repo.save(row())); assert.deepEqual(await repo.load(B, [row().case_id]), [])
  state.owner = A; assert.equal((await repo.load(A, [row().case_id])).length, 1)
})
test('duplicate identity with different payload is rejected rather than overwritten', async () => {
  const { repo, state } = database(); await repo.save(row())
  await assert.rejects(repo.save({ ...row(), errors: 0 })); assert.equal(state.rows[0].errors, 1)
})
test('a changed content version does not inherit an earlier completion', async () => {
  const { repo } = database(); await repo.save(row())
  assert.deepEqual(await repo.load(A, [`codelab:bls_01_chain:${'b'.repeat(64)}`]), [])
})
test('concurrent retries of the same event produce one record', async () => {
  const { repo, state } = database(); await Promise.all([repo.save(row()), repo.save(row())]); assert.equal(state.rows.length, 1)
})
test('new intentional attempt receives its own record', async () => {
  const { repo, state } = database(); await repo.save(row()); await repo.save({ ...row(), id: '10000000-0000-4000-8000-000000000002', errors: 0 })
  assert.equal(state.rows.length, 2)
})
test('invalid evidence and XP awards fail before persistence', () => {
  for (const patch of [{ errors: NaN }, { errors: -1 }, { errors: 0.5 }, { xp_earned: 20 }, { case_id: 'legacy' }, { id: 'x' }, { completed_at: 'bad' }])
    assert.throws(() => validateLessonCompletion({ ...row(), ...patch }))
})
test('an unresponsive authentication request exits to a retryable error', async () => {
  const repo = createLessonCompletionRepository({ auth: { getUser: () => new Promise(() => {}) } }, 5)
  await assert.rejects(repo.save(row()), /timed out/)
})

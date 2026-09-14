import test from 'node:test'
import assert from 'node:assert/strict'
import { batch20, sourceRegistry } from '../content/medical/batch20.ts'
import { caseCompletionKey, prepareCaseCompletion, validateCaseCompletion, createCaseCompletionRepository } from '../app/lib/caseCompletion.ts'
import { validateLessonCompletion } from '../app/lib/lessonCompletion.ts'

const owner = '00000000-0000-4000-8000-000000000001'
const other = '00000000-0000-4000-8000-000000000002'
const attempt = { id: '10000000-0000-4000-8000-000000000001', owner, answer: 1,
  explanationReviewed: true, completedAt: '2026-09-14T10:00:00.000Z' }
const item = batch20[0]
const row = await prepareCaseCompletion(item, sourceRegistry, attempt)
const keys = new Set([row.case_id])

test('all 20 reviewed text cases receive distinct stable content identities', async () => {
  const all = await Promise.all(batch20.map(c => caseCompletionKey(c, sourceRegistry)))
  assert.equal(new Set(all).size, 20)
  assert.equal(await caseCompletionKey({ ...item }, sourceRegistry), row.case_id)
})
test('clinical wording, answer, communication and reference changes invalidate the content identity', async () => {
  for (const patch of [{ explanation: 'changed' }, { answer: 0 }, { communication: 'changed' }, { scenario: 'changed' }])
    assert.notEqual(await caseCompletionKey({ ...item, ...patch }, sourceRegistry), row.case_id)
  const sources = structuredClone(sourceRegistry); sources[item.sourceIds[0]].scope = 'new review'
  assert.notEqual(await caseCompletionKey(item, sources), row.case_id)
})
test('missing references and unconfirmed review fail closed', async () => {
  await assert.rejects(caseCompletionKey(item, {}))
  await assert.rejects(caseCompletionKey({ ...item, clinicalReview: 'pending' }, sourceRegistry))
})
test('completion requires an answer and explicit explanation acknowledgement', async () => {
  for (const patch of [{ explanationReviewed: false }, { answer: undefined }, { answer: -1 }, { answer: 3 }, { answer: 0.5 }])
    await assert.rejects(prepareCaseCompletion(item, sourceRegistry, { ...attempt, ...patch }))
  assert.equal(row.errors, 0)
  assert.equal((await prepareCaseCompletion(item, sourceRegistry, { ...attempt, answer: 0 })).errors, 1)
  assert.equal(row.xp_earned, 0)
})
test('case and Code Lab evidence remain separate and invalid evidence is rejected', () => {
  assert.throws(() => validateLessonCompletion(row))
  for (const patch of [{ errors: 2 }, { xp_earned: 1 }, { id: 'x' }, { user_id: '' },
    { completed_at: 'bad' }, { case_id: `codelab:bls:${'a'.repeat(64)}` }])
    assert.throws(() => validateCaseCompletion({ ...row, ...patch }, keys))
  assert.throws(() => validateCaseCompletion(row, new Set()))
})

function database() {
  const state = { owner, rows: [], loseAck: false, offline: false, switchOnWrite: false, writes: 0 }
  const client = { auth: { async getUser() { return { data: { user: state.owner ? { id: state.owner } : null }, error: null } } }, from(table) {
    assert.equal(table, 'case_completions')
    let inserted; const filters = {}
    const q = { select() { return q }, eq(k, v) { filters[k] = v; return q }, order() { return q }, limit() { return q },
      insert(r) { inserted = r; return q }, single: execute, maybeSingle: execute }
    async function execute() {
      if (state.offline) throw Error('offline')
      if (inserted) {
        state.writes++
        if (state.rows.some(r => r.id === inserted.id)) return { data: null, error: { code: '23505' } }
        state.rows.push({ ...inserted })
        if (state.switchOnWrite) state.owner = other
        if (state.loseAck) { state.loseAck = false; throw Error('lost acknowledgement') }
        return { data: { ...inserted }, error: null }
      }
      return { data: state.rows.find(r => r.user_id === state.owner && Object.entries(filters).every(([k, v]) => r[k] === v)) ?? null, error: null }
    }
    return q
  } }
  return { state, client, repo: createCaseCompletionRepository(client, [...keys]) }
}
test('account completion saves and reloads through the shared acknowledgement mechanism', async () => {
  const { repo, state } = database()
  assert.deepEqual(await repo.save(row), row)
  assert.deepEqual(await repo.load(owner), [row]); assert.equal(state.rows.length, 1)
})
test('lost acknowledgement and concurrent retry keep one immutable completion', async () => {
  const { repo, state } = database(); state.loseAck = true
  await assert.rejects(repo.save(row))
  await Promise.all([repo.save(row), repo.save(row)])
  assert.equal(state.rows.length, 1)
  await assert.rejects(repo.save({ ...row, errors: 1 }))
})
test('sign-out, account switch and offline requests do not claim a successful save', async () => {
  for (const patch of [{ owner: null }, { owner: other }, { offline: true }, { switchOnWrite: true }]) {
    const { repo, state } = database(); Object.assign(state, patch)
    await assert.rejects(repo.save(row))
  }
})
test('old version cannot be written or loaded by the current catalogue', async () => {
  const { repo, state, client } = database(); await repo.save(row)
  const next = createCaseCompletionRepository(client, [`microcase:${item.id}:${'b'.repeat(64)}`])
  assert.deepEqual(await next.load(owner), [])
  await assert.rejects(next.save(row)); assert.equal(state.writes, 1)
})
test('unresponsive authentication times out without claiming saved progress', async () => {
  const repo = createCaseCompletionRepository({ auth: { getUser: () => new Promise(() => {}) } }, [...keys], 5)
  await assert.rejects(repo.save(row), /timed out/)
})

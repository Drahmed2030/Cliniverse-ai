import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_BATCH_01_CANDIDATES, validateEchoBatch01CandidateRegistry } from '../app/lib/clinicalMedia/echoBatch01CandidateRegistry.ts'

test('curated Echo Batch 01 contains exactly 12 source-page-verified candidates', () => {
  assert.doesNotThrow(() => validateEchoBatch01CandidateRegistry())
  assert.equal(ECHO_BATCH_01_CANDIDATES.length, 12)
  assert.ok(ECHO_BATCH_01_CANDIDATES.every(item => item.evidenceState === 'source-page-verified'))
})

test('candidate batch spans normal, cardiomyopathy, right-heart, pericardial, valve and congenital targets', () => {
  const labels = ECHO_BATCH_01_CANDIDATES.map(item => item.diagnosisLabel.toLowerCase()).join(' | ')
  for (const expected of ['normal', 'takotsubo', 'hypertrophic', 'dilated', 'arrhythmogenic', 'pericardial', 'mitral', 'aortic', 'vsd']) {
    assert.match(labels, new RegExp(expected))
  }
})

test('candidate batch is not A4C-only and includes color Doppler context', () => {
  const views = new Set(ECHO_BATCH_01_CANDIDATES.map(item => item.view))
  assert.ok([...views].some(view => view.startsWith('A3C')))
  assert.ok([...views].some(view => view.startsWith('PSAX')))
  assert.ok([...views].some(view => view.startsWith('PLAX')))
  assert.ok([...views].some(view => view.includes('Color Doppler')))
})

test('source pages are unique and all carry the frozen CC BY-SA/VRT contract', () => {
  assert.equal(new Set(ECHO_BATCH_01_CANDIDATES.map(item => item.sourcePageUrl)).size, 12)
  assert.ok(ECHO_BATCH_01_CANDIDATES.every(item => item.licenseId === 'CC-BY-SA-3.0'))
  assert.ok(ECHO_BATCH_01_CANDIDATES.every(item => item.vrtTicket === '2011102310008874'))
})

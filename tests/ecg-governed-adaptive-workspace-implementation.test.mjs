import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../app/components/release/EcgGovernedAdaptiveWorkspace.tsx', import.meta.url), 'utf8')

test('workspace implementation is driven by semantic layout mode', () => {
  assert.match(source, /case 'COMPACT'/)
  assert.match(source, /case 'EXPANDED'/)
  assert.match(source, /case 'WIDE_CLINICAL'/)
  assert.match(source, /data-layout-mode=\{mode\}/)
})

test('workspace preserves upstream attempt and case identity instead of creating state', () => {
  assert.match(source, /data-attempt-id=\{session\.attemptId\}/)
  assert.match(source, /data-case-id=\{session\.caseId\}/)
  assert.doesNotMatch(source, /useState\s*\(/)
  assert.doesNotMatch(source, /crypto\.randomUUID/)
})

test('workspace does not contain synthetic ECG generation', () => {
  assert.doesNotMatch(source, /generateEcgPath/)
  assert.doesNotMatch(source, /Math\.random/)
  assert.doesNotMatch(source, /ECG_CASES/)
})

test('workspace keeps waveform primary across compact and expanded layouts', () => {
  assert.match(source, /aria-label="ECG waveform workspace"/)
  assert.match(source, /\{waveform\}/)
  assert.match(source, /Interpretation and competency/)
})

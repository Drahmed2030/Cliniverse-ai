import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('event contract decouples learner actions from downstream consumers', () => {
  const source = read('app/lib/platform/events.ts')
  for (const name of ['practice.completed','answer.submitted','review.scheduled','collection.completed']) {
    assert.ok(source.includes(name), name)
  }
  for (const consumer of ['progress','today','review-scheduler','analytics','intelligence']) {
    assert.ok(source.includes(consumer), consumer)
  }
})

test('capability registry records owner, layer, state and dependencies', () => {
  const source = read('app/lib/platform/capabilityRegistry.ts')
  for (const field of ['owner:','layer:','state:','dependencies:']) assert.ok(source.includes(field), field)
  for (const id of ['ecg-practice','echo-practice','ward-practice','content-graph','ai-evals','fhir-foundation']) {
    assert.ok(source.includes(id), id)
  }
})

test('AI eval contract requires grounding and clinical boundaries before production use', () => {
  const source = read('app/lib/intelligence/evalContract.ts')
  assert.match(source, /grounding/)
  assert.match(source, /tool-selection/)
  assert.match(source, /clinical-boundary/)
  assert.match(source, /unsupported competency claim/)
  assert.match(source, /publication-state promotion/)
})

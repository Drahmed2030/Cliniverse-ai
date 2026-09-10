import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('commercial release shell consumes semantic visual tokens', () => {
  const source = read('app/components/ReleaseApp.tsx')
  for (const token of [
    'var(--cv-bg)',
    'var(--cv-surface)',
    'var(--cv-surface-elevated)',
    'var(--cv-surface-subtle)',
    'var(--cv-border)',
    'var(--cv-text)',
    'var(--cv-text-secondary)',
  ]) {
    assert.match(source, new RegExp(token.replace(/[()]/g, '\\$&')))
  }
})

test('today and progress expose commercial surface markers', () => {
  const source = read('app/components/ReleaseApp.tsx')
  assert.match(source, /data-commercial-surface="today"/)
  assert.match(source, /data-commercial-surface="progress"/)
  assert.match(source, /data-commercial-card-grid/)
  assert.match(source, /data-commercial-safety-note/)
})

test('commercial core surfaces avoid fixed dark palette literals', () => {
  const source = read('app/components/ReleaseApp.tsx')
  for (const literal of ['#080C16', '#111827', '#172033', '#F8FAFC', '#94A3B8']) {
    assert.equal(source.includes(literal), false)
  }
})

test('commercial headings use scalable relative typography', () => {
  const source = read('app/components/ReleaseApp.tsx')
  assert.match(source, /clamp\(1\.75rem, 4vw, 2\.25rem\)/)
  assert.match(source, /clamp\(1\.5rem, 3vw, 2rem\)/)
  assert.equal(/fontSize:\s*28\b/.test(source), false)
  assert.equal(/fontSize:\s*24\b/.test(source), false)
})

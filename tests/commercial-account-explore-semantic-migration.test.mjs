import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Me commercial surface uses semantic visual tokens', () => {
  const source = read('app/components/release/MeHub.tsx')
  assert.match(source, /data-commercial-me-surface/)
  for (const token of ['--cv-surface', '--cv-border', '--cv-text', '--cv-text-secondary', '--cv-blue', '--cv-teal', '--cv-gold']) {
    assert.equal(source.includes(token), true)
  }
  for (const legacy of ['#111827', '#172033', '#F8FAFC', '#94A3B8', '#3B82F6', '#14B8A6', '#D4A72C']) {
    assert.equal(source.includes(legacy), false)
  }
})

test('Explore commercial surface uses semantic visual tokens', () => {
  const source = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(source, /data-commercial-explore-surface/)
  for (const token of ['--cv-surface', '--cv-surface-elevated', '--cv-border', '--cv-text', '--cv-text-secondary', '--cv-blue', '--cv-teal', '--cv-violet', '--cv-gold']) {
    assert.equal(source.includes(token), true)
  }
  for (const legacy of ['#111827', '#172033', '#F8FAFC', '#94A3B8', '#3B82F6', '#14B8A6', '#8B5CF6', '#D4A72C']) {
    assert.equal(source.includes(legacy), false)
  }
})

test('Me and Explore primary headings use scalable typography', () => {
  const me = read('app/components/release/MeHub.tsx')
  const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(me, /fontSize: 'clamp\(/)
  assert.match(explore, /fontSize: 'clamp\(/)
})

test('commercial migration preserves account, StoreKit and release-boundary copy', () => {
  const me = read('app/components/release/MeHub.tsx')
  const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(me, /No surface may create a second identity or activate PRO locally/)
  assert.match(explore, /StoreKit/)
  assert.match(explore, /PRO activates only after server verification/)
  assert.match(explore, /third-party clinical AI, diagnosis, prescribing, real-patient workflows and device-health integrations are not part of this version/)
})

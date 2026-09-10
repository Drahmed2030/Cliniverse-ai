import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('Learn workspace uses semantic light-dark surfaces and readable selected text', () => {
  const source = read('app/components/ward/index.tsx')
  assert.match(source, /data-commercial-learn-surface/)
  assert.match(source, /panel:\s*'var\(--cv-surface\)'/)
  assert.match(source, /elevated:\s*'var\(--cv-surface-elevated\)'/)
  assert.match(source, /color:\s*selected \? C\.teal : C\.text/)
  assert.equal(source.includes("color: C.text"), true)
  assert.equal(source.includes("panel: '#111827'"), false)
})

test('Me primary identity accent is gold to match account identity', () => {
  const source = read('app/components/release/MeHub.tsx')
  assert.match(source, /ONE ACCOUNT DESTINATION/)
  assert.match(source, /color:\s*C\.gold/)
})

test('Me account and achievement surfaces consume commercial semantic tokens', () => {
  for (const path of [
    'app/components/release/MeAccountSummary.tsx',
    'app/components/release/AchievementsHub.tsx',
    'app/components/release/LifeDeviceBoundary.tsx',
  ]) {
    const source = read(path)
    assert.match(source, /var\(--cv-surface\)/)
    assert.match(source, /var\(--cv-text\)/)
    assert.equal(source.includes("panel: '#111827'"), false)
  }
})

test('section accent identities remain Today blue, Learn teal, Progress violet, Explore blue, Me gold', () => {
  const app = read('app/components/ReleaseApp.tsx')
  const learn = read('app/components/ward/index.tsx')
  const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
  const me = read('app/components/release/MeHub.tsx')

  assert.match(app, /CLINIVERSE/)
  assert.match(app, /C\.blue/)
  assert.match(app, /COMPETENCY/)
  assert.match(app, /C\.violet/)
  assert.match(learn, /C\.teal/)
  assert.match(explore, /C\.blue/)
  assert.match(me, /C\.gold/)
})

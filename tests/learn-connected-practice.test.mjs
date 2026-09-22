import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('Learn renders Cardiology Practice from the shared content collection', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  assert.match(learn, /CONTENT_COLLECTIONS/)
  assert.match(learn, /collectionNodes/)
  assert.match(learn, /cardiology-practice/)
  for (const id of ['ecg-record-10','echo-a4c-normal','ward-current-set','pathway-replay']) {
    assert.ok(learn.includes(id), id)
  }
})

test('connected practice reuses Learn navigation and commercial tokens', () => {
  const learn = read('app/components/release/LearnTracks.tsx')
  const css = read('app/commercial-visual-system.css')
  assert.match(learn, /cv-learn-collection/)
  assert.match(learn, /onOpenWorkspace/)
  assert.doesNotMatch(learn, /linear-gradient/)
  assert.doesNotMatch(learn, /fontFamily/)
  assert.match(css, /\[data-commercial-surface="learn"\] \.cv-learn-collection/)
  for (const token of ['--cv-surface-emphasis','--cv-border','--cv-text-secondary','--cv-radius-xl']) {
    assert.ok(css.includes(token), token)
  }
})

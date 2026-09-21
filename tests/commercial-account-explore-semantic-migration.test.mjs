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
  // Explore v2 styling lives in the scoped stylesheet block, so the tokens are asserted there.
  const css = read('app/commercial-visual-system.css')
  const block = css.slice(css.lastIndexOf('/*', css.indexOf('Explore — curated discovery')))
  for (const token of ['--cv-surface-elevated', '--cv-border', '--cv-text', '--cv-text-secondary', '--cv-blue']) {
    assert.equal(block.includes(token), true, token)
  }
  for (const legacy of ['#111827', '#172033', '#F8FAFC', '#94A3B8', '#3B82F6', '#14B8A6', '#8B5CF6', '#D4A72C']) {
    assert.equal(source.includes(legacy), false)
  }
})

test('Me and Explore primary headings use scalable typography', () => {
  const me = read('app/components/release/MeHub.tsx')
  const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(me, /fontSize: 'clamp\(/)
  // Explore's page heading is the shared header's (1rem, inherited); its row titles are token-sized in the stylesheet.
  const css = read('app/commercial-visual-system.css')
  assert.match(css, /\.cv-explore-row-title \{[^}]*font-size: var\(--cv-text-section\)/)
  assert.equal(/fontSize:\s*\d+\b/.test(explore), false)
})

test('commercial migration preserves account, StoreKit and release-boundary copy', () => {
  const me = read('app/components/release/MeHub.tsx')
  const explore = read('app/components/release/AtlasReleaseCatalog.tsx')
  assert.match(me, /<MeAccountSummary/)
  assert.match(me, /Apple Health and Apple Watch are not connected/)
  assert.match(me, /Hospital and NeuraOps connections are not available/)
  // Explore keeps one restrained release boundary; the plan copy moved to Me and the order boundary lives in the workspace.
  assert.match(explore, /Not for diagnosis, prescribing or managing real patient care/)
  assert.match(read('app/components/release/MeAccountSummary.tsx'), /View available plans or restore an existing purchase in the iOS app/)
  assert.match(read('app/components/ward/cardiology/NotesOrdersTracker.tsx'), /cannot place, alter, approve, or transmit a clinical order/)
  const provider = read('app/components/release/SubscriptionPurchaseProvider.tsx')
  assert.match(provider, /completeStoreKitPurchase/)
  assert.match(provider, /getOwnEntitlement/)
})

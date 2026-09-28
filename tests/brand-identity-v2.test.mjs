import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('canonical Cliniverse icon uses the v2 family palette and flat mark', () => {
  const svg = read('assets/logo.svg')
  assert.match(svg, /#0B0F19/)
  assert.match(svg, /#2563EB/)
  assert.match(svg, /#7C3AED/)
  assert.match(svg, /#22C7D6/)
  assert.doesNotMatch(svg, /linearGradient|radialGradient|#FFD54F|#FF8F00|#E65100/)
})

test('public icon sources remain identical to the canonical product mark', () => {
  const canonical = read('assets/logo.svg')
  for (const path of [
    'public/icons/icon.svg',
    'public/icons/icon-72.svg',
    'public/icons/icon-96.svg',
    'public/icons/icon-128.svg',
    'public/icons/icon-144.svg',
    'public/icons/icon-152.svg',
    'public/icons/icon-192.svg',
    'public/icons/icon-384.svg',
    'public/icons/icon-512.svg',
  ]) {
    assert.equal(read(path), canonical, `${path} drifted from canonical identity`)
  }
})

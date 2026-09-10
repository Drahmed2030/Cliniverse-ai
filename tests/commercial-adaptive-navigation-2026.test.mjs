import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('commercial navigation keeps the five outcome destinations', () => {
  const nav = read('app/components/ReleaseNav.tsx')
  for (const label of ['Today', 'Learn', 'Progress', 'Explore', 'Me']) {
    assert.match(nav, new RegExp(`label: '${label}'`))
  }
  assert.equal(nav.includes("label: 'Intelligence'"), false)
})

test('navigation styling uses semantic visual tokens instead of fixed release colors', () => {
  const nav = read('app/components/ReleaseNav.tsx')
  assert.match(nav, /var\(--cv-nav-bg\)/)
  assert.match(nav, /var\(--cv-border\)/)
  assert.match(nav, /var\(--cv-nav-selected\)/)
  assert.match(nav, /var\(--cv-nav-inactive\)/)
  assert.equal(nav.includes("background: 'rgba(8,12,22,0.94)'"), false)
  assert.equal(nav.includes("color: selected ? '#FFFFFF'"), false)
})

test('expanded navigation is selected by viewport geometry without device-name forks', () => {
  const css = read('app/commercial-visual-system.css')
  assert.match(css, /@media \(min-width: 700px\)/)
  assert.match(css, /grid-template-columns: 1fr !important/)
  assert.match(css, /grid-template-rows: repeat\(5,/)
  for (const forbidden of ['iPhone18', 'iPhone 18', 'iPhone Duo', 'Fold', 'iPad Pro']) {
    assert.equal(css.includes(forbidden), false)
  }
})

test('compact navigation remains the base presentation and safe areas stay respected', () => {
  const nav = read('app/components/ReleaseNav.tsx')
  assert.match(nav, /gridTemplateColumns: 'repeat\(5, minmax\(0, 1fr\)\)'/)
  assert.match(nav, /NATIVE_SAFE_AREA_BOTTOM/)
  assert.match(nav, /NATIVE_SAFE_AREA_LEFT/)
  assert.match(nav, /NATIVE_SAFE_AREA_RIGHT/)
})

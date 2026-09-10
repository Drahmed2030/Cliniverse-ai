import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('runtime visual system follows system light and dark appearance', () => {
  const layout = read('app/layout.tsx')
  const css = read('app/commercial-visual-system.css')
  assert.match(layout, /colorScheme:\s*"light dark"/)
  assert.match(layout, /prefers-color-scheme: light/)
  assert.match(layout, /prefers-color-scheme: dark/)
  assert.match(css, /color-scheme:\s*light dark/)
  assert.match(css, /@media \(prefers-color-scheme: dark\)/)
})

test('commercial theme is scoped and does not replace legacy clinical styling globally', () => {
  const css = read('app/commercial-visual-system.css')
  assert.match(css, /\[data-commercial-shell\]/)
  assert.equal(css.includes('body {'), false)
  assert.equal(css.includes(':root {'), false)
})

test('commercial typography is system-first and inherits into controls', () => {
  const css = read('app/commercial-visual-system.css')
  assert.match(css, /-apple-system/)
  assert.match(css, /SF Pro Text/)
  assert.match(css, /:is\(button, a, input, textarea, select\)/)
  assert.match(css, /font:\s*inherit/)
})

test('accessibility preferences and functional glass boundaries are present', () => {
  const css = read('app/commercial-visual-system.css')
  assert.match(css, /@media \(prefers-contrast: more\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\[data-commercial-navigation\]/)
  assert.match(css, /\[data-release-header\]/)
  assert.doesNotMatch(css, /\[data-commercial-shell\]\s*\{[^}]*backdrop-filter/s)
})

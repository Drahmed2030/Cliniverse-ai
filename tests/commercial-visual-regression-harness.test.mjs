import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('commercial visual harness covers the five required viewport geometries', () => {
  const source = read('tests/visual/commercial-visual-regression.spec.ts')
  for (const geometry of ['390, height: 844', '430, height: 932', '820, height: 1180', '1180, height: 820', '1440, height: 1000']) {
    assert.equal(source.includes(geometry), true)
  }
})

test('commercial visual harness covers light dark contrast reduced motion and large-text proxy', () => {
  const source = read('tests/visual/commercial-visual-regression.spec.ts')
  assert.match(source, /colorScheme:\s*'light'/)
  assert.match(source, /colorScheme:\s*'dark'/)
  assert.match(source, /contrast:\s*'more'/)
  assert.match(source, /reducedMotion:\s*'reduce'/)
  assert.match(source, /textScale:\s*1\.25/)
})

test('commercial visual harness requires authorized auth without committed credentials', () => {
  const source = read('tests/visual/commercial-visual-regression.spec.ts')
  assert.match(source, /CLINIVERSE_VISUAL_EMAIL/)
  assert.match(source, /CLINIVERSE_VISUAL_PASSWORD/)
  assert.match(source, /CLINIVERSE_VISUAL_STORAGE_STATE/)
  assert.equal(/reviewer@cliniverseai\.com/.test(source), false)
  assert.equal(/password\s*[:=]\s*['"][^'"]+['"]/.test(source), false)
})

test('commercial visual harness checks navigation overflow accessibility focus and screenshots', () => {
  const source = read('tests/visual/commercial-visual-regression.spec.ts')
  assert.match(source, /Today.*Learn.*Progress.*Explore.*Me/s)
  assert.match(source, /scrollWidth/)
  assert.match(source, /AxeBuilder/)
  assert.match(source, /outlineStyle/)
  assert.match(source, /page\.screenshot/)
  assert.match(source, /Intelligence/)
})

test('dedicated commercial config can target local runtime or an external preview', () => {
  const config = read('playwright.commercial.config.ts')
  assert.match(config, /CLINIVERSE_VISUAL_BASE_URL/)
  assert.match(config, /127\.0\.0\.1:3000/)
  assert.match(config, /commercial-visual-regression/)
  assert.match(config, /workers:\s*1/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('visual QA matrix covers compact expanded and wide clinical geometry', () => {
  const source = read('app/lib/commercial/commercialVisualQaMatrix2026.ts')
  assert.match(source, /COMPACT/)
  assert.match(source, /EXPANDED/)
  assert.match(source, /WIDE_CLINICAL/)
  assert.match(source, /minWidth:\s*900/)
  assert.match(source, /minWidth:\s*1280/)
})

test('visual QA matrix requires light dark and increased contrast coverage', () => {
  const source = read('app/lib/commercial/commercialVisualQaMatrix2026.ts')
  assert.match(source, /appearance:\s*'LIGHT'/)
  assert.match(source, /appearance:\s*'DARK'/)
  assert.match(source, /contrast:\s*'INCREASED'/)
})

test('visual QA matrix includes accessibility large type and geometry-driven navigation', () => {
  const source = read('app/lib/commercial/commercialVisualQaMatrix2026.ts')
  assert.match(source, /ACCESSIBILITY_LARGE/)
  assert.match(source, /BOTTOM_TABS/)
  assert.match(source, /ADAPTIVE_RAIL/)
  assert.match(source, /deviceNameForksProhibited:\s*true/)
})

test('live device validation remains mandatory before release', () => {
  const source = read('app/lib/commercial/commercialVisualQaMatrix2026.ts')
  assert.match(source, /liveDeviceValidationStillRequiredBeforeRelease:\s*true/)
})

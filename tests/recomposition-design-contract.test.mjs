import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('recomposition contract uses the commercial visual system instead of a legacy theme fork', () => {
  const contract = read('app/lib/design/recompositionContract.ts')
  const shell = read('app/components/release/RecomposedModuleShell.tsx')
  const css = read('app/commercial-visual-system.css')
  assert.match(contract, /Recover capability and content; rebuild presentation/)
  assert.match(contract, /legacy inline-style layouts copied into recomposed surfaces/)
  assert.match(shell, /data-recomposed-module/)
  for (const token of ['--cv-text','--cv-surface-elevated','--cv-border','--cv-radius-xl','--cv-space-5']) {
    assert.ok(css.includes(token), token)
  }
  assert.match(css, /\.cv-recomposed-module/)
  assert.doesNotMatch(shell, /style=\{/)
})

test('every recovered asset is explicitly marked for visual recomposition', () => {
  const inventory = read('app/lib/content/recoveryInventory.ts')
  const rows = [...inventory.matchAll(/\{ presentation:'recompose', id:/g)]
  assert.ok(rows.length >= 15, 'expected the mapped recovery inventory to require recomposition')
  assert.doesNotMatch(inventory, /presentation:'legacy'/)
})

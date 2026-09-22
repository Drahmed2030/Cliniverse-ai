import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('recovery inventory preserves known legacy value without exposing the studio in production', () => {
  const inventory = read('app/lib/content/recoveryInventory.ts')
  const page = read('app/internal/content-studio/page.tsx')
  for (const title of ['Deferred Ward templates','Code Lab BLS lessons','Code Lab ACLS lessons','Megacode v2','Clinical Library cases','Medical Calculators','Clinical Nexus','FHIR Integration foundation','Teleconsult / remote workflow']) {
    assert.ok(inventory.includes(title), title)
  }
  assert.match(page, /VERCEL_ENV === 'preview'/)
  assert.match(page, /NODE_ENV !== 'production'/)
  assert.match(page, /notFound\(\)/)
})

test('content studio treats legacy code as source material, not direct product UI', () => {
  const page = read('app/internal/content-studio/page.tsx')
  const doc = read('docs/CLINIVERSE_PLATFORM_RECOVERY_V2.md')
  assert.match(page, /Nothing returns unchanged simply because it already exists/)
  assert.match(doc, /Do not revive legacy screens unchanged/)
  assert.match(doc, /Source\/Legacy -> Normalize -> Validate -> Connect -> Publish -> Measure/)
})
